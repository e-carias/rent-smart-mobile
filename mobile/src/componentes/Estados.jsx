/**
 * Los tres estados que toda pantalla con datos debe saber mostrar:
 * cargando, vacío y con error. Tenerlos como componentes evita que cada
 * pantalla improvise el suyo.
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espacio, radio } from '../tema';
import Boton from './Boton';

export function Cargando({ mensaje = 'Cargando…' }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
}

export function Vacio({ icono = 'file-tray-outline', titulo, descripcion, accion }) {
  return (
    <View style={estilos.centro}>
      <View style={estilos.circulo}>
        <Ionicons name={icono} size={28} color={colores.textoTenue} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      {descripcion ? <Text style={estilos.mensaje}>{descripcion}</Text> : null}
      {accion ? <View style={estilos.accion}>{accion}</View> : null}
    </View>
  );
}

export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <View style={estilos.centro}>
      <View style={[estilos.circulo, { backgroundColor: colores.errorSuave }]}>
        <Ionicons name="alert-circle-outline" size={28} color={colores.error} />
      </View>
      <Text style={estilos.titulo}>No se pudieron cargar los datos</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      {onReintentar ? (
        <Boton
          titulo="Reintentar"
          variante="secundario"
          onPress={onReintentar}
          estilo={estilos.accion}
        />
      ) : null}
    </View>
  );
}

/** Mensaje de error de formulario, encima del botón de envío. */
export function MensajeError({ texto }) {
  if (!texto) return null;
  return (
    <View style={estilos.alerta}>
      <Ionicons name="alert-circle" size={18} color={colores.error} />
      <Text style={estilos.alertaTexto}>{texto}</Text>
    </View>
  );
}

export function MensajeExito({ texto }) {
  if (!texto) return null;
  return (
    <View style={[estilos.alerta, estilos.alertaExito]}>
      <Ionicons name="checkmark-circle" size={18} color={colores.exito} />
      <Text style={[estilos.alertaTexto, { color: colores.exito }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
    gap: espacio.sm,
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colores.neutroSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.xs,
  },
  titulo: { fontSize: 16, fontWeight: '600', color: colores.texto, textAlign: 'center' },
  mensaje: { fontSize: 14, color: colores.textoSuave, textAlign: 'center' },
  accion: { marginTop: espacio.md, minWidth: 160 },
  alerta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.sm,
    backgroundColor: colores.errorSuave,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radio.md,
    padding: espacio.md,
    marginBottom: espacio.lg,
  },
  alertaExito: { backgroundColor: colores.exitoSuave, borderColor: '#BBF7D0' },
  alertaTexto: { flex: 1, fontSize: 13, color: colores.error, lineHeight: 18 },
});
