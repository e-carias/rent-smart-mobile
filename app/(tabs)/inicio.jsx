/**
 * Pantalla 4 · Inicio.
 *
 * Responde a tres preguntas en el orden en que importan al llegar: quién soy,
 * qué tengo pendiente y qué puedo hacer ahora. Por eso el saludo va primero,
 * la próxima reserva después, y la flota disponible al final.
 */

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/contexto/AuthContext';
import VehiculoService from '../../src/servicios/vehiculoService';
import ReservaService from '../../src/servicios/reservaService';
import { dinero, fechaLarga, hoy } from '../../src/lib/formato';
import { ESTADOS_QUE_OCUPAN } from '../../src/lib/negocio';
import TarjetaVehiculo from '../../src/componentes/TarjetaVehiculo';
import Etiqueta from '../../src/componentes/Etiqueta';
import AvisoOrigen from '../../src/componentes/AvisoOrigen';
import { Cargando, ErrorCarga } from '../../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../../src/tema';

export default function Inicio() {
  const router = useRouter();
  const { usuario } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      // Las dos peticiones son independientes: en paralelo tarda la más
      // lenta, no la suma de ambas.
      const [listaVehiculos, listaReservas] = await Promise.all([
        VehiculoService.obtenerVehiculos({ estado: 'disponible' }),
        ReservaService.obtenerReservas(),
      ]);
      setVehiculos(listaVehiculos || []);
      setReservas(listaReservas || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // useFocusEffect recarga al volver a la pestaña, no solo al montarla: si el
  // usuario acaba de crear una reserva, al regresar aquí ya la ve.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const refrescar = () => {
    setRefrescando(true);
    cargar();
  };

  if (cargando) return <Cargando mensaje="Cargando tu información…" />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargar} />;

  const activas = reservas.filter((r) => ESTADOS_QUE_OCUPAN.includes(r.estado));
  const proxima = [...activas].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];
  const gastoTotal = reservas
    .filter((r) => r.estado !== 'cancelada')
    .reduce((suma, r) => suma + Number(r.total || 0), 0);

  return (
    <ScrollView
      contentContainerStyle={estilos.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
    >
      <AvisoOrigen />

      <Text style={estilos.saludo}>Hola, {usuario?.nombre?.split(' ')[0] || 'bienvenido'}</Text>
      <Text style={estilos.fecha}>{fechaLarga(hoy())}</Text>

      <View style={estilos.indicadores}>
        <View style={estilos.indicador}>
          <Text style={estilos.indicadorValor}>{activas.length}</Text>
          <Text style={estilos.indicadorTexto}>Reservas activas</Text>
        </View>
        <View style={estilos.indicador}>
          <Text style={estilos.indicadorValor}>{vehiculos.length}</Text>
          <Text style={estilos.indicadorTexto}>Vehículos libres</Text>
        </View>
        <View style={estilos.indicador}>
          <Text style={estilos.indicadorValor}>{dinero(gastoTotal)}</Text>
          <Text style={estilos.indicadorTexto}>Total contratado</Text>
        </View>
      </View>

      {proxima ? (
        <Pressable
          onPress={() => router.push(`/reserva/${proxima.id}`)}
          style={({ pressed }) => [estilos.proxima, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel={`Próxima reserva: ${proxima.vehiculo}`}
        >
          <View style={estilos.proximaEncabezado}>
            <Text style={estilos.proximaTitulo}>Tu próxima reserva</Text>
            <Etiqueta estado={proxima.estado} />
          </View>
          <Text style={estilos.proximaVehiculo}>{proxima.vehiculo}</Text>
          <Text style={estilos.proximaFecha}>
            Entrega el {fechaLarga(proxima.fechaInicio)} en {proxima.lugarEntrega}
          </Text>
          <View style={estilos.proximaPie}>
            <Text style={estilos.proximaTotal}>{dinero(proxima.total)}</Text>
            <Text style={estilos.proximaEnlace}>Ver detalle →</Text>
          </View>
        </Pressable>
      ) : (
        <View style={estilos.sinReservas}>
          <Ionicons name="calendar-clear-outline" size={22} color={colores.textoTenue} />
          <Text style={estilos.sinReservasTexto}>
            No tienes reservas activas. Elige un vehículo para comenzar.
          </Text>
        </View>
      )}

      <View style={estilos.seccion}>
        <Text style={estilos.seccionTitulo}>Disponibles ahora</Text>
        <Pressable onPress={() => router.push('/(tabs)/vehiculos')} accessibilityRole="link">
          <Text style={estilos.verTodos}>Ver todos</Text>
        </Pressable>
      </View>

      {vehiculos.slice(0, 4).map((v) => (
        <TarjetaVehiculo
          key={v.id}
          vehiculo={v}
          onPress={() => router.push(`/vehiculo/${v.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.lg, paddingBottom: espacio.xxl },
  saludo: { fontSize: 24, fontWeight: '700', color: colores.texto },
  fecha: { fontSize: 13, color: colores.textoSuave, marginTop: 2, marginBottom: espacio.xl },
  indicadores: { flexDirection: 'row', gap: espacio.sm, marginBottom: espacio.xl },
  indicador: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    paddingVertical: espacio.md,
    paddingHorizontal: espacio.sm,
    alignItems: 'center',
    ...sombra,
  },
  indicadorValor: { fontSize: 18, fontWeight: '700', color: colores.primario },
  indicadorTexto: { fontSize: 11, color: colores.textoSuave, marginTop: 2, textAlign: 'center' },
  proxima: {
    backgroundColor: colores.primario,
    borderRadius: radio.lg,
    padding: espacio.lg,
    marginBottom: espacio.xl,
    gap: espacio.xs,
  },
  proximaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacio.xs,
  },
  proximaTitulo: { fontSize: 12, fontWeight: '600', color: '#BFDBFE', letterSpacing: 0.5 },
  proximaVehiculo: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  proximaFecha: { fontSize: 13, color: '#DBEAFE', lineHeight: 18 },
  proximaPie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacio.sm,
    paddingTop: espacio.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  proximaTotal: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  proximaEnlace: { fontSize: 13, fontWeight: '600', color: '#BFDBFE' },
  sinReservas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderStyle: 'dashed',
    borderRadius: radio.lg,
    padding: espacio.lg,
    marginBottom: espacio.xl,
  },
  sinReservasTexto: { flex: 1, fontSize: 13, color: colores.textoSuave, lineHeight: 18 },
  seccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacio.md,
  },
  seccionTitulo: { fontSize: 16, fontWeight: '700', color: colores.texto },
  verTodos: { fontSize: 13, fontWeight: '600', color: colores.primario },
});
