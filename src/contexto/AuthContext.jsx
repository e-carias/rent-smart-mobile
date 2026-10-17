/**
 * Estado global de sesión.
 *
 * Context API + useReducer, igual que `app/context/AuthContext.jsx` de la
 * versión web. Se eligió sobre Redux por la misma razón: la aplicación tiene
 * un solo dominio de estado compartido (quién inició sesión) y Redux
 * agregaría tres archivos por cada acción sin resolver nada adicional.
 *
 * La sesión se guarda con AsyncStorage para que al cerrar y volver a abrir la
 * app el usuario siga dentro, que es lo que espera cualquiera en un teléfono.
 */

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthService from '../servicios/authService';
import { guardarToken } from '../servicios/apiClient';

const CLAVE_SESION = 'rentsmart.sesion';

const ESTADO_INICIAL = {
  usuario: null,
  cliente: null,
  cargando: true, // true mientras se lee la sesión guardada
};

function reductor(estado, accion) {
  switch (accion.tipo) {
    case 'SESION_RESTAURADA':
      return {
        usuario: accion.usuario ?? null,
        cliente: accion.cliente ?? null,
        cargando: false,
      };
    case 'ENTRO':
      return { usuario: accion.usuario, cliente: accion.cliente ?? null, cargando: false };
    case 'SALIO':
      return { usuario: null, cliente: null, cargando: false };
    case 'PERFIL_ACTUALIZADO':
      return { ...estado, cliente: { ...estado.cliente, ...accion.cambios } };
    default:
      return estado;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [estado, despachar] = useReducer(reductor, ESTADO_INICIAL);

  // Al arrancar la app se busca una sesión guardada en el teléfono.
  useEffect(() => {
    let vigente = true;

    (async () => {
      try {
        const crudo = await AsyncStorage.getItem(CLAVE_SESION);
        const guardada = crudo ? JSON.parse(crudo) : null;
        if (vigente) {
          despachar({
            tipo: 'SESION_RESTAURADA',
            usuario: guardada?.usuario,
            cliente: guardada?.cliente,
          });
        }
      } catch {
        if (vigente) despachar({ tipo: 'SESION_RESTAURADA' });
      }
    })();

    return () => {
      vigente = false;
    };
  }, []);

  const valor = useMemo(
    () => ({
      ...estado,
      autenticado: Boolean(estado.usuario),
      rol: estado.usuario?.rol ?? null,

      async iniciarSesion(credenciales) {
        const datos = await AuthService.iniciarSesion(credenciales);
        await guardarToken(datos.token);
        await AsyncStorage.setItem(
          CLAVE_SESION,
          JSON.stringify({ usuario: datos.usuario, cliente: datos.cliente })
        );
        despachar({ tipo: 'ENTRO', usuario: datos.usuario, cliente: datos.cliente });
        return datos.usuario;
      },

      async registrar(formulario) {
        const datos = await AuthService.registrar(formulario);
        await guardarToken(datos.token);
        await AsyncStorage.setItem(
          CLAVE_SESION,
          JSON.stringify({ usuario: datos.usuario, cliente: datos.cliente })
        );
        despachar({ tipo: 'ENTRO', usuario: datos.usuario, cliente: datos.cliente });
        return datos.usuario;
      },

      async cerrarSesion() {
        await guardarToken(null);
        await AsyncStorage.removeItem(CLAVE_SESION);
        despachar({ tipo: 'SALIO' });
      },

      actualizarPerfil(cambios) {
        despachar({ tipo: 'PERFIL_ACTUALIZADO', cambios });
      },
    }),
    [estado]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return contexto;
}

export default AuthContext;
