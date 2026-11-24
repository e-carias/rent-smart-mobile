/**
 * Pantalla 8 · Historial de actividad (requerimiento funcional 4).
 *
 * Muestra los registros que la aplicación ha almacenado en la colección
 * `actividad` de Firestore para el usuario autenticado: creación y
 * cancelación de reservas, cambios de estado y actualizaciones de perfil.
 *
 * Es la evidencia visible de que los datos se persisten en la nube y quedan
 * asociados a quien los generó: al cerrar sesión y volver a entrar desde
 * otro dispositivo, el historial sigue ahí.
 */

import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/contexto/AuthContext';
import ActividadService from '../../src/servicios/actividadService';
import AvisoOrigen from '../../src/componentes/AvisoOrigen';
import { Cargando, ErrorCarga, Vacio } from '../../src/componentes/Estados';
import { dinero } from '../../src/lib/formato';
import { colores, espacio, radio, sombra } from '../../src/tema';

/** "hace 5 minutos", "ayer", "12 de octubre" según la distancia temporal. */
function cuandoFue(fecha) {
  if (!fecha) return 'Hace un momento';

  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.round(horas / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;

  return fecha.toLocaleDateString('es-SV', { day: 'numeric', month: 'long' });
}

function Registro({ item, esUltimo }) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.columnaLinea}>
        <View style={estilos.punto}>
          <Ionicons name={item.icono} size={14} color={colores.primario} />
        </View>
        {!esUltimo && <View style={estilos.linea} />}
      </View>

      <View style={[estilos.tarjeta, esUltimo && { marginBottom: 0 }]}>
        <View style={estilos.encabezado}>
          <Text style={estilos.etiqueta}>{item.etiqueta}</Text>
          <Text style={estilos.cuando}>{cuandoFue(item.fecha)}</Text>
        </View>
        <Text style={estilos.descripcion}>{item.descripcion}</Text>
        {item.monto != null && (
          <Text style={estilos.monto}>{dinero(item.monto)}</Text>
        )}
      </View>
    </View>
  );
}

export default function Historial() {
  const { uid } = useAuth();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!uid) return;
    setError(null);
    try {
      setRegistros((await ActividadService.obtenerHistorial(uid)) || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const resumen = useMemo(() => {
    const reservas = registros.filter((r) => r.accion === 'reserva_creada').length;
    const canceladas = registros.filter((r) => r.accion === 'reserva_cancelada').length;
    return { total: registros.length, reservas, canceladas };
  }, [registros]);

  if (cargando) return <Cargando mensaje="Cargando tu historial…" />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={cargar} />;

  return (
    <FlatList
      data={registros}
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
      ListHeaderComponent={
        <>
          <AvisoOrigen />
          {registros.length > 0 && (
            <View style={estilos.indicadores}>
              <View style={estilos.indicador}>
                <Text style={estilos.indicadorValor}>{resumen.total}</Text>
                <Text style={estilos.indicadorTexto}>Registros</Text>
              </View>
              <View style={estilos.indicador}>
                <Text style={estilos.indicadorValor}>{resumen.reservas}</Text>
                <Text style={estilos.indicadorTexto}>Reservas creadas</Text>
              </View>
              <View style={estilos.indicador}>
                <Text style={estilos.indicadorValor}>{resumen.canceladas}</Text>
                <Text style={estilos.indicadorTexto}>Canceladas</Text>
              </View>
            </View>
          )}
        </>
      }
      renderItem={({ item, index }) => (
        <Registro item={item} esUltimo={index === registros.length - 1} />
      )}
      ListEmptyComponent={
        <Vacio
          icono="time-outline"
          titulo="Todavía no hay movimientos"
          descripcion="Cuando reserves o canceles un vehículo, el registro quedará guardado aquí."
        />
      }
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: espacio.lg, paddingBottom: espacio.xxl, flexGrow: 1 },
  indicadores: { flexDirection: 'row', gap: espacio.sm, marginBottom: espacio.xl },
  indicador: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderWidth: 1, borderColor: colores.borde, borderRadius: radio.md,
    paddingVertical: espacio.md, paddingHorizontal: espacio.sm,
    alignItems: 'center', ...sombra,
  },
  indicadorValor: { fontSize: 18, fontWeight: '700', color: colores.primario },
  indicadorTexto: { fontSize: 11, color: colores.textoSuave, marginTop: 2, textAlign: 'center' },

  fila: { flexDirection: 'row', gap: espacio.md },
  columnaLinea: { alignItems: 'center', width: 32 },
  punto: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center', justifyContent: 'center',
  },
  linea: { flex: 1, width: 2, backgroundColor: colores.borde, marginVertical: 4 },

  tarjeta: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderWidth: 1, borderColor: colores.borde, borderRadius: radio.lg,
    padding: espacio.md, marginBottom: espacio.md, gap: 3, ...sombra,
  },
  encabezado: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: espacio.sm,
  },
  etiqueta: { flex: 1, fontSize: 14, fontWeight: '600', color: colores.texto },
  cuando: { fontSize: 11, color: colores.textoTenue },
  descripcion: { fontSize: 13, color: colores.textoSuave, lineHeight: 18 },
  monto: { fontSize: 14, fontWeight: '700', color: colores.primario, marginTop: 2 },
});
