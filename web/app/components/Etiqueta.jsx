'use client';

import {
  ETIQUETAS_ESTADO_VEHICULO,
  ETIQUETAS_ESTADO_RESERVA,
  ETIQUETAS_ESTADO_CONTRATO,
} from '@/app/lib/formato';

const COLORES = {
  verde: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  ambar: 'bg-amber-100 text-amber-800 ring-amber-200',
  rojo: 'bg-red-100 text-red-800 ring-red-200',
  azul: 'bg-blue-100 text-blue-800 ring-blue-200',
  gris: 'bg-slate-100 text-slate-700 ring-slate-200',
  violeta: 'bg-violet-100 text-violet-800 ring-violet-200',
};

function Pastilla({ color = 'gris', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES[color]}`}
    >
      {children}
    </span>
  );
}

const COLOR_VEHICULO = {
  disponible: 'verde',
  mantenimiento: 'ambar',
  no_disponible: 'rojo',
};

const COLOR_RESERVA = {
  pendiente: 'ambar',
  confirmada: 'azul',
  en_curso: 'violeta',
  finalizada: 'verde',
  cancelada: 'rojo',
};

const COLOR_CONTRATO = {
  vigente: 'azul',
  finalizado: 'verde',
  anulado: 'rojo',
};

export function EstadoVehiculo({ estado }) {
  return (
    <Pastilla color={COLOR_VEHICULO[estado] || 'gris'}>
      {ETIQUETAS_ESTADO_VEHICULO[estado] || estado}
    </Pastilla>
  );
}

export function EstadoReserva({ estado }) {
  return (
    <Pastilla color={COLOR_RESERVA[estado] || 'gris'}>
      {ETIQUETAS_ESTADO_RESERVA[estado] || estado}
    </Pastilla>
  );
}

export function EstadoContrato({ estado }) {
  return (
    <Pastilla color={COLOR_CONTRATO[estado] || 'gris'}>
      {ETIQUETAS_ESTADO_CONTRATO[estado] || estado}
    </Pastilla>
  );
}

export default Pastilla;
