import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Event } from '../types';

interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  event: Event | null;
  onDelete?: (eventId: string) => void;
  onUpdatePhotos?: (eventId: string, photos: string[]) => void;
  onConvertToMemory?: (eventId: string) => void;
}

const { width } = Dimensions.get('window');

export default function EventDetailModal({
  visible,
  onClose,
  event,
  onDelete,
  onUpdatePhotos,
  onConvertToMemory,
}: EventDetailModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!event) return null;

  const handleConvertToMemory = () => {
    Alert.alert('¡Se hizo realidad! 🎉', '¿Querés marcar este plan como un recuerdo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: '¡Sí, se cumplió!',
        onPress: () => {
          if (onConvertToMemory) {
            onConvertToMemory(event.id);
            onClose();
          }
        },
      },
    ]);
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Eliminar evento',
      '¿Estás seguro de que querés eliminar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(event.id);
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleAddPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para agregar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && onUpdatePhotos) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      const updatedPhotos = [...event.photos, ...newPhotos];
      onUpdatePhotos(event.id, updatedPhotos);
    }
  };

  const handleDeletePhoto = (photoIndex: number) => {
    Alert.alert('Eliminar foto', '¿Querés eliminar esta foto del evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (onUpdatePhotos) {
            const updatedPhotos = event.photos.filter((_, index) => index !== photoIndex);
            onUpdatePhotos(event.id, updatedPhotos);
            if (selectedPhotoIndex >= updatedPhotos.length) {
              setSelectedPhotoIndex(Math.max(0, updatedPhotos.length - 1));
            }
          }
        },
      },
    ]);
  };

  const openLocationInMaps = () => {
    if (!event.location) return;

    const { latitude, longitude } = event.location;
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.typeBadge,
                  event.type === 'past' ? styles.pastBadge : styles.futureBadge,
                ]}>
                <Ionicons
                  name={event.type === 'past' ? 'heart' : 'rocket'}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.typeBadgeText}>
                  {event.type === 'past' ? 'Recuerdo' : 'Plan'}
                </Text>
              </View>
              {/* Badge de conversión para planes */}
              {onConvertToMemory && event.type === 'future' && (
                <TouchableOpacity
                  style={styles.convertBadge}
                  onPress={handleConvertToMemory}
                  activeOpacity={0.7}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Foto principal */}
            {event.photos.length > 0 && (
              <View style={styles.photoSection}>
                <Image
                  source={{ uri: event.photos[selectedPhotoIndex] }}
                  style={styles.mainPhoto}
                  resizeMode="cover"
                />
                {/* Botón para eliminar foto */}
                {onUpdatePhotos && (
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() => handleDeletePhoto(selectedPhotoIndex)}>
                    <Ionicons name="trash" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                {event.photos.length > 1 && (
                  <View style={styles.photoIndicators}>
                    {event.photos.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.indicator,
                          selectedPhotoIndex === index && styles.indicatorActive,
                        ]}
                        onPress={() => setSelectedPhotoIndex(index)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Thumbnails */}
            {event.photos.length > 1 && (
              <ScrollView
                horizontal
                style={styles.thumbnailsContainer}
                showsHorizontalScrollIndicator={false}>
                {event.photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedPhotoIndex(index)}
                    style={[
                      styles.thumbnail,
                      selectedPhotoIndex === index && styles.thumbnailActive,
                    ]}>
                    <Image source={{ uri: photo }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Información */}
            <View style={styles.infoSection}>
              {/* Fecha */}
              <View style={styles.dateContainer}>
                <Ionicons name="calendar" size={20} color="#3B38A0" />
                <Text style={styles.dateText}>{event.date}</Text>
              </View>

              {/* Título */}
              <Text style={styles.title}>{event.title}</Text>

              {/* Descripción */}
              {event.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Descripción</Text>
                  <Text style={styles.description}>{event.description}</Text>
                </View>
              )}

              {/* Ubicación */}
              {event.location && (
                <View style={styles.locationContainer}>
                  <Text style={styles.locationLabel}>Ubicación</Text>
                  <TouchableOpacity style={styles.locationCard} onPress={openLocationInMaps}>
                    <View style={styles.locationInfo}>
                      <Ionicons name="location-sharp" size={24} color="#3B38A0" />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationName} numberOfLines={1}>
                          {event.location.name || 'Ubicación del evento'}
                        </Text>
                        {event.location.address && (
                          <Text style={styles.locationAddress} numberOfLines={2}>
                            {event.location.address}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Botones de acción */}
              {(onUpdatePhotos || onDelete) && (
                <View style={styles.actionsSection}>
                  {onUpdatePhotos && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleAddPhotos}>
                      <Ionicons name="images" size={20} color="#3B38A0" />
                      <Text style={styles.actionButtonText}>Agregar fotos</Text>
                    </TouchableOpacity>
                  )}

                  {onDelete && !event.isRecurring && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={handleDeleteEvent}>
                      <Ionicons name="trash-outline" size={20} color="#dc2626" />
                      <Text style={styles.deleteButtonText}>Eliminar evento</Text>
                    </TouchableOpacity>
                  )}

                  {event.isRecurring && (
                    <View style={styles.recurringNote}>
                      <Ionicons name="information-circle" size={16} color="#6b7280" />
                      <Text style={styles.recurringNoteText}>
                        Este es un evento recurrente anual
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
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
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  pastBadge: {
    backgroundColor: '#3B38A0',
  },
  futureBadge: {
    backgroundColor: '#7A85C1',
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  convertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  scrollContent: {
    flexGrow: 1,
  },
  photoSection: {
    position: 'relative',
  },
  mainPhoto: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#f3f4f6',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  thumbnailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  thumbnail: {
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#3B38A0',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  infoSection: {
    padding: 20,
    paddingBottom: 40,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2A80',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  locationContainer: {
    marginTop: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  deletePhotoButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionsSection: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B38A0',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  recurringNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  recurringNoteText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
});
