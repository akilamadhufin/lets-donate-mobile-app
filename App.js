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
  setShowRegister(false);
};


// Show main app if logged in
if (isLoggedIn) {
  return <HomeScreen user={user} onLogout={handleLogout} />;
}
}

