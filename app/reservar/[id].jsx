/**
 * Pantalla 9 · Nueva reserva (requerimiento funcional 4: validaciones).
 *
 * La cotización se recalcula en cada cambio de fecha con `calcularTarifa`, la
 * misma fórmula del servidor. El usuario ve el precio antes de confirmar, no
 * después: es la queja más repetida del proceso manual que el sistema sustituye.
 */

import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/contexto/AuthContext';
import VehiculoService from '../../src/servicios/vehiculoService';
import ReservaService from '../../src/servicios/reservaService';
import { validarReserva, hayErrores } from '../../src/lib/validaciones';
import { calcularTarifa } from '../../src/lib/negocio';
import { dinero, hoy, sumarDias } from '../../src/lib/formato';
import { LUGARES_ENTREGA } from '../../src/datos/demo';
import CampoFecha from '../../src/componentes/CampoFecha';
import CampoTexto from '../../src/componentes/CampoTexto';
import Boton from '../../src/componentes/Boton';
import { Cargando, ErrorCarga, MensajeError } from '../../src/componentes/Estados';
import { colores, espacio, radio, sombra } from '../../src/tema';

export default function NuevaReserva() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cliente, usuario } = useAuth();

  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(sumarDias(hoy(), 1));
  const [fechaFin, setFechaFin] = useState(sumarDias(hoy(), 4));
  const [lugarEntrega, setLugarEntrega] = useState(LUGARES_ENTREGA[0]);
  const [observaciones, setObservaciones] = useState('');

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setErrorCarga(null);
    try {
      const datos = await VehiculoService.obtenerVehiculo(id);
      if (!datos) setErrorCarga('El vehículo no existe.');
      else setVehiculo(datos);
    } catch (e) {
      setErrorCarga(e.message);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // useMemo evita recalcular la tarifa en cada dibujado; solo cuando cambian
  // las fechas o el precio del vehículo.
  const tarifa = useMemo(
    () => (vehiculo ? calcularTarifa(vehiculo.precioPorDia, fechaInicio, fechaFin) : null),
    [vehiculo, fechaInicio, fechaFin]
  );

  const cambiarInicio = (nueva) => {
    setFechaInicio(nueva);
    // Mantener la coherencia: si el inicio pasa de la devolución, se empuja.
    if (nueva >= fechaFin) setFechaFin(sumarDias(nueva, 1));
    setErrores((e) => ({ ...e, fechaInicio: undefined, fechaFin: undefined }));
  };

  const confirmar = async () => {
    setMensaje(null);

    const datos = {
      vehiculoId: vehiculo.id,
      clienteId: cliente?.id ?? usuario?.clienteId ?? usuario?.id,
      fechaInicio,
      fechaFin,
      lugarEntrega,
      observaciones: observaciones.trim(),
    };

    const encontrados = validarReserva(datos);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setEnviando(true);
    try {
      const reserva = await ReservaService.crearReserva(datos);

      Alert.alert(
        'Reserva creada',
        `Tu reserva ${reserva.codigo} quedó registrada por ${dinero(reserva.total)}.`,
        [{ text: 'Ver mis reservas', onPress: () => router.replace('/(tabs)/reservas') }]
      );
    } catch (e) {
      // 409 = el vehículo ya está tomado en esas fechas.
      setMensaje(e.message);
      if (e.errores) setErrores(e.errores);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <Cargando mensaje="Preparando la reserva…" />;
  if (errorCarga) return <ErrorCarga mensaje={errorCarga} onReintentar={cargar} />;

  return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <View style={estilos.resumen}>
        <View style={estilos.miniatura}>
          <Ionicons name="car-sport" size={24} color={colores.primario} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.resumenTitulo}>
            {vehiculo.marca} {vehiculo.modelo}
          </Text>
          <Text style={estilos.resumenDetalle}>
            {vehiculo.categoria} · {dinero(vehiculo.precioPorDia)} por día
          </Text>
        </View>
      </View>

      <MensajeError texto={mensaje} />

      <Text style={estilos.seccion}>Fechas del alquiler</Text>

      <CampoFecha
        etiqueta="Fecha de entrega"
        valor={fechaInicio}
        onChange={cambiarInicio}
        minimo={hoy()}
        error={errores.fechaInicio}
      />

      <CampoFecha
        etiqueta="Fecha de devolución"
        valor={fechaFin}
        onChange={(v) => {
          setFechaFin(v);
          setErrores((e) => ({ ...e, fechaFin: undefined }));
        }}
        minimo={sumarDias(fechaInicio, 1)}
        error={errores.fechaFin}
      />

      <Text style={estilos.seccion}>Lugar de entrega</Text>
      <View style={estilos.lugares}>
        {LUGARES_ENTREGA.map((lugar) => {
          const activo = lugarEntrega === lugar;
          return (
            <Pressable
              key={lugar}
              onPress={() => setLugarEntrega(lugar)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activo }}
              style={[estilos.lugar, activo && estilos.lugarActivo]}
            >
              <Ionicons
                name={activo ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={activo ? colores.primario : colores.textoTenue}
              />
              <Text style={[estilos.lugarTexto, activo && estilos.lugarTextoActivo]}>{lugar}</Text>
            </Pressable>
          );
        })}
      </View>
      {errores.lugarEntrega ? <Text style={estilos.error}>{errores.lugarEntrega}</Text> : null}

      <Text style={[estilos.seccion, { marginTop: espacio.xl }]}>Observaciones</Text>
      <CampoTexto
        etiqueta="Indicaciones para el operador (opcional)"
        valor={observaciones}
        onChangeText={setObservaciones}
        placeholder="Ejemplo: entrega en el mostrador de llegadas."
        multiline
        numberOfLines={3}
      />

      <View style={estilos.cotizacion}>
        <Text style={estilos.cotizacionTitulo}>Resumen del cobro</Text>

        <View style={estilos.linea}>
          <Text style={estilos.lineaEtiqueta}>
            {tarifa.dias} {tarifa.dias === 1 ? 'día' : 'días'} × {dinero(tarifa.tarifaDiaria)}
          </Text>
          <Text style={estilos.lineaValor}>{dinero(tarifa.bruto)}</Text>
        </View>

        {tarifa.descuento > 0 && (
          <View style={estilos.linea}>
            <Text style={[estilos.lineaEtiqueta, { color: colores.exito }]}>
              Descuento por volumen ({tarifa.porcentajeDescuento * 100} %)
            </Text>
            <Text style={[estilos.lineaValor, { color: colores.exito }]}>
              −{dinero(tarifa.descuento)}
            </Text>
          </View>
        )}

        <View style={estilos.linea}>
          <Text style={estilos.lineaEtiqueta}>Subtotal</Text>
          <Text style={estilos.lineaValor}>{dinero(tarifa.subtotal)}</Text>
        </View>

        <View style={estilos.linea}>
          <Text style={estilos.lineaEtiqueta}>IVA (13 %)</Text>
          <Text style={estilos.lineaValor}>{dinero(tarifa.impuesto)}</Text>
        </View>

        <View style={[estilos.linea, estilos.lineaTotal]}>
          <Text style={estilos.totalEtiqueta}>Total</Text>
          <Text style={estilos.totalValor}>{dinero(tarifa.total)}</Text>
        </View>

        <Text style={estilos.deposito}>
          Depósito en garantía al retirar el vehículo: {dinero(tarifa.deposito)} (20 % del total,
          reembolsable).
        </Text>
      </View>

      <Boton titulo="Confirmar reserva" onPress={confirmar} cargando={enviando} />

      <Text style={estilos.nota}>
        La disponibilidad se verifica en el servidor al confirmar. Si otra persona reservó el
        vehículo en esas fechas, se te avisará aquí mismo.
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.lg, paddingBottom: espacio.xxl, backgroundColor: colores.fondo },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.lg,
    padding: espacio.md,
    marginBottom: espacio.xl,
    ...sombra,
  },
  miniatura: {
    width: 48,
    height: 48,
    borderRadius: radio.md,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumenTitulo: { fontSize: 15, fontWeight: '600', color: colores.texto },
  resumenDetalle: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  seccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoTenue,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: espacio.md,
  },
  lugares: { gap: espacio.sm },
  lugar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    paddingHorizontal: espacio.md,
    minHeight: 48,
  },
  lugarActivo: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  lugarTexto: { fontSize: 14, color: colores.textoSuave },
  lugarTextoActivo: { color: colores.primario, fontWeight: '600' },
  error: { marginTop: espacio.xs, fontSize: 12, color: colores.error },
  cotizacion: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.primarioBorde,
    borderRadius: radio.lg,
    padding: espacio.lg,
    marginBottom: espacio.xl,
    ...sombra,
  },
  cotizacionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.primario,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: espacio.md,
  },
  linea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: espacio.xs + 2,
  },
  lineaEtiqueta: { flex: 1, fontSize: 13, color: colores.textoSuave },
  lineaValor: { fontSize: 13, fontWeight: '500', color: colores.texto },
  lineaTotal: {
    marginTop: espacio.sm,
    paddingTop: espacio.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  totalEtiqueta: { fontSize: 15, fontWeight: '700', color: colores.texto },
  totalValor: { fontSize: 20, fontWeight: '800', color: colores.primario },
  deposito: {
    fontSize: 11,
    color: colores.textoTenue,
    lineHeight: 16,
    marginTop: espacio.md,
    paddingTop: espacio.sm,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  nota: {
    fontSize: 11,
    color: colores.textoTenue,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: espacio.lg,
  },
});
