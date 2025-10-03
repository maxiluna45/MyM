// Service Worker para funcionalidad offline
const CACHE_NAME = 'mym-app-v1';
const urlsToCache = [
  '/',
  '/_expo/static/css/web-8fabc38b7a5ae8e4d7fd0372a3f2284a.css',
  '/_expo/static/js/web/AppEntry-485db2df60d002ea8aa154e479a3a8b8.js',
  '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
