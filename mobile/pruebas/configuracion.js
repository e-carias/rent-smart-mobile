/**
 * Configuración común de las pruebas.
 *
 * Define credenciales ficticias de Firebase para que el módulo de
 * configuración no aborte, y silencia los avisos esperados para que la
 * salida de la suite muestre solo lo que importa.
 */

process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'clave-de-prueba';
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'rent-smart-pruebas.firebaseapp.com';
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'rent-smart-pruebas';
process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = 'rent-smart-pruebas.appspot.com';
process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '000000000000';
process.env.EXPO_PUBLIC_FIREBASE_APP_ID = '1:000000000000:web:0000000000000000';

// Los servicios avisan por consola cuando recurren al respaldo; en las
// pruebas eso es un caso previsto, no un problema que deba imprimirse.
const avisoOriginal = console.warn;
global.console.warn = (...args) => {
  const texto = String(args[0] ?? '');
  if (texto.includes('[actividad]') || texto.includes('[origenDatos]')) return;
  avisoOriginal(...args);
};
