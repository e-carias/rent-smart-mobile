/** Utilidades de fechas y montos compartidas por el servidor y el cliente. */

/** Días completos entre dos fechas 'YYYY-MM-DD'. Mínimo un día de renta. */
export function diasEntre(fechaInicio, fechaFin) {
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFin}T00:00:00`);
  const dias = Math.ceil((fin.getTime() - inicio.getTime()) / 86400000);
  return dias <= 0 ? 1 : dias;
}

/** Redondea a dos decimales evitando los errores del punto flotante. */
export function redondear(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

/** Fecha de hoy en formato 'YYYY-MM-DD'. */
export function hoy() {
  return new Date().toISOString().slice(0, 10);
}

/** Genera códigos legibles: codigo('RS', 23) -> 'RS-00023'. */
export function codigo(prefijo, id) {
  return `${prefijo}-${String(id).padStart(5, '0')}`;
}
