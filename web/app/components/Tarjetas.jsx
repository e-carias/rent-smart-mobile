'use client';

/** Tarjeta de indicador (KPI) para los dashboards. */
export function TarjetaKpi({ titulo, valor, detalle, icono, color = 'azul' }) {
  const fondos = {
    azul: 'bg-blue-50 text-blue-700',
    verde: 'bg-emerald-50 text-emerald-700',
    ambar: 'bg-amber-50 text-amber-700',
    violeta: 'bg-violet-50 text-violet-700',
    rojo: 'bg-red-50 text-red-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{valor}</p>
          {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
        </div>
        {icono && (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg ${fondos[color]}`}>
            {icono}
          </span>
        )}
      </div>
    </div>
  );
}

/** Contenedor de sección con título. */
export function Panel({ titulo, descripcion, acciones, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(titulo || acciones) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            {titulo && <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>}
            {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
          </div>
          {acciones}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Barra horizontal simple para comparar valores sin librerías de gráficos. */
export function BarraComparativa({ etiqueta, valor, maximo, textoValor, color = 'bg-blue-500' }) {
  const porcentaje = maximo > 0 ? Math.min(100, (valor / maximo) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-medium text-slate-700">{etiqueta}</span>
        <span className="shrink-0 tabular-nums text-slate-500">{textoValor}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}
