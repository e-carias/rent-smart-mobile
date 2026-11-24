/** Formateo de valores para mostrar en pantalla. Sin dependencias externas. */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** 1234.5 -> "$1,234.50" */
export function dinero(valor) {
  const n = Number(valor || 0);
  const partes = n.toFixed(2).split('.');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${partes.join('.')}`;
}

/** "2026-10-18" -> "18 de octubre de 2026" */
export function fechaLarga(iso) {
  if (!iso) return '';
  const [a, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!a || !m || !d) return String(iso);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** "2026-10-18" -> "18/10/2026" */
export function fechaCorta(iso) {
  if (!iso) return '';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  if (!a || !m || !d) return String(iso);
  return `${d}/${m}/${a}`;
}

/** Fecha de hoy en formato ISO corto. */
export function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Suma días a una fecha ISO y devuelve otra fecha ISO. */
export function sumarDias(iso, dias) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Días entre dos fechas ISO. Mínimo 1. */
export function diasEntre(inicio, fin) {
  const a = new Date(`${inicio}T00:00:00`);
  const b = new Date(`${fin}T00:00:00`);
  const dias = Math.round((b - a) / 86400000);
  return dias > 0 ? dias : 1;
}

/** "no_disponible" -> "No disponible" */
export function textoEstado(estado) {
  const mapa = {
    disponible: 'Disponible',
    mantenimiento: 'En mantenimiento',
    no_disponible: 'No disponible',
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    en_curso: 'En curso',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada',
    vigente: 'Vigente',
    finalizado: 'Finalizado',
    anulado: 'Anulado',
  };
  return mapa[estado] || estado;
}

/** Iniciales para el avatar del perfil. */
export function iniciales(nombre) {
  if (!nombre) return '?';
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
