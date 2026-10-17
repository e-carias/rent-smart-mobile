/**
 * Datos de respaldo.
 *
 * La app consume el API REST del proyecto web. Cuando ese API no responde
 * —no hay red, la computadora está apagada, la IP cambió— la capa de
 * servicios recurre a estos datos para que la aplicación siga siendo
 * navegable y la interfaz nunca aparezca vacía.
 *
 * Son una copia exacta de `database/semilla.sql`, con los mismos nombres de
 * campo que devuelve el API, de modo que las pantallas no distinguen el
 * origen de los datos.
 */

export const VEHICULOS = [
  {
    id: 1, marca: 'Toyota', modelo: 'Corolla', anio: 2023, placa: 'P123456',
    categoria: 'Sedán', color: 'Blanco', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 24500,
    precioPorDia: 38, estado: 'disponible', imagenUrl: '',
    descripcion: 'Sedán económico, ideal para ciudad y viajes cortos.',
  },
  {
    id: 2, marca: 'Nissan', modelo: 'Versa', anio: 2022, placa: 'P234567',
    categoria: 'Sedán', color: 'Gris', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 41200,
    precioPorDia: 33, estado: 'disponible', imagenUrl: '',
    descripcion: 'Bajo consumo de combustible y amplio maletero.',
  },
  {
    id: 3, marca: 'Kia', modelo: 'Sportage', anio: 2024, placa: 'P345678',
    categoria: 'SUV', color: 'Negro', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 12800,
    precioPorDia: 58, estado: 'disponible', imagenUrl: '',
    descripcion: 'SUV compacta con cámara de retroceso y sensores.',
  },
  {
    id: 4, marca: 'Toyota', modelo: 'Hilux', anio: 2023, placa: 'P456789',
    categoria: 'Pick-up', color: 'Plata', transmision: 'Manual',
    combustible: 'Diésel', capacidad: 5, kilometraje: 56300,
    precioPorDia: 72, estado: 'disponible', imagenUrl: '',
    descripcion: 'Doble cabina 4x4, recomendada para zonas rurales.',
  },
  {
    id: 5, marca: 'Hyundai', modelo: 'Accent', anio: 2021, placa: 'P567890',
    categoria: 'Compacto', color: 'Rojo', transmision: 'Manual',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 78900,
    precioPorDia: 28, estado: 'mantenimiento', imagenUrl: '',
    descripcion: 'En taller por servicio preventivo de 80,000 km.',
  },
  {
    id: 6, marca: 'Honda', modelo: 'CR-V', anio: 2024, placa: 'P678901',
    categoria: 'SUV', color: 'Azul', transmision: 'Automática',
    combustible: 'Híbrido', capacidad: 5, kilometraje: 9400,
    precioPorDia: 65, estado: 'disponible', imagenUrl: '',
    descripcion: 'SUV híbrida, excelente rendimiento en carretera.',
  },
  {
    id: 7, marca: 'Suzuki', modelo: 'Swift', anio: 2022, placa: 'P789012',
    categoria: 'Compacto', color: 'Blanco', transmision: 'Automática',
    combustible: 'Gasolina', capacidad: 5, kilometraje: 33100,
    precioPorDia: 30, estado: 'disponible', imagenUrl: '',
    descripcion: 'Compacto ágil y fácil de estacionar.',
  },
  {
    id: 8, marca: 'Toyota', modelo: 'Hiace', anio: 2020, placa: 'P890123',
    categoria: 'Microbús', color: 'Blanco', transmision: 'Manual',
    combustible: 'Diésel', capacidad: 15, kilometraje: 132400,
    precioPorDia: 95, estado: 'no_disponible', imagenUrl: '',
    descripcion: 'Retirado temporalmente de la flota por revisión mecánica.',
  },
];

export const RESERVAS = [
  {
    id: 101, codigo: 'RS-00101', vehiculoId: 1, clienteId: 1,
    fechaInicio: '2026-09-12', fechaFin: '2026-09-16', dias: 4,
    tarifaDiaria: 38, porcentajeDescuento: 0, descuento: 0,
    subtotal: 152, impuesto: 19.76, total: 171.76,
    estado: 'finalizada', lugarEntrega: 'Sucursal San Salvador',
    observaciones: '', fechaCreacion: '2026-09-10',
    vehiculo: 'Toyota Corolla', placa: 'P123456',
  },
  {
    id: 102, codigo: 'RS-00102', vehiculoId: 3, clienteId: 1,
    fechaInicio: '2026-10-20', fechaFin: '2026-10-25', dias: 5,
    tarifaDiaria: 58, porcentajeDescuento: 5, descuento: 14.5,
    subtotal: 275.5, impuesto: 35.82, total: 311.32,
    estado: 'confirmada', lugarEntrega: 'Aeropuerto de Comalapa',
    observaciones: 'Entrega en mostrador de llegadas.', fechaCreacion: '2026-10-11',
    vehiculo: 'Kia Sportage', placa: 'P345678',
  },
  {
    id: 103, codigo: 'RS-00103', vehiculoId: 6, clienteId: 1,
    fechaInicio: '2026-11-02', fechaFin: '2026-11-05', dias: 3,
    tarifaDiaria: 65, porcentajeDescuento: 0, descuento: 0,
    subtotal: 195, impuesto: 25.35, total: 220.35,
    estado: 'pendiente', lugarEntrega: 'Sucursal Santa Ana',
    observaciones: '', fechaCreacion: '2026-10-13',
    vehiculo: 'Honda CR-V', placa: 'P678901',
  },
];

/**
 * Cuentas aceptadas cuando el API no responde. Las contraseñas coinciden con
 * las de `database/semilla.sql`; son de demostración académica.
 */
export const USUARIOS = [
  {
    id: 1, nombre: 'Erick Rosales', email: 'cliente@rentsmart.com',
    password: 'Cliente123', rol: 'cliente', clienteId: 1, activo: 1,
  },
  {
    id: 2, nombre: 'Administrador RENT SMART', email: 'admin@rentsmart.com',
    password: 'Admin123', rol: 'administrador', clienteId: null, activo: 1,
  },
  {
    id: 3, nombre: 'Operador de mostrador', email: 'operador@rentsmart.com',
    password: 'Operador123', rol: 'operador', clienteId: null, activo: 1,
  },
];

export const CLIENTES = [
  {
    id: 1, nombre: 'Erick Rosales', documento: '01234567-8',
    telefono: '7777-7777', email: 'cliente@rentsmart.com',
    direccion: 'San Salvador, El Salvador', licencia: 'L-998877',
  },
];

export const CUENTAS_DEMO = [
  { rol: 'Cliente', email: 'cliente@rentsmart.com', password: 'Cliente123' },
  { rol: 'Administrador', email: 'admin@rentsmart.com', password: 'Admin123' },
  { rol: 'Operador', email: 'operador@rentsmart.com', password: 'Operador123' },
];

export const LUGARES_ENTREGA = [
  'Sucursal San Salvador',
  'Sucursal Santa Ana',
  'Sucursal San Miguel',
  'Aeropuerto de Comalapa',
];
