import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event } from '../types';
import { StorageService } from '../utils/storage';

interface EventsContextType {
  events: Event[];
  loadEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (eventId: string, updatedEvent: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  const initializeAnniversary = async () => {
    const existingEvents = await StorageService.getEvents();
    const anniversaryId = 'anniversary-2025-08-03';

    // Verificar si el evento del aniversario ya existe
    const anniversaryExists = existingEvents.some((e) => e.id === anniversaryId);

    if (!anniversaryExists) {
      const anniversaryEvent: Event = {
        id: anniversaryId,
        date: '2025-08-03',
        title: 'Nuestro aniversario ❤️',
        description: 'El día que nos pusimos de novios',
        photos: [],
        type: 'past',
        createdAt: Date.now(),
        isRecurring: true,
      };

      await StorageService.saveEvent(anniversaryEvent);
    }
  };

  const loadEvents = async () => {
    await initializeAnniversary();
    const loadedEvents = await StorageService.getEvents();
    setEvents(loadedEvents);
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    await StorageService.saveEvent(newEvent);
    await loadEvents();
  };

  const updateEvent = async (eventId: string, updatedEvent: Partial<Event>) => {
    await StorageService.updateEvent(eventId, updatedEvent);
    await loadEvents();
  };

  const deleteEvent = async (eventId: string) => {
    await StorageService.deleteEvent(eventId);
    await loadEvents();
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ events, loadEvents, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
