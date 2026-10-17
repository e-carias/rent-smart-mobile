/**
 * Pantalla 8 · Detalle del vehículo.
 *
 * Ruta dinámica: el nombre del archivo entre corchetes hace que /vehiculo/3
 * entregue id = 3. Es la misma convención de `app/vehiculos/[id]/page.jsx` en
 * la versión web.
 *
 * El botón de reservar queda fijo al pie, fuera del área que se desplaza: en
 * un teléfono la acción principal no debe depender de que el usuario llegue
 * al final del contenido.
 */

import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import VehiculoService from '../../src/servicios/vehiculoService';
import { dinero } from '../../src/lib/formato';
import { calcularTarifa } from '../../src/lib/negocio';
import Etiqueta from '../../src/componentes/Etiqueta';
import Boton from '../../src/componentes/Boton';
import { Cargando, ErrorCarga } from '../../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../../src/tema';

function Ficha({ icono, etiqueta, valor }) {
  return (
    <View style={estilos.ficha}>
      <Ionicons name={icono} size={18} color={colores.primario} />
      <Text style={estilos.fichaEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.fichaValor}>{valor}</Text>
    </View>
  );
}

export default function DetalleVehiculo() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const datos = await VehiculoService.obtenerVehiculo(id);
      if (!datos) setError('El vehículo no existe o fue retirado de la flota.');
      else setVehiculo(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (cargando) return <Cargando mensaje="Cargando el vehículo…" />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargar} />;

  const disponible = vehiculo.estado === 'disponible';
  // Ejemplo de tarifa a 3 días: es donde entra el primer tramo de descuento.
  const ejemplo = calcularTarifa(vehiculo.precioPorDia, '2026-01-01', '2026-01-04');

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.portada}>
          <Ionicons name="car-sport" size={56} color={colores.primario} />
        </View>

        <View style={estilos.encabezado}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.titulo}>
              {vehiculo.marca} {vehiculo.modelo}
            </Text>
            <Text style={estilos.subtitulo}>
              {vehiculo.anio} · Placa {vehiculo.placa}
            </Text>
          </View>
          <Etiqueta estado={vehiculo.estado} tipo="vehiculo" />
        </View>

        <View style={estilos.precio}>
          <Text style={estilos.precioValor}>{dinero(vehiculo.precioPorDia)}</Text>
          <Text style={estilos.precioTexto}>por día, antes de impuestos</Text>
        </View>

        {vehiculo.descripcion ? (
          <Text style={estilos.descripcion}>{vehiculo.descripcion}</Text>
        ) : null}

        <Text style={estilos.seccion}>Características</Text>
        <View style={estilos.fichas}>
          <Ficha icono="pricetag-outline" etiqueta="Categoría" valor={vehiculo.categoria} />
          <Ficha icono="color-palette-outline" etiqueta="Color" valor={vehiculo.color} />
          <Ficha icono="settings-outline" etiqueta="Transmisión" valor={vehiculo.transmision} />
          <Ficha icono="water-outline" etiqueta="Combustible" valor={vehiculo.combustible} />
          <Ficha icono="people-outline" etiqueta="Capacidad" valor={`${vehiculo.capacidad} personas`} />
          <Ficha
            icono="speedometer-outline"
            etiqueta="Kilometraje"
            valor={`${Number(vehiculo.kilometraje).toLocaleString('es-SV')} km`}
          />
        </View>

        <Text style={estilos.seccion}>Ejemplo de tarifa a 3 días</Text>
        <View style={estilos.cotizacion}>
          <View style={estilos.lineaCot}>
            <Text style={estilos.lineaEtiqueta}>3 días × {dinero(ejemplo.tarifaDiaria)}</Text>
            <Text style={estilos.lineaValor}>{dinero(ejemplo.bruto)}</Text>
          </View>
          {ejemplo.descuento > 0 && (
            <View style={estilos.lineaCot}>
              <Text style={[estilos.lineaEtiqueta, { color: colores.exito }]}>
                Descuento por volumen ({ejemplo.porcentajeDescuento * 100} %)
              </Text>
              <Text style={[estilos.lineaValor, { color: colores.exito }]}>
                −{dinero(ejemplo.descuento)}
              </Text>
            </View>
          )}
          <View style={estilos.lineaCot}>
            <Text style={estilos.lineaEtiqueta}>IVA (13 %)</Text>
            <Text style={estilos.lineaValor}>{dinero(ejemplo.impuesto)}</Text>
          </View>
          <View style={[estilos.lineaCot, estilos.lineaTotal]}>
            <Text style={estilos.totalEtiqueta}>Total</Text>
            <Text style={estilos.totalValor}>{dinero(ejemplo.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        <Boton
          titulo={disponible ? 'Reservar este vehículo' : 'No disponible'}
          deshabilitado={!disponible}
          onPress={() => router.push(`/reservar/${vehiculo.id}`)}
        />
        {!disponible && (
          <Text style={estilos.aviso}>
            Este vehículo está en {vehiculo.estado === 'mantenimiento' ? 'mantenimiento' : 'revisión'}.
            Elige otro de la flota.
          </Text>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.lg, paddingBottom: espacio.xxl },
  portada: {
    height: 150,
    borderRadius: radio.lg,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.lg,
  },
  encabezado: { flexDirection: 'row', alignItems: 'flex-start', gap: espacio.md },
  titulo: { fontSize: 22, fontWeight: '700', color: colores.texto },
  subtitulo: { fontSize: 13, color: colores.textoSuave, marginTop: 2 },
  precio: { flexDirection: 'row', alignItems: 'baseline', gap: espacio.sm, marginTop: espacio.lg },
  precioValor: { fontSize: 26, fontWeight: '800', color: colores.primario },
  precioTexto: { fontSize: 12, color: colores.textoTenue },
  descripcion: {
    fontSize: 14,
    color: colores.textoSuave,
    lineHeight: 21,
    marginTop: espacio.md,
  },
  seccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoTenue,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: espacio.xl,
    marginBottom: espacio.md,
  },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.sm },
  ficha: {
    width: '48%',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    padding: espacio.md,
    gap: 2,
    ...sombra,
  },
  fichaEtiqueta: { fontSize: 11, color: colores.textoTenue, marginTop: espacio.xs },
  fichaValor: { fontSize: 14, fontWeight: '600', color: colores.texto },
  cotizacion: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.lg,
    ...sombra,
  },
  lineaCot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: espacio.xs + 2,
  },
  lineaEtiqueta: { fontSize: 13, color: colores.textoSuave },
  lineaValor: { fontSize: 13, color: colores.texto, fontWeight: '500' },
  lineaTotal: {
    marginTop: espacio.sm,
    paddingTop: espacio.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  totalEtiqueta: { fontSize: 15, fontWeight: '700', color: colores.texto },
  totalValor: { fontSize: 18, fontWeight: '800', color: colores.primario },
  pie: {
    padding: espacio.lg,
    backgroundColor: colores.superficie,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  aviso: { fontSize: 12, color: colores.textoTenue, textAlign: 'center', marginTop: espacio.sm },
});
