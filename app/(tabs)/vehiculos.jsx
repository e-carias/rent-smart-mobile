/**
 * Pantalla 5 · Catálogo de vehículos.
 *
 * Buscador + filtros por categoría + lista. Se usa FlatList y no un ScrollView
 * con .map(): FlatList solo dibuja las filas visibles, y con una flota grande
 * esa diferencia es la que separa una lista fluida de una que se traba.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import VehiculoService from '../../src/servicios/vehiculoService';
import TarjetaVehiculo from '../../src/componentes/TarjetaVehiculo';
import AvisoOrigen from '../../src/componentes/AvisoOrigen';
import { Cargando, ErrorCarga, Vacio } from '../../src/componentes/Estados';
import { colores, espacio, radio } from '../../src/tema';

export default function Vehiculos() {
  const router = useRouter();

  const [vehiculos, setVehiculos] = useState([]);
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setVehiculos((await VehiculoService.obtenerVehiculos()) || []);
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

  const categorias = useMemo(
    () => [...new Set(vehiculos.map((v) => v.categoria))].sort(),
    [vehiculos]
  );

  /**
   * El filtrado se hace en memoria y no con una petición por tecla: la flota
   * cabe entera en el teléfono y así la búsqueda responde al instante, sin
   * depender de la red.
   */
  const filtrados = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();

    return vehiculos.filter((v) => {
      if (soloDisponibles && v.estado !== 'disponible') return false;
      if (categoria && v.categoria !== categoria) return false;
      if (!busqueda) return true;
      return [v.marca, v.modelo, v.placa, v.categoria, v.color]
        .join(' ')
        .toLowerCase()
        .includes(busqueda);
    });
  }, [vehiculos, texto, categoria, soloDisponibles]);

  if (cargando) return <Cargando mensaje="Cargando la flota…" />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargar} />;

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.cabecera}>
        <View style={estilos.buscador}>
          <Ionicons name="search" size={18} color={colores.textoTenue} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Marca, modelo o placa"
            placeholderTextColor={colores.textoTenue}
            style={estilos.entrada}
            autoCapitalize="none"
            accessibilityLabel="Buscar vehículo"
          />
          {texto.length > 0 && (
            <Pressable onPress={() => setTexto('')} hitSlop={10} accessibilityLabel="Limpiar">
              <Ionicons name="close-circle" size={18} color={colores.textoTenue} />
            </Pressable>
          )}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['', ...categorias]}
          keyExtractor={(c) => c || 'todas'}
          contentContainerStyle={estilos.filtros}
          renderItem={({ item }) => {
            const activo = categoria === item;
            return (
              <Pressable
                onPress={() => setCategoria(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={[estilos.chip, activo && estilos.chipActivo]}
              >
                <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                  {item || 'Todas'}
                </Text>
              </Pressable>
            );
          }}
        />

        <Pressable
          onPress={() => setSoloDisponibles((v) => !v)}
          style={estilos.interruptor}
          accessibilityRole="switch"
          accessibilityState={{ checked: soloDisponibles }}
        >
          <Ionicons
            name={soloDisponibles ? 'checkbox' : 'square-outline'}
            size={18}
            color={soloDisponibles ? colores.primario : colores.textoTenue}
          />
          <Text style={estilos.interruptorTexto}>Mostrar solo disponibles</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(v) => String(v.id)}
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
        ListHeaderComponent={
          <>
            <AvisoOrigen />
            <Text style={estilos.conteo}>
              {filtrados.length} {filtrados.length === 1 ? 'vehículo' : 'vehículos'}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <TarjetaVehiculo vehiculo={item} onPress={() => router.push(`/vehiculo/${item.id}`)} />
        )}
        ListEmptyComponent={
          <Vacio
            icono="car-outline"
            titulo="Sin resultados"
            descripcion="Prueba con otra marca o quita los filtros."
          />
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  cabecera: {
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingTop: espacio.md,
  },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    paddingHorizontal: espacio.md,
    marginHorizontal: espacio.lg,
    minHeight: 44,
  },
  entrada: { flex: 1, fontSize: 15, color: colores.texto, paddingVertical: espacio.sm },
  filtros: { paddingHorizontal: espacio.lg, paddingVertical: espacio.md, gap: espacio.sm },
  chip: {
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.sm,
    borderRadius: radio.completo,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { fontSize: 13, fontWeight: '600', color: colores.textoSuave },
  chipTextoActivo: { color: '#FFFFFF' },
  interruptor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    paddingHorizontal: espacio.lg,
    paddingBottom: espacio.md,
  },
  interruptorTexto: { fontSize: 13, color: colores.textoSuave },
  lista: { padding: espacio.lg, paddingBottom: espacio.xxl },
  conteo: { fontSize: 12, color: colores.textoTenue, marginBottom: espacio.md },
});
