/**
 * Tarjeta de un vehículo dentro del listado.
 *
 * El vehículo no trae fotografía en la base de datos, así que la miniatura se
 * resuelve con la inicial de la marca sobre el color de la categoría. Es
 * preferible a un espacio gris: da ritmo visual a la lista y nunca falla.
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etiqueta from './Etiqueta';
import { dinero } from '../lib/formato';
import { colores, espacio, radio, sombra } from '../tema';

const ICONO_CATEGORIA = {
  'Sedán': 'car-outline',
  SUV: 'car-sport-outline',
  'Pick-up': 'car-sport-outline',
  Compacto: 'car-outline',
  'Microbús': 'bus-outline',
};

function TarjetaVehiculo({ vehiculo, onPress }) {
  const disponible = vehiculo.estado === 'disponible';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${vehiculo.marca} ${vehiculo.modelo}, ${dinero(vehiculo.precioPorDia)} por día`}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
    >
      <View style={estilos.miniatura}>
        <Ionicons
          name={ICONO_CATEGORIA[vehiculo.categoria] || 'car-outline'}
          size={26}
          color={colores.primario}
        />
      </View>

      <View style={estilos.cuerpo}>
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo} numberOfLines={1}>
            {vehiculo.marca} {vehiculo.modelo}
          </Text>
          <Text style={estilos.anio}>{vehiculo.anio}</Text>
        </View>

        <Text style={estilos.detalle} numberOfLines={1}>
          {vehiculo.categoria} · {vehiculo.transmision} · {vehiculo.capacidad} pasajeros
        </Text>

        <View style={estilos.pie}>
          <Text style={estilos.precio}>
            {dinero(vehiculo.precioPorDia)}
            <Text style={estilos.porDia}> / día</Text>
          </Text>
          {!disponible && <Etiqueta estado={vehiculo.estado} tipo="vehiculo" />}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
    </Pressable>
  );
}

// memo evita volver a dibujar las tarjetas que no cambiaron al filtrar.
export default memo(TarjetaVehiculo);

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.md,
    marginBottom: espacio.md,
    ...sombra,
  },
  presionada: { opacity: 0.9, borderColor: colores.primarioBorde },
  miniatura: {
    width: 52,
    height: 52,
    borderRadius: radio.md,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: { flex: 1, gap: 2 },
  encabezado: { flexDirection: 'row', alignItems: 'baseline', gap: espacio.sm },
  titulo: { flex: 1, fontSize: 15, fontWeight: '600', color: colores.texto },
  anio: { fontSize: 12, color: colores.textoTenue },
  detalle: { fontSize: 12, color: colores.textoSuave },
  pie: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm, marginTop: espacio.xs },
  precio: { fontSize: 15, fontWeight: '700', color: colores.primario },
  porDia: { fontSize: 12, fontWeight: '400', color: colores.textoTenue },
});
