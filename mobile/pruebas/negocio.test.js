/**
 * Pruebas de las reglas de negocio: tarifa y traslape de fechas.
 *
 * Son las dos reglas que el sistema automatiza y que antes dependían del
 * criterio del operador, así que conviene fijarlas con casos explícitos.
 */

import {
  calcularTarifa,
  hayTraslape,
  IMPUESTO,
  PORCENTAJE_DEPOSITO,
  ESTADOS_QUE_OCUPAN,
} from '../src/lib/negocio';

describe('calcularTarifa · tramos de descuento por volumen', () => {
  test('sin descuento por debajo de tres días', () => {
    const t = calcularTarifa(38, '2026-11-10', '2026-11-12'); // 2 días
    expect(t.dias).toBe(2);
    expect(t.porcentajeDescuento).toBe(0);
    expect(t.bruto).toBe(76);
    expect(t.descuento).toBe(0);
  });

  test('5 % desde tres días', () => {
    const t = calcularTarifa(38, '2026-11-10', '2026-11-13'); // 3 días
    expect(t.porcentajeDescuento).toBe(0.05);
    expect(t.descuento).toBe(5.7);
  });

  test('10 % desde siete días', () => {
    const t = calcularTarifa(38, '2026-11-10', '2026-11-17'); // 7 días
    expect(t.porcentajeDescuento).toBe(0.1);
    expect(t.bruto).toBe(266);
    expect(t.descuento).toBe(26.6);
    expect(t.subtotal).toBe(239.4);
    expect(t.impuesto).toBe(31.12);
    expect(t.total).toBe(270.52);
    expect(t.deposito).toBe(54.1);
  });

  test('20 % desde treinta días', () => {
    const t = calcularTarifa(38, '2026-11-01', '2026-12-01'); // 30 días
    expect(t.dias).toBe(30);
    expect(t.porcentajeDescuento).toBe(0.2);
  });

  test('el IVA se aplica sobre el subtotal, no sobre el bruto', () => {
    const t = calcularTarifa(100, '2026-11-10', '2026-11-17'); // 7 días, 10 %
    expect(t.subtotal).toBe(630);
    expect(t.impuesto).toBe(Math.round(630 * IMPUESTO * 100) / 100);
    expect(t.impuesto).not.toBe(Math.round(700 * IMPUESTO * 100) / 100);
  });

  test('el depósito es el 20 % del total', () => {
    const t = calcularTarifa(50, '2026-11-10', '2026-11-12');
    expect(t.deposito).toBeCloseTo(t.total * PORCENTAJE_DEPOSITO, 2);
  });

  test('todos los importes salen con dos decimales como máximo', () => {
    const t = calcularTarifa(33.33, '2026-11-10', '2026-11-19');
    for (const campo of ['bruto', 'descuento', 'subtotal', 'impuesto', 'total', 'deposito']) {
      const decimales = String(t[campo]).split('.')[1]?.length ?? 0;
      expect(decimales).toBeLessThanOrEqual(2);
    }
  });

  test('un precio ausente no rompe el cálculo', () => {
    const t = calcularTarifa(undefined, '2026-11-10', '2026-11-12');
    expect(t.total).toBe(0);
  });
});

describe('hayTraslape · intervalos semiabiertos [inicio, fin)', () => {
  // Reserva existente del 10 al 15 de noviembre.
  const INICIO = '2026-11-10';
  const FIN = '2026-11-15';

  test.each([
    ['la nueva empieza dentro', '2026-11-12', '2026-11-20', true],
    ['la nueva termina dentro', '2026-11-05', '2026-11-12', true],
    ['la nueva está contenida', '2026-11-11', '2026-11-13', true],
    ['la nueva la contiene', '2026-11-05', '2026-11-20', true],
    ['la nueva termina el día en que empieza la otra', '2026-11-05', '2026-11-10', false],
    ['la nueva empieza el día en que termina la otra', '2026-11-15', '2026-11-20', false],
    ['la nueva es muy anterior', '2026-10-01', '2026-10-05', false],
    ['la nueva es muy posterior', '2026-12-01', '2026-12-05', false],
  ])('%s', (_caso, i2, f2, esperado) => {
    expect(hayTraslape(i2, f2, INICIO, FIN)).toBe(esperado);
  });

  test('la relación es simétrica', () => {
    expect(hayTraslape('2026-11-12', '2026-11-20', INICIO, FIN))
      .toBe(hayTraslape(INICIO, FIN, '2026-11-12', '2026-11-20'));
  });
});

describe('estados que ocupan el vehículo', () => {
  test('pendiente, confirmada y en curso bloquean fechas', () => {
    expect(ESTADOS_QUE_OCUPAN).toEqual(['pendiente', 'confirmada', 'en_curso']);
  });

  test('finalizada y cancelada no bloquean fechas', () => {
    expect(ESTADOS_QUE_OCUPAN).not.toContain('finalizada');
    expect(ESTADOS_QUE_OCUPAN).not.toContain('cancelada');
  });
});
