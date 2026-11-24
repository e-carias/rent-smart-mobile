/**
 * Carga inicial del catálogo de vehículos en Cloud Firestore.
 *
 *   npm run seed
 *
 * Las reglas de seguridad solo permiten escribir en `vehiculos` a un usuario
 * con rol de administrador, así que el script inicia sesión con las
 * credenciales de SEED_EMAIL y SEED_PASSWORD antes de escribir. Eso es
 * deliberado: si el script pudiera escribir sin autenticarse, cualquiera
 * podría hacerlo también.
 *
 * Antes de ejecutarlo por primera vez:
 *   1. Crea la cuenta en la app o en la consola de Firebase.
 *   2. En Firestore, abre usuarios/{uid} y cambia rol a "administrador".
 *   3. Añade SEED_EMAIL y SEED_PASSWORD a tu archivo .env.
 */

import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';

const RAIZ = process.cwd();

/** Lector mínimo de .env, para no añadir dotenv como dependencia. */
function cargarEnv() {
  for (const archivo of ['.env', '.env.local']) {
    const ruta = path.join(RAIZ, archivo);
    if (!fs.existsSync(ruta)) continue;
    for (const linea of fs.readFileSync(ruta, 'utf8').split('\n')) {
      const limpia = linea.trim();
      if (!limpia || limpia.startsWith('#')) continue;
      const corte = limpia.indexOf('=');
      if (corte === -1) continue;
      const clave = limpia.slice(0, corte).trim();
      const valor = limpia.slice(corte + 1).trim().replace(/^["']|["']$/g, '');
      if (!(clave in process.env)) process.env[clave] = valor;
    }
  }
}

const VEHICULOS = [
  { id: 'v1', marca: 'Toyota', modelo: 'Corolla', anio: 2023, placa: 'P123456', categoria: 'Sedán', color: 'Blanco', transmision: 'Automática', combustible: 'Gasolina', capacidad: 5, kilometraje: 24500, precioPorDia: 38, estado: 'disponible', imagenUrl: '', descripcion: 'Sedán económico, ideal para ciudad y viajes cortos.' },
  { id: 'v2', marca: 'Nissan', modelo: 'Versa', anio: 2022, placa: 'P234567', categoria: 'Sedán', color: 'Gris', transmision: 'Automática', combustible: 'Gasolina', capacidad: 5, kilometraje: 41200, precioPorDia: 33, estado: 'disponible', imagenUrl: '', descripcion: 'Bajo consumo de combustible y amplio maletero.' },
  { id: 'v3', marca: 'Kia', modelo: 'Sportage', anio: 2024, placa: 'P345678', categoria: 'SUV', color: 'Negro', transmision: 'Automática', combustible: 'Gasolina', capacidad: 5, kilometraje: 12800, precioPorDia: 58, estado: 'disponible', imagenUrl: '', descripcion: 'SUV compacta con cámara de retroceso y sensores.' },
  { id: 'v4', marca: 'Toyota', modelo: 'Hilux', anio: 2023, placa: 'P456789', categoria: 'Pick-up', color: 'Plata', transmision: 'Manual', combustible: 'Diésel', capacidad: 5, kilometraje: 56300, precioPorDia: 72, estado: 'disponible', imagenUrl: '', descripcion: 'Doble cabina 4x4, recomendada para zonas rurales.' },
  { id: 'v5', marca: 'Hyundai', modelo: 'Accent', anio: 2021, placa: 'P567890', categoria: 'Compacto', color: 'Rojo', transmision: 'Manual', combustible: 'Gasolina', capacidad: 5, kilometraje: 78900, precioPorDia: 28, estado: 'mantenimiento', imagenUrl: '', descripcion: 'En taller por servicio preventivo de 80,000 km.' },
  { id: 'v6', marca: 'Honda', modelo: 'CR-V', anio: 2024, placa: 'P678901', categoria: 'SUV', color: 'Azul', transmision: 'Automática', combustible: 'Híbrido', capacidad: 5, kilometraje: 9400, precioPorDia: 65, estado: 'disponible', imagenUrl: '', descripcion: 'SUV híbrida, excelente rendimiento en carretera.' },
  { id: 'v7', marca: 'Suzuki', modelo: 'Swift', anio: 2022, placa: 'P789012', categoria: 'Compacto', color: 'Blanco', transmision: 'Automática', combustible: 'Gasolina', capacidad: 5, kilometraje: 33100, precioPorDia: 30, estado: 'disponible', imagenUrl: '', descripcion: 'Compacto ágil y fácil de estacionar.' },
  { id: 'v8', marca: 'Toyota', modelo: 'Hiace', anio: 2020, placa: 'P890123', categoria: 'Microbús', color: 'Blanco', transmision: 'Manual', combustible: 'Diésel', capacidad: 15, kilometraje: 132400, precioPorDia: 95, estado: 'no_disponible', imagenUrl: '', descripcion: 'Retirado temporalmente de la flota por revisión mecánica.' },
];

async function main() {
  cargarEnv();

  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  if (!config.apiKey || !config.projectId) {
    console.error('Faltan las variables EXPO_PUBLIC_FIREBASE_* en el archivo .env.');
    process.exit(1);
  }

  const correo = process.env.SEED_EMAIL;
  const clave = process.env.SEED_PASSWORD;
  if (!correo || !clave) {
    console.error('Faltan SEED_EMAIL y SEED_PASSWORD en el archivo .env.');
    console.error('Deben corresponder a una cuenta con rol "administrador" en usuarios/{uid}.');
    process.exit(1);
  }

  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Iniciando sesión como ${correo}…`);
  await signInWithEmailAndPassword(auth, correo, clave);
  console.log('  Sesión iniciada.');

  console.log(`Escribiendo ${VEHICULOS.length} vehículos…`);
  for (const { id, ...datos } of VEHICULOS) {
    await setDoc(doc(db, 'vehiculos', id), datos);
    process.stdout.write(`  ${id}: ${datos.marca} ${datos.modelo}\n`);
  }

  const comprobacion = await getDocs(collection(db, 'vehiculos'));
  console.log(`\nCatálogo cargado. Documentos en la colección: ${comprobacion.size}`);
  console.log('Ya puedes ejecutar: npm start');
  process.exit(0);
}

main().catch((e) => {
  console.error('\nNo se pudo cargar el catálogo.');
  console.error(e.code ? `${e.code}: ${e.message}` : e.message);
  if (e.code === 'permission-denied') {
    console.error('\nLa cuenta no tiene rol "administrador" en usuarios/{uid}.');
    console.error('Ábrelo en la consola de Firestore y cambia el campo rol.');
  }
  process.exit(1);
});
