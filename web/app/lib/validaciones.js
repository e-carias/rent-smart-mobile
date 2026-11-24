/**
 * Validaciones compartidas entre el formulario (cliente) y el API (servidor).
 * Tener una sola fuente evita que la pantalla acepte algo que el API rechaza.
 */

import { ESTADOS_VEHICULO } from './constantes';

const ANIO_ACTUAL = new Date().getFullYear();

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Placa salvadoreña simplificada: 1 letra + 5 o 6 dígitos (P123456, A12345)
export const REGEX_PLACA = /^[A-Z]{1,3}[0-9]{4,6}$/;

export function esTextoVacio(valor) {
  return valor === undefined || valor === null || String(valor).trim() === '';
}

/* ------------------------------ Vehículo ------------------------------ */

export function validarVehiculo(datos = {}) {
  const errores = {};

  if (esTextoVacio(datos.marca)) errores.marca = 'La marca es obligatoria.';
  else if (String(datos.marca).trim().length < 2) errores.marca = 'La marca debe tener al menos 2 caracteres.';

  if (esTextoVacio(datos.modelo)) errores.modelo = 'El modelo es obligatorio.';

  const anio = Number(datos.anio);
  if (esTextoVacio(datos.anio)) errores.anio = 'El año es obligatorio.';
  else if (!Number.isInteger(anio)) errores.anio = 'El año debe ser un número entero.';
  else if (anio < 1990 || anio > ANIO_ACTUAL + 1)
    errores.anio = `El año debe estar entre 1990 y ${ANIO_ACTUAL + 1}.`;

  const placa = String(datos.placa || '').trim().toUpperCase();
  if (esTextoVacio(placa)) errores.placa = 'La placa es obligatoria.';
  else if (!REGEX_PLACA.test(placa))
    errores.placa = 'Formato de placa inválido. Ejemplo válido: P123456.';

  if (esTextoVacio(datos.categoria)) errores.categoria = 'La categoría es obligatoria.';
  if (esTextoVacio(datos.color)) errores.color = 'El color es obligatorio.';

  const precio = Number(datos.precioPorDia);
  if (esTextoVacio(datos.precioPorDia)) errores.precioPorDia = 'El precio por día es obligatorio.';
  else if (Number.isNaN(precio)) errores.precioPorDia = 'El precio debe ser numérico.';
  else if (precio <= 0) errores.precioPorDia = 'El precio debe ser mayor que cero.';
  else if (precio > 1000) errores.precioPorDia = 'El precio no puede superar $1,000 por día.';

  if (datos.kilometraje !== undefined && datos.kilometraje !== '') {
    const km = Number(datos.kilometraje);
    if (Number.isNaN(km) || km < 0) errores.kilometraje = 'El kilometraje debe ser un número positivo.';
  }

  if (datos.capacidad !== undefined && datos.capacidad !== '') {
    const cap = Number(datos.capacidad);
    if (!Number.isInteger(cap) || cap < 1 || cap > 60)
      errores.capacidad = 'La capacidad debe estar entre 1 y 60 pasajeros.';
  }

  if (!esTextoVacio(datos.estado) && !ESTADOS_VEHICULO.includes(datos.estado))
    errores.estado = `Estado inválido. Valores permitidos: ${ESTADOS_VEHICULO.join(', ')}.`;

  return errores;
}

/* ------------------------------ Usuario ------------------------------- */

export function validarRegistro(datos = {}) {
  const errores = {};

  if (esTextoVacio(datos.nombre)) errores.nombre = 'El nombre es obligatorio.';
  else if (String(datos.nombre).trim().length < 3) errores.nombre = 'Escribe tu nombre completo.';

  if (esTextoVacio(datos.email)) errores.email = 'El correo es obligatorio.';
  else if (!REGEX_EMAIL.test(String(datos.email).trim())) errores.email = 'Formato de correo inválido.';

  if (esTextoVacio(datos.password)) errores.password = 'La contraseña es obligatoria.';
  else if (String(datos.password).length < 8)
    errores.password = 'La contraseña debe tener al menos 8 caracteres.';
  else if (!/[A-Za-z]/.test(datos.password) || !/[0-9]/.test(datos.password))
    errores.password = 'La contraseña debe combinar letras y números.';

  if (datos.confirmarPassword !== undefined && datos.password !== datos.confirmarPassword)
    errores.confirmarPassword = 'Las contraseñas no coinciden.';

  if (esTextoVacio(datos.documento)) errores.documento = 'El documento (DUI) es obligatorio.';
  if (esTextoVacio(datos.telefono)) errores.telefono = 'El teléfono es obligatorio.';

  return errores;
}

export function validarLogin(datos = {}) {
  const errores = {};
  if (esTextoVacio(datos.email)) errores.email = 'Ingresa tu correo.';
  else if (!REGEX_EMAIL.test(String(datos.email).trim())) errores.email = 'Formato de correo inválido.';
  if (esTextoVacio(datos.password)) errores.password = 'Ingresa tu contraseña.';
  return errores;
}

/* ------------------------------ Reserva ------------------------------- */

export function validarReserva(datos = {}) {
  const errores = {};

  if (!datos.vehiculoId) errores.vehiculoId = 'Selecciona un vehículo.';
  if (!datos.clienteId) errores.clienteId = 'La reserva debe pertenecer a un cliente.';

  if (esTextoVacio(datos.fechaInicio)) errores.fechaInicio = 'La fecha de inicio es obligatoria.';
  if (esTextoVacio(datos.fechaFin)) errores.fechaFin = 'La fecha de devolución es obligatoria.';

  if (!errores.fechaInicio && !errores.fechaFin) {
    const inicio = new Date(`${datos.fechaInicio}T00:00:00`);
    const fin = new Date(`${datos.fechaFin}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) errores.fechaInicio = 'Fecha de inicio inválida.';
    if (Number.isNaN(fin.getTime())) errores.fechaFin = 'Fecha de devolución inválida.';
    if (!errores.fechaInicio && !errores.fechaFin && fin <= inicio)
      errores.fechaFin = 'La devolución debe ser posterior al inicio.';
  }

  return errores;
}

export function hayErrores(errores) {
  return Object.keys(errores || {}).length > 0;
}
