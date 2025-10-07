import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput,TouchableOpacity,Image,ScrollView,ActivityIndicator,FlatList, } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// categories array
const categories = ['All', 'Clothes', 'Books', 'Sports', 'Electronics'];
const SERVER_URL = 'http://10.0.2.2:3000'; // server URL

export default function App() {

// useState for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

// useState for items
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

    // Fetch donations from server
  const fetchDonations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await fetch(`${SERVER_URL}/api/donations`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const donations = data.data;
      
      console.log('Using donations array:', donations.length, 'items');
      
      setItems(donations);
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donations. Please check your internet connection.');
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
    fetchDonations();
  }, []);


    // Filter items by category or search
  const filteredItems = items.filter(
    (item) =>
      (selectedCategory === 'All' || item.category === selectedCategory) &&
      item.title.toLowerCase().includes(search.toLowerCase())
  );

   // Render empty component
  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.noItemsText}>
        {selectedCategory === 'All' 
          ? 'No donations available at the moment.'
          : `No ${selectedCategory.toLowerCase()} items available.`
        }
      </Text>
    </View>
  );

    // Render individual item
  const renderItem = ({ item }) => (
    <View style={styles.itemCardRow}>
      <Image 
        source={
          item.image 
            ? { uri: `${SERVER_URL}${item.image}` }
            : require('../assets/adaptive-icon.png')
        } 
        style={styles.itemImage} 
      />
      <View style={[styles.itemCard, !item.available && styles.itemCardUnavailable]}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, item.available ? styles.statusAvailable : styles.statusUnavailable]}>
            <Text style={[styles.statusText, item.available ? styles.statusTextAvailable : styles.statusTextUnavailable]}>
              {item.available ? '✓ Available' : '✗ Booked'}
            </Text>
          </View>
        </View>
        <Text style={styles.itemLocation}>Pickup from {item.pickupLocation}</Text>
        
        <TouchableOpacity style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>More Details</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bookBtn, !item.available && styles.bookBtnDisabled]}
          disabled={!item.available}
        >
          <Text style={[styles.bookBtnText, !item.available && styles.bookBtnTextDisabled]}>
            {item.available ? 'Book Item' : 'Already Booked'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}></SafeAreaView>
      <View style={styles.container}>
        {/* Greeting */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingSmall}>Hi {user?.firstname || 'User'}!!</Text>
              <Text style={styles.greetingBold}>Good Morning</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="search by category or name"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={{ fontSize: 20, color: '#fff' }}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filters */}
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

         {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navBtn}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navTextActive}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/donate')}>
            <Text style={styles.navIcon}>🤲</Text>
            <Text style={styles.navText}>Donate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Text style={styles.navIcon}>🧺</Text>
            <Text style={styles.navText}>Basket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>

        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 10,
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
});
