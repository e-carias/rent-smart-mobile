/**
 * Bitácora de actividad del usuario en Firestore.
 *
 * Cubre el requerimiento de "historial o visualización de registros
 * almacenados": cada operación relevante —registro, acceso, creación y
 * cancelación de reservas— deja una línea en la colección `actividad`,
 * asociada al uid de quien la ejecutó.
 *
 * Es deliberadamente de solo escritura y lectura: no existe forma de editar
 * ni de borrar un registro desde la aplicación, porque una bitácora que se
 * puede alterar no sirve como evidencia de lo ocurrido.
 */

import {
  collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';

import { obtenerDb, COLECCIONES } from '../firebase/configuracion';
import { conRespaldo } from './origenDatos';

export const ETIQUETAS = {
  cuenta_creada: 'Cuenta creada',
  sesion_iniciada: 'Sesión iniciada',
  reserva_creada: 'Reserva creada',
  reserva_confirmada: 'Reserva confirmada',
  reserva_en_curso: 'Vehículo entregado',
  reserva_finalizada: 'Reserva finalizada',
  reserva_cancelada: 'Reserva cancelada',
  perfil_actualizado: 'Perfil actualizado',
};

export const ICONOS = {
  cuenta_creada: 'person-add-outline',
  sesion_iniciada: 'log-in-outline',
  reserva_creada: 'calendar-outline',
  reserva_confirmada: 'checkmark-circle-outline',
  reserva_en_curso: 'car-outline',
  reserva_finalizada: 'flag-outline',
  reserva_cancelada: 'close-circle-outline',
  perfil_actualizado: 'create-outline',
};

function mapear(documento) {
  const d = documento.data();
  return {
    id: documento.id,
    uid: d.uid,
    accion: d.accion,
    etiqueta: ETIQUETAS[d.accion] || d.accion,
    icono: ICONOS[d.accion] || 'ellipse-outline',
    descripcion: d.descripcion ?? '',
    reservaId: d.reservaId ?? null,
    monto: d.monto ?? null,
    // serverTimestamp() llega como null en el instante en que se escribe y
    // se completa cuando el servidor confirma; de ahí el encadenamiento.
    fecha: d.creadoEn?.toDate?.() ?? null,
  };
}

export const ActividadService = {
  /**
   * Registrar nunca debe hacer fallar la operación principal: si la bitácora
   * no se puede escribir, la reserva ya se creó y eso es lo que importa.
   */
  async registrar(uid, { accion, descripcion, reservaId = null, monto = null }) {
    if (!uid) return null;
    try {
      const referencia = await addDoc(collection(obtenerDb(), COLECCIONES.actividad), {
        uid,
        accion,
        descripcion,
        reservaId,
        monto,
        creadoEn: serverTimestamp(),
      });
      return referencia.id;
    } catch (e) {
      console.warn('[actividad] no se pudo registrar:', e.message);
      return null;
    }
  },

  /** Últimos movimientos del usuario, del más reciente al más antiguo. */
  obtenerHistorial(uid, cantidad = 50) {
    return conRespaldo(async () => {
      const consulta = query(
        collection(obtenerDb(), COLECCIONES.actividad),
        where('uid', '==', uid),
        orderBy('creadoEn', 'desc'),
        limit(cantidad)
      );
      const instantanea = await getDocs(consulta);
      return instantanea.docs.map(mapear);
    }, () => []);
  },
};

export default ActividadService;
