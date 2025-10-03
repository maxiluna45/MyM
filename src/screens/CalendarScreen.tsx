import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { useEvents } from '../context/EventsContext';
import AddEventModal from '../components/AddEventModal';
import EventDetailModal from '../components/EventDetailModal';
import FloatingHearts from '../components/FloatingHearts';

export default function CalendarScreen() {
  const { events, loadEvents, addEvent, deleteEvent, updateEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  // Función para expandir eventos recurrentes a todos los años visibles
  const expandRecurringEvents = (events: Event[]): Event[] => {
    const currentYear = new Date().getFullYear();
    const yearsToShow = 5; // Mostrar 5 años hacia atrás y 5 hacia adelante
    const expandedEvents: Event[] = [];

    events.forEach((event) => {
      if (event.isRecurring) {
        // Obtener mes y día del evento original
        const [, month, day] = event.date.split('-');
        const originalYear = parseInt(event.date.split('-')[0]);

        // Crear eventos para cada año
        for (let yearOffset = -yearsToShow; yearOffset <= yearsToShow; yearOffset++) {
          const targetYear = currentYear + yearOffset;
          const newDate = `${targetYear}-${month}-${day}`;
          const yearsSince = targetYear - originalYear;

          expandedEvents.push({
            ...event,
            date: newDate,
            title:
              yearsSince > 0
                ? `${event.title} (${yearsSince} ${yearsSince === 1 ? 'año' : 'años'})`
                : event.title,
          });
        }
      } else {
        expandedEvents.push(event);
      }
    });

    return expandedEvents;
  };

  const allEvents = expandRecurringEvents(events);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const dayEvents = allEvents.filter((e) => e.date === day.dateString);
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setShowDetailModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    await addEvent(eventData);
    // Mostrar animación de corazones
    setShowHearts(true);
    setTimeout(() => {
      setShowHearts(false);
    }, 6000);
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const handleUpdatePhotos = async (eventId: string, photos: string[]) => {
    await updateEvent(eventId, { photos });
    // Actualizar el evento seleccionado para reflejar los cambios inmediatamente
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({ ...selectedEvent, photos });
    }
  };

  const handleConvertToMemory = async (eventId: string) => {
    await updateEvent(eventId, { type: 'past' });
    // Mostrar animación de corazones
    setShowHearts(true);
    setTimeout(() => {
      setShowHearts(false);
    }, 3000);
  };

  const handleAddButtonPress = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setShowAddModal(true);
  };

  // Crear objeto de fechas marcadas
  const markedDates = allEvents.reduce(
    (acc, event) => {
      acc[event.date] = {
        marked: true,
        dotColor: event.type === 'past' ? '#3B38A0' : '#7A85C1',
        customStyles: {
          container: {
            backgroundColor: event.type === 'past' ? '#B2B0E8' : '#B2B0E8',
            borderRadius: 8,
          },
          text: {
            color: '#1f2937',
            fontWeight: '600',
          },
        },
      };
      return acc;
    },
    {} as Record<string, any>
  );

  // Eventos del mes actual
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthEvents = allEvents.filter((e) => e.date.startsWith(currentMonth));

  return (
    <LinearGradient
      colors={['#B2B0E8', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Calendario</Text>
            <Text style={styles.headerSubtitle}>Nuestros momentos especiales</Text>
          </View>
        </View>

        {/* Calendario */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={'custom'}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#000000',
              selectedDayBackgroundColor: '#3B38A0',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3B38A0',
              dayTextColor: '#1f2937',
              textDisabledColor: '#d1d5db',
              monthTextColor: '#1f2937',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Leyenda */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B38A0' }]} />
            <Text style={styles.legendText}>Recuerdos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#7A85C1' }]} />
            <Text style={styles.legendText}>Planes</Text>
          </View>
        </View>

        {/* Eventos del mes */}
        {currentMonthEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>Este mes</Text>
            {currentMonthEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => {
                  setSelectedEvent(event);
                  setShowDetailModal(true);
                }}>
                <View
                  style={[
                    styles.eventCardIcon,
                    event.type === 'past' ? styles.pastIcon : styles.futureIcon,
                  ]}>
                  <Ionicons
                    name={event.type === 'past' ? 'heart' : 'rocket'}
                    size={20}
                    color="#fff"
                  />
                </View>
                <View style={styles.eventCardContent}>
                  <Text style={styles.eventCardTitle}>{event.title}</Text>
                  <Text style={styles.eventCardDate}>{event.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mensaje si no hay eventos */}
        {allEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="gift" size={48} color="#9ca3af" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>Comenzá a crear recuerdos</Text>
            <Text style={styles.emptyStateText}>
              Tocá en una fecha del calendario o usá el botón + para agregar tu primer momento
              especial
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante para agregar */}
      <TouchableOpacity style={styles.fab} onPress={handleAddButtonPress}>
        <LinearGradient
          colors={['#3B38A0', '#1A2A80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}>
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modales */}
      <AddEventModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />

      <EventDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        onUpdatePhotos={handleUpdatePhotos}
        onConvertToMemory={handleConvertToMemory}
      />

      {/* Animación de corazones */}
      {showHearts && <FloatingHearts />}

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
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  eventsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 100,
  },
  eventsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pastIcon: {
    backgroundColor: '#3B38A0',
  },
  futureIcon: {
    backgroundColor: '#7A85C1',
  },
  eventCardContent: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  eventCardDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    marginHorizontal: 32,
    marginBottom: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
