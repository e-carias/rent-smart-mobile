/**
 * Validaciones de formularios (requerimiento funcional 4).
 *
 * Son las MISMAS reglas que `app/lib/validaciones.js` de la versión web, con
 * los mismos nombres de función y los mismos mensajes. Se copian en lugar de
 * importarse porque el empaquetador de React Native (Metro) no puede salir de
 * la carpeta del proyecto móvil; mantener los nombres idénticos deja claro que
 * son la misma especificación y facilita unificarlas en un paquete compartido.
 *
 * Todas devuelven un objeto { campo: 'motivo' }. Vacío significa válido.
 */

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// DUI salvadoreño: 8 dígitos, guion, 1 dígito. Se acepta con o sin guion.
export const REGEX_DUI = /^[0-9]{8}-?[0-9]$/;
// Teléfono salvadoreño: 8 dígitos, con espacios o guiones opcionales.
export const REGEX_TELEFONO = /^[0-9]{4}[\s-]?[0-9]{4}$/;

export function esTextoVacio(valor) {
  return valor === undefined || valor === null || String(valor).trim() === '';
}

export function hayErrores(errores) {
  return Object.keys(errores || {}).length > 0;
}

/* ------------------------------- Login -------------------------------- */

export function validarLogin(datos = {}) {
  const errores = {};

  if (esTextoVacio(datos.email)) errores.email = 'Ingresa tu correo.';
  else if (!REGEX_EMAIL.test(String(datos.email).trim()))
    errores.email = 'Formato de correo inválido.';

  if (esTextoVacio(datos.password)) errores.password = 'Ingresa tu contraseña.';

  return errores;
}

/* ------------------------------ Registro ------------------------------ */

export function validarRegistro(datos = {}) {
  const errores = {};

  if (esTextoVacio(datos.nombre)) errores.nombre = 'El nombre es obligatorio.';
  else if (String(datos.nombre).trim().length < 3)
    errores.nombre = 'Escribe tu nombre completo.';

  if (esTextoVacio(datos.email)) errores.email = 'El correo es obligatorio.';
  else if (!REGEX_EMAIL.test(String(datos.email).trim()))
    errores.email = 'Formato de correo inválido.';

  if (esTextoVacio(datos.password)) errores.password = 'La contraseña es obligatoria.';
  else if (String(datos.password).length < 8)
    errores.password = 'La contraseña debe tener al menos 8 caracteres.';
  else if (!/[A-Za-z]/.test(datos.password) || !/[0-9]/.test(datos.password))
    errores.password = 'La contraseña debe combinar letras y números.';

  if (datos.confirmarPassword !== undefined && datos.password !== datos.confirmarPassword)
    errores.confirmarPassword = 'Las contraseñas no coinciden.';

  const documento = String(datos.documento || '').trim();
  if (esTextoVacio(documento)) errores.documento = 'El documento (DUI) es obligatorio.';
  else if (!REGEX_DUI.test(documento))
    errores.documento = 'Formato de DUI inválido. Ejemplo: 01234567-8.';

  const telefono = String(datos.telefono || '').trim();
  if (esTextoVacio(telefono)) errores.telefono = 'El teléfono es obligatorio.';
  else if (!REGEX_TELEFONO.test(telefono))
    errores.telefono = 'El teléfono debe tener 8 dígitos. Ejemplo: 7777-7777.';

  return errores;
}

/* ------------------------------ Reserva ------------------------------- */

export function validarReserva(datos = {}) {
  const errores = {};

  if (!datos.vehiculoId) errores.vehiculoId = 'Selecciona un vehículo.';

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

  if (esTextoVacio(datos.lugarEntrega)) errores.lugarEntrega = 'Indica el lugar de entrega.';

  return errores;
}

/* ------------------------- Recuperar contraseña ----------------------- */

export function validarRecuperar(datos = {}) {
  const errores = {};

  if (esTextoVacio(datos.email)) errores.email = 'Ingresa tu correo.';
  else if (!REGEX_EMAIL.test(String(datos.email).trim()))
    errores.email = 'Formato de correo inválido.';

  return errores;
}
