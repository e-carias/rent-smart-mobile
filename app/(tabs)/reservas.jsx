/**
 * Pantalla 6 · Mis reservas.
 *
 * Las reservas se agrupan por situación, no por fecha: primero las que
 * todavía pueden pasar algo (activas) y después el historial. Es la pregunta
 * que trae al usuario a esta pantalla.
 */

import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import ReservaService from '../../src/servicios/reservaService';
import TarjetaReserva from '../../src/componentes/TarjetaReserva';
import AvisoOrigen from '../../src/componentes/AvisoOrigen';
import Boton from '../../src/componentes/Boton';
import { Cargando, ErrorCarga, Vacio } from '../../src/componentes/Estados';
import { ESTADOS_QUE_OCUPAN } from '../../src/lib/negocio';
import { colores, espacio, radio } from '../../src/tema';

const PESTANAS = [
  { clave: 'activas', texto: 'Activas' },
  { clave: 'historial', texto: 'Historial' },
];

export default function Reservas() {
  const router = useRouter();

  const [reservas, setReservas] = useState([]);
  const [pestana, setPestana] = useState('activas');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setReservas((await ReservaService.obtenerReservas()) || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const visibles = useMemo(() => {
    const activa = (r) => ESTADOS_QUE_OCUPAN.includes(r.estado);
    const lista = reservas.filter((r) => (pestana === 'activas' ? activa(r) : !activa(r)));
    return lista.sort((a, b) => String(b.fechaInicio).localeCompare(String(a.fechaInicio)));
  }, [reservas, pestana]);

  if (cargando) return <Cargando mensaje="Cargando tus reservas…" />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargar} />;

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.pestanas}>
        {PESTANAS.map((p) => {
          const activa = pestana === p.clave;
          return (
            <Pressable
              key={p.clave}
              onPress={() => setPestana(p.clave)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              style={[estilos.pestana, activa && estilos.pestanaActiva]}
            >
              <Text style={[estilos.pestanaTexto, activa && estilos.pestanaTextoActivo]}>
                {p.texto}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargar();
            }}
          />
        }
        ListHeaderComponent={<AvisoOrigen />}
        renderItem={({ item }) => (
          <TarjetaReserva reserva={item} onPress={() => router.push(`/reserva/${item.id}`)} />
        )}
        ListEmptyComponent={
          <Vacio
            icono="calendar-outline"
            titulo={pestana === 'activas' ? 'No tienes reservas activas' : 'Sin historial'}
            descripcion={
              pestana === 'activas'
                ? 'Cuando reserves un vehículo aparecerá aquí.'
                : 'Las reservas finalizadas o canceladas se guardan en esta pestaña.'
            }
            accion={
              pestana === 'activas' ? (
                <Boton
                  titulo="Ver vehículos"
                  onPress={() => router.push('/(tabs)/vehiculos')}
                />
              ) : null
            }
          />
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  pestanas: {
    flexDirection: 'row',
    gap: espacio.sm,
    padding: espacio.lg,
    paddingBottom: espacio.md,
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  pestana: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: espacio.md,
    borderRadius: radio.md,
    backgroundColor: colores.fondo,
  },
  pestanaActiva: { backgroundColor: colores.primarioSuave },
  pestanaTexto: { fontSize: 14, fontWeight: '600', color: colores.textoSuave },
  pestanaTextoActivo: { color: colores.primario },
  lista: { padding: espacio.lg, paddingBottom: espacio.xxl, flexGrow: 1 },
});
