/**
 * Catálogos y constantes de negocio.
 *
 * Están fuera de la capa de datos a propósito: los usan tanto el servidor
 * como el navegador, y no deben arrastrar la conexión a MySQL al cliente.
 */

export const ESTADOS_VEHICULO = ['disponible', 'mantenimiento', 'no_disponible'];
export const ESTADOS_RESERVA = ['pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada'];
export const ESTADOS_CONTRATO = ['vigente', 'finalizado', 'anulado'];
export const ROLES = ['administrador', 'operador', 'cliente'];

/** IVA vigente en El Salvador. */
export const IMPUESTO = 0.13;

/** Porcentaje del total que se cobra como depósito en garantía. */
export const PORCENTAJE_DEPOSITO = 0.2;

/** Estados de reserva que ocupan el vehículo en el calendario. */
export const ESTADOS_QUE_OCUPAN = ['pendiente', 'confirmada', 'en_curso'];

/** Estados de reserva que se consideran facturables en los reportes. */
export const ESTADOS_FACTURABLES = ['confirmada', 'en_curso', 'finalizada'];

export const CONDICIONES_ESTANDAR = [
  'El arrendatario declara poseer licencia de conducir vigente.',
  'El vehículo se entrega con tanque lleno y debe devolverse en las mismas condiciones.',
  'El kilometraje es libre dentro del territorio nacional.',
  'Cualquier daño no cubierto por el seguro será responsabilidad del arrendatario.',
  'La devolución tardía genera un recargo equivalente a un día de renta.',
].join('\n');
