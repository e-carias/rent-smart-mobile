/** Tarjeta de una reserva en "Mis reservas". */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etiqueta from './Etiqueta';
import { dinero, fechaCorta } from '../lib/formato';
import { colores, espacio, radio, sombra } from '../tema';

function TarjetaReserva({ reserva, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Reserva ${reserva.codigo}, ${reserva.vehiculo}`}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
    >
      <View style={estilos.encabezado}>
        <Text style={estilos.codigo}>{reserva.codigo}</Text>
        <Etiqueta estado={reserva.estado} />
      </View>

      <Text style={estilos.vehiculo} numberOfLines={1}>
        {reserva.vehiculo ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo}` : `Vehículo #${reserva.vehiculoId}`}
      </Text>

      <View style={estilos.fila}>
        <Ionicons name="calendar-outline" size={14} color={colores.textoSuave} />
        <Text style={estilos.detalle}>
          {fechaCorta(reserva.fechaInicio)} al {fechaCorta(reserva.fechaFin)} · {reserva.dias}{' '}
          {reserva.dias === 1 ? 'día' : 'días'}
        </Text>
      </View>

      <View style={estilos.fila}>
        <Ionicons name="location-outline" size={14} color={colores.textoSuave} />
        <Text style={estilos.detalle} numberOfLines={1}>
          {reserva.lugarEntrega}
        </Text>
      </View>

      <View style={estilos.pie}>
        <Text style={estilos.total}>{dinero(reserva.total)}</Text>
        {reserva.pendienteDeEnvio && (
          <View style={estilos.pendiente}>
            <Ionicons name="time-outline" size={12} color={colores.advertencia} />
            <Text style={estilos.pendienteTexto}>Sin enviar</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default memo(TarjetaReserva);

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.lg,
    marginBottom: espacio.md,
    gap: espacio.xs + 2,
    ...sombra,
  },
  presionada: { opacity: 0.9, borderColor: colores.primarioBorde },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codigo: { fontSize: 12, fontWeight: '700', color: colores.textoTenue, letterSpacing: 0.5 },
  vehiculo: { fontSize: 16, fontWeight: '600', color: colores.texto },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  detalle: { flex: 1, fontSize: 13, color: colores.textoSuave },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacio.xs,
    paddingTop: espacio.sm,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  total: { fontSize: 16, fontWeight: '700', color: colores.texto },
  pendiente: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pendienteTexto: { fontSize: 11, fontWeight: '600', color: colores.advertencia },
});
