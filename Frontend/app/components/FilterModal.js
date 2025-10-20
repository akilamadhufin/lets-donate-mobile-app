import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterModal = ({ 
  visible, 
  onClose, 
  filters,
  onApplyFilters,
  onResetFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🏠' },
    { value: 'Food', label: 'Food', icon: '🍕' },
    { value: 'Clothes', label: 'Clothes', icon: '👕' },
    { value: 'Electronics', label: 'Electronics', icon: '📱' },
    { value: 'Books', label: 'Books', icon: '📚' },
    { value: 'Furniture', label: 'Furniture', icon: '🪑' },
    { value: 'Toys', label: 'Toys', icon: '🧸' },
    { value: 'Sports', label: 'Sports', icon: '⚽' },
    { value: 'Other', label: 'Other', icon: '📦' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'time' },
    { value: 'oldest', label: 'Oldest First', icon: 'time-outline' },
    { value: 'title_asc', label: 'Title A-Z', icon: 'text' },
    { value: 'title_desc', label: 'Title Z-A', icon: 'text-outline' },
  ];

  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'all',
      sortBy: 'newest',
      availableOnly: false,
    };
    setLocalFilters(resetFilters);
    onResetFilters(resetFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryItem,
                      localFilters.category === cat.value && styles.categoryItemActive
                    ]}
                    onPress={() => updateFilter('category', cat.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      localFilters.category === cat.value && styles.categoryLabelActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    localFilters.sortBy === option.value && styles.sortOptionActive
                  ]}
                  onPress={() => updateFilter('sortBy', option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sortOptionLeft}>
                    <Ionicons 
                      name={option.icon} 
                      size={20} 
                      color={localFilters.sortBy === option.value ? '#007AFF' : '#666'} 
                    />
                    <Text style={[
                      styles.sortOptionText,
                      localFilters.sortBy === option.value && styles.sortOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                  {localFilters.sortBy === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Availability Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.toggleLabel}>Show available items only</Text>
                </View>
                <Switch
                  value={localFilters.availableOnly}
                  onValueChange={(value) => updateFilter('availableOnly', value)}
                  trackColor={{ false: '#E0E0E0', true: '#34C759' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FilterModal;
