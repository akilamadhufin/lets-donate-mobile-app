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