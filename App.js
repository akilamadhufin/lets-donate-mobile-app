import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput,TouchableOpacity,Image,ScrollView,ActivityIndicator,FlatList, } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';


export default function App() {

// useState for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);






  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text>home screen</Text>
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
