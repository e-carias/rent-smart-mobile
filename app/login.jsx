/**
 * Pantalla 1 · Inicio de sesión (requerimiento funcional 1).
 *
 * Replica el mockup de Figma de la Etapa 1: marca arriba, formulario al
 * centro, accesos de demostración al pie. La validación ocurre antes de salir
 * a la red, y el error del servidor se muestra sobre el botón.
 */

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../src/contexto/AuthContext';
import { validarLogin, hayErrores } from '../src/lib/validaciones';
import { CUENTAS_DEMO } from '../src/datos/demo';
import CampoTexto from '../src/componentes/CampoTexto';
import Boton from '../src/componentes/Boton';
import { MensajeError } from '../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../src/tema';

export default function Login() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();

  const [datos, setDatos] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    // Limpiar el error del campo en cuanto el usuario lo corrige.
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const usarDemo = (cuenta) => {
    setDatos({ email: cuenta.email, password: cuenta.password });
    setErrores({});
    setMensaje(null);
  };

  const enviar = async () => {
    setMensaje(null);

    const encontrados = validarLogin(datos);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setEnviando(true);
    try {
      await iniciarSesion({ email: datos.email.trim().toLowerCase(), password: datos.password });
      router.replace('/(tabs)/inicio');
    } catch (e) {
      setMensaje(e.message);
      if (e.errores) setErrores(e.errores);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.marca}>
            <View style={estilos.logo}>
              <Ionicons name="car-sport" size={30} color="#FFFFFF" />
            </View>
            <Text style={estilos.titulo}>RENT SMART</Text>
            <Text style={estilos.lema}>Alquiler de vehículos · Rosales Rent A Car</Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.encabezado}>Iniciar sesión</Text>
            <Text style={estilos.subencabezado}>
              Ingresa con la cuenta que registraste en el sistema.
            </Text>

            <MensajeError texto={mensaje} />

            <CampoTexto
              etiqueta="Correo electrónico"
              valor={datos.email}
              onChangeText={cambiar('email')}
              error={errores.email}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <CampoTexto
              etiqueta="Contraseña"
              valor={datos.password}
              onChangeText={cambiar('password')}
              error={errores.password}
              placeholder="••••••••"
              secreto
              autoCapitalize="none"
              textContentType="password"
              onSubmitEditing={enviar}
              returnKeyType="go"
            />

            <Boton titulo="Entrar" onPress={enviar} cargando={enviando} />

            <Pressable
              onPress={() => router.push('/recuperar')}
              style={estilos.enlaceCentro}
              accessibilityRole="link"
            >
              <Text style={estilos.enlace}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          <View style={estilos.registro}>
            <Text style={estilos.registroTexto}>¿No tienes cuenta?</Text>
            <Pressable onPress={() => router.push('/registro')} accessibilityRole="link">
              <Text style={[estilos.enlace, { fontWeight: '600' }]}>Regístrate aquí</Text>
            </Pressable>
          </View>

          <View style={estilos.demo}>
            <Text style={estilos.demoTitulo}>CUENTAS DE PRUEBA</Text>
            {CUENTAS_DEMO.map((cuenta) => (
              <Pressable
                key={cuenta.email}
                onPress={() => usarDemo(cuenta)}
                accessibilityRole="button"
                accessibilityLabel={`Usar la cuenta de ${cuenta.rol}`}
                style={({ pressed }) => [estilos.demoFila, pressed && estilos.demoPresionada]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={estilos.demoRol}>{cuenta.rol}</Text>
                  <Text style={estilos.demoEmail}>{cuenta.email}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colores.primario} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.xl, paddingBottom: espacio.xxl },
  marca: { alignItems: 'center', marginTop: espacio.xl, marginBottom: espacio.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radio.lg,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.md,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: colores.texto, letterSpacing: 1 },
  lema: { fontSize: 13, color: colores.textoSuave, marginTop: espacio.xs },
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
  enlaceCentro: { alignItems: 'center', marginTop: espacio.lg },
  enlace: { fontSize: 13, color: colores.primario },
  registro: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espacio.xs + 2,
    marginTop: espacio.xl,
  },
  registroTexto: { fontSize: 13, color: colores.textoSuave },
  demo: {
    marginTop: espacio.xxl,
    backgroundColor: colores.primarioSuave,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    borderRadius: radio.lg,
    padding: espacio.lg,
  },
  demoTitulo: {
    fontSize: 11,
    fontWeight: '700',
    color: colores.primario,
    letterSpacing: 0.8,
    marginBottom: espacio.md,
  },
  demoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    backgroundColor: colores.superficie,
    borderRadius: radio.md,
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.md,
    marginBottom: espacio.sm,
  },
  demoPresionada: { opacity: 0.85 },
  demoRol: { fontSize: 14, fontWeight: '600', color: colores.texto },
  demoEmail: { fontSize: 12, color: colores.textoSuave },
});
