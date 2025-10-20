import NetInfo from '@react-native-community/netinfo';
import databaseService from './DatabaseService';

const SERVER_URL = 'http://10.0.2.2:3000';

class SyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncListeners = [];
    
    // Listen to network changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      console.log('Network status changed:', this.isOnline ? 'ONLINE' : 'OFFLINE');
      
      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        console.log('Back online! Starting sync...');
        this.syncAll();
      }
    });
  }

  // Helper to check if error is a network error
  isNetworkError(error) {
    return error.message === 'Network request failed' || 
           error.message.includes('Network') || 
           error.message.includes('Failed to fetch');
  }

  // Check if device is online
  async checkOnlineStatus() {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected && state.isInternetReachable;
    return this.isOnline;
  }

  // Add listener for sync events
  addSyncListener(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifySyncListeners(event, data) {
    this.syncListeners.forEach(listener => listener(event, data));
  }

  // ============ SYNC ALL DATA ============

  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    const online = await this.checkOnlineStatus();
    if (!online) {
      console.log('Device is offline, cannot sync');
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners('sync_start', null);

    try {
      console.log('Starting full sync...');
      
      // 1. Process sync queue (upload local changes first)
      await this.processSyncQueue();
      
      // 2. Download latest data from server
      await this.syncDonationsFromServer();
      
      // 3. Clean up old sync queue items
      await databaseService.clearSyncQueue();
      
      console.log('Sync completed successfully');
      this.notifySyncListeners('sync_complete', { success: true });
    } catch (error) {
      // Only log network errors as warnings when offline
      if (this.isNetworkError(error)) {
        console.log('Sync skipped: Device appears to be offline');
      } else {
        console.error('Sync error:', error);
      }
      this.notifySyncListeners('sync_error', { error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  // ============ PROCESS SYNC QUEUE ============

  async processSyncQueue() {
    const pendingItems = await databaseService.getPendingSyncItems();
    
    if (pendingItems.length === 0) {
      console.log('No pending items to sync');
      return;
    }

    console.log(`Processing ${pendingItems.length} pending sync items...`);

    for (const item of pendingItems) {
      try {
        await this.processSyncItem(item);
        await databaseService.markSyncItemCompleted(item.id);
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);
        await databaseService.markSyncItemFailed(item.id, error.message);
      }
    }
  }

  async processSyncItem(item) {
    const { operation, entity_type, entity_id, data } = item;

    switch (entity_type) {
      case 'donation':
        if (operation === 'create') {
          await this.uploadDonation(data);
        } else if (operation === 'update') {
          await this.uploadDonationUpdate(entity_id, data);
        } else if (operation === 'delete') {
          await this.uploadDonationDelete(entity_id);
        }
        break;

      case 'cart':
        if (operation === 'add') {
          await this.uploadCartAdd(data.userId, data.itemId);
        } else if (operation === 'remove') {
          await this.uploadCartRemove(data.userId, data.itemId);
        }
        break;

      case 'user':
        if (operation === 'update') {
          await this.uploadUserUpdate(entity_id, data);
        }
        break;

      default:
        console.warn(`Unknown entity type: ${entity_type}`);
    }
  }

  // ============ UPLOAD TO SERVER ============

  async uploadDonation(donationData) {
    const response = await fetch(`${SERVER_URL}/donate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData)
    });

    if (!response.ok) {
      throw new Error('Failed to upload donation');
    }

    const result = await response.json();
    return result;
  }

  async uploadDonationUpdate(donationId, updateData) {
    const response = await fetch(`${SERVER_URL}/api/donations/${donationId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Failed to update donation');
    }

    return await response.json();
  }

  async uploadDonationDelete(donationId) {
    const response = await fetch(`${SERVER_URL}/api/donations/${donationId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete donation');
    }

    return await response.json();
  }

  async uploadCartAdd(userId, itemId) {
    const response = await fetch(`${SERVER_URL}/api/cart/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId })
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    return await response.json();
  }

  async uploadCartRemove(userId, itemId) {
    const response = await fetch(`${SERVER_URL}/api/cart/${userId}/${itemId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }

    return await response.json();
  }

  async uploadUserUpdate(userId, userData) {
    const response = await fetch(`${SERVER_URL}/api/users/${userId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return await response.json();
  }

  // ============ DOWNLOAD FROM SERVER ============

  async syncDonationsFromServer() {
    try {
      console.log('Syncing donations from server...');
      const response = await fetch(`${SERVER_URL}/api/donations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const donations = result.data || [];

      console.log(`Downloaded ${donations.length} donations from server`);

      // Save all donations to local database
      for (const donation of donations) {
        await databaseService.saveDonation(donation);
      }

      console.log('Donations synced to local database');
    } catch (error) {
      // Only log as error if it's not a network error
      if (this.isNetworkError(error)) {
        console.log('Cannot sync donations: offline');
      } else {
        console.error('Error syncing donations from server:', error);
      }
      throw error;
    }
  }

  async syncUserData(userId) {
    try {
      const response = await fetch(`${SERVER_URL}/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const result = await response.json();
      const user = result.data;

      await databaseService.saveUser(user);
      console.log('User data synced');
      
      return user;
    } catch (error) {
      if (this.isNetworkError(error)) {
        console.log('Cannot sync user data: offline');
      } else {
        console.error('Error syncing user data:', error);
      }
      throw error;
    }
  }

  async syncMyDonations(userId) {
    try {
      const response = await fetch(`${SERVER_URL}/api/mydonations/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch my donations');
      }

      const result = await response.json();
      const donations = result.data || [];

      for (const donation of donations) {
        await databaseService.saveDonation(donation);
      }

      console.log(`Synced ${donations.length} user donations`);
      return donations;
    } catch (error) {
      if (this.isNetworkError(error)) {
        console.log('Cannot sync my donations: offline');
      } else {
        console.error('Error syncing my donations:', error);
      }
      throw error;
    }
  }

  async syncCart(userId) {
    try {
      const response = await fetch(`${SERVER_URL}/api/cart/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const result = await response.json();
      const cartItems = result.data || [];

      // Clear local cart for this user first
      const existingCart = await databaseService.getCartByUserId(userId);
      for (const item of existingCart) {
        // Check if itemId exists before accessing _id
        if (item.itemId && item.itemId._id) {
          await databaseService.removeFromCart(userId, item.itemId._id);
        }
      }

      // Add server cart items
      for (const item of cartItems) {
        // Skip items with null or undefined itemId
        if (!item.itemId) {
          console.warn('Skipping cart item with null itemId:', item);
          continue;
        }

        const itemIdValue = item.itemId._id || item.itemId;
        
        // Only add valid items
        if (itemIdValue) {
          await databaseService.addToCart(userId, itemIdValue);
          
          // Also save the donation details if it's a populated object
          if (item.itemId && typeof item.itemId === 'object' && item.itemId._id) {
            await databaseService.saveDonation(item.itemId);
          }
        }
      }

      console.log(`Synced ${cartItems.length} cart items`);
      return cartItems;
    } catch (error) {
      if (this.isNetworkError(error)) {
        console.log('Cannot sync cart: offline');
      } else {
        console.error('Error syncing cart:', error);
      }
      throw error;
    }
  }

  // ============ HYBRID OPERATIONS (Try Server, Fallback to Local) ============

  async getDonations() {
    const online = await this.checkOnlineStatus();

    if (online) {
      try {
        // Try to get from server
        await this.syncDonationsFromServer();
      } catch (error) {
        console.log('Failed to fetch from server, using cached data:', error.message);
      }
    }

    // Always return from local database
    return await databaseService.getAllDonations();
  }

  async getMyDonations(userId) {
    const online = await this.checkOnlineStatus();

    if (online) {
      try {
        await this.syncMyDonations(userId);
      } catch (error) {
        console.log('Failed to sync my donations, using cached data');
      }
    }

    return await databaseService.getDonationsByUserId(userId);
  }

  async getCart(userId) {
    const online = await this.checkOnlineStatus();

    if (online) {
      try {
        await this.syncCart(userId);
      } catch (error) {
        console.log('Failed to sync cart, using cached data');
      }
    }

    return await databaseService.getCartByUserId(userId);
  }

  async getUserData(userId) {
    const online = await this.checkOnlineStatus();

    if (online) {
      try {
        return await this.syncUserData(userId);
      } catch (error) {
        console.log('Failed to sync user data, using cached data');
      }
    }

    return await databaseService.getUserByServerId(userId);
  }

  // ============ OFFLINE-FIRST OPERATIONS ============

  async bookItem(userId, itemId) {
    const online = await this.checkOnlineStatus();

    // Add to local database immediately
    await databaseService.addToCart(userId, itemId);
    
    // Update donation availability locally
    const donation = await databaseService.getDonationByServerId(itemId);
    if (donation) {
      await databaseService.updateDonation(itemId, {
        ...donation,
        available: false,
        bookedBy: userId
      });
    }

    if (online) {
      // Try to sync immediately
      try {
        await this.uploadCartAdd(userId, itemId);
      } catch (error) {
        console.log('Failed to book online, queued for sync');
        // Add to sync queue
        await databaseService.addToSyncQueue('add', 'cart', null, { userId, itemId });
      }
    } else {
      // Add to sync queue
      await databaseService.addToSyncQueue('add', 'cart', null, { userId, itemId });
    }

    return { success: true, offline: !online };
  }

  async removeFromCart(userId, itemId) {
    const online = await this.checkOnlineStatus();

    // Remove from local database immediately
    await databaseService.removeFromCart(userId, itemId);
    
    // Update donation availability locally
    const donation = await databaseService.getDonationByServerId(itemId);
    if (donation) {
      await databaseService.updateDonation(itemId, {
        ...donation,
        available: true,
        bookedBy: null
      });
    }

    if (online) {
      try {
        await this.uploadCartRemove(userId, itemId);
      } catch (error) {
        console.log('Failed to remove online, queued for sync');
        await databaseService.addToSyncQueue('remove', 'cart', null, { userId, itemId });
      }
    } else {
      await databaseService.addToSyncQueue('remove', 'cart', null, { userId, itemId });
    }

    return { success: true, offline: !online };
  }

  async deleteDonation(donationId) {
    const online = await this.checkOnlineStatus();

    // Delete from local database immediately
    await databaseService.deleteDonation(donationId);

    if (online) {
      try {
        await this.uploadDonationDelete(donationId);
      } catch (error) {
        console.log('Failed to delete online, queued for sync');
        await databaseService.addToSyncQueue('delete', 'donation', donationId, null);
      }
    } else {
      await databaseService.addToSyncQueue('delete', 'donation', donationId, null);
    }

    return { success: true, offline: !online };
  }

  // Cleanup
  destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }
}

// Export singleton instance
const syncService = new SyncService();
export default syncService;
