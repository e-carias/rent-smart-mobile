/**
 * Datos de respaldo.
 *
 * La aplicación lee de Cloud Firestore. Cuando el dispositivo está sin red,
 * la capa de servicios recurre a estos datos para que la interfaz siga siendo
 * navegable y nunca aparezca vacía; una franja amarilla advierte al usuario
 * de que lo que ve no acaba de confirmarse con el servidor.
 *
 * Los identificadores coinciden con los que escribe `scripts/cargar-catalogo.mjs`
 * en Firestore, de modo que las pantallas no distinguen el origen.
 *
 * Las cuentas de demostración de la entrega anterior se eliminaron: ahora los
 * usuarios los administra Firebase Authentication.
 */

export const VEHICULOS = [
  {
    id: 'v1', marca: 'Toyota', modelo: 'Corolla', anio: 2023, placa: 'P123456',
    categoria: 'Sedán', color: 'Blanco', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 24500,
    precioPorDia: 38, estado: 'disponible', imagenUrl: '',
    descripcion: 'Sedán económico, ideal para ciudad y viajes cortos.',
  },
  {
    id: 'v2', marca: 'Nissan', modelo: 'Versa', anio: 2022, placa: 'P234567',
    categoria: 'Sedán', color: 'Gris', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 41200,
    precioPorDia: 33, estado: 'disponible', imagenUrl: '',
    descripcion: 'Bajo consumo de combustible y amplio maletero.',
  },
  {
    id: 'v3', marca: 'Kia', modelo: 'Sportage', anio: 2024, placa: 'P345678',
    categoria: 'SUV', color: 'Negro', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 12800,
    precioPorDia: 58, estado: 'disponible', imagenUrl: '',
    descripcion: 'SUV compacta con cámara de retroceso y sensores.',
  },
  {
    id: 'v4', marca: 'Toyota', modelo: 'Hilux', anio: 2023, placa: 'P456789',
    categoria: 'Pick-up', color: 'Plata', transmision: 'Manual',
    combustible: 'Diésel', capacidad: 5, kilometraje: 56300,
    precioPorDia: 72, estado: 'disponible', imagenUrl: '',
    descripcion: 'Doble cabina 4x4, recomendada para zonas rurales.',
  },
  {
    id: 'v5', marca: 'Hyundai', modelo: 'Accent', anio: 2021, placa: 'P567890',
    categoria: 'Compacto', color: 'Rojo', transmision: 'Manual',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 78900,
    precioPorDia: 28, estado: 'mantenimiento', imagenUrl: '',
    descripcion: 'En taller por servicio preventivo de 80,000 km.',
  },
  {
    id: 'v6', marca: 'Honda', modelo: 'CR-V', anio: 2024, placa: 'P678901',
    categoria: 'SUV', color: 'Azul', transmision: 'Automática',
    combustible: 'Híbrido', capacidad: 5, kilometraje: 9400,
    precioPorDia: 65, estado: 'disponible', imagenUrl: '',
    descripcion: 'SUV híbrida, excelente rendimiento en carretera.',
  },
  {
    id: 'v7', marca: 'Suzuki', modelo: 'Swift', anio: 2022, placa: 'P789012',
    categoria: 'Compacto', color: 'Blanco', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 33100,
    precioPorDia: 30, estado: 'disponible', imagenUrl: '',
    descripcion: 'Compacto ágil y fácil de estacionar.',
  },
  {
    id: 'v8', marca: 'Toyota', modelo: 'Hiace', anio: 2020, placa: 'P890123',
    categoria: 'Microbús', color: 'Blanco', transmision: 'Manual',
    combustible: 'Diésel', capacidad: 15, kilometraje: 132400,
    precioPorDia: 95, estado: 'no_disponible', imagenUrl: '',
    descripcion: 'Retirado temporalmente de la flota por revisión mecánica.',
  },
];

export const RESERVAS = [
  {
    id: 101, codigo: 'RS-00101', vehiculoId: 'v1', uid: 'demo',
    fechaInicio: '2026-09-12', fechaFin: '2026-09-16', dias: 4,
    tarifaDiaria: 38, porcentajeDescuento: 0, descuento: 0,
    subtotal: 152, impuesto: 19.76, total: 171.76,
    estado: 'finalizada', lugarEntrega: 'Sucursal San Salvador',
    observaciones: '', fechaCreacion: '2026-09-10',
    vehiculo: 'Toyota Corolla', placa: 'P123456',
  },
  {
    id: 102, codigo: 'RS-00102', vehiculoId: 'v3', uid: 'demo',
    fechaInicio: '2026-10-20', fechaFin: '2026-10-25', dias: 5,
    tarifaDiaria: 58, porcentajeDescuento: 5, descuento: 14.5,
    subtotal: 275.5, impuesto: 35.82, total: 311.32,
    estado: 'confirmada', lugarEntrega: 'Aeropuerto de Comalapa',
    observaciones: 'Entrega en mostrador de llegadas.', fechaCreacion: '2026-10-11',
    vehiculo: 'Kia Sportage', placa: 'P345678',
  },
  {
    id: 103, codigo: 'RS-00103', vehiculoId: 'v6', uid: 'demo',
    fechaInicio: '2026-11-02', fechaFin: '2026-11-05', dias: 3,
    tarifaDiaria: 65, porcentajeDescuento: 0, descuento: 0,
    subtotal: 195, impuesto: 25.35, total: 220.35,
    estado: 'pendiente', lugarEntrega: 'Sucursal Santa Ana',
    observaciones: '', fechaCreacion: '2026-10-13',
    vehiculo: 'Honda CR-V', placa: 'P678901',
  },
];

export const LUGARES_ENTREGA = [
  'Sucursal San Salvador',
  'Sucursal Santa Ana',
  'Sucursal San Miguel',
  'Aeropuerto de Comalapa',
];
