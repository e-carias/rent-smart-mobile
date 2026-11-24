import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="text-center">
        <p className="text-5xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Página no encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          La dirección que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
