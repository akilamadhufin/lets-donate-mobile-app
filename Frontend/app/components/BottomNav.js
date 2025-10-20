import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**

 * - onNavigate: function(pathOrTab) -> called when user taps a nav item
 */
export default function BottomNav({ active = 'Home', onNavigate = () => {} }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navBtn} onPress={() => onNavigate('/') }>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={active === 'Home' ? styles.navTextActive : styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => onNavigate('/donate') }>
        <Text style={styles.navIcon}>🤲</Text>
        <Text style={active === 'Donate' ? styles.navTextActive : styles.navText}>Donate</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => onNavigate('/basket') }>
        <Text style={styles.navIcon}>🧺</Text>
        <Text style={active === 'Basket' ? styles.navTextActive : styles.navText}>Basket</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => onNavigate('/profile') }>
        <Text style={styles.navIcon}>👤</Text>
        <Text style={active === 'Profile' ? styles.navTextActive : styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
