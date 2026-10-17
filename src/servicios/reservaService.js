/**
 * Servicio de reservas.
 *
 * Mismas rutas que la versión web. Las reservas creadas sin conexión se
 * guardan en el teléfono con AsyncStorage y se marcan con `pendienteDeEnvio`,
 * para que el usuario vea lo que hizo y sepa que todavía no llegó al servidor.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { conRespaldo } from './origenDatos';
import { calcularTarifa } from '../lib/negocio';
import { hoy } from '../lib/formato';
import { RESERVAS, VEHICULOS } from '../datos/demo';

const CLAVE_LOCALES = 'rentsmart.reservas.locales';

async function leerLocales() {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE_LOCALES);
    return crudo ? JSON.parse(crudo) : [];
  } catch {
    return [];
  }
}

async function guardarLocal(reserva) {
  try {
    const locales = await leerLocales();
    locales.unshift(reserva);
    await AsyncStorage.setItem(CLAVE_LOCALES, JSON.stringify(locales));
  } catch {
    // Si el almacenamiento falla, la reserva simplemente no se recuerda.
  }
}

/** Añade los datos del vehículo a una reserva que solo trae el id. */
function completarVehiculo(reserva) {
  if (reserva.vehiculo) return reserva;
  const v = VEHICULOS.find((x) => x.id === Number(reserva.vehiculoId));
  return v
    ? { ...reserva, vehiculo: `${v.marca} ${v.modelo}`, placa: v.placa }
    : reserva;
}

export const ReservaService = {
  /** Reservas de un cliente, de la más reciente a la más antigua. */
  async obtenerReservas(filtros = {}) {
    const delServidor = await conRespaldo(
      () => apiClient.get('/reservas', { params: filtros }),
      () => RESERVAS.filter((r) => !filtros.estado || r.estado === filtros.estado)
    );

    const locales = await leerLocales();
    return [...locales, ...(delServidor || [])].map(completarVehiculo);
  },

  async obtenerReserva(id) {
    const locales = await leerLocales();
    const local = locales.find((r) => String(r.id) === String(id));
    if (local) return completarVehiculo(local);

    const reserva = await conRespaldo(
      () => apiClient.get(`/reservas/${id}`),
      () => RESERVAS.find((r) => String(r.id) === String(id)) || null
    );
    return reserva ? completarVehiculo(reserva) : null;
  },

  /**
   * Crear una reserva.
   *
   * Un 409 significa que el vehículo ya está tomado en esas fechas: es una
   * respuesta válida del servidor y debe llegar a la pantalla, no caer al
   * respaldo. Solo un fallo de red activa el guardado local.
   */
  async crearReserva(datos) {
    try {
      return await apiClient.post('/reservas', datos);
    } catch (e) {
      if (!e.esFalloDeRed) throw e;

      const vehiculo = VEHICULOS.find((v) => v.id === Number(datos.vehiculoId));
      const tarifa = calcularTarifa(vehiculo?.precioPorDia || 0, datos.fechaInicio, datos.fechaFin);
      const consecutivo = Date.now() % 100000;

      const reserva = {
        id: `local-${consecutivo}`,
        codigo: `RS-L${String(consecutivo).padStart(5, '0')}`,
        ...datos,
        ...tarifa,
        estado: 'pendiente',
        fechaCreacion: hoy(),
        pendienteDeEnvio: true,
      };

      await guardarLocal(reserva);
      return completarVehiculo(reserva);
    }
  },

  /** Cancelar una reserva (transición pendiente/confirmada -> cancelada). */
  cancelarReserva(id, motivo = '') {
    return apiClient.patch(`/reservas/${id}`, { estado: 'cancelada', observaciones: motivo });
  },

  /** Solo para pruebas: vacía las reservas guardadas en el teléfono. */
  async limpiarLocales() {
    await AsyncStorage.removeItem(CLAVE_LOCALES);
  },
};

export default ReservaService;
