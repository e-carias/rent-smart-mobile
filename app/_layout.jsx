/**
 * Raíz de la navegación (expo-router).
 *
 * expo-router usa enrutamiento por archivos, igual que el App Router de
 * Next.js que ya emplea la versión web: cada archivo de esta carpeta es una
 * ruta. Eso hace que la estructura de navegación de la app móvil sea legible
 * sin abrir un solo archivo de configuración.
 *
 * Este layout monta el proveedor de sesión y decide, cada vez que cambia la
 * ruta, si el usuario puede estar donde está.
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '../src/contexto/AuthContext';
import { Cargando } from '../src/componentes/Estados';
import { colores } from '../src/tema';

/**
 * Guardia de rutas. Es el equivalente móvil de `RutaProtegida.jsx` de la web:
 * sin sesión no se entra al módulo principal, y con sesión no se vuelve al
 * login con el botón de atrás.
 */
function Guardia() {
  const { autenticado, cargando } = useAuth();
  const segmentos = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    const enZonaPrivada = segmentos[0] === '(tabs)' || segmentos[0] === 'vehiculo'
      || segmentos[0] === 'reservar' || segmentos[0] === 'reserva';

    if (!autenticado && enZonaPrivada) router.replace('/login');
    else if (autenticado && !enZonaPrivada) router.replace('/(tabs)/inicio');
  }, [autenticado, cargando, segmentos, router]);

  if (cargando) return <Cargando mensaje="Preparando la aplicación…" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
      <Stack.Screen name="recuperar" options={{ title: 'Recuperar contraseña' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="vehiculo/[id]" options={{ title: 'Detalle del vehículo' }} />
      <Stack.Screen name="reservar/[id]" options={{ title: 'Nueva reserva' }} />
      <Stack.Screen name="reserva/[id]" options={{ title: 'Detalle de la reserva' }} />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Guardia />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
