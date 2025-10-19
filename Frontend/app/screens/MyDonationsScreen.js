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
   // Handle edit donation
  const handleEdit = (donation) => {
    // Navigate to edit screen
    router.push({ 
      pathname: '/editdonation', 
      params: { 
        donation: JSON.stringify(donation),
        user: JSON.stringify(user)
      } 
    });
  };
