import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'letsdonate.db';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // Initialize database connection and create tables
  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  // Create all required tables
  async createTables() {
    try {
      // Users table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          server_id TEXT UNIQUE,
          firstname TEXT NOT NULL,
          lastname TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          contactnumber TEXT,
          address TEXT,
          synced INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Donations table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS donations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          server_id TEXT UNIQUE,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT,
          street TEXT,
          city TEXT,
          state TEXT,
          postalCode TEXT,
          country TEXT,
          latitude REAL,
          longitude REAL,
          image TEXT,
          user_id TEXT,
          available INTEGER DEFAULT 1,
          booked_by TEXT,
          synced INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Cart table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          server_id TEXT UNIQUE,
          user_id TEXT NOT NULL,
          item_id TEXT NOT NULL,
          synced INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, item_id)
        );
      `);

      // Sync queue table for offline operations
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          operation TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          data TEXT,
          status TEXT DEFAULT 'pending',
          error TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          retries INTEGER DEFAULT 0
        );
      `);

      console.log('All tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // ============ USER OPERATIONS ============

  async saveUser(user) {
    try {
      const result = await this.db.runAsync(
        `INSERT OR REPLACE INTO users (server_id, firstname, lastname, email, contactnumber, address, synced, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [user._id || user.id, user.firstname, user.lastname, user.email, user.contactnumber, user.address]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return result;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByServerId(serverId) {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE server_id = ?',
        [serverId]
      );
      return result;
    } catch (error) {
      console.error('Error getting user by server ID:', error);
      throw error;
    }
  }

  async updateUser(serverId, userData) {
    try {
      const result = await this.db.runAsync(
        `UPDATE users 
         SET firstname = ?, lastname = ?, email = ?, contactnumber = ?, address = ?, 
             synced = 0, updated_at = CURRENT_TIMESTAMP
         WHERE server_id = ?`,
        [userData.firstname, userData.lastname, userData.email, userData.contactnumber, userData.address, serverId]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // ============ DONATION OPERATIONS ============

  async saveDonation(donation) {
    try {
      const imageStr = Array.isArray(donation.image) ? JSON.stringify(donation.image) : donation.image;
      
      const result = await this.db.runAsync(
        `INSERT OR REPLACE INTO donations 
         (server_id, title, description, category, street, city, state, postalCode, country, 
          latitude, longitude, image, user_id, available, booked_by, synced, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [
          donation._id || donation.id,
          donation.title,
          donation.description,
          donation.category,
          donation.street,
          donation.city,
          donation.state,
          donation.postalCode,
          donation.country,
          donation.latitude,
          donation.longitude,
          imageStr,
          donation.userId || donation.user_id,
          donation.available ? 1 : 0,
          donation.bookedBy || donation.booked_by || null
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error saving donation:', error);
      throw error;
    }
  }

  async getAllDonations() {
    try {
      const donations = await this.db.getAllAsync('SELECT * FROM donations ORDER BY created_at DESC');
      
      // Parse image JSON strings
      return donations.map(d => ({
        ...d,
        _id: d.server_id,
        image: d.image ? JSON.parse(d.image) : [],
        userId: d.user_id,
        bookedBy: d.booked_by,
        available: d.available === 1
      }));
    } catch (error) {
      console.error('Error getting all donations:', error);
      throw error;
    }
  }

  async getDonationsByUserId(userId) {
    try {
      const donations = await this.db.getAllAsync(
        'SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      return donations.map(d => ({
        ...d,
        _id: d.server_id,
        image: d.image ? JSON.parse(d.image) : [],
        userId: d.user_id,
        bookedBy: d.booked_by,
        available: d.available === 1
      }));
    } catch (error) {
      console.error('Error getting donations by user ID:', error);
      throw error;
    }
  }

  async getDonationByServerId(serverId) {
    try {
      const donation = await this.db.getFirstAsync(
        'SELECT * FROM donations WHERE server_id = ?',
        [serverId]
      );
      
      if (donation) {
        return {
          ...donation,
          _id: donation.server_id,
          image: donation.image ? JSON.parse(donation.image) : [],
          userId: donation.user_id,
          bookedBy: donation.booked_by,
          available: donation.available === 1
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting donation by server ID:', error);
      throw error;
    }
  }

  async updateDonation(serverId, donationData) {
    try {
      const imageStr = Array.isArray(donationData.image) ? JSON.stringify(donationData.image) : donationData.image;
      
      const result = await this.db.runAsync(
        `UPDATE donations 
         SET title = ?, description = ?, category = ?, street = ?, city = ?, state = ?, 
             postalCode = ?, country = ?, latitude = ?, longitude = ?, image = ?,
             available = ?, booked_by = ?, synced = 0, updated_at = CURRENT_TIMESTAMP
         WHERE server_id = ?`,
        [
          donationData.title,
          donationData.description,
          donationData.category,
          donationData.street,
          donationData.city,
          donationData.state,
          donationData.postalCode,
          donationData.country,
          donationData.latitude,
          donationData.longitude,
          imageStr,
          donationData.available ? 1 : 0,
          donationData.bookedBy || donationData.booked_by || null,
          serverId
        ]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  }

  async deleteDonation(serverId) {
    try {
      const result = await this.db.runAsync(
        'DELETE FROM donations WHERE server_id = ?',
        [serverId]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  }

  // ============ CART OPERATIONS ============

  async addToCart(userId, itemId) {
    try {
      const result = await this.db.runAsync(
        'INSERT OR IGNORE INTO cart (user_id, item_id, synced) VALUES (?, ?, 1)',
        [userId, itemId]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async getCartByUserId(userId) {
    try {
      const cartItems = await this.db.getAllAsync(
        `SELECT c.*, d.* 
         FROM cart c
         LEFT JOIN donations d ON c.item_id = d.server_id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`,
        [userId]
      );
      
      // Filter out items where donation doesn't exist (orphaned cart items)
      const validItems = cartItems.filter(item => item.server_id !== null);
      
      // Clean up orphaned cart items (donations that no longer exist)
      const orphanedItems = cartItems.filter(item => item.server_id === null);
      for (const orphaned of orphanedItems) {
        console.warn('Removing orphaned cart item:', orphaned.item_id);
        await this.removeFromCart(orphaned.user_id, orphaned.item_id);
      }
      
      return validItems.map(item => ({
        userId: item.user_id,
        itemId: {
          _id: item.server_id,
          title: item.title,
          description: item.description,
          category: item.category,
          street: item.street,
          city: item.city,
          state: item.state,
          postalCode: item.postalCode,
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude,
          image: item.image ? JSON.parse(item.image) : [],
          available: item.available === 1,
          userId: item.user_id
        }
      }));
    } catch (error) {
      console.error('Error getting cart by user ID:', error);
      throw error;
    }
  }

  async removeFromCart(userId, itemId) {
    try {
      const result = await this.db.runAsync(
        'DELETE FROM cart WHERE user_id = ? AND item_id = ?',
        [userId, itemId]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async getCartCount(userId) {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
        [userId]
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  // ============ SYNC QUEUE OPERATIONS ============

  async addToSyncQueue(operation, entityType, entityId, data) {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO sync_queue (operation, entity_type, entity_id, data) VALUES (?, ?, ?, ?)',
        [operation, entityType, entityId, JSON.stringify(data)]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  async getPendingSyncItems() {
    try {
      const items = await this.db.getAllAsync(
        "SELECT * FROM sync_queue WHERE status = 'pending' AND retries < 3 ORDER BY created_at ASC"
      );
      
      return items.map(item => ({
        ...item,
        data: item.data ? JSON.parse(item.data) : null
      }));
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      return [];
    }
  }

  async markSyncItemCompleted(id) {
    try {
      await this.db.runAsync(
        "UPDATE sync_queue SET status = 'completed' WHERE id = ?",
        [id]
      );
    } catch (error) {
      console.error('Error marking sync item completed:', error);
    }
  }

  async markSyncItemFailed(id, error) {
    try {
      await this.db.runAsync(
        "UPDATE sync_queue SET status = 'failed', error = ?, retries = retries + 1 WHERE id = ?",
        [error, id]
      );
    } catch (error) {
      console.error('Error marking sync item failed:', error);
    }
  }

  async clearSyncQueue() {
    try {
      await this.db.runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  // ============ UTILITY OPERATIONS ============

  async clearAllData() {
    try {
      await this.db.execAsync(`
        DELETE FROM users;
        DELETE FROM donations;
        DELETE FROM cart;
        DELETE FROM sync_queue;
      `);
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
