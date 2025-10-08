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
    