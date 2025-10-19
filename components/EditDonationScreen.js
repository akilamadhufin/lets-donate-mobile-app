import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';

const SERVER_URL = 'http://10.0.2.2:3000';
const GOOGLE_MAPS_API_KEY = 'AIzaSyCWCujwOxd2-jnpkUdx9_ZWFvzpIFjXZ4E';

const EditDonationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  let donation = null;
  let user = null;

  if (params.donation) {
    try {
      donation = JSON.parse(params.donation);
    } catch {
      donation = null;
    }
  }

  if (params.user) {
    try {
      user = JSON.parse(params.user);
    } catch {
      user = null;
    }
  }

  const [title, setTitle] = useState(donation?.title || '');
  const [description, setDescription] = useState(donation?.description || '');
  const [category, setCategory] = useState(donation?.category || '');
  const [street, setStreet] = useState(donation?.street || '');
  const [city, setCity] = useState(donation?.city || '');
  const [state, setState] = useState(donation?.state || '');
  const [postalCode, setPostalCode] = useState(donation?.postalCode || '');
  const [country, setCountry] = useState(donation?.country || '');
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(donation?.image || []);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [region, setRegion] = useState({
    latitude: donation?.latitude || 61.4978,
    longitude: donation?.longitude || 23.7610,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: donation?.latitude || 61.4978,
    longitude: donation?.longitude || 23.7610,
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Furniture',
    'Toys',
    'Sports Equipment',
    'Kitchen Items',
    'Other'
  ];

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to upload images.');
      }
    })();
  }, []);

  // Pick images from gallery
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permissions are required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Remove new image
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  // Handle map marker drag
  const handleMarkerDragEnd = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });

    // Reverse geocoding to get address
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        
        // Parse address components
        let streetNumber = '';
        let route = '';
        
        addressComponents.forEach(component => {
          if (component.types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (component.types.includes('route')) {
            route = component.long_name;
          }
          if (component.types.includes('locality')) {
            setCity(component.long_name);
          }
          if (component.types.includes('administrative_area_level_1')) {
            setState(component.long_name);
          }
          if (component.types.includes('postal_code')) {
            setPostalCode(component.long_name);
          }
          if (component.types.includes('country')) {
            setCountry(component.long_name);
          }
        });
        
        if (streetNumber && route) {
          setStreet(`${streetNumber} ${route}`);
        } else if (route) {
          setStreet(route);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Handle location input change
  const handleAddressChange = async () => {
    const fullAddress = `${street}, ${city}, ${state} ${postalCode}, ${country}`;

    // Geocode the address
    if (fullAddress.replace(/,/g, '').trim().length > 10) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
          setMarkerPosition({ latitude: lat, longitude: lng });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an item title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!street.trim()) {
      Alert.alert('Error', 'Please enter a street address');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter a city');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter a state');
      return;
    }
    if (!postalCode.trim()) {
      Alert.alert('Error', 'Please enter a postal code');
      return;
    }
    if (!country.trim()) {
      Alert.alert('Error', 'Please enter a country');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('postalCode', postalCode);
      formData.append('country', country);
      formData.append('latitude', markerPosition.latitude.toString());
      formData.append('longitude', markerPosition.longitude.toString());

      // Add existing images that weren't removed
      formData.append('existingImages', JSON.stringify(existingImages));

      // Add new images
      images.forEach((image, index) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('images', {
          uri: image.uri,
          name: `photo_${Date.now()}_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });

      const response = await fetch(`${SERVER_URL}/api/donations/${donation._id}/update`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert('Success', 'Donation updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update donation');
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      Alert.alert('Error', 'An error occurred while updating the donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit the form</Text>
        </View>

        {/* Item Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter item title"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={category ? styles.dropdownText : styles.dropdownPlaceholder}>
              {category || 'Select category'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.dropdownList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Pickup Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Location</Text>
          <Text style={styles.helperText}>or mark the location in the map</Text>
          
          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            </MapView>
          </View>

          {/* Street Address */}
          <TextInput
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            onBlur={handleAddressChange}
            placeholder="Street address"
          />

          {/* City */}
          <TextInput
            style={[styles.input, styles.inputSpacing]}
            value={city}
            onChangeText={setCity}
            onBlur={handleAddressChange}
            placeholder="City"
          />

          {/* State */}
          <TextInput
            style={[styles.input, styles.inputSpacing]}
            value={state}
            onChangeText={setState}
            onBlur={handleAddressChange}
            placeholder="State / Province"
          />

          {/* Postal Code */}
          <TextInput
            style={[styles.input, styles.inputSpacing]}
            value={postalCode}
            onChangeText={setPostalCode}
            onBlur={handleAddressChange}
            placeholder="Postal Code"
          />

          {/* Country */}
          <TextInput
            style={[styles.input, styles.inputSpacing]}
            value={country}
            onChangeText={setCountry}
            onBlur={handleAddressChange}
            placeholder="Country"
          />
        </View>

        {/* Upload Images */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload Images</Text>
          
          <View style={styles.imageButtonsRow}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
              <Text style={styles.imageButtonIcon}>📤</Text>
              <Text style={styles.imageButtonText}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonIcon}>📷</Text>
              <Text style={styles.imageButtonText}>Take photo</Text>
            </TouchableOpacity>
          </View>

          {/* Display existing images */}
          {existingImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.existingImagesLabel}>Current Images:</Text>
              {existingImages.map((img, index) => (
                <View key={`existing-${index}`} style={styles.imagePreview}>
                  <Image
                    source={{ uri: `${SERVER_URL}${img}` }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeExistingImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Display new images */}
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.existingImagesLabel}>New Images:</Text>
              {images.map((img, index) => (
                <View key={`new-${index}`} style={styles.imagePreview}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  inputSpacing: {
    marginTop: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#00C6A2',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2F1',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  map: {
    flex: 1,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  imageButtonIcon: {
    fontSize: 20,
  },
  imageButtonText: {
    fontSize: 14,
    color: '#00C6A2',
    fontWeight: '600',
  },
  existingImagesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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

export default EditDonationScreen;
