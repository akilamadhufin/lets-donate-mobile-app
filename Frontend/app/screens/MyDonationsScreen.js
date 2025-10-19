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
//Handle delete donation
  const handleDelete = (donationId, title) => {
    Alert.alert(
      'Delete Donation',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${SERVER_URL}/api/donations/${donationId}`, {
                method: 'DELETE',
              });

              const result = await response.json();

              if (result.success) {
                Alert.alert('Success', 'Donation deleted successfully');
                fetchMyDonations();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete donation');
              }
            } catch (error) {
              console.error('Error deleting donation:', error);
              Alert.alert('Error', 'An error occurred while deleting the donation');
            }
          },
        },
      ]
    );
  };
  
  // Fetch data when component loads
  useEffect(() => {
    fetchMyDonations();
  }, []);
 // Render empty component
  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyText}>No donations yet</Text>
      <Text style={styles.emptySubtext}>Start donating items to help others!</Text>
      <TouchableOpacity
        style={styles.donateBtn}
        onPress={() => {
          const actualUserId = user?.userId || user?._id || user;
          router.push({ pathname: '/donate', params: { userId: actualUserId } });
        }}
      >
        <Text style={styles.donateBtnText}>Donate Now</Text>
      </TouchableOpacity>
    </View>
  );
// DonationItem component for FlatList
  const DonationItem = ({ item }) => {
    const images = Array.isArray(item.image) ? item.image : (item.image ? [item.image] : []);
    const mainImg = images.length > 0 ? `${SERVER_URL}${images[0]}` : null;

    return (
      <View style={styles.donationCard}>
        <View style={styles.cardContent}>
          <Image
            source={mainImg ? { uri: mainImg } : require('../../assets/images/icon.png')}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemLocation}>Pickup from {item.city}</Text>
            <View style={[styles.statusBadge, item.available ? styles.statusAvailable : styles.statusBooked]}>
              <Text style={[styles.statusText, item.available ? styles.statusTextAvailable : styles.statusTextBooked]}>
                {item.available ? '✓ Available' : '✗ Booked'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id, item.title)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => <DonationItem item={item} />;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00C6A2" />
          <Text style={styles.loadingText}>Loading your donations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMyDonations()}>
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
          <Text style={styles.headerTitle}>My Donations</Text>
          <Text style={styles.headerSubtitle}>
            {donations.length} {donations.length === 1 ? 'item' : 'items'} donated
          </Text>
        </View>

         {/* Donations List */}
                <FlatList
                  data={donations}
                  renderItem={renderItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={[
                    styles.listContent,
                    donations.length === 0 && styles.listContentEmpty
                  ]}
                  ListEmptyComponent={renderEmptyComponent}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />

        {/* Bottom Navigation */}
        <BottomNav
          active="Profile"
          onNavigate={(path) => {
            const actualUserId = user?.userId || user?._id || user;
            if (path === '/') {
              router.push({ pathname: '/', params: { user: JSON.stringify(user) } });
            } else if (path === '/donate') {
              router.push({ pathname: '/donate', params: { userId: actualUserId } });
            } else if (path === '/basket') {
              router.push({ pathname: '/basket', params: { user: JSON.stringify(user) } });
            } else if (path === '/profile') {
              router.push({ pathname: '/profile', params: { user: JSON.stringify(user) } });
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};