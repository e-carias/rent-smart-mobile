/**
 * RENT SMART · Inicialización de Firebase.
 *
 * Un único punto de entrada para toda la aplicación. Ninguna pantalla ni
 * servicio importa directamente de 'firebase/app': todo pasa por aquí, igual
 * que `app/lib/conexion.js` concentraba la conexión a MySQL en la versión web.
 *
 * Las credenciales se leen de variables de entorno con el prefijo
 * EXPO_PUBLIC_, que Expo inyecta en el paquete durante la compilación.
 *
 * Nota de seguridad: las claves de un proyecto Firebase del lado del cliente
 * no son secretas. Identifican el proyecto, no autorizan operaciones. Quien
 * autoriza es el conjunto de reglas de seguridad de Firestore (firestore.rules),
 * que verifica la identidad del usuario en el servidor (Google, 2025b).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import * as fbAuth from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const configuracionFirebase = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** true cuando el archivo .env trae, al menos, el proyecto y la clave. */
export function firebaseConfigurado() {
  return Boolean(configuracionFirebase.apiKey && configuracionFirebase.projectId);
}

let app = null;
let auth = null;
let db = null;

function crearApp() {
  if (getApps().length) return getApp();
  return initializeApp(configuracionFirebase);
}

/**
 * La sesión debe sobrevivir al cierre de la aplicación. En React Native eso
 * exige indicarle a Firebase dónde guardarla: AsyncStorage. Si no se le pasa
 * persistencia, Firebase avisa por consola y la sesión se pierde al reiniciar.
 */
function crearAuth(aplicacion) {
  if (Platform.OS === 'web') return fbAuth.getAuth(aplicacion);

  const persistencia = fbAuth.getReactNativePersistence;
  if (typeof persistencia === 'function') {
    return fbAuth.initializeAuth(aplicacion, {
      persistence: persistencia(AsyncStorage),
    });
  }
  return fbAuth.getAuth(aplicacion);
}

/**
 * En Expo Go, el transporte por streaming de Firestore puede quedarse
 * colgado detrás de algunas redes. `experimentalForceLongPolling` evita ese
 * caso y no tiene efecto perceptible en el volumen de datos del proyecto.
 */
function crearFirestore(aplicacion) {
  try {
    return initializeFirestore(aplicacion, {
      experimentalForceLongPolling: Platform.OS !== 'web',
    });
  } catch {
    return getFirestore(aplicacion);
  }
}

export function obtenerApp() {
  if (!firebaseConfigurado()) {
    throw new Error(
      'Firebase no está configurado. Copia .env.example como .env y completa las variables EXPO_PUBLIC_FIREBASE_*.'
    );
  }
  if (!app) app = crearApp();
  return app;
}

export function obtenerAuth() {
  if (!auth) auth = crearAuth(obtenerApp());
  return auth;
}

export function obtenerDb() {
  if (!db) db = crearFirestore(obtenerApp());
  return db;
}

/** Nombres de las colecciones, en un solo lugar para evitar erratas. */
export const COLECCIONES = {
  usuarios: 'usuarios',
  vehiculos: 'vehiculos',
  reservas: 'reservas',
  actividad: 'actividad',
};

export default { obtenerApp, obtenerAuth, obtenerDb, COLECCIONES, firebaseConfigurado };
