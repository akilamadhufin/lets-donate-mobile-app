import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
const SERVER_URL = 'http://10.0.2.2:3000';

export default function DonationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const donation = params.donation ? JSON.parse(params.donation) : {};
  const images = Array.isArray(donation.image) ? donation.image : (donation.image ? [donation.image] : []);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const showPrev = () => setCurrentImgIdx(idx => Math.max(0, idx - 1));
  const showNext = () => setCurrentImgIdx(idx => Math.min(images.length - 1, idx + 1));
  const mainImg = images.length > 0 ? `${SERVER_URL}${images[currentImgIdx]}` : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image Carousel */}
      <View style={styles.imageCarouselWrap}>
        <Image
          source={mainImg ? { uri: mainImg } : require('../../assets/images/icon.png')}
          style={styles.mainImage}
        />
        {images.length > 1 && (
          <View style={styles.carouselArrows}>
            <TouchableOpacity
              style={[styles.arrowBtn, currentImgIdx === 0 && styles.arrowBtnDisabled]}
              onPress={showPrev}
              disabled={currentImgIdx === 0}
            >
              <Text style={styles.arrowText}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, currentImgIdx === images.length - 1 && styles.arrowBtnDisabled]}
              onPress={showNext}
              disabled={currentImgIdx === images.length - 1}
            >
              <Text style={styles.arrowText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        )}
        {images.length > 1 && (
          <Text style={styles.carouselIndicator}>{currentImgIdx + 1} / {images.length}</Text>
        )}
      </View>
      {/* Title and Details */}
      <Text style={styles.title}>{donation.title}</Text>
      <Text style={styles.category}>{donation.category}</Text>
      <Text style={styles.description}>{donation.description}</Text>
      <Text style={styles.sectionLabel}>Address</Text>
      <Text style={styles.address}>{donation.street}, {donation.city}, {donation.state}, {donation.postalCode}, {donation.country}</Text>
      {/* Map */}
      <Text style={styles.sectionLabel}>Location</Text>
      <MapView
        style={styles.map}
        region={{
          latitude: Number(donation.latitude) || 60.9827,
          longitude: Number(donation.longitude) || 24.4641,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={{
          latitude: Number(donation.latitude) || 60.9827,
          longitude: Number(donation.longitude) || 24.4641,
        }} />
      </MapView>
      {/* Book Button */}
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookBtnText}>Book Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  imageCarouselWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  carouselArrows: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  arrowBtn: {
    backgroundColor: '#00C6AE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    opacity: 1,
  },
  arrowBtnDisabled: {
    opacity: 0.4,
  },
  arrowText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -20 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 14,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00C6AE',
    marginBottom: 8,
    textAlign: 'center',
  },
  category: {
    fontSize: 18,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  address: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  map: {
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  bookBtn: {
    backgroundColor: '#00C6AE',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
