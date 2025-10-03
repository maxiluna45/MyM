import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Event } from '../types';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  selectedDate: string;
  existingEvent?: Event;
}

export default function AddEventModal({
  visible,
  onClose,
  onSave,
  selectedDate,
  existingEvent,
}: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [eventType, setEventType] = useState<'past' | 'future'>('past');

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description);
      setPhotos(existingEvent.photos);
      setEventType(existingEvent.type);
    } else {
      // Determinar si la fecha es pasada o futura
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate + 'T00:00:00');
      setEventType(selected < today ? 'past' : 'future');
    }
  }, [existingEvent, selectedDate]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Necesitamos acceso a tus fotos para esta función');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título');
      return;
    }

    onSave({
      date: selectedDate,
      title: title.trim(),
      description: description.trim(),
      photos,
      type: eventType,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPhotos([]);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPhotos([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {existingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Fecha */}
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={20} color="#3B38A0" />
              <Text style={styles.dateText}>{selectedDate}</Text>
            </View>

            {/* Tipo de evento */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, eventType === 'past' && styles.typeButtonActive]}
                onPress={() => setEventType('past')}>
                <Ionicons
                  name="heart"
                  size={20}
                  color={eventType === 'past' ? '#fff' : '#3B38A0'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    eventType === 'past' && styles.typeButtonTextActive,
                  ]}>
                  Recuerdo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, eventType === 'future' && styles.typeButtonActive]}
                onPress={() => setEventType('future')}>
                <Ionicons
                  name="rocket"
                  size={20}
                  color={eventType === 'future' ? '#fff' : '#3B38A0'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    eventType === 'future' && styles.typeButtonTextActive,
                  ]}>
                  Plan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Título */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Nuestra primera cita"
                placeholderTextColor="#AAAAAA"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Descripción */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Más detalles sobre este momento especial..."
                placeholderTextColor="#AAAAAA"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Fotos */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fotos</Text>
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#3B38A0" />
                <Text style={styles.addPhotoText}>Agregar Fotos</Text>
              </TouchableOpacity>

              {photos.length > 0 && (
                <ScrollView horizontal style={styles.photosContainer}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}>
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B2B0E8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2A80',
    marginLeft: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B38A0',
    backgroundColor: '#fff',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3B38A0',
    borderColor: '#3B38A0',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B38A0',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#374151',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B38A0',
    borderStyle: 'dashed',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B38A0',
  },
  photosContainer: {
    marginTop: 12,
  },
  photoWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3B38A0',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
