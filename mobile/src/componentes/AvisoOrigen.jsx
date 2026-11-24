/**
 * Franja que aparece cuando los datos vienen del respaldo local.
 *
 * Es una decisión de honestidad de interfaz: el usuario debe saber que está
 * viendo información que no acaba de confirmarse con el servidor.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { alCambiarOrigen, estaEnModoRespaldo } from '../servicios/origenDatos';
import { colores, espacio, radio } from '../tema';

export default function AvisoOrigen() {
  const [sinConexion, setSinConexion] = useState(estaEnModoRespaldo());

  useEffect(() => alCambiarOrigen(setSinConexion), []);

  if (!sinConexion) return null;

  return (
    <View style={estilos.franja}>
      <Ionicons name="cloud-offline-outline" size={16} color={colores.advertencia} />
      <Text style={estilos.texto}>
        Sin conexión con el servidor. Mostrando datos de demostración.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  franja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    backgroundColor: colores.advertenciaSuave,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radio.md,
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.sm,
    marginBottom: espacio.lg,
  },
  texto: { flex: 1, fontSize: 12, color: colores.advertencia },
});
