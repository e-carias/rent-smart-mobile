/**
 * Bus de progreso y errores de la aplicación web.
 *
 * Sustituye al bus que vivía dentro de `apiClient.js` cuando los datos
 * llegaban por HTTP. La idea no cambia: cualquier operación contra Firestore
 * avisa cuándo empieza y cuándo termina, y el componente EstadoGlobal pinta
 * la barra de progreso y las notificaciones sin que cada pantalla repita ese
 * código.
 */

const suscriptores = { carga: new Set(), error: new Set() };
let operacionesEnCurso = 0;

function emitir(evento, dato) {
  suscriptores[evento].forEach((fn) => {
    try {
      fn(dato);
    } catch (e) {
      console.error('[progreso] suscriptor falló:', e);
    }
  });
}

export function alCambiarCarga(callback) {
  suscriptores.carga.add(callback);
  return () => suscriptores.carga.delete(callback);
}

export function alOcurrirError(callback) {
  suscriptores.error.add(callback);
  return () => suscriptores.error.delete(callback);
}

/** Error de dominio, con un mensaje pensado para mostrarse al usuario. */
export class ErrorDatos extends Error {
  constructor(mensaje, codigo = 'datos/error') {
    super(mensaje);
    this.name = 'ErrorDatos';
    this.codigo = codigo;
  }
}

const MENSAJES = {
  'permission-denied':
    'No tienes permiso para esta operación. Revisa que las reglas de seguridad estén publicadas.',
  unavailable: 'No hay conexión con Firestore. Revisa tu red e inténtalo de nuevo.',
  'not-found': 'El registro solicitado ya no existe.',
  'failed-precondition':
    'La consulta necesita un índice que todavía no existe en el proyecto de Firebase.',
};

export function traducirError(error) {
  if (error instanceof ErrorDatos) return error;
  const codigo = String(error?.code || '').replace('firestore/', '');
  return new ErrorDatos(
    MENSAJES[codigo] || error?.message || 'No se pudo completar la operación.',
    codigo || 'datos/desconocido'
  );
}

/**
 * Envuelve una operación con el aviso de carga y la traducción del error.
 *
 *   return conProgreso(() => getDocs(consulta));
 *
 * `silencioso` evita la notificación global cuando la pantalla ya muestra el
 * error junto al campo o dentro de su propio modal.
 */
export async function conProgreso(operacion, { silencioso = false } = {}) {
  operacionesEnCurso += 1;
  if (operacionesEnCurso === 1) emitir('carga', true);

  try {
    return await operacion();
  } catch (e) {
    const error = traducirError(e);
    if (!silencioso) emitir('error', error);
    throw error;
  } finally {
    operacionesEnCurso = Math.max(0, operacionesEnCurso - 1);
    if (operacionesEnCurso === 0) emitir('carga', false);
  }
}

const Progreso = { conProgreso, alCambiarCarga, alOcurrirError, ErrorDatos, traducirError };

export default Progreso;
