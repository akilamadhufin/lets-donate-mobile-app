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

const SERVER_URL = 'http://10.0.2.2:3000';

const MyDonationsScreen = ({ user: propUser }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  let user = propUser;
  if (!user && params.user) {
    try {
      user = JSON.parse(params.user);
    } catch {
      user = null;
    }
  }

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's donations from server
  const fetchMyDonations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      const actualUserId = user?.userId || user?._id || user;
      if (!actualUserId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/mydonations/${actualUserId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDonations(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load your donations. Please check your internet connection.');
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
    fetchMyDonations(true);
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
    color: '#00C6A2',
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
  donateBtn: {
    backgroundColor: '#00C6A2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  donateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  donationCard: {
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
    color: '#00C6A2',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#e8f5e8',
  },
  statusBooked: {
    backgroundColor: '#ffe8e8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextAvailable: {
    color: '#2d8a2d',
  },
  statusTextBooked: {
    color: '#cc4444',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#00C6A2',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FF8A80',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyDonationsScreen;
