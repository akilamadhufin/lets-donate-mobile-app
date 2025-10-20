import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import syncService from '../database/SyncService';
import { useDatabase } from '../contexts/DatabaseContext';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import FilterModal from '../components/FilterModal';

const categories = ['All', 'Clothes', 'Books', 'Sports', 'Electronics'];
const SERVER_URL = 'http://10.0.2.2:3000';

const HomeScreen = ({ user: propUser, onLogout }) => {
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'newest',
    availableOnly: false,
  });


    // Book item handler using SyncService (offline-first)
  const handleBookItem = async (itemId) => {
    try {
      // Extract the actual userId string from the user object
      const actualUserId = user?.userId || user?._id || user;
      console.log('Booking with userId:', actualUserId);
      
      const result = await syncService.bookItem(actualUserId, itemId);

      if (result.success) {
        if (result.offline) {
          alert('Item booked! Will sync when online.');
        } else {
          alert('Item booked successfully!');
        }
        // Refresh the donations list from local database
        fetchDonations();
      } else {
        alert('Failed to book item');
      }
    } catch (error) {
      console.error('Error booking item:', error);
      alert('An error occurred while booking the item');
    }
  };

  // Fetch donations from server
  const fetchDonations = async (isRefresh = false) => {

        if (!dbInitialized) {
      console.log('Database not yet initialized');
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      // Get donations from local database (SyncService handles server sync)
      const donations = await syncService.getDonations();
      setItems(donations);
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(isOnline 
        ? 'Failed to load donations. Please try again.' 
        : 'Offline mode: Showing cached donations.');
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
    fetchDonations(true);
  };

  // Fetch data when component loads
  useEffect(() => {
    if (dbInitialized) {
      fetchDonations();
    }
  }, [dbInitialized]);

  // Apply advanced filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [items, search, filters]);

  const applyFiltersAndSearch = () => {
    let result = [...items];

    // Apply search filter
    if (search.trim()) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }

    // Apply availability filter
    if (filters.availableOnly) {
      result = result.filter(item => item.available === true);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    setFilteredItems(result);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = (resetFilters) => {
    setFilters(resetFilters);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  // Render empty component
  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.noItemsText}>
        {selectedCategory === 'All'
          ? 'No donations available at the moment.'
          : `No ${selectedCategory.toLowerCase()} items available.`}
      </Text>
    </View>
  );

  // DonationItem component for FlatList
  const DonationItem = ({ item }) => {
    const images = Array.isArray(item.image) ? item.image : (item.image ? [item.image] : []);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const showPrev = () => setCurrentImgIdx(idx => Math.max(0, idx - 1));
    const showNext = () => setCurrentImgIdx(idx => Math.min(images.length - 1, idx + 1));
    const mainImg = images.length > 0 ? `${SERVER_URL}${images[currentImgIdx]}` : null;
    return (
      <View style={styles.itemCardRow}>
        <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Image
            source={mainImg ? { uri: mainImg } : require('../../assets/images/icon.png')}
            style={styles.itemImage}
          />
          {images.length > 1 && (
            <View style={styles.carouselArrows}>
              <TouchableOpacity
                style={[styles.arrowBtn, currentImgIdx === 0 && styles.arrowBtnDisabled]}
                onPress={showPrev}
                disabled={currentImgIdx === 0}
              >
                <Text style={styles.arrowText}>{'<'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arrowBtn, currentImgIdx === images.length - 1 && styles.arrowBtnDisabled]}
                onPress={showNext}
                disabled={currentImgIdx === images.length - 1}
              >
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {images.length > 1 && (
            <Text style={styles.carouselIndicator}>{currentImgIdx + 1} / {images.length}</Text>
          )}
        </View>
        <View style={[styles.itemCard, !item.available && styles.itemCardUnavailable]}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, item.available ? styles.statusAvailable : styles.statusUnavailable]}>
              <Text style={[styles.statusText, item.available ? styles.statusTextAvailable : styles.statusTextUnavailable]}>
                {item.available ? '\u2713 Available' : '\u2717 Booked'}
              </Text>
            </View>
          </View>
          <Text style={styles.itemLocation}>
            📍 {item.city ? `${item.city}${item.state ? ', ' + item.state : ''}` : item.street || 'Location not specified'}
          </Text>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => {
              router.push({
                pathname: '/screens/DonationDetailsScreen',
                params: { donation: JSON.stringify(item) },
              });
            }}
          >
            <Text style={styles.detailsBtnText}>More Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookBtn, !item.available && styles.bookBtnDisabled]}
            disabled={!item.available}
            onPress={() => handleBookItem(item._id)}
          >
            <Text style={[styles.bookBtnText, !item.available && styles.bookBtnTextDisabled]}>
              {item.available ? 'Book Item' : 'Already Booked'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };




  // Render individual item
  const renderItem = ({ item }) => <DonationItem item={item} />;
  return(
<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Offline/Syncing Indicator */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>📡 Offline Mode - Showing cached data</Text>
          </View>
        )}
        {isSyncing && isOnline && (
          <View style={styles.syncingBanner}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.syncingBannerText}>Syncing...</Text>
          </View>
        )}
        
        {/* Greeting */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingSmall}>Hi {user?.firstname || 'User'}!!</Text>
              <Text style={styles.greetingBold}>Good Morning</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={() => onLogout?.()}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar with Filter Button */}
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search donations..."
            onClear={handleClearSearch}
            onFilterPress={() => setShowFilters(true)}
          />

          {/* Active Filter Indicator */}
          {(filters.category !== 'all' || filters.sortBy !== 'newest') && (
            <View style={styles.activeFiltersIndicator}>
              <Text style={styles.activeFiltersText}>
                {filteredItems.length} results 
                {filters.category !== 'all' && ` • ${filters.category}`}
              </Text>
              <TouchableOpacity 
                onPress={() => handleResetFilters({
                  category: 'all',
                  sortBy: 'newest',
                  availableOnly: false,
                })}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Category Filters - Legacy (can remove if you prefer only modal filters) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filter Modal */}
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />

        {/* while loading the donations */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00C6AE" />
            <Text style={styles.loadingText}>Loading donations...</Text>
          </View>
        )}

        {/* if donations are not loaded */}
        {error && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchDonations}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Item List */}
        {!loading && !error && (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={renderEmptyComponent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}

        {/* Bottom Navigation (reusable component) */}
        <BottomNav
            active="Home"
            onNavigate={(path) => {
              const actualUserId = user?.userId || user?._id || user;
              if (path === '/donate') {
                // Pass userId to DonateScreen
                router.push({ pathname: '/donate', params: { userId: actualUserId } });
              } else if (path === '/basket') {
                // Navigate to basket with user info
                router.push({ pathname: '/basket', params: { user: JSON.stringify(user) } });
              } else if (path === '/profile') {
                // Navigate to profile with user info
                router.push({ pathname: '/profile', params: { user: JSON.stringify(user) } });
              } else if (path === '/') {
                router.push('/');
              } else {
                router.push(path);
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
    paddingTop: 40,
    paddingHorizontal: 10,
  },
   offlineBanner: {
    backgroundColor: '#FF9800',
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 4,
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  syncingBanner: {
    backgroundColor: '#00C6AE',
    padding: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 4,
  },
  syncingBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    marginBottom: 10,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greetingSmall: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  greetingBold: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  searchButton: {
    backgroundColor: '#00C6AE',
    borderRadius: 20,
    padding: 8,
    marginLeft: 5,
  },
  categoryScroll: {
    marginBottom: 10,
  },
  categoryBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#00C6AE',
  },
  categoryText: {
    color: '#888',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  flatListContent: {
    paddingBottom: 80,
  },
  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  carouselArrows: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 2,
  },
  arrowBtn: {
    backgroundColor: '#00C6AE',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    opacity: 1,
  },
  arrowBtnDisabled: {
    opacity: 0.4,
  },
  arrowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: [{ translateX: -20 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 12,
    zIndex: 2,
  },
  itemCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 18,
    padding: 14,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardUnavailable: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00C6AE',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusAvailable: {
    backgroundColor: '#e8f5e8',
  },
  statusUnavailable: {
    backgroundColor: '#ffe8e8',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTextAvailable: {
    color: '#2d8a2d',
  },
  statusTextUnavailable: {
    color: '#cc4444',
  },
  itemLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  detailsBtn: {
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  detailsBtnText: {
    color: '#333',
    fontWeight: '500',
  },
  bookBtn: {
    backgroundColor: '#00C6AE',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: '#cccccc',
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookBtnTextDisabled: {
    color: '#888888',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navBtn: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  navText: {
    fontSize: 12,
    color: '#888',
  },
  navTextActive: {
    fontSize: 12,
    color: '#00C6AE',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#00C6AE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noItemsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  activeFiltersIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
});
export default HomeScreen;
