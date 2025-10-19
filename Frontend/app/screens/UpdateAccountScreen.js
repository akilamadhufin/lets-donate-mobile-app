
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVER_URL = 'http://10.0.2.2:3000';

const UpdateAccountScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  let userData = null;
  if (params.userData) {
    try {
      userData = JSON.parse(params.userData);
    } catch {
      userData = null;
    }
  }

  let user = null;
  if (params.user) {
    try {
      user = JSON.parse(params.user);
    } catch {
      user = null;
    }
  }

  const [firstname, setFirstname] = useState(userData?.firstname || '');
  const [lastname, setLastname] = useState(userData?.lastname || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [contactnumber, setContactnumber] = useState(userData?.contactnumber || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    if (!firstname || !lastname || !email || !contactnumber || !address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const actualUserId = user?.userId || user?._id || user;
      
      const updateData = {
        firstname,
        lastname,
        email,
        contactnumber,
        address,
      };

      // Only include password if it was changed
      if (password && password.length > 0) {
        if (password.length < 5) {
          Alert.alert('Error', 'Password must be at least 5 characters');
          setLoading(false);
          return;
        }
        updateData.password = password;
      }

      const response = await fetch(`${SERVER_URL}/api/users/${actualUserId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert('Success', 'Account updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to My Account screen
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      Alert.alert('Error', 'An error occurred while updating your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Update Details</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstname}
              onChangeText={setFirstname}
              placeholder="Enter first name"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastname}
              onChangeText={setLastname}
              placeholder="Enter last name"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Contact Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={contactnumber}
              onChangeText={setContactnumber}
              placeholder="Enter contact number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password (optional)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Leave blank to keep current password</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Updating...' : 'Submit'}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00C6A2',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  eyeIconText: {
    fontSize: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    paddingLeft: 4,
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: '#00C6A2',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#80E3D1',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00C6A2',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    color: '#00C6A2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateAccountScreen;
