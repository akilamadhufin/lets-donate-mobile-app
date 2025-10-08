import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const LoginScreen = ({ onLogin, onSignUp, loading, error }) => {
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginPress = () => {
        if (email && password) {
          onLogin(email, password);
        }
      };
    return (
        <SafeAreaView style={styles.loginContainer}>
          <View style={styles.loginContent}>
           {/* Header */}
                   <View style={styles.loginHeader}>
                     <TouchableOpacity style={styles.backButton}>
                       <Text style={styles.backArrow}>←</Text>
                     </TouchableOpacity>
                     <Text style={styles.loginTitle}>Login</Text>
                   </View>
            {/* Logo/Icon */}
                           <View style={styles.logoContainer}>
                             <View style={styles.logoIcon}>
                               <Text style={styles.heartIcon}>💚</Text>
                             </View>
                           </View>