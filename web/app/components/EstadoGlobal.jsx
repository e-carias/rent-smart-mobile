'use client';

/**
 * Manejo GLOBAL de estados de carga y error.
 *
 * Se suscribe a los eventos de la capa de servicios: cualquier operación
 * contra Firestore, venga de la pantalla que venga, enciende la barra de
 * progreso superior, y cualquier error no silenciado aparece como
 * notificación, sin duplicar código en las páginas.
 */

import { useEffect, useState } from 'react';
import { alCambiarCarga, alOcurrirError } from '@/app/services/progreso';

export default function EstadoGlobal() {
  const [cargando, setCargando] = useState(false);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const quitarCarga = alCambiarCarga(setCargando);
    const quitarError = alOcurrirError((err) => {
      const id = Date.now() + Math.random();
      setAvisos((previos) => [...previos, { id, mensaje: err.message }]);
      setTimeout(() => {
        setAvisos((previos) => previos.filter((a) => a.id !== id));
      }, 6000);
    });
    return () => {
      quitarCarga();
      quitarError();
    };
  }, []);

  return (
    <>
      {/* Barra de progreso global */}
      <div
        className={`fixed inset-x-0 top-0 z-[60] h-0.5 transition-opacity duration-200 ${
          cargando ? 'opacity-100' : 'opacity-0'
        }`}
        role="status"
        aria-live="polite"
        aria-label={cargando ? 'Cargando datos' : ''}
      >
        <div className="h-full w-1/3 animate-[barra_1.1s_ease-in-out_infinite] bg-blue-600" />
      </div>

      {/* Notificaciones de error */}
      <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-4 shadow-lg"
          >
            <span aria-hidden="true">⚠️</span>
            <p className="flex-1 text-sm text-slate-700">{aviso.mensaje}</p>
            <button
              type="button"
              onClick={() => setAvisos((p) => p.filter((a) => a.id !== aviso.id))}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
