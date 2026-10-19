/**
 * Pantalla 10 · Detalle de la reserva.
 *
 * Muestra el desglose guardado —no recalculado— porque una reserva confirmada
 * conserva el precio del día en que se hizo, aunque la tarifa cambie después.
 */

import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ReservaService from '../../src/servicios/reservaService';
import { dinero, fechaLarga, textoEstado } from '../../src/lib/formato';
import { PORCENTAJE_DEPOSITO } from '../../src/lib/negocio';
import Etiqueta from '../../src/componentes/Etiqueta';
import Boton from '../../src/componentes/Boton';
import { Cargando, ErrorCarga } from '../../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../../src/tema';

/** Estados desde los que el cliente todavía puede cancelar. */
const CANCELABLES = ['pendiente', 'confirmada'];

function Dato({ icono, etiqueta, valor }) {
  return (
    <View style={estilos.dato}>
      <Ionicons name={icono} size={18} color={colores.textoSuave} />
      <View style={{ flex: 1 }}>
        <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
        <Text style={estilos.datoValor}>{valor}</Text>
      </View>
    </View>
  );
}

export default function DetalleReserva() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const datos = await ReservaService.obtenerReserva(id);
      if (!datos) setError('La reserva no existe.');
      else setReserva(datos);
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

  const cancelar = () => {
    Alert.alert(
      'Cancelar reserva',
      `¿Seguro que deseas cancelar la reserva ${reserva.codigo}? Esta acción no se puede deshacer.`,
      [
        { text: 'No, conservarla', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(true);
            try {
              await ReservaService.cancelarReserva(reserva.id, 'Cancelada por el cliente desde la app.');
              await cargar();
            } catch (e) {
              Alert.alert('No se pudo cancelar', e.message);
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  };

  if (cargando) return <Cargando mensaje="Cargando la reserva…" />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargar} />;

  const deposito = Number(reserva.total || 0) * PORCENTAJE_DEPOSITO;

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <View style={estilos.encabezado}>
        <Text style={estilos.codigo}>{reserva.codigo}</Text>
        <Etiqueta estado={reserva.estado} />
      </View>

      <Text style={estilos.vehiculo}>
        {reserva.vehiculo ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo}` : `Vehículo #${reserva.vehiculoId}`}
      </Text>
      {reserva.placa ? <Text style={estilos.placa}>Placa {reserva.placa}</Text> : null}

      {reserva.pendienteDeEnvio && (
        <View style={estilos.pendiente}>
          <Ionicons name="cloud-offline-outline" size={16} color={colores.advertencia} />
          <Text style={estilos.pendienteTexto}>
            Esta reserva se creó sin conexión y aún no se ha enviado al servidor.
          </Text>
        </View>
      )}

      <View style={estilos.tarjeta}>
        <Dato icono="calendar-outline" etiqueta="Entrega" valor={fechaLarga(reserva.fechaInicio)} />
        <Dato icono="calendar-outline" etiqueta="Devolución" valor={fechaLarga(reserva.fechaFin)} />
        <Dato
          icono="time-outline"
          etiqueta="Duración"
          valor={`${reserva.dias} ${reserva.dias === 1 ? 'día' : 'días'}`}
        />
        <Dato icono="location-outline" etiqueta="Lugar de entrega" valor={reserva.lugarEntrega} />
        {reserva.observaciones ? (
          <Dato icono="chatbox-outline" etiqueta="Observaciones" valor={reserva.observaciones} />
        ) : null}
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.tarjetaTitulo}>Desglose</Text>

        <View style={estilos.linea}>
          <Text style={estilos.lineaEtiqueta}>
            {reserva.dias} × {dinero(reserva.tarifaDiaria)}
          </Text>
          <Text style={estilos.lineaValor}>
            {dinero(Number(reserva.subtotal) + Number(reserva.descuento || 0))}
          </Text>
        </View>

        {Number(reserva.descuento) > 0 && (
          <View style={estilos.linea}>
            <Text style={[estilos.lineaEtiqueta, { color: colores.exito }]}>
              Descuento ({Number(reserva.porcentajeDescuento) * 100} %)
            </Text>
            <Text style={[estilos.lineaValor, { color: colores.exito }]}>
              −{dinero(reserva.descuento)}
            </Text>
          </View>
        )}

        <View style={estilos.linea}>
          <Text style={estilos.lineaEtiqueta}>Subtotal</Text>
          <Text style={estilos.lineaValor}>{dinero(reserva.subtotal)}</Text>
        </View>

        <View style={estilos.linea}>
          <Text style={estilos.lineaEtiqueta}>IVA (13 %)</Text>
          <Text style={estilos.lineaValor}>{dinero(reserva.impuesto)}</Text>
        </View>

        <View style={[estilos.linea, estilos.lineaTotal]}>
          <Text style={estilos.totalEtiqueta}>Total</Text>
          <Text style={estilos.totalValor}>{dinero(reserva.total)}</Text>
        </View>

        <Text style={estilos.deposito}>Depósito en garantía: {dinero(deposito)}</Text>
      </View>

      {CANCELABLES.includes(reserva.estado) ? (
        <Boton
          titulo="Cancelar reserva"
          variante="peligro"
          onPress={cancelar}
          cargando={cancelando}
        />
      ) : (
        <Text style={estilos.nota}>
          Una reserva {textoEstado(reserva.estado).toLowerCase()} ya no puede modificarse desde la
          aplicación.
        </Text>
      )}

      <Boton
        titulo="Volver a mis reservas"
        variante="secundario"
        onPress={() => router.replace('/(tabs)/reservas')}
        estilo={{ marginTop: espacio.md }}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.lg, paddingBottom: espacio.xxl, backgroundColor: colores.fondo },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codigo: { fontSize: 13, fontWeight: '700', color: colores.textoTenue, letterSpacing: 0.8 },
  vehiculo: { fontSize: 22, fontWeight: '700', color: colores.texto, marginTop: espacio.md },
  placa: { fontSize: 13, color: colores.textoSuave, marginTop: 2 },
  pendiente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    backgroundColor: colores.advertenciaSuave,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radio.md,
    padding: espacio.md,
    marginTop: espacio.lg,
  },
  pendienteTexto: { flex: 1, fontSize: 12, color: colores.advertencia, lineHeight: 17 },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.lg,
    marginTop: espacio.xl,
    ...sombra,
  },
  tarjetaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoTenue,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: espacio.md,
  },
  dato: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.md,
    paddingVertical: espacio.sm,
  },
  datoEtiqueta: { fontSize: 11, color: colores.textoTenue },
  datoValor: { fontSize: 14, color: colores.texto, marginTop: 1 },
  linea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: espacio.xs + 2,
  },
  lineaEtiqueta: { flex: 1, fontSize: 13, color: colores.textoSuave },
  lineaValor: { fontSize: 13, fontWeight: '500', color: colores.texto },
  lineaTotal: {
    marginTop: espacio.sm,
    paddingTop: espacio.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  totalEtiqueta: { fontSize: 15, fontWeight: '700', color: colores.texto },
  totalValor: { fontSize: 20, fontWeight: '800', color: colores.primario },
  deposito: { fontSize: 11, color: colores.textoTenue, marginTop: espacio.md },
  nota: {
    fontSize: 12,
    color: colores.textoTenue,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: espacio.xl,
  },
});
