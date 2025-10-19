
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

const ProfileScreen = ({ user: propUser, onLogout: propOnLogout }) => {
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

  const handleNavigation = (screen) => {
    const actualUserId = user?.userId || user?._id || user;
    
    switch(screen) {
      case 'basket':
        router.push({ pathname: '/basket', params: { user: JSON.stringify(user) } });
        break;
      case 'donations':
        router.push({ pathname: '/mydonations', params: { user: JSON.stringify(user) } });
        break;
      case 'messages':
        router.push({ pathname: '/messages', params: { user: JSON.stringify(user) } });
        break;
      case 'account':
        router.push({ pathname: '/myaccount', params: { user: JSON.stringify(user) } });
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    // Clear user data and navigate to login
    if (propOnLogout) {
      propOnLogout();
    }
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Go to</Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigation('basket')}
          >
            <Text style={styles.navButtonText}>My Basket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigation('donations')}
          >
            <Text style={styles.navButtonText}>My Donations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigation('messages')}
          >
            <Text style={styles.navButtonText}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleNavigation('account')}
          >
            <Text style={styles.navButtonText}>My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.logoutButton]}
            onPress={() => handleNavigation('logout')}
          >
            <Text style={[styles.navButtonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>

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
            // Already on profile
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
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C6A2',
  },
  buttonContainer: {
    paddingHorizontal: 40,
    gap: 15,
  },
  navButton: {
    backgroundColor: '#00C6A2',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF8A80',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
  },
});

export default ProfileScreen;
