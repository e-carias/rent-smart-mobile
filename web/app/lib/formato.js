/** Formateo compartido por todas las pantallas. */

const formateadorMoneda = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export function moneda(valor) {
  const numero = Number(valor);
  return formateadorMoneda.format(Number.isFinite(numero) ? numero : 0);
}

export function numero(valor) {
  return new Intl.NumberFormat('es-SV').format(Number(valor) || 0);
}

export function fechaLarga(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fechaCorta(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function hoyIso(desplazamientoDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + desplazamientoDias);
  return d.toISOString().slice(0, 10);
}

export const ETIQUETAS_ESTADO_VEHICULO = {
  disponible: 'Disponible',
  mantenimiento: 'En mantenimiento',
  no_disponible: 'No disponible',
};

export const ETIQUETAS_ESTADO_RESERVA = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export const ETIQUETAS_ESTADO_CONTRATO = {
  vigente: 'Vigente',
  finalizado: 'Finalizado',
  anulado: 'Anulado',
};

export const CATEGORIAS = ['Compacto', 'Sedán', 'SUV', 'Pick-up', 'Microbús', 'Lujo'];
export const TRANSMISIONES = ['Automática', 'Manual'];
export const COMBUSTIBLES = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'];
