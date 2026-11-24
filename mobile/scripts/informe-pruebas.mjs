/**
 * Genera PRUEBAS.md con el RESULTADO OBSERVADO de cada caso.
 *
 *   npm run test:informe
 *
 * El docente pidió registrar lo observado y no solo lo esperado. Este script
 * ejecuta la suite, lee la salida real de Jest y la vuelca a un informe con
 * fecha, entorno y duración. Si un caso falla, el informe lo recoge con su
 * mensaje: el documento refleja lo que ocurrió, no lo que se pretendía.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RAIZ = process.cwd();
const SALIDA_JSON = path.join(os.tmpdir(), 'rent-smart-jest.json');

console.log('Ejecutando la suite de pruebas…');

let codigoSalida = 0;
try {
  execFileSync(
    'npx',
    ['jest', '--ci', '--runInBand', '--json', `--outputFile=${SALIDA_JSON}`],
    { cwd: RAIZ, stdio: ['ignore', 'inherit', 'inherit'] }
  );
} catch {
  // Jest devuelve código distinto de cero cuando algún caso falla; el informe
  // debe generarse igual, porque un fallo también es un resultado observado.
  codigoSalida = 1;
}

if (!fs.existsSync(SALIDA_JSON)) {
  console.error('Jest no produjo salida. ¿Se instalaron las dependencias?');
  process.exit(1);
}

const informe = JSON.parse(fs.readFileSync(SALIDA_JSON, 'utf8'));

const ESTADO = {
  passed: 'Correcto',
  failed: 'Fallido',
  pending: 'Pendiente',
  skipped: 'Omitido',
  todo: 'Por hacer',
};

const fecha = new Date(informe.startTime);
const duracion = ((Date.now() - informe.startTime) / 1000).toFixed(2);

const lineas = [];

lineas.push('# RENT SMART · Informe de pruebas automatizadas');
lineas.push('');
lineas.push('> Generado automáticamente con `npm run test:informe`.');
lineas.push('> Las columnas recogen el resultado **observado** en la ejecución, no el esperado.');
lineas.push('');
lineas.push('## Resumen de la ejecución');
lineas.push('');
lineas.push('| Dato | Valor |');
lineas.push('| --- | --- |');
lineas.push(`| Fecha y hora | ${fecha.toLocaleString('es-SV')} |`);
lineas.push(`| Sistema operativo | ${os.type()} ${os.release()} |`);
lineas.push(`| Node.js | ${process.version} |`);
lineas.push(`| Suites ejecutadas | ${informe.numTotalTestSuites} |`);
lineas.push(`| Casos ejecutados | ${informe.numTotalTests} |`);
lineas.push(`| Casos correctos | ${informe.numPassedTests} |`);
lineas.push(`| Casos fallidos | ${informe.numFailedTests} |`);
lineas.push(`| Duración total | ${duracion} s |`);
lineas.push(`| Resultado global | ${informe.success ? 'TODAS LAS PRUEBAS PASARON' : 'HAY PRUEBAS FALLIDAS'} |`);
lineas.push('');

for (const suite of informe.testResults) {
  const nombre = path.relative(RAIZ, suite.name);
  const correctos = suite.assertionResults.filter((a) => a.status === 'passed').length;

  lineas.push(`## ${nombre}`);
  lineas.push('');
  lineas.push(`${correctos} de ${suite.assertionResults.length} casos correctos · `
    + `${((suite.endTime - suite.startTime) / 1000).toFixed(2)} s`);
  lineas.push('');
  lineas.push('| # | Caso de prueba | Resultado observado | ms |');
  lineas.push('| --- | --- | --- | --- |');

  suite.assertionResults.forEach((caso, i) => {
    const titulo = [...caso.ancestorTitles, caso.title].join(' › ').replace(/\|/g, '\\|');
    const estado = ESTADO[caso.status] || caso.status;
    lineas.push(`| ${i + 1} | ${titulo} | ${estado} | ${caso.duration ?? 0} |`);
  });

  lineas.push('');

  const fallidos = suite.assertionResults.filter((a) => a.status === 'failed');
  if (fallidos.length) {
    lineas.push('### Detalle de los fallos observados');
    lineas.push('');
    for (const caso of fallidos) {
      lineas.push(`**${[...caso.ancestorTitles, caso.title].join(' › ')}**`);
      lineas.push('');
      lineas.push('```');
      lineas.push((caso.failureMessages || []).join('\n').replace(/\u001b\[\d+m/g, '').slice(0, 1500));
      lineas.push('```');
      lineas.push('');
    }
  }
}

lineas.push('---');
lineas.push('');
lineas.push('## Cobertura de los requerimientos');
lineas.push('');
lineas.push('| Requerimiento | Archivo de pruebas |');
lineas.push('| --- | --- |');
lineas.push('| Validaciones de formularios | `pruebas/validaciones.test.js` |');
lineas.push('| Autenticación (correo y Google) | `pruebas/autenticacion.test.js` |');
lineas.push('| Creación y cancelación de reservas | `pruebas/reservas.test.js` |');
lineas.push('| Formato de los datos del vehículo | `pruebas/vehiculos.test.js` |');
lineas.push('| Reglas de negocio (tarifa y traslape) | `pruebas/negocio.test.js` |');
lineas.push('');

fs.writeFileSync(path.join(RAIZ, 'PRUEBAS.md'), `${lineas.join('\n')}\n`, 'utf8');
fs.rmSync(SALIDA_JSON, { force: true });

console.log(`\nInforme escrito en PRUEBAS.md`);
console.log(`  ${informe.numPassedTests} correctos, ${informe.numFailedTests} fallidos de ${informe.numTotalTests}.`);
process.exit(codigoSalida);
