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
  });

  // input handler for form fields
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle register button
  const handleRegisterPress = () => {
    // Check if all fields are filled
    const { firstname, lastname, email, contactnumber, address, password } = formData;
    if (firstname && lastname && email && contactnumber && address && password) {
      onRegister(formData);
    }
  };

  //function isFormValid checks if all required registration fields are filled
    const isFormValid = () => {
    const { firstname, lastname, email, contactnumber, address, password } = formData;
    return firstname && lastname && email && contactnumber && address && password;
  };

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
        {/* Logo*/}
          <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.heartIcon}>💚</Text>
          </View>
          <View style={styles.handIcon}>
            <Text style={styles.handEmoji}>🤲</Text>
          </View>
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeTitle}>Welcome to Let's Donate</Text>
        <Text style={styles.welcomeSubtitle}>Register here</Text>


          {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              First Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
              value={formData.firstname}
              onChangeText={(value) => handleInputChange('firstname', value)}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Last Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
              value={formData.lastname}
              onChangeText={(value) => handleInputChange('lastname', value)}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Contact Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Contact Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your contact number"
              placeholderTextColor="#999"
              value={formData.contactnumber}
              onChangeText={(value) => handleInputChange('contactnumber', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={styles.errorMessage}>{error}</Text>
          ) : null}


            {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, (!isFormValid() || loading) && styles.registerButtonDisabled]}
            onPress={handleRegisterPress}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

                
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
    backButton: {
    marginRight: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#00C6AE',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 44,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#00C6AE',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heartIcon: {
    fontSize: 40,
    color: '#fff',
  },
  handIcon: {
    position: 'absolute',
    bottom: -10,
    left: '60%',
  },
  handEmoji: {
    fontSize: 35,
    color: '#00C6AE',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C6AE',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#ff4444',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    minHeight: 50,
  },
  errorMessage: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#00C6AE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  });
export default RegisterScreen;
