import React, { useState } from 'react';
import { View, Text, Modal, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PhotoDetailModalProps {
  visible: boolean;
  onClose: () => void;
  photo: string;
  eventTitle: string;
  date: string;
}

const { width, height } = Dimensions.get('window');

export default function PhotoDetailModal({
  visible,
  onClose,
  photo,
  eventTitle,
  date,
}: PhotoDetailModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Foto */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: photo }} style={styles.image} resizeMode="contain" />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.infoContainer}>
              <Text style={styles.eventTitle}>{eventTitle}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.dateText}>{date}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  infoContainer: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
