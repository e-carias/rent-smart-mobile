'use client';

/** Bloque de error reutilizable, con opción de reintentar. */
export function MensajeError({ mensaje, onReintentar }) {
  if (!mensaje) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <span aria-hidden="true">⚠️</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{mensaje}</p>
        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

export function MensajeExito({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <span aria-hidden="true">✅</span>
      <p className="text-sm font-medium text-emerald-800">{mensaje}</p>
    </div>
  );
}

/** Estado vacío para listas sin resultados. */
export function SinResultados({ titulo = 'Sin resultados', descripcion, accion }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <p className="text-3xl" aria-hidden="true">
        🗂️
      </p>
      <h3 className="mt-3 text-base font-semibold text-slate-800">{titulo}</h3>
      {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

/** Error de validación debajo de un campo del formulario. */
export function ErrorCampo({ mensaje }) {
  if (!mensaje) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{mensaje}</p>;
}
