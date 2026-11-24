/**
 * Reservas en Cloud Firestore, asociadas al usuario autenticado.
 *
 * Cada documento de `reservas` guarda el campo `uid` con el identificador que
 * emite Firebase Authentication. Las reglas de seguridad comparan ese campo
 * con `request.auth.uid`, de modo que un cliente solo puede leer y modificar
 * las suyas: la restricción se aplica en el servidor y no depende de que la
 * aplicación se comporte bien (Google, 2025b).
 *
 * La verificación de disponibilidad y el cálculo de la tarifa conservan las
 * mismas reglas de la versión web; lo que cambió es dónde se guardan.
 */

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';

import { obtenerDb, COLECCIONES } from '../firebase/configuracion';
import { conRespaldo } from './origenDatos';
import { calcularTarifa, ESTADOS_QUE_OCUPAN, hayTraslape } from '../lib/negocio';
import { RESERVAS, VEHICULOS } from '../datos/demo';
import ActividadService from './actividadService';

/** Transiciones permitidas, idénticas a las de la versión web. */
export const TRANSICIONES = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['en_curso', 'cancelada'],
  en_curso: ['finalizada'],
  finalizada: [],
  cancelada: [],
};

export function puedeTransicionar(desde, hacia) {
  return (TRANSICIONES[desde] || []).includes(hacia);
}

export class ErrorReserva extends Error {
  constructor(mensaje, codigo = 'reserva/invalida') {
    super(mensaje);
    this.name = 'ErrorReserva';
    this.codigo = codigo;
  }
}

/** Convierte un documento de Firestore a la forma que usan las pantallas. */
export function mapearReserva(documento) {
  const d = documento.data();
  return {
    id: documento.id,
    uid: d.uid,
    codigo: d.codigo,
    vehiculoId: d.vehiculoId,
    // Se guarda el nombre del vehículo junto a la reserva. Sin esta copia,
    // la pantalla de detalle mostraba "undefined undefined" cuando el
    // catálogo no se había cargado todavía.
    vehiculo: d.vehiculo ?? '',
    placa: d.placa ?? '',
    fechaInicio: d.fechaInicio,
    fechaFin: d.fechaFin,
    dias: Number(d.dias ?? 0),
    tarifaDiaria: Number(d.tarifaDiaria ?? 0),
    porcentajeDescuento: Number(d.porcentajeDescuento ?? 0),
    descuento: Number(d.descuento ?? 0),
    subtotal: Number(d.subtotal ?? 0),
    impuesto: Number(d.impuesto ?? 0),
    total: Number(d.total ?? 0),
    deposito: Number(d.deposito ?? 0),
    estado: d.estado ?? 'pendiente',
    lugarEntrega: d.lugarEntrega ?? '',
    observaciones: d.observaciones ?? '',
    creadoEn: d.creadoEn?.toDate?.() ?? null,
  };
}

function coleccion() {
  return collection(obtenerDb(), COLECCIONES.reservas);
}

/** Código legible para el usuario: RS- más los últimos seis dígitos del tiempo. */
export function generarCodigo() {
  return `RS-${String(Date.now()).slice(-6)}`;
}

export const ReservaService = {
  /** Reservas del usuario autenticado, de la más reciente a la más antigua. */
  obtenerReservas(uid, filtros = {}) {
    return conRespaldo(async () => {
      const restricciones = [where('uid', '==', uid)];
      if (filtros.estado) restricciones.push(where('estado', '==', filtros.estado));
      restricciones.push(orderBy('fechaInicio', 'desc'));

      const instantanea = await getDocs(query(coleccion(), ...restricciones));
      return instantanea.docs.map(mapearReserva);
    }, () => RESERVAS.filter((r) => !filtros.estado || r.estado === filtros.estado));
  },

  obtenerReserva(id) {
    return conRespaldo(async () => {
      const instantanea = await getDoc(doc(obtenerDb(), COLECCIONES.reservas, String(id)));
      return instantanea.exists() ? mapearReserva(instantanea) : null;
    }, () => RESERVAS.find((r) => String(r.id) === String(id)) || null);
  },

  /**
   * Comprueba que el vehículo esté libre en el rango solicitado.
   * Se traen las reservas que ocupan ese vehículo y se compara en memoria:
   * Firestore no admite dos filtros de rango sobre campos distintos, y el
   * número de reservas por unidad es pequeño.
   */
  async verificarDisponibilidad(vehiculoId, fechaInicio, fechaFin, exceptoId = null) {
    const instantanea = await getDocs(query(
      coleccion(),
      where('vehiculoId', '==', String(vehiculoId)),
      where('estado', 'in', ESTADOS_QUE_OCUPAN)
    ));

    const conflicto = instantanea.docs
      .map(mapearReserva)
      .filter((r) => String(r.id) !== String(exceptoId))
      .find((r) => hayTraslape(fechaInicio, fechaFin, r.fechaInicio, r.fechaFin));

    return conflicto
      ? { disponible: false, motivo: `El vehículo ya está reservado del ${conflicto.fechaInicio} al ${conflicto.fechaFin}.`, conflicto }
      : { disponible: true, motivo: null, conflicto: null };
  },

  /**
   * Crea la reserva. El total se calcula aquí con la misma fórmula que
   * muestra la pantalla, de modo que el importe que se guarda es el que el
   * usuario vio antes de confirmar.
   */
  async crearReserva(uid, datos) {
    if (!uid) throw new ErrorReserva('Debes iniciar sesión para reservar.', 'reserva/sin-sesion');

    const vehiculoId = String(datos.vehiculoId);

    const vehiculoDoc = await getDoc(doc(obtenerDb(), COLECCIONES.vehiculos, vehiculoId));
    if (!vehiculoDoc.exists()) {
      throw new ErrorReserva('El vehículo ya no está disponible.', 'reserva/vehiculo-inexistente');
    }
    const vehiculo = vehiculoDoc.data();

    if (vehiculo.estado !== 'disponible') {
      throw new ErrorReserva('El vehículo no está disponible para alquiler.', 'reserva/no-disponible');
    }

    const disponibilidad = await this.verificarDisponibilidad(
      vehiculoId, datos.fechaInicio, datos.fechaFin
    );
    if (!disponibilidad.disponible) {
      throw new ErrorReserva(disponibilidad.motivo, 'reserva/traslape');
    }

    const tarifa = calcularTarifa(vehiculo.precioPorDia, datos.fechaInicio, datos.fechaFin);

    const reserva = {
      uid,
      codigo: generarCodigo(),
      vehiculoId,
      vehiculo: `${vehiculo.marca} ${vehiculo.modelo}`.trim(),
      placa: vehiculo.placa ?? '',
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      ...tarifa,
      estado: 'pendiente',
      lugarEntrega: String(datos.lugarEntrega || '').trim(),
      observaciones: String(datos.observaciones || '').trim(),
      creadoEn: serverTimestamp(),
    };

    const referencia = await addDoc(coleccion(), reserva);

    await ActividadService.registrar(uid, {
      accion: 'reserva_creada',
      descripcion: `Reserva ${reserva.codigo} de ${reserva.vehiculo} por ${reserva.dias} día(s).`,
      reservaId: referencia.id,
      monto: reserva.total,
    });

    return { id: referencia.id, ...reserva, creadoEn: new Date() };
  },

  /** Cambia el estado respetando la máquina de estados del negocio. */
  async cambiarEstado(uid, id, nuevoEstado, motivo = '') {
    const referencia = doc(obtenerDb(), COLECCIONES.reservas, String(id));
    const instantanea = await getDoc(referencia);

    if (!instantanea.exists()) throw new ErrorReserva('La reserva no existe.', 'reserva/inexistente');

    const actual = mapearReserva(instantanea);
    if (actual.uid !== uid) {
      throw new ErrorReserva('No puedes modificar una reserva de otro usuario.', 'reserva/ajena');
    }
    if (!puedeTransicionar(actual.estado, nuevoEstado)) {
      throw new ErrorReserva(
        `No se puede pasar de ${actual.estado} a ${nuevoEstado}.`,
        'reserva/transicion-invalida'
      );
    }

    await updateDoc(referencia, {
      estado: nuevoEstado,
      observaciones: motivo ? motivo : actual.observaciones,
      actualizadoEn: serverTimestamp(),
    });

    await ActividadService.registrar(uid, {
      accion: `reserva_${nuevoEstado}`,
      descripcion: `Reserva ${actual.codigo}: ${actual.estado} → ${nuevoEstado}.`,
      reservaId: String(id),
    });

    return { ...actual, estado: nuevoEstado };
  },

  cancelarReserva(uid, id, motivo = 'Cancelada por el cliente desde la aplicación.') {
    return this.cambiarEstado(uid, id, 'cancelada', motivo);
  },

  /** Totales para la pantalla de inicio. */
  async resumen(uid) {
    const reservas = await this.obtenerReservas(uid);
    const activas = reservas.filter((r) => ESTADOS_QUE_OCUPAN.includes(r.estado));
    const contratado = reservas
      .filter((r) => r.estado !== 'cancelada')
      .reduce((suma, r) => suma + Number(r.total || 0), 0);

    return {
      total: reservas.length,
      activas: activas.length,
      contratado,
      proxima: [...activas].sort((a, b) => String(a.fechaInicio).localeCompare(String(b.fechaInicio)))[0] || null,
      reservas,
    };
  },
};

export default ReservaService;
