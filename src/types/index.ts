export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface Event {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  description: string;
  photos: string[]; // URIs de las fotos
  type: 'past' | 'future'; // Momento pasado o plan futuro
  createdAt: number;
  isRecurring?: boolean; // Si el evento se repite cada año
  location?: Location; // Ubicación del evento
}

export interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  customStyles?: {
    container?: object;
    text?: object;
  };
}
