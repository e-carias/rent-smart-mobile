/**
 * Campo de formulario con etiqueta, ayuda y mensaje de error.
 *
 * El error se muestra bajo el campo y el borde cambia de color; así el usuario
 * ve qué campo falló sin tener que leer un listado al final del formulario.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, radio, espacio } from '../tema';

export default function CampoTexto({
  etiqueta,
  valor,
  onChangeText,
  error,
  ayuda,
  secreto = false,
  ...resto
}) {
  const [oculto, setOculto] = useState(secreto);

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>

      <View style={[estilos.caja, error && estilos.cajaError]}>
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          secureTextEntry={oculto}
          placeholderTextColor={colores.textoTenue}
          style={estilos.entrada}
          accessibilityLabel={etiqueta}
          {...resto}
        />

        {secreto && (
          <Pressable
            onPress={() => setOculto((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            <Ionicons
              name={oculto ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colores.textoSuave}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={estilos.error}>{error}</Text>
      ) : ayuda ? (
        <Text style={estilos.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: espacio.lg },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.textoSuave,
    marginBottom: espacio.xs + 2,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    paddingHorizontal: espacio.md,
    minHeight: 48,
  },
  cajaError: { borderColor: colores.error, backgroundColor: colores.errorSuave },
  entrada: { flex: 1, fontSize: 15, color: colores.texto, paddingVertical: espacio.md },
  error: { marginTop: espacio.xs, fontSize: 12, color: colores.error },
  ayuda: { marginTop: espacio.xs, fontSize: 12, color: colores.textoTenue },
});
