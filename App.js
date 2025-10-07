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



  return (
    <View style={styles.container}>
      <Text>this is let's donate app</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
