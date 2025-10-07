
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './components/HomeScreen';


export default function App() {

// useState for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };


// Show main app if logged in
  if (isLoggedIn) {
    return <HomeScreen user={user} onLogout={handleLogout} />;
  }
  // Show login/register screen if not logged in
  return (
    <>
      <StatusBar style="auto" />
      {/* Add your login/register UI here */}
      <h1>Welcome! Please log in or register.</h1>
    </>
  );
}

