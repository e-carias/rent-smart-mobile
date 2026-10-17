/** Insignia de estado. El color comunica, el texto confirma. */

import { StyleSheet, Text, View } from 'react-native';
import { colorEstadoReserva, colorEstadoVehiculo, colores, radio, espacio } from '../tema';
import { textoEstado } from '../lib/formato';

export default function Etiqueta({ estado, tipo = 'reserva', estilo }) {
  const paleta = tipo === 'vehiculo' ? colorEstadoVehiculo : colorEstadoReserva;
  const tono = paleta[estado] || { fondo: colores.neutroSuave, texto: colores.neutro };

  return (
    <View style={[estilos.caja, { backgroundColor: tono.fondo }, estilo]}>
      <Text style={[estilos.texto, { color: tono.texto }]}>{textoEstado(estado)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.xs + 1,
    borderRadius: radio.completo,
  },
  texto: { fontSize: 12, fontWeight: '600' },
});
