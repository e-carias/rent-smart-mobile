/**
 * Servicio de autenticación.
 *
 * Llama a /auth/login, /auth/registro y /auth/recuperar del mismo API que usa
 * la web. Si el servidor no responde, valida contra las cuentas de
 * demostración para que la pantalla de login siga siendo funcional: el
 * requerimiento 1 pide una pantalla de autenticación operativa, y una
 * demostración no debería depender de que la computadora esté encendida.
 */

import apiClient from './apiClient';
import { USUARIOS, CLIENTES } from '../datos/demo';

/** Token simulado, igual que en la web: el payload en base64 sin firma. */
function tokenLocal(usuario) {
  const payload = {
    sub: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  };
  // btoa existe en el motor de JavaScript de React Native.
  return global.btoa
    ? global.btoa(JSON.stringify(payload))
    : JSON.stringify(payload);
}

function sinPassword(usuario) {
  const copia = { ...usuario };
  delete copia.password;
  return copia;
}

export const AuthService = {
  async iniciarSesion({ email, password }) {
    try {
      return await apiClient.post('/auth/login', { email, password });
    } catch (e) {
      if (!e.esFalloDeRed) throw e;

      const correo = String(email).trim().toLowerCase();
      const usuario = USUARIOS.find((u) => u.email === correo && u.password === password);

      if (!usuario) {
        const err = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
      }

      return {
        usuario: sinPassword(usuario),
        cliente: CLIENTES.find((c) => c.id === usuario.clienteId) || null,
        token: tokenLocal(usuario),
      };
    }
  },

  async registrar(datos) {
    try {
      return await apiClient.post('/auth/registro', datos);
    } catch (e) {
      if (!e.esFalloDeRed) throw e;

      const usuario = {
        id: Date.now() % 100000,
        nombre: datos.nombre,
        email: String(datos.email).trim().toLowerCase(),
        rol: 'cliente',
        clienteId: null,
        activo: 1,
      };

      return {
        usuario,
        cliente: {
          id: usuario.id,
          nombre: datos.nombre,
          documento: datos.documento,
          telefono: datos.telefono,
          email: usuario.email,
        },
        token: tokenLocal(usuario),
      };
    }
  },

  async recuperar(email) {
    try {
      return await apiClient.post('/auth/recuperar', { email });
    } catch (e) {
      if (!e.esFalloDeRed) throw e;
      return { mensaje: 'Si el correo existe, recibirás las instrucciones.' };
    }
  },
};

export default AuthService;
