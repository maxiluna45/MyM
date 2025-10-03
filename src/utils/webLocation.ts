import { Platform } from 'react-native';

// Función para verificar si el navegador soporta geolocalización
export const checkGeolocationSupport = (): boolean => {
  if (Platform.OS !== 'web') return true;
  return 'geolocation' in navigator;
};

// Función para solicitar permisos de ubicación en web
export const requestWebLocationPermission = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!checkGeolocationSupport()) {
      reject(new Error('Tu navegador no soporta geolocalización'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'No se pudo obtener la ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Permisos de ubicación denegados. Por favor, permite el acceso a la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación';
            break;
          default:
            errorMessage = 'Error desconocido al obtener la ubicación';
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};
