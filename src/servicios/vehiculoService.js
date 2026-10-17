/**
 * Servicio de vehículos.
 *
 * Mismas operaciones y mismas rutas que `app/services/vehiculoService.js` de
 * la versión web. La diferencia es que cada lectura pasa por `conRespaldo`,
 * para que la app siga funcionando si el API no está disponible.
 */

import apiClient from './apiClient';
import { conRespaldo } from './origenDatos';
import { VEHICULOS } from '../datos/demo';

function filtrarLocal(filtros = {}) {
  const texto = String(filtros.texto || '').trim().toLowerCase();

  return VEHICULOS.filter((v) => {
    if (filtros.estado && v.estado !== filtros.estado) return false;
    if (filtros.categoria && v.categoria !== filtros.categoria) return false;
    if (!texto) return true;
    return [v.marca, v.modelo, v.placa, v.categoria, v.color]
      .join(' ')
      .toLowerCase()
      .includes(texto);
  });
}

export const VehiculoService = {
  /** Listar vehículos. filtros: { estado, categoria, texto } */
  obtenerVehiculos(filtros = {}) {
    return conRespaldo(
      () => apiClient.get('/vehiculos', { params: filtros }),
      () => filtrarLocal(filtros)
    );
  },

  /** Un vehículo por su identificador. */
  obtenerVehiculo(id) {
    return conRespaldo(
      () => apiClient.get(`/vehiculos/${id}`),
      () => VEHICULOS.find((v) => v.id === Number(id)) || null
    );
  },

  /** Vehículos libres en un rango de fechas, con la cotización ya calculada. */
  buscarDisponibles(filtros = {}) {
    return conRespaldo(
      () => apiClient.get('/vehiculos/disponibles', { params: filtros }),
      () => filtrarLocal({ ...filtros, estado: 'disponible' })
    );
  },

  /** Categorías presentes en la flota, para los filtros de la pantalla. */
  async obtenerCategorias() {
    const lista = await this.obtenerVehiculos();
    return [...new Set(lista.map((v) => v.categoria))].sort();
  },
};

export default VehiculoService;
