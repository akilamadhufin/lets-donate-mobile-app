import React, { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { Text,View } from 'react-native';

import HomeScreen from './components/HomeScreen';
import RegisterScreen from './components/RegisterScreen';
import LoginScreen from './components/LoginScreen';

const SERVER_URL = 'http://10.0.2.2:3000';

export default function App() {

// useState for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Registration state and error
  const [showRegister, setShowRegister] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');


    // Registration function
  const handleRegister = async (formData) => {
    try {
      setRegisterLoading(true);
      setRegisterError('');
      
      const response = await fetch(`${SERVER_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // The server redirects on success
  if (response.redirected || response.status === 200) {

        const userData = {
          email: formData.email,
          firstname: formData.firstname,
        };
        setUser(userData);
        setIsLoggedIn(true);
        setShowRegister(false);
      } else {
        throw new Error('Registration failed');
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setRegisterError('Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };


  // Navigation functions for registration
const handleShowRegister = () => {
  setShowRegister(true);
  setLoginError('');
};

  const handleBackToLogin = () => {
  setShowRegister(false);
  setRegisterError('');
};


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
      const response = await fetch(`${SERVER_URL}/login`, {
        method: 'POST',  // in here we use POST instead of GET to enhance security. if GET is used, login credentials are exposed in the URL
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // The server redirects on success, so we check for redirect or success status
      if (response.redirected || response.status === 200) {
        
        const userData = {
          email: email,
          firstname: email.split('@')[0], // Extract firstname from email and it will be displayed in the homescreen
        };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        throw new Error('Invalid credentials');
      }
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
  // Show registration screen if not logged in
  if (showRegister) {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onBackToLogin={handleBackToLogin}
        loading={registerLoading}
        error={registerError}
      />
    );
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSignUp={handleShowRegister}
      loading={loginLoading}
      error={loginError}
    />
  );
}
