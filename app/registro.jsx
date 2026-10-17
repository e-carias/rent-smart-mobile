/**
 * Pantalla 2 · Registro de cliente (requerimiento funcional 1).
 *
 * Es el formulario con más validaciones de la app: siete campos, cinco reglas
 * distintas y confirmación de contraseña. Todas las reglas están en
 * `src/lib/validaciones.js`, nunca escritas aquí dentro.
 */

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../src/contexto/AuthContext';
import { validarRegistro, hayErrores } from '../src/lib/validaciones';
import CampoTexto from '../src/componentes/CampoTexto';
import Boton from '../src/componentes/Boton';
import { MensajeError } from '../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../src/tema';

const VACIO = {
  nombre: '',
  email: '',
  documento: '',
  telefono: '',
  password: '',
  confirmarPassword: '',
};

export default function Registro() {
  const router = useRouter();
  const { registrar } = useAuth();

  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = async () => {
    setMensaje(null);

    const encontrados = validarRegistro(datos);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setEnviando(true);
    try {
      await registrar({
        nombre: datos.nombre.trim(),
        email: datos.email.trim().toLowerCase(),
        documento: datos.documento.trim(),
        telefono: datos.telefono.trim(),
        password: datos.password,
      });
      router.replace('/(tabs)/inicio');
    } catch (e) {
      setMensaje(e.message);
      if (e.errores) setErrores(e.errores);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.tarjeta}>
          <Text style={estilos.encabezado}>Crea tu cuenta</Text>
          <Text style={estilos.subencabezado}>
            Con una cuenta puedes reservar vehículos y consultar tus contratos.
          </Text>

          <MensajeError texto={mensaje} />

          <CampoTexto
            etiqueta="Nombre completo"
            valor={datos.nombre}
            onChangeText={cambiar('nombre')}
            error={errores.nombre}
            placeholder="Erick Rosales"
            autoCapitalize="words"
            textContentType="name"
          />

          <CampoTexto
            etiqueta="Correo electrónico"
            valor={datos.email}
            onChangeText={cambiar('email')}
            error={errores.email}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />

          <CampoTexto
            etiqueta="Documento (DUI)"
            valor={datos.documento}
            onChangeText={cambiar('documento')}
            error={errores.documento}
            ayuda="Ocho dígitos, guion y un dígito verificador."
            placeholder="01234567-8"
            keyboardType="number-pad"
          />

          <CampoTexto
            etiqueta="Teléfono"
            valor={datos.telefono}
            onChangeText={cambiar('telefono')}
            error={errores.telefono}
            placeholder="7777-7777"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />

          <CampoTexto
            etiqueta="Contraseña"
            valor={datos.password}
            onChangeText={cambiar('password')}
            error={errores.password}
            ayuda="Al menos 8 caracteres, combinando letras y números."
            placeholder="••••••••"
            secreto
            autoCapitalize="none"
          />

          <CampoTexto
            etiqueta="Confirmar contraseña"
            valor={datos.confirmarPassword}
            onChangeText={cambiar('confirmarPassword')}
            error={errores.confirmarPassword}
            placeholder="••••••••"
            secreto
            autoCapitalize="none"
            onSubmitEditing={enviar}
            returnKeyType="go"
          />

          <Boton titulo="Crear cuenta" onPress={enviar} cargando={enviando} />

          <Boton
            titulo="Ya tengo cuenta"
            variante="secundario"
            onPress={() => router.back()}
            estilo={{ marginTop: espacio.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.lg, paddingBottom: espacio.xxl },
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
});
