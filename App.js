import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput,TouchableOpacity,Image,ScrollView,ActivityIndicator,FlatList, } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

// useState for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);


  return (
    <View style={styles.container}>
      <Text>this is let's donate app</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
