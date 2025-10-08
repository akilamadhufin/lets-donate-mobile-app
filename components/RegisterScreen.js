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

const RegisterScreen = ({ onRegister, onBackToLogin, loading, error }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contactnumber: '',
    address: '',
    password: '',
  })

  return(
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text> test register screen </Text>
  
        </View>
      </ScrollView>
    </SafeAreaView>
  
  );
  };
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },

  });
export default RegisterScreen;
