/**
 * RENT SMART · Inicialización de Firebase para la versión web.
 *
 * Es el gemelo de `mobile/src/firebase/configuracion.js`: mismas colecciones,
 * mismo proyecto, mismas reglas de seguridad. La única diferencia es la
 * persistencia de la sesión, que en el navegador la resuelve Firebase por sí
 * mismo con el almacenamiento local, sin necesidad de AsyncStorage.
 *
 * Ninguna pantalla ni servicio importa 'firebase/app' directamente: todo pasa
 * por aquí, igual que antes todo pasaba por `app/lib/conexion.js`.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const configuracionFirebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** true cuando el archivo .env.local trae, al menos, el proyecto y la clave. */
export function firebaseConfigurado() {
  return Boolean(configuracionFirebase.apiKey && configuracionFirebase.projectId);
}

let app = null;
let auth = null;
let db = null;

export function obtenerApp() {
  if (!firebaseConfigurado()) {
    throw new Error(
      'Firebase no está configurado. Copia .env.example como .env.local y completa las variables NEXT_PUBLIC_FIREBASE_*.'
    );
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(configuracionFirebase);
  return app;
}

export function obtenerAuth() {
  if (!auth) auth = getAuth(obtenerApp());
  return auth;
}

export function obtenerDb() {
  if (!db) db = getFirestore(obtenerApp());
  return db;
}

/**
 * Nombres de las colecciones. Son exactamente los mismos que usa la
 * aplicación móvil: ahí está la persistencia compartida entre plataformas.
 */
export const COLECCIONES = {
  usuarios: 'usuarios',
  vehiculos: 'vehiculos',
  reservas: 'reservas',
  contratos: 'contratos',
  actividad: 'actividad',
};

const Firebase = { obtenerApp, obtenerAuth, obtenerDb, COLECCIONES, firebaseConfigurado };

export default Firebase;
