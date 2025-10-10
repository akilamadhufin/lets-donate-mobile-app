
import React, { useState } from 'react';

import HomeScreen from './screens/HomeScreen';
import LoginPage from './screens/LoginScreen';

export default function Index() {
  // Simple authentication state for demonstration
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume logged in for now
  const [user, setUser] = useState({ firstname: 'User' });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // If not logged in, show the login page
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <HomeScreen user={user} onLogout={handleLogout} />;
}
