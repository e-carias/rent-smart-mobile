/**
 * Pantalla 3 · Recuperar contraseña.
 *
 * Responde siempre lo mismo, exista o no el correo. Es deliberado: decir "ese
 * correo no está registrado" permitiría averiguar qué cuentas existen.
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AuthService from '../src/servicios/authService';
import { validarRecuperar, hayErrores } from '../src/lib/validaciones';
import CampoTexto from '../src/componentes/CampoTexto';
import Boton from '../src/componentes/Boton';
import { MensajeError } from '../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../src/tema';

export default function Recuperar() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setMensaje(null);

    const encontrados = validarRecuperar({ email });
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setEnviando(true);
    try {
      await AuthService.recuperar(email.trim().toLowerCase());
      setEnviado(true);
    } catch (e) {
      setMensaje(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <View style={estilos.exito}>
        <View style={estilos.circulo}>
          <Ionicons name="mail-outline" size={30} color={colores.exito} />
        </View>
        <Text style={estilos.exitoTitulo}>Revisa tu correo</Text>
        <Text style={estilos.exitoTexto}>
          Si {email.trim()} está registrado, recibirás las instrucciones para restablecer tu
          contraseña.
        </Text>
        <Boton
          titulo="Volver al inicio de sesión"
          onPress={() => router.replace('/login')}
          estilo={{ marginTop: espacio.xl, alignSelf: 'stretch' }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <View style={estilos.tarjeta}>
        <Text style={estilos.encabezado}>Recuperar contraseña</Text>
        <Text style={estilos.subencabezado}>
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.
        </Text>

        <MensajeError texto={mensaje} />

        <CampoTexto
          etiqueta="Correo electrónico"
          valor={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errores.email) setErrores({});
          }}
          error={errores.email}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          onSubmitEditing={enviar}
          returnKeyType="send"
        />

        <Boton titulo="Enviar instrucciones" onPress={enviar} cargando={enviando} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.lg, backgroundColor: colores.fondo, flexGrow: 1 },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.xl,
    ...sombra,
  },
  encabezado: { fontSize: 20, fontWeight: '700', color: colores.texto },
  subencabezado: { fontSize: 13, color: colores.textoSuave, marginTop: 4, marginBottom: espacio.xl },
  exito: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
    backgroundColor: colores.fondo,
  },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.exitoSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.lg,
  },
  exitoTitulo: { fontSize: 20, fontWeight: '700', color: colores.texto },
  exitoTexto: {
    fontSize: 14,
    color: colores.textoSuave,
    textAlign: 'center',
    marginTop: espacio.sm,
    lineHeight: 20,
  },
});
