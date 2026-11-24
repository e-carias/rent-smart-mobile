/**
 * Selector de fecha.
 *
 * Usa el calendario nativo del sistema operativo en lugar de un campo de
 * texto. Es la primera adaptación real a móvil: en la web se escribía la
 * fecha en un <input type="date">, y aquí escribir "2026-10-18" con el teclado
 * del teléfono sería lento y propenso a errores. El valor que entrega sigue
 * siendo la misma cadena ISO que espera el API.
 */

import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { fechaLarga } from '../lib/formato';
import { colores, espacio, radio } from '../tema';

function aISO(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export default function CampoFecha({ etiqueta, valor, onChange, minimo, error }) {
  const [abierto, setAbierto] = useState(false);

  const alElegir = (evento, fecha) => {
    // En Android el calendario se cierra solo; en iOS se mantiene abierto.
    if (Platform.OS === 'android') setAbierto(false);
    if (evento.type === 'dismissed' || !fecha) return;
    onChange(aISO(fecha));
  };

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>

      <Pressable
        onPress={() => setAbierto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${fechaLarga(valor)}. Pulsa para cambiar.`}
        style={[estilos.caja, error && estilos.cajaError]}
      >
        <Ionicons name="calendar-outline" size={18} color={colores.primario} />
        <Text style={estilos.valor}>{fechaLarga(valor)}</Text>
        <Ionicons name="chevron-down" size={16} color={colores.textoTenue} />
      </Pressable>

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      {abierto && (
        <DateTimePicker
          value={new Date(`${valor}T12:00:00`)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={minimo ? new Date(`${minimo}T12:00:00`) : undefined}
          onChange={alElegir}
        />
      )}

      {abierto && Platform.OS === 'ios' && (
        <Pressable onPress={() => setAbierto(false)} style={estilos.listo}>
          <Text style={estilos.listoTexto}>Listo</Text>
        </Pressable>
      )}
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
    gap: espacio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    paddingHorizontal: espacio.md,
    minHeight: 48,
  },
  cajaError: { borderColor: colores.error, backgroundColor: colores.errorSuave },
  valor: { flex: 1, fontSize: 15, color: colores.texto },
  error: { marginTop: espacio.xs, fontSize: 12, color: colores.error },
  listo: { alignSelf: 'flex-end', padding: espacio.sm },
  listoTexto: { color: colores.primario, fontWeight: '600' },
});
