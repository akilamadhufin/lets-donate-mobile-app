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