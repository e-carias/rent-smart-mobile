/**
 * Registro del origen de los datos.
 *
 * La app prefiere siempre el API REST. Cuando una petición falla por red, el
 * servicio devuelve los datos de respaldo y avisa aquí; la pantalla muestra
 * entonces el aviso de "modo sin conexión". Es un bus de eventos mínimo, el
 * mismo patrón que usa el apiClient de la versión web para la barra de carga.
 */

import { ApiError } from './apiClient';

let enModoRespaldo = false;
const suscriptores = new Set();

export function estaEnModoRespaldo() {
  return enModoRespaldo;
}

function anunciar(valor) {
  if (enModoRespaldo === valor) return;
  enModoRespaldo = valor;
  suscriptores.forEach((fn) => {
    try {
      fn(valor);
    } catch (e) {
      console.warn('[origenDatos] suscriptor falló:', e);
    }
  });
}

/** Devuelve la función para cancelar la suscripción. */
export function alCambiarOrigen(callback) {
  suscriptores.add(callback);
  return () => suscriptores.delete(callback);
}

/**
 * Ejecuta una llamada al API y, si falla por red, devuelve el respaldo.
 *
 *   const lista = await conRespaldo(
 *     () => apiClient.get('/vehiculos'),
 *     () => VEHICULOS
 *   );
 *
 * Importante: solo se cae al respaldo ante un fallo de RED. Un 422 de
 * validación o un 409 de conflicto son respuestas legítimas del servidor y
 * deben llegar a la pantalla para mostrarse al usuario.
 */
export async function conRespaldo(llamada, respaldo) {
  try {
    const datos = await llamada();
    anunciar(false);
    return datos;
  } catch (e) {
    if (e instanceof ApiError && e.esFalloDeRed) {
      anunciar(true);
      return typeof respaldo === 'function' ? respaldo() : respaldo;
    }
    throw e;
  }
}
