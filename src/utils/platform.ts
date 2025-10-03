import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

// Función para abrir mapas que funciona en web
export const openMaps = (latitude: number, longitude: number, name?: string) => {
  if (isWeb) {
    // En web, abrir Google Maps
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  } else {
    // En móvil, usar los esquemas nativos
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}`,
    });

    if (url) {
      const { Linking } = require('react-native');
      Linking.openURL(url);
    }
  }
};
