/**
 * Lógica de negocio central: disponibilidad, tarifas y flujo de estados.
 *
 * Desde la migración a Firestore, estas funciones son puras: no consultan la
 * base de datos. Eso permite que la versión web y la móvil compartan
 * exactamente las mismas reglas, y que puedan probarse sin red.
 *
 * El acceso a los datos vive en los servicios (app/services), y la
 * autorización, en las reglas de seguridad publicadas en Firebase.
 */

import { IMPUESTO, PORCENTAJE_DEPOSITO } from '@/app/lib/constantes';
import { diasEntre, redondear } from '@/app/lib/utilidades';

/** Transiciones permitidas del flujo de la reserva. */
export const TRANSICIONES = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['en_curso', 'cancelada'],
  en_curso: ['finalizada'],
  finalizada: [],
  cancelada: [],
};

export function puedeTransicionar(estadoActual, estadoNuevo) {
  return (TRANSICIONES[estadoActual] || []).includes(estadoNuevo);
}

/**
 * Verifica la disponibilidad de un vehículo en un rango de fechas.
 *
 * El traslape lo resuelve la base de datos (ver `buscarTraslape`):
 * dos rangos chocan si cada uno empieza antes de que el otro termine.
 *
 * @returns {{ disponible: boolean, motivo?: string, conflicto?: object }}
 */
/**
 * Dos intervalos semiabiertos [i, f) se traslapan cuando i1 < f2 e i2 < f1.
 * La notación [i, f) indica que la fecha de devolución es exclusiva: la
 * unidad queda libre ese mismo día, de modo que una devolución y una nueva
 * entrega pueden coincidir en la fecha sin generar conflicto.
 *
 * Es una función pura: la consulta de las reservas que ocupan un vehículo
 * vive ahora en reservaService, contra Firestore.
 */
export function hayTraslape(inicio1, fin1, inicio2, fin2) {
  return inicio1 < fin2 && inicio2 < fin1;
}

export function calcularTarifa(precioPorDia, fechaInicio, fechaFin) {
  const dias = diasEntre(fechaInicio, fechaFin);
  const tarifaDiaria = Number(precioPorDia);

  let porcentajeDescuento = 0;
  if (dias >= 30) porcentajeDescuento = 0.2;
  else if (dias >= 7) porcentajeDescuento = 0.1;
  else if (dias >= 3) porcentajeDescuento = 0.05;

  const bruto = redondear(dias * tarifaDiaria);
  const descuento = redondear(bruto * porcentajeDescuento);
  const subtotal = redondear(bruto - descuento);
  const impuesto = redondear(subtotal * IMPUESTO);
  const total = redondear(subtotal + impuesto);

  return {
    dias,
    tarifaDiaria,
    bruto,
    porcentajeDescuento,
    descuento,
    subtotal,
    impuesto,
    total,
    deposito: redondear(total * PORCENTAJE_DEPOSITO),
  };
}

/**
 * Vehículos libres en un rango de fechas (Pantalla 6).
 * Filtra primero en SQL y luego descarta los que tengan traslape.
 */
