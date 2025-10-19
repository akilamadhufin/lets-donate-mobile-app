import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import HomeScreen from './screens/HomeScreen';
import LoginPage from './screens/LoginScreen';

export default function Index() {
  const params = useLocalSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (params.user) {
      try {
        const parsedUser = JSON.parse(params.user);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch {
      }
    }
  }, [params.user]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <HomeScreen user={user} onLogout={handleLogout} />;
}
