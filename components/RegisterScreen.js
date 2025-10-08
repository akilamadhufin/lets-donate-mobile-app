import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,} from 'react-native';
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
        {/* Header */}
       <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign up</Text>
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
