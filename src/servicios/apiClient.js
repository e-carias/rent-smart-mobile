/**
 * Cliente HTTP único de la app móvil.
 *
 * Es el equivalente de `app/services/apiClient.js` de la versión web: las
 * pantallas nunca llaman a fetch, solo a los servicios, y los servicios solo
 * a este archivo. Lo que cambia respecto de la web:
 *
 *   1. El token se guarda con AsyncStorage (el teléfono no tiene localStorage).
 *   2. Cada petición lleva un tiempo límite; en una red móvil un servidor
 *      inalcanzable se queda colgado y la pantalla se congelaría.
 *   3. Si el API no responde, quien llama puede continuar con los datos de
 *      respaldo: por eso el error de red se marca con `esFalloDeRed`.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Dirección del API.
 *
 * Se define en el archivo .env como EXPO_PUBLIC_API_URL. Expo inyecta en el
 * paquete toda variable que empiece con EXPO_PUBLIC_.
 */
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

/** Milisegundos antes de dar por perdida una petición. */
const TIEMPO_LIMITE = 8000;

const CLAVE_TOKEN = 'rentsmart.token';

/* ----------------------------- Token ------------------------------- */

export async function guardarToken(token) {
  try {
    if (token) await AsyncStorage.setItem(CLAVE_TOKEN, token);
    else await AsyncStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Si el almacenamiento falla, la sesión simplemente no se recuerda.
  }
}

export async function obtenerToken() {
  try {
    return await AsyncStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

/* --------------------------- Error tipado --------------------------- */

export class ApiError extends Error {
  constructor(mensaje, { status = 0, errores = null, esFalloDeRed = false } = {}) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.errores = errores; // { campo: 'motivo' }
    this.esFalloDeRed = esFalloDeRed;
  }
}

/* ------------------------------ Núcleo ------------------------------ */

function construirUrl(ruta, params) {
  const base = `${API_BASE}${ruta}`;
  if (!params) return base;

  const limpios = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!limpios.length) return base;

  const query = limpios
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return `${base}${base.includes('?') ? '&' : '?'}${query}`;
}

async function peticion(metodo, ruta, { body, params } = {}) {
  if (!API_BASE) {
    throw new ApiError('No hay una dirección de API configurada.', { esFalloDeRed: true });
  }

  const url = construirUrl(ruta, params);
  const token = await obtenerToken();

  // AbortController corta la petición si el servidor no responde a tiempo.
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE);

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: control.signal,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', { esFalloDeRed: true });
  } finally {
    clearTimeout(temporizador);
  }

  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok || (cuerpo && cuerpo.ok === false)) {
    throw new ApiError(
      (cuerpo && cuerpo.mensaje) || `Error ${respuesta.status}: no se pudo completar la operación.`,
      { status: respuesta.status, errores: cuerpo ? cuerpo.errores : null }
    );
  }

  // El API responde { ok: true, data: ... }; la pantalla solo necesita data.
  return cuerpo ? cuerpo.data : null;
}

export const apiClient = {
  get: (ruta, opciones) => peticion('GET', ruta, opciones),
  post: (ruta, body, opciones) => peticion('POST', ruta, { ...opciones, body }),
  put: (ruta, body, opciones) => peticion('PUT', ruta, { ...opciones, body }),
  patch: (ruta, body, opciones) => peticion('PATCH', ruta, { ...opciones, body }),
  delete: (ruta, opciones) => peticion('DELETE', ruta, opciones),
};

export default apiClient;
