
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/HomeScreen';

const SERVER_URL = 'http://10.0.2.2:3000';

export default function App() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Navigation states
  const [showRegister, setShowRegister] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Login function
  const handleLogin = async (email, password) => {
    try {
      setLoginLoading(true);
      setLoginError('');
      
      const response = await fetch(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      // The server redirects on success, so we check for redirect or success status
      if (response.redirected || response.status === 200) {
        // Create a user object for the frontend (since server doesn't return JSON)
        const userData = {
          email: email,
          firstname: email.split('@')[0], // Extract firstname from email
        };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        throw new Error('Invalid credentials');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  // Registration function
  const handleRegister = async (formData) => {
    try {
      setRegisterLoading(true);
      setRegisterError('');
      
      const response = await fetch(`${SERVER_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: Object.keys(formData)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`)
          .join('&'),
      });

      // The server redirects on success or auto-logs in
      if (response.redirected || response.status === 200) {
        // Create a user object for the frontend
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

  // Navigation functions
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
    setShowRegister(false);
  };

  // Show main app if logged in
  if (isLoggedIn) {
    return <HomeScreen user={user} onLogout={handleLogout} />;
  }

  // Show registration screen
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

  // Show login screen (default)
  return (
    <LoginScreen 
      onLogin={handleLogin}
      onSignUp={handleShowRegister}
      loading={loginLoading}
      error={loginError}
    />
  );
}
