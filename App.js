import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import { StatusBar } from 'expo-status-bar';
import { Text,View } from 'react-native';

import HomeScreen from './components/HomeScreen';


export default function App() {

// useState for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };
  // Login function
  const handleLogin = async (email, password) => {
    try {
      setLoginLoading(true);
      setLoginError('');
      // ...server request logic...
      // On success:
      // setUser(userData);
      // setIsLoggedIn(true);
    } catch (err) {
      setLoginError('Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

// Show main app if logged in
  if (isLoggedIn) {
    return <HomeScreen user={user} onLogout={handleLogout} />;
  }
  // Show login/register screen if not logged in
  return (
    <View>
      <StatusBar style="auto" />
      {/* Add your login/register UI here */}
      <Text>Welcome! Please log in or register.</Text>
    </View>
  );
}

// Show login screen (default)
return (
  <LoginScreen 
    onLogin={handleLogin}
    onSignUp={handleShowRegister}
    loading={loginLoading}
    error={loginError}
  />
);