'use client';

export default function Cargando({ mensaje = 'Cargando…' }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-500">{mensaje}</p>
    </div>
  );
}

/** Filas "esqueleto" para tablas mientras llegan los datos. */
export function FilasEsqueleto({ filas = 5, columnas = 6 }) {
  return (
    <>
      {Array.from({ length: filas }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: columnas }).map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-3 rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
