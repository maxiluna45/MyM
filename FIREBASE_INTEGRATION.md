# 🔥 Guía de Integración con Firebase

Esta guía te ayudará a integrar Firebase en la aplicación M&M cuando estés listo.

## 📦 Paquetes necesarios

```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```

## 🔧 Configuración Básica

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "MyM"
3. Agrega apps para iOS y Android
4. Descarga los archivos de configuración:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)

### 2. Estructura recomendada

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_AUTH_DOMAIN',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_STORAGE_BUCKET',
  messagingSenderId: 'TU_MESSAGING_SENDER_ID',
  appId: 'TU_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 🔐 Autenticación (Solo 2 usuarios)

### Opción 1: Email/Password fijo

```typescript
// src/utils/auth.ts
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Crear los dos usuarios una sola vez
export const setupUsers = async () => {
  // Usuario 1 (tú)
  await createUserWithEmailAndPassword(auth, 'tu@email.com', 'password_seguro_1');

  // Usuario 2 (tu novia)
  await createUserWithEmailAndPassword(auth, 'ella@email.com', 'password_seguro_2');
};

// Login
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
```

### Opción 2: Google Sign-In (más simple)

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Solo permitir 2 cuentas de Google específicas
const ALLOWED_EMAILS = ['tu@gmail.com', 'ella@gmail.com'];

export const googleSignIn = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();

  if (!ALLOWED_EMAILS.includes(userInfo.user.email)) {
    throw new Error('Usuario no autorizado');
  }

  // Continuar con login...
};
```

## 💾 Migración de Storage a Firestore

### Estructura de Firestore

```
events/
  ├── {eventId}/
  │   ├── id: string
  │   ├── date: string
  │   ├── title: string
  │   ├── description: string
  │   ├── photos: string[] (URLs de Storage)
  │   ├── type: 'past' | 'future'
  │   ├── createdAt: timestamp
  │   ├── createdBy: string (userId)
  │   └── updatedAt: timestamp

users/
  ├── {userId}/
  │   ├── email: string
  │   ├── displayName: string
  │   └── photoURL: string
```

### Nuevo StorageService con Firebase

```typescript
// src/utils/firebaseStorage.ts
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Event } from '../types';

export const FirebaseStorageService = {
  // Subir foto a Firebase Storage
  async uploadPhoto(uri: string, eventId: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `events/${eventId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  },

  // Obtener eventos
  async getEvents(): Promise<Event[]> {
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Event);
  },

  // Guardar evento
  async saveEvent(event: Event): Promise<void> {
    await addDoc(collection(db, 'events'), {
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  // Actualizar evento
  async updateEvent(eventId: string, updatedEvent: Partial<Event>): Promise<void> {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...updatedEvent,
      updatedAt: new Date(),
    });
  },

  // Eliminar evento
  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(db, 'events', eventId));
  },
};
```

## 🔄 Sincronización en Tiempo Real

```typescript
import { onSnapshot, collection } from 'firebase/firestore';

// En EventsContext.tsx
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
    const updatedEvents = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Event
    );

    setEvents(updatedEvents);
  });

  return () => unsubscribe();
}, []);
```

## 🔒 Reglas de Seguridad (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo los 2 usuarios autorizados pueden leer/escribir
    match /events/{eventId} {
      allow read, write: if request.auth != null &&
        (request.auth.token.email == 'tu@email.com' ||
         request.auth.token.email == 'ella@email.com');
    }

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 🚀 Pasos para Migración

1. ✅ Instalar paquetes de Firebase
2. ✅ Configurar Firebase en el proyecto
3. ✅ Implementar autenticación
4. ✅ Crear FirebaseStorageService
5. ✅ Actualizar EventsContext para usar Firestore
6. ✅ Migrar datos locales a Firebase (script one-time)
7. ✅ Configurar reglas de seguridad
8. ✅ Probar sincronización entre dispositivos
9. ✅ Eliminar AsyncStorage (opcional, puede ser backup)

## 💡 Tips

- **Caché Offline**: Firestore tiene caché automático, la app funcionará sin internet
- **Backup**: Puedes mantener AsyncStorage como backup local
- **Fotos**: Considera comprimir fotos antes de subirlas (usa `expo-image-manipulator`)
- **Costos**: Con 2 usuarios y uso normal, estarás en el plan gratuito
- **Privacidad**: Las reglas de Firestore aseguran que solo ustedes dos accedan

## 📱 Pantalla de Login (cuando estés listo)

```typescript
// src/screens/LoginScreen.tsx
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navegación automática se maneja en App.tsx con onAuthStateChanged
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  return (
    // UI bonita con gradiente rosa...
  );
}
```

---

¡Cuando estés listo para implementar Firebase, este documento te guiará paso a paso! 🚀
