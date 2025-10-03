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
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoLocation from 'expo-location';
import { Event, Location } from '../types';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { openMaps } from '../utils/platform';
import { requestWebLocationPermission, checkGeolocationSupport } from '../utils/webLocation';

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
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const { alert, prompt, AlertComponent, PromptComponent } = useCustomAlert();

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description);
      setPhotos(existingEvent.photos);
      setEventType(existingEvent.type);
      setLocation(existingEvent.location);
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
      alert('Permisos necesarios', 'Necesitamos acceso a tus fotos para esta función', [
        { text: 'OK' },
      ]);
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

  const handleSelectLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        // Verificar soporte de geolocalización
        if (!checkGeolocationSupport()) {
          alert('Error', 'Tu navegador no soporta geolocalización.', [{ text: 'OK' }]);
          return;
        }

        // Solicitar ubicación directamente (esto debería mostrar el popup de permisos)
        console.log('Solicitando ubicación en web...');
        const coords = await requestWebLocationPermission();
        const { latitude, longitude } = coords;

        // Obtener la dirección usando expo-location
        const addressResults = await ExpoLocation.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResults.length > 0) {
          const address = addressResults[0];
          const addressString = [
            address.street,
            address.streetNumber,
            address.city,
            address.region,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

          setLocation({
            latitude,
            longitude,
            address: addressString,
            name: address.name || addressString,
          });
        }
      } else {
        // Código para móvil (sin cambios)
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permiso requerido', 'Necesitamos acceso a tu ubicación para esta función.', [
            { text: 'OK' },
          ]);
          return;
        }

        const currentLocation = await ExpoLocation.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;

        const addressResults = await ExpoLocation.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResults.length > 0) {
          const address = addressResults[0];
          const addressString = [
            address.street,
            address.streetNumber,
            address.city,
            address.region,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

          setLocation({
            latitude,
            longitude,
            address: addressString,
            name: address.name || addressString,
          });
        }
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'No se pudo obtener la ubicación';
      alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const openInMaps = () => {
    if (!location) return;
    openMaps(location.latitude, location.longitude, location.name);
  };

  const removeLocation = () => {
    setLocation(undefined);
  };

  const handleEditLocation = () => {
    prompt(
      'Editar ubicación',
      'Ingresa la dirección que querés buscar:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Buscar',
          onPress: async (address: string) => {
            if (address && address.trim()) {
              try {
                const results = await ExpoLocation.geocodeAsync(address);
                if (results.length > 0) {
                  const result = results[0];

                  // Obtener la dirección formateada
                  const addressResults = await ExpoLocation.reverseGeocodeAsync({
                    latitude: result.latitude,
                    longitude: result.longitude,
                  });

                  if (addressResults.length > 0) {
                    const addr = addressResults[0];
                    const addressString = [
                      addr.street,
                      addr.streetNumber,
                      addr.city,
                      addr.region,
                      addr.country,
                    ]
                      .filter(Boolean)
                      .join(', ');

                    setLocation({
                      latitude: result.latitude,
                      longitude: result.longitude,
                      address: addressString,
                      name: addr.name || address,
                    });
                  }
                } else {
                  alert('Error', 'No se encontró la dirección. Intentá con otra.', [
                    { text: 'OK' },
                  ]);
                }
              } catch (error) {
                alert('Error', 'No se pudo buscar la dirección', [{ text: 'OK' }]);
              }
            }
          },
        },
      ],
      'Ingresa una dirección...'
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Error', 'Por favor ingresa un título', [{ text: 'OK' }]);
      return;
    }

    onSave({
      date: selectedDate,
      title: title.trim(),
      description: description.trim(),
      photos,
      type: eventType,
      location,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPhotos([]);
    setLocation(undefined);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPhotos([]);
    setLocation(undefined);
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

            {/* Ubicación */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ubicación</Text>
              {!location ? (
                <TouchableOpacity style={styles.addLocationButton} onPress={handleSelectLocation}>
                  <Ionicons name="location" size={24} color="#3B38A0" />
                  <Text style={styles.addLocationText}>Agregar ubicación</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.locationCard}>
                  <View style={styles.locationInfo}>
                    <Ionicons name="location-sharp" size={20} color="#3B38A0" />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.locationName} numberOfLines={1}>
                        {location.name || 'Ubicación seleccionada'}
                      </Text>
                      {location.address && (
                        <Text style={styles.locationAddress} numberOfLines={2}>
                          {location.address}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.locationActions}>
                    <TouchableOpacity
                      style={styles.locationActionButton}
                      onPress={handleEditLocation}>
                      <Ionicons name="pencil" size={20} color="#3B38A0" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.locationActionButton} onPress={openInMaps}>
                      <Ionicons name="map" size={20} color="#3B38A0" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.locationActionButton} onPress={removeLocation}>
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
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
      <AlertComponent />
      <PromptComponent />
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
  addLocationButton: {
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
  addLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B38A0',
  },
  locationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  locationActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
