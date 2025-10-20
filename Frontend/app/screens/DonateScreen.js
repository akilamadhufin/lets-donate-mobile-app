import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';


export default function DonateScreen(props) {
  const params = useLocalSearchParams();
  // Try to get userId from navigation params, props, or context
  const userId = params.userId || props.userId || (props.user && props.user._id) || null;
  console.log('Current userId:', userId);
  const router = useRouter();
  console.log('DonateScreen rendered');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState({
    latitude: 60.9827,
    longitude: 24.4641,
  });

  const [images, setImages] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBhEo-ui4dWJKKEyLbRaTwhoMNUnzVeL5w';

  // Geocode address when any address field changes
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!street || !city || !state || !postalCode || !country) return;
      setIsGeocoding(true);
      const address = `${street}, ${city}, ${state}, ${postalCode}, ${country}`;
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setLocation({ latitude: lat, longitude: lng });
        }
      } catch (err) {
        // Optionally show error to user
      } finally {
        setIsGeocoding(false);
      }
    };
    geocodeAddress();
  }, [street, city, state, postalCode, country]);

  const handleMapPress = (e) => {
    setLocation(e.nativeEvent.coordinate);
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      // For single selection, result.assets is array with one item
      // For multiple, result.selected is array (expo-image-picker v14+)
      const newImages = result.assets ? result.assets.map(a => a.uri) : [];
      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      console.log('Submit pressed');
      // Prepare FormData for backend
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('postalCode', postalCode);
      formData.append('country', country);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      // Append images
      images.forEach((imgUri, idx) => {
        const filename = imgUri.split('/').pop();
        formData.append('image', {
          uri: imgUri,
          name: filename || `image_${idx}.jpg`,
          type: 'image/jpeg',
        });
      });
      // Append userId if available
      if (userId) {
        formData.append('userId', userId);
      }
      // Send to backend
      const response = await fetch('http://10.0.2.2:3000/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      let result;
      try {
        result = await response.json();
      } catch (err) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw err;
      }
        if (response.ok) {
          console.log('Donation submitted successfully:', result);
          // Navigate to HomeScreen (root route) and pass user as param
          router.replace({ pathname: '/', params: { user: JSON.stringify(userId) } });
        } else {
          console.error('Error submitting donation:', result);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Item Title *"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Item Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >

              {/*  Picker is used to select the category of the item  */}
              <Picker.Item label="Select Category *" value="" />
              <Picker.Item label="Clothes" value="Clothes" />
              <Picker.Item label="Books" value="Books" />
              <Picker.Item label="Sports" value="Sports" />
              <Picker.Item label="Electronics" value="Electronics" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Street *"
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            style={styles.input}
            placeholder="City *"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="State *"
            value={state}
            onChangeText={setState}
          />
          <TextInput
            style={styles.input}
            placeholder="Postal Code *"
            value={postalCode}
            onChangeText={setPostalCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Country *"
            value={country}
            onChangeText={setCountry}
          />
          <Text style={styles.mapLabel}>
            {isGeocoding ? 'Locating address...' : 'Mark the location on the map (auto from address, tap to adjust)'}
          </Text>
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={location} />
          </MapView>
          <Text style={styles.uploadLabel}>Upload images</Text>
          <View style={styles.imagePreviewRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageThumbWrap}>
                <Image source={{ uri: img }} style={styles.imageThumb} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => handleRemoveImage(idx)}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.uploadBtns}>
            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
              <Text>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleTakePhoto}>
              <Text>Take photo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Submit Donation"
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  mapLabel: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  map: {
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  uploadBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  uploadBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  submitBtn: {
    backgroundColor: '#00C6A2',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    minWidth: 200,
    alignSelf: 'stretch',
  },
  picker: {
    height: 48,
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
  },
    pickerItem: {
    fontSize: 18,
    height: 55,
  },
    imagePreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  imageThumbWrap: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  imageThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 2,
  },
});
