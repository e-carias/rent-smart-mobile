/**
 * Reglas de negocio que la app necesita calcular en el teléfono.
 *
 * El cálculo autoritativo vive en el servidor (`app/lib/negocio.js`); aquí se
 * repite únicamente para mostrar la cotización EN VIVO mientras el usuario
 * mueve las fechas, sin ir y volver al servidor en cada pulsación, y para que
 * la pantalla de reserva siga siendo utilizable sin conexión. El total que se
 * guarda es siempre el que devuelve el API.
 */

import { diasEntre } from './formato';

/** IVA vigente en El Salvador. */
export const IMPUESTO = 0.13;

/** Porcentaje del total que se cobra como depósito en garantía. */
export const PORCENTAJE_DEPOSITO = 0.2;

/** Estados de reserva que ocupan el vehículo en el calendario. */
export const ESTADOS_QUE_OCUPAN = ['pendiente', 'confirmada', 'en_curso'];

function redondear(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * Tarifa por volumen: 5 % desde 3 días, 10 % desde 7, 20 % desde 30.
 * Son los mismos umbrales del servidor.
 */
export function calcularTarifa(precioPorDia, fechaInicio, fechaFin) {
  const dias = diasEntre(fechaInicio, fechaFin);
  const tarifaDiaria = Number(precioPorDia) || 0;

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
 * Dos rangos se traslapan si inicio1 < fin2 y inicio2 < fin1.
 * Se usa para avisar al usuario antes de enviar la reserva.
 */
export function hayTraslape(inicio1, fin1, inicio2, fin2) {
  return inicio1 < fin2 && inicio2 < fin1;
}
