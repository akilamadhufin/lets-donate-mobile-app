import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import syncService from '../database/SyncService';
import { useDatabase } from '../contexts/DatabaseContext';

const SERVER_URL = 'http://10.0.2.2:3000';

const BasketScreen = ({ user: propUser }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { dbInitialized, isOnline, isSyncing } = useDatabase();

  let user = propUser;
  if (!user && params.user) {
    try {
      user = JSON.parse(params.user);
    } catch {
      user = null;
    }
  }

  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch basket items from server
  const fetchBasketItems = async (isRefresh = false) => {
        if (!dbInitialized) {
      console.log('Database not yet initialized');
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      
      // Extract the actual userId string from the user object
      const actualUserId = user?.userId || user?._id || user;
      if (!actualUserId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      // Get cart from local database (SyncService handles server sync)
      const cart = await syncService.getCart(actualUserId);
      setBasketItems(cart);
      setError(null);
    } catch (err) {
      console.error('Error fetching basket:', err);
      setError(isOnline 
        ? 'Failed to load basket items. Please try again.' 
        : 'Offline mode: Showing cached basket.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBasketItems(true);
  };

  // Handle remove item from basket
  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your basket?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Extract the actual userId string from the user object
              const actualUserId = user?.userId || user?._id || user;
              const result = await syncService.removeFromCart(actualUserId, itemId);

              if (result.success) {
                if (result.offline) {
                  Alert.alert('Success', 'Item removed! Will sync when online.');
                } else {
                  Alert.alert('Success', 'Item removed from basket');
                }
                fetchBasketItems();
              } else {
                Alert.alert('Error', 'Failed to remove item');
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'An error occurred while removing the item');
            }
          },
        },
      ]
    );
  };

  // Fetch data when component loads
  useEffect(() => {
    if (dbInitialized) {
      fetchBasketItems();
    }
  }, [dbInitialized]);

  // Render empty component
  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>🧺</Text>
      <Text style={styles.emptyText}>Your basket is empty</Text>
      <Text style={styles.emptySubtext}>Browse items and book something!</Text>
      <TouchableOpacity
        style={styles.browseBtn}
        onPress={() => router.push('/')}
      >
        <Text style={styles.browseBtnText}>Browse Items</Text>
      </TouchableOpacity>
    </View>
  );

  // BasketItem component for FlatList
  const BasketItem = ({ item }) => {
    const donation = item.itemId;
    if (!donation) return null;

    const images = Array.isArray(donation.image) ? donation.image : (donation.image ? [donation.image] : []);
    const mainImg = images.length > 0 ? `${SERVER_URL}${images[0]}` : null;
    const donor = donation.userId;

    return (
      <View style={styles.basketCard}>
        <View style={styles.cardContent}>
          <Image
            source={mainImg ? { uri: mainImg } : require('../../assets/images/icon.png')}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{donation.title}</Text>
            <Text style={styles.itemLocation}>Pickup from {donation.city}</Text>
            {donor && (
              <Text style={styles.donorInfo}>Donor: {donor.firstname} {donor.lastname}</Text>
            )}
            <Text style={styles.bookedDate}>
              Booked on: {new Date(item.bookedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => {
              router.push({
                pathname: '/screens/DonationDetailsScreen',
                params: { donation: JSON.stringify(donation) },
              });
            }}
          >
            <Text style={styles.detailsBtnText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemoveItem(donation._id)}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => <BasketItem item={item} />;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00C6A2" />
          <Text style={styles.loadingText}>Loading your basket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBasketItems()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Basket</Text>
          <Text style={styles.headerSubtitle}>
            {basketItems.length} {basketItems.length === 1 ? 'item' : 'items'} booked
          </Text>
        </View>

        {/* Basket Items List */}
        <FlatList
          data={basketItems}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            basketItems.length === 0 && styles.listContentEmpty
          ]}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />

        {/* Bottom Navigation */}
        <BottomNav
          active="Basket"
          onNavigate={(path) => {
            const actualUserId = user?.userId || user?._id || user;
            if (path === '/') {
              router.push({ pathname: '/', params: { user: JSON.stringify(user) } });
            } else if (path === '/donate') {
              router.push({ pathname: '/donate', params: { userId: actualUserId } });
            } else if (path === '/basket') {
              // Already on basket
            } else if (path === '/profile') {
              router.push({ pathname: '/profile', params: { user: JSON.stringify(user) } });
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#00C6A2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  browseBtn: {
    backgroundColor: '#00C6A2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  basketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  donorInfo: {
    fontSize: 14,
    color: '#00C6A2',
    marginBottom: 2,
  },
  bookedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  detailsBtnText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    flex: 1,
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BasketScreen;
