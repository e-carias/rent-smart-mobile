/**
 * Sistema de diseño de RENT SMART.
 *
 * Los valores de esta tabla son los mismos tokens definidos en los mockups
 * de Figma de la Etapa 1 y aplicados en la versión web con Tailwind. Tenerlos
 * en un solo archivo es lo que permite afirmar que la app móvil y la web
 * comparten identidad visual: ninguna pantalla escribe un color literal.
 */

export const colores = {
  // Primario — azul de la marca (Tailwind blue-700 / blue-600)
  primario: '#1D4ED8',
  primarioClaro: '#3B82F6',
  primarioSuave: '#EFF6FF',
  primarioBorde: '#BFDBFE',

  // Superficies
  fondo: '#F8FAFC',
  superficie: '#FFFFFF',
  borde: '#E2E8F0',

  // Texto
  texto: '#0F172A',
  textoSuave: '#475569',
  textoTenue: '#94A3B8',

  // Estados
  exito: '#15803D',
  exitoSuave: '#F0FDF4',
  advertencia: '#B45309',
  advertenciaSuave: '#FFFBEB',
  error: '#B91C1C',
  errorSuave: '#FEF2F2',
  neutro: '#475569',
  neutroSuave: '#F1F5F9',
};

/** Escala de espaciado de 4 puntos. */
export const espacio = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radio = {
  sm: 8,
  md: 12,
  lg: 16,
  completo: 999,
};

export const tipografia = {
  titulo: { fontSize: 24, fontWeight: '700', color: colores.texto },
  subtitulo: { fontSize: 18, fontWeight: '600', color: colores.texto },
  cuerpo: { fontSize: 15, color: colores.texto },
  secundario: { fontSize: 13, color: colores.textoSuave },
  etiqueta: { fontSize: 12, fontWeight: '600', color: colores.textoSuave },
};

/** Sombra equivalente en Android y en iOS. */
export const sombra = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/** Color de cada estado de reserva, igual que en la versión web. */
export const colorEstadoReserva = {
  pendiente: { fondo: colores.advertenciaSuave, texto: colores.advertencia },
  confirmada: { fondo: colores.primarioSuave, texto: colores.primario },
  en_curso: { fondo: colores.exitoSuave, texto: colores.exito },
  finalizada: { fondo: colores.neutroSuave, texto: colores.neutro },
  cancelada: { fondo: colores.errorSuave, texto: colores.error },
};

export const colorEstadoVehiculo = {
  disponible: { fondo: colores.exitoSuave, texto: colores.exito },
  mantenimiento: { fondo: colores.advertenciaSuave, texto: colores.advertencia },
  no_disponible: { fondo: colores.errorSuave, texto: colores.error },
};

export default { colores, espacio, radio, tipografia, sombra };
