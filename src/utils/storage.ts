import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';

const EVENTS_KEY = '@MyM_Events';

export const StorageService = {
  // Obtener todos los eventos
  async getEvents(): Promise<Event[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      return [];
    }
  },

  // Guardar un nuevo evento
  async saveEvent(event: Event): Promise<void> {
    try {
      const events = await this.getEvents();
      events.push(event);
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error al guardar evento:', error);
      throw error;
    }
  },

  // Actualizar un evento existente
  async updateEvent(eventId: string, updatedEvent: Partial<Event>): Promise<void> {
    try {
      const events = await this.getEvents();
      const index = events.findIndex((e) => e.id === eventId);
      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      }
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  },

  // Eliminar un evento
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const events = await this.getEvents();
      const filteredEvents = events.filter((e) => e.id !== eventId);
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filteredEvents));
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  },

  // Obtener eventos de una fecha específica
  async getEventsByDate(date: string): Promise<Event[]> {
    try {
      const events = await this.getEvents();
      return events.filter((e) => e.date === date);
    } catch (error) {
      console.error('Error al obtener eventos por fecha:', error);
      return [];
    }
  },

  // Obtener todas las fotos
  async getAllPhotos(): Promise<
    { eventId: string; eventTitle: string; photo: string; date: string }[]
  > {
    try {
      const events = await this.getEvents();
      const photos: { eventId: string; eventTitle: string; photo: string; date: string }[] = [];

      events.forEach((event) => {
        event.photos.forEach((photo) => {
          photos.push({
            eventId: event.id,
            eventTitle: event.title,
            photo,
            date: event.date,
          });
        });
      });

      // Ordenar por fecha (más recientes primero)
      return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error al obtener todas las fotos:', error);
      return [];
    }
  },
};
