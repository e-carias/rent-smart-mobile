'use client';

/** Manejo global de errores de renderizado (Paso 5). */

export default function ErrorGlobal({ error, reset }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-4xl" aria-hidden="true">
          ⚠️
        </p>
        <h1 className="mt-4 text-lg font-semibold text-red-900">Algo salió mal</h1>
        <p className="mt-2 text-sm text-red-800">
          {error?.message || 'Ocurrió un error inesperado al mostrar esta pantalla.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
