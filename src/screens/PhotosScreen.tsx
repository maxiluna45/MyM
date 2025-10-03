import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../context/EventsContext';
import PhotoDetailModal from '../components/PhotoDetailModal';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 2; // 2 columnas con padding

export default function PhotosScreen() {
  const { events, loadEvents } = useEvents();
  const [photos, setPhotos] = useState<
    { eventId: string; eventTitle: string; photo: string; date: string }[]
  >([]);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photo: string;
    eventTitle: string;
    date: string;
  } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Extraer todas las fotos de los eventos
    const allPhotos: { eventId: string; eventTitle: string; photo: string; date: string }[] = [];

    events.forEach((event) => {
      event.photos.forEach((photo) => {
        allPhotos.push({
          eventId: event.id,
          eventTitle: event.title,
          photo,
          date: event.date,
        });
      });
    });

    // Ordenar por fecha (más recientes primero)
    allPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setPhotos(allPhotos);
  }, [events]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const handlePhotoPress = (photo: string, eventTitle: string, date: string) => {
    setSelectedPhoto({ photo, eventTitle, date });
    setShowDetailModal(true);
  };

  // Agrupar fotos en pares para el grid de 2 columnas
  const photoRows = [];
  for (let i = 0; i < photos.length; i += 2) {
    photoRows.push(photos.slice(i, i + 2));
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#B2B0E8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Álbum</Text>
            <Text style={styles.headerSubtitle}>Nuestras memorias juntos</Text>
          </View>
          {photos.length > 0 && (
            <View style={styles.countBadge}>
              <Ionicons name="images" size={16} color="#1A2A80" />
              <Text style={styles.countText}>{photos.length}</Text>
            </View>
          )}
        </View>

        {/* Grid de fotos */}
        {photos.length > 0 ? (
          <View style={styles.photosGrid}>
            {photoRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.photoRow}>
                {row.map((item, index) => (
                  <View key={`${item.eventId}-${index}`} style={styles.photoWrapper}>
                    <TouchableOpacity
                      style={styles.photoCard}
                      onPress={() => handlePhotoPress(item.photo, item.eventTitle, item.date)}
                      activeOpacity={0.8}>
                      <Image source={{ uri: item.photo }} style={styles.photo} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.photoOverlay}>
                        <Text style={styles.photoTitle} numberOfLines={2}>
                          {item.eventTitle}
                        </Text>
                        <Text style={styles.photoDate}>{item.date}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Relleno si la fila tiene solo un elemento */}
                {row.length === 1 && <View style={styles.photoWrapper} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="camera" size={48} color="#9ca3af" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>Aún no hay fotos</Text>
            <Text style={styles.emptyStateText}>
              Las fotos que agregues en el calendario van a aparecer acá
            </Text>
            <TouchableOpacity style={styles.emptyStateButton}>
              <LinearGradient
                colors={['#3B38A0', '#1A2A80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyStateButtonGradient}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Agregar primera foto</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de detalle */}
      {selectedPhoto && (
        <PhotoDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          photo={selectedPhoto.photo}
          eventTitle={selectedPhoto.eventTitle}
          date={selectedPhoto.date}
        />
      )}

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2A80',
  },
  photosGrid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  photoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  photoWrapper: {
    flex: 1,
  },
  photoCard: {
    width: '100%',
    height: PHOTO_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'flex-end',
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    marginHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
