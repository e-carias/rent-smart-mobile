/**
 * Pruebas de creación y cancelación de reservas.
 *
 * Firestore se sustituye por dobles de prueba. Lo que se verifica es la
 * lógica propia: que no se acepte un traslape, que el importe guardado sea el
 * calculado, que no se pueda cancelar la reserva de otro usuario y que la
 * máquina de estados no admita saltos.
 */

// jest.mock() se eleva por encima de todo el archivo, así que su fábrica solo
// puede referirse a variables cuyo nombre empiece por "mock". De ahí el prefijo.
var mockDatos = { reservas: [], vehiculos: {} };

function mockInstantanea(id, datos) {
  return { id, exists: () => datos != null, data: () => datos };
}

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db, nombre) => ({ nombre })),
  doc: jest.fn((_db, coleccion, id) => ({ coleccion, id })),
  addDoc: jest.fn(async (_col, datos) => {
    const id = `r${mockDatos.reservas.length + 1}`;
    mockDatos.reservas.push({ id, ...datos });
    return { id };
  }),
  getDoc: jest.fn(async (referencia) => {
    if (referencia.coleccion === 'vehiculos') {
      return mockInstantanea(referencia.id, mockDatos.vehiculos[referencia.id]);
    }
    const r = mockDatos.reservas.find((x) => x.id === referencia.id);
    return mockInstantanea(referencia.id, r ? { ...r } : null);
  }),
  // El doble aplica de verdad las cláusulas where: si no lo hiciera, una
  // consulta filtrada devolvería todo y las pruebas de disponibilidad
  // pasarían por el motivo equivocado.
  getDocs: jest.fn(async (consulta) => {
    const restricciones = (consulta?.restricciones || []).filter((r) => r && r.operador);

    const filtradas = mockDatos.reservas.filter((documento) =>
      restricciones.every(({ campo, operador, valor }) => {
        if (operador === '==') return documento[campo] === valor;
        if (operador === 'in') return valor.includes(documento[campo]);
        return true;
      })
    );

    return {
      docs: filtradas.map((r) => mockInstantanea(r.id, { ...r })),
      size: filtradas.length,
    };
  }),
  updateDoc: jest.fn(async (referencia, cambios) => {
    const r = mockDatos.reservas.find((x) => x.id === referencia.id);
    Object.assign(r, cambios);
  }),
  query: jest.fn((coleccion, ...restricciones) => ({ coleccion, restricciones })),
  where: jest.fn((campo, operador, valor) => ({ campo, operador, valor })),
  orderBy: jest.fn((campo, direccion) => ({ campo, direccion })),
  limit: jest.fn((n) => ({ limite: n })),
  serverTimestamp: jest.fn(() => ({ marca: 'servidor' })),
}));

jest.mock('../src/firebase/configuracion', () => ({
  obtenerDb: jest.fn(() => ({ nombre: 'db-de-prueba' })),
  obtenerAuth: jest.fn(),
  COLECCIONES: { usuarios: 'usuarios', vehiculos: 'vehiculos', reservas: 'reservas', actividad: 'actividad' },
  firebaseConfigurado: jest.fn(() => true),
}));

jest.mock('../src/servicios/actividadService', () => ({
  __esModule: true,
  default: { registrar: jest.fn(async () => 'a1'), obtenerHistorial: jest.fn(async () => []) },
}));

import ReservaService, {
  ErrorReserva, puedeTransicionar, generarCodigo, TRANSICIONES,
} from '../src/servicios/reservaService';
import ActividadService from '../src/servicios/actividadService';

const UID = 'uid-erick';
const OTRO_UID = 'uid-ajeno';

beforeEach(() => {
  mockDatos.reservas = [];
  mockDatos.vehiculos = {
    v1: { marca: 'Toyota', modelo: 'Corolla', placa: 'P123456', precioPorDia: 38, estado: 'disponible' },
    v5: { marca: 'Hyundai', modelo: 'Accent', placa: 'P567890', precioPorDia: 28, estado: 'mantenimiento' },
  };
  jest.clearAllMocks();
});

const DATOS = {
  vehiculoId: 'v1',
  fechaInicio: '2026-11-10',
  fechaFin: '2026-11-17',
  lugarEntrega: 'Sucursal San Salvador',
};

describe('crearReserva', () => {
  test('guarda la reserva con el uid del usuario autenticado', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    expect(reserva.uid).toBe(UID);
    expect(mockDatos.reservas).toHaveLength(1);
    expect(mockDatos.reservas[0].uid).toBe(UID);
  });

  test('copia el nombre y la placa del vehículo en la reserva', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    // Sin esta copia, el detalle mostraba "undefined undefined".
    expect(reserva.vehiculo).toBe('Toyota Corolla');
    expect(reserva.placa).toBe('P123456');
  });

  test('calcula el importe con las reglas del negocio (7 días a $38)', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    expect(reserva.dias).toBe(7);
    expect(reserva.porcentajeDescuento).toBe(0.1);
    expect(reserva.subtotal).toBe(239.4);
    expect(reserva.impuesto).toBe(31.12);
    expect(reserva.total).toBe(270.52);
  });

  test('la reserva nace en estado pendiente', async () => {
    expect((await ReservaService.crearReserva(UID, DATOS)).estado).toBe('pendiente');
  });

  test('asigna un código legible con prefijo RS-', async () => {
    expect((await ReservaService.crearReserva(UID, DATOS)).codigo).toMatch(/^RS-\d{6}$/);
  });

  test('deja constancia en la bitácora de actividad', async () => {
    await ReservaService.crearReserva(UID, DATOS);
    expect(ActividadService.registrar).toHaveBeenCalledWith(
      UID, expect.objectContaining({ accion: 'reserva_creada' })
    );
  });

  test('rechaza la reserva sin sesión iniciada', async () => {
    await expect(ReservaService.crearReserva(null, DATOS)).rejects.toThrow(ErrorReserva);
    await expect(ReservaService.crearReserva(null, DATOS)).rejects.toThrow(/iniciar sesión/i);
  });

  test('rechaza un vehículo que no existe', async () => {
    await expect(ReservaService.crearReserva(UID, { ...DATOS, vehiculoId: 'v99' }))
      .rejects.toThrow(/ya no está disponible/i);
  });

  test('rechaza un vehículo en mantenimiento', async () => {
    await expect(ReservaService.crearReserva(UID, { ...DATOS, vehiculoId: 'v5' }))
      .rejects.toThrow(/no está disponible para alquiler/i);
  });

  test('rechaza fechas que se traslapan con una reserva activa', async () => {
    await ReservaService.crearReserva(UID, DATOS); // 10 al 17

    await expect(
      ReservaService.crearReserva(UID, { ...DATOS, fechaInicio: '2026-11-12', fechaFin: '2026-11-20' })
    ).rejects.toThrow(/ya está reservado/i);

    expect(mockDatos.reservas).toHaveLength(1); // no se guardó la segunda
  });

  test('acepta una reserva que empieza el día en que termina la anterior', async () => {
    await ReservaService.crearReserva(UID, DATOS); // 10 al 17

    const segunda = await ReservaService.crearReserva(UID, {
      ...DATOS, fechaInicio: '2026-11-17', fechaFin: '2026-11-20',
    });

    expect(segunda.estado).toBe('pendiente');
    expect(mockDatos.reservas).toHaveLength(2);
  });

  test('una reserva cancelada deja libres sus fechas', async () => {
    const primera = await ReservaService.crearReserva(UID, DATOS);
    await ReservaService.cancelarReserva(UID, primera.id);

    const segunda = await ReservaService.crearReserva(UID, DATOS);
    expect(segunda.id).not.toBe(primera.id);
    expect(mockDatos.reservas).toHaveLength(2);
  });
});

describe('cancelarReserva', () => {
  test('cambia el estado a cancelada', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    const resultado = await ReservaService.cancelarReserva(UID, reserva.id);

    expect(resultado.estado).toBe('cancelada');
    expect(mockDatos.reservas[0].estado).toBe('cancelada');
  });

  test('registra la cancelación en la bitácora', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    await ReservaService.cancelarReserva(UID, reserva.id);

    expect(ActividadService.registrar).toHaveBeenCalledWith(
      UID, expect.objectContaining({ accion: 'reserva_cancelada' })
    );
  });

  test('no permite cancelar la reserva de otro usuario', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);

    await expect(ReservaService.cancelarReserva(OTRO_UID, reserva.id))
      .rejects.toThrow(/otro usuario/i);
    expect(mockDatos.reservas[0].estado).toBe('pendiente');
  });

  test('no permite cancelar dos veces', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    await ReservaService.cancelarReserva(UID, reserva.id);

    await expect(ReservaService.cancelarReserva(UID, reserva.id))
      .rejects.toThrow(/No se puede pasar de cancelada a cancelada/);
  });

  test('informa cuando la reserva no existe', async () => {
    await expect(ReservaService.cancelarReserva(UID, 'r404')).rejects.toThrow(/no existe/i);
  });
});

describe('máquina de estados', () => {
  test.each([
    ['pendiente', 'confirmada', true],
    ['pendiente', 'cancelada', true],
    ['pendiente', 'finalizada', false],
    ['confirmada', 'en_curso', true],
    ['confirmada', 'finalizada', false],
    ['en_curso', 'finalizada', true],
    ['en_curso', 'cancelada', false],
    ['finalizada', 'cancelada', false],
    ['cancelada', 'pendiente', false],
  ])('de %s a %s → %s', (desde, hacia, esperado) => {
    expect(puedeTransicionar(desde, hacia)).toBe(esperado);
  });

  test('los estados terminales no admiten ninguna transición', () => {
    expect(TRANSICIONES.finalizada).toEqual([]);
    expect(TRANSICIONES.cancelada).toEqual([]);
  });

  test('no se puede pasar de pendiente a en curso saltando la confirmación', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    await expect(ReservaService.cambiarEstado(UID, reserva.id, 'en_curso'))
      .rejects.toThrow(/No se puede pasar de pendiente a en_curso/);
  });

  test('el ciclo completo pendiente → confirmada → en curso → finalizada', async () => {
    const reserva = await ReservaService.crearReserva(UID, DATOS);
    await ReservaService.cambiarEstado(UID, reserva.id, 'confirmada');
    await ReservaService.cambiarEstado(UID, reserva.id, 'en_curso');
    const final = await ReservaService.cambiarEstado(UID, reserva.id, 'finalizada');
    expect(final.estado).toBe('finalizada');
  });
});

describe('generarCodigo', () => {
  test('respeta el formato RS- más seis dígitos', () => {
    expect(generarCodigo()).toMatch(/^RS-\d{6}$/);
  });
});

describe('resumen', () => {
  test('cuenta las activas y suma lo contratado sin las canceladas', async () => {
    const primera = await ReservaService.crearReserva(UID, DATOS);
    await ReservaService.crearReserva(UID, {
      ...DATOS, fechaInicio: '2026-12-01', fechaFin: '2026-12-04',
    });
    await ReservaService.cancelarReserva(UID, primera.id);

    const resumen = await ReservaService.resumen(UID);
    expect(resumen.total).toBe(2);
    expect(resumen.activas).toBe(1);
    expect(resumen.contratado).toBeGreaterThan(0);
  });
});
