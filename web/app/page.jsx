'use client';

/** Portada pública: presenta el sistema y encamina a cada rol. */

import Link from 'next/link';
import { useAuth, rutaInicioPorRol } from '@/app/context/AuthContext';

const CARACTERISTICAS = [
  {
    icono: '🚗',
    titulo: 'Flota siempre al día',
    texto: 'Alta, edición y baja de vehículos con control de disponibilidad y mantenimiento.',
  },
  {
    icono: '📅',
    titulo: 'Reservas sin choques',
    texto: 'El sistema verifica la disponibilidad real y evita que dos clientes reserven la misma unidad.',
  },
  {
    icono: '📄',
    titulo: 'Contratos automáticos',
    texto: 'Al confirmar una reserva se genera el contrato y queda almacenado de forma digital.',
  },
  {
    icono: '📈',
    titulo: 'Reportes de operación',
    texto: 'Ingresos por mes, vehículos más solicitados y ocupación de la flota en un solo lugar.',
  },
];

export default function Inicio() {
  const { autenticado, rol, usuario } = useAuth();

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Plataforma inteligente de alquiler
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            RENT <span className="text-blue-600">SMART</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Gestiona tu flota, tus reservas y tus contratos desde un solo sistema. Para el equipo de
            operaciones y para tus clientes.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {autenticado ? (
              <>
                <Link
                  href={rutaInicioPorRol(rol)}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Ir a mi panel
                </Link>
                <span className="text-sm text-slate-500">
                  Sesión activa: {usuario.nombre} ({rol})
                </span>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Registrarme como cliente
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARACTERISTICAS.map((c) => (
            <article key={c.titulo} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-2xl" aria-hidden="true">
                {c.icono}
              </span>
              <h2 className="mt-3 text-base font-semibold text-slate-900">{c.titulo}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.texto}</p>
            </article>
          ))}
        </div>

        {!autenticado && (
          <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-sm font-semibold text-blue-900">Cuentas de demostración</h2>
            <ul className="mt-3 grid gap-2 text-sm text-blue-900 sm:grid-cols-3">
              <li className="rounded-lg bg-white/70 px-4 py-3">
                <strong className="block">Administrador</strong>
                admin@rentsmart.com / Admin123
              </li>
              <li className="rounded-lg bg-white/70 px-4 py-3">
                <strong className="block">Operador</strong>
                operador@rentsmart.com / Operador123
              </li>
              <li className="rounded-lg bg-white/70 px-4 py-3">
                <strong className="block">Cliente</strong>
                cliente@rentsmart.com / Cliente123
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
