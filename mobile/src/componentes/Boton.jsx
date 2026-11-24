/** Botón de la aplicación. Tres variantes y estado de carga. */

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, radio, espacio } from '../tema';

export default function Boton({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  icono = null,
  estilo,
}) {
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        inactivo && estilos.inactivo,
        pressed && !inactivo && estilos.presionado,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator
          color={variante === 'primario' ? '#FFFFFF' : colores.primario}
          size="small"
        />
      ) : (
        <View style={estilos.contenido}>
          {icono}
          <Text style={[estilos.texto, estilos[`texto_${variante}`]]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48, // objetivo táctil accesible
    borderRadius: radio.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.lg,
  },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  primario: { backgroundColor: colores.primario },
  secundario: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  peligro: { backgroundColor: colores.errorSuave, borderWidth: 1, borderColor: '#FECACA' },
  inactivo: { opacity: 0.5 },
  presionado: { opacity: 0.85 },
  texto: { fontSize: 15, fontWeight: '600' },
  texto_primario: { color: '#FFFFFF' },
  texto_secundario: { color: colores.texto },
  texto_peligro: { color: colores.error },
});
