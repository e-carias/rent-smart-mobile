/**
 * Pantalla 7 · Perfil.
 *
 * Datos del usuario, origen de los datos y cierre de sesión. El bloque de
 * "Conexión" no es decorativo: es lo primero que se revisa cuando la app no
 * muestra información, y tenerlo a la vista evita abrir el código.
 */

import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/contexto/AuthContext';
import { API_BASE } from '../../src/servicios/apiClient';
import { alCambiarOrigen, estaEnModoRespaldo } from '../../src/servicios/origenDatos';
import { iniciales } from '../../src/lib/formato';
import Boton from '../../src/componentes/Boton';
import { colores, espacio, radio, sombra } from '../../src/tema';

function Fila({ icono, etiqueta, valor }) {
  return (
    <View style={estilos.fila}>
      <Ionicons name={icono} size={18} color={colores.textoSuave} />
      <View style={{ flex: 1 }}>
        <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
        <Text style={estilos.filaValor}>{valor || 'No registrado'}</Text>
      </View>
    </View>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { usuario, cliente, cerrarSesion } = useAuth();
  const [sinConexion, setSinConexion] = useState(estaEnModoRespaldo());

  useEffect(() => alCambiarOrigen(setSinConexion), []);

  const confirmarSalida = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await cerrarSesion();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <View style={estilos.encabezado}>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarTexto}>{iniciales(usuario?.nombre)}</Text>
        </View>
        <Text style={estilos.nombre}>{usuario?.nombre}</Text>
        <View style={estilos.rol}>
          <Text style={estilos.rolTexto}>{usuario?.rol}</Text>
        </View>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.tarjetaTitulo}>Datos de la cuenta</Text>
        <Fila icono="mail-outline" etiqueta="Correo" valor={usuario?.email} />
        <Fila icono="card-outline" etiqueta="Documento (DUI)" valor={cliente?.documento} />
        <Fila icono="call-outline" etiqueta="Teléfono" valor={cliente?.telefono} />
        <Fila icono="location-outline" etiqueta="Dirección" valor={cliente?.direccion} />
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.tarjetaTitulo}>Conexión</Text>

        <View style={estilos.fila}>
          <Ionicons
            name={sinConexion ? 'cloud-offline-outline' : 'cloud-done-outline'}
            size={18}
            color={sinConexion ? colores.advertencia : colores.exito}
          />
          <View style={{ flex: 1 }}>
            <Text style={estilos.filaEtiqueta}>Origen de los datos</Text>
            <Text
              style={[
                estilos.filaValor,
                { color: sinConexion ? colores.advertencia : colores.exito },
              ]}
            >
              {sinConexion ? 'Datos de demostración (sin servidor)' : 'API REST del sistema'}
            </Text>
          </View>
        </View>

        <Fila icono="server-outline" etiqueta="Dirección del API" valor={API_BASE || 'Sin configurar'} />

        <Text style={estilos.nota}>
          La dirección se define en el archivo .env con la variable
          EXPO_PUBLIC_API_URL. Si el servidor no responde, la app usa los datos
          incluidos para seguir siendo navegable.
        </Text>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.tarjetaTitulo}>Acerca de</Text>
        <Fila icono="phone-portrait-outline" etiqueta="Versión" valor="1.0.0 · Etapa 3" />
        <Fila icono="school-outline" etiqueta="Asignatura" valor="Diseño y Programación de Software Multiplataforma" />
        <Fila icono="business-outline" etiqueta="Institución" valor="Universidad Don Bosco" />
      </View>

      <Boton
        titulo="Cerrar sesión"
        variante="peligro"
        onPress={confirmarSalida}
        icono={<Ionicons name="log-out-outline" size={18} color={colores.error} />}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.lg, paddingBottom: espacio.xxl },
  encabezado: { alignItems: 'center', marginBottom: espacio.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.md,
  },
  avatarTexto: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  nombre: { fontSize: 20, fontWeight: '700', color: colores.texto },
  rol: {
    marginTop: espacio.sm,
    paddingHorizontal: espacio.md,
    paddingVertical: 4,
    borderRadius: radio.completo,
    backgroundColor: colores.primarioSuave,
  },
  rolTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colores.primario,
    textTransform: 'capitalize',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.lg,
    marginBottom: espacio.lg,
    ...sombra,
  },
  tarjetaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoTenue,
    letterSpacing: 0.6,
    marginBottom: espacio.md,
    textTransform: 'uppercase',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.md,
    paddingVertical: espacio.sm,
  },
  filaEtiqueta: { fontSize: 11, color: colores.textoTenue },
  filaValor: { fontSize: 14, color: colores.texto, marginTop: 1 },
  nota: {
    fontSize: 11,
    color: colores.textoTenue,
    lineHeight: 16,
    marginTop: espacio.sm,
    paddingTop: espacio.sm,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
});
