# RENT SMART · Aplicación móvil

Versión móvil del sistema de alquiler de vehículos de Rosales Rent A Car,
construida con **React Native** sobre **Expo**. La autenticación y la
persistencia de datos se resuelven con **Firebase Authentication** y
**Cloud Firestore**.

| | |
| --- | --- |
| Asignatura | Diseño y Programación de Software Multiplataforma |
| Institución | Universidad Don Bosco · grupo 02T |
| Entrega | Avance 2 · Foro de Discusión 2 |
| Tecnología | React Native 0.86 · Expo SDK 57 · expo-router 57 · Firebase 13 |
| Lenguaje | JavaScript (.js / .jsx) |

> **El proyecto está en la raíz de este repositorio.** Todos los comandos de
> esta guía se ejecutan desde la carpeta que contiene este archivo; no hay
> que entrar a ninguna subcarpeta.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Instalación](#2-instalación)
3. [Configurar Firebase](#3-configurar-firebase)
4. [Cargar el catálogo inicial](#4-cargar-el-catálogo-inicial)
5. [Ejecutar la aplicación](#5-ejecutar-la-aplicación)
6. [Pruebas automatizadas](#6-pruebas-automatizadas)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Arquitectura](#8-arquitectura)
9. [Modelo de datos y seguridad](#9-modelo-de-datos-y-seguridad)
10. [Problemas frecuentes](#10-problemas-frecuentes)

---

## 1. Requisitos

- **Node.js 20.19.4 o superior** — comprueba con `node -v`.
- **Expo Go** en un teléfono Android o iPhone (gratuita en Play Store y App Store).
  El teléfono y la computadora deben estar en la misma red Wi-Fi.
- Una cuenta de Google para crear el proyecto de Firebase (gratuita).

No hace falta Android Studio ni Xcode: Expo Go ejecuta la aplicación sin compilar.

---

## 2. Instalación

```bash
npm install
```

Las versiones de `react`, `react-dom`, `react-native` y los paquetes de Expo
están **fijadas a versiones exactas y compatibles entre sí**, de modo que la
instalación estándar funciona sin `--force` ni `--legacy-peer-deps`.

---

## 3. Configurar Firebase

La aplicación necesita un proyecto propio de Firebase. Son unos diez minutos.

### 3.1 Crear el proyecto

1. Entra a [console.firebase.google.com](https://console.firebase.google.com)
   y pulsa **Agregar proyecto**. Nómbralo `rent-smart` y continúa
   (puedes desactivar Google Analytics).
2. En la pantalla inicial del proyecto, pulsa el icono **web** (`</>`) para
   registrar una aplicación web. Ponle cualquier apodo y pulsa **Registrar**.
3. Firebase muestra un bloque `firebaseConfig`. **No cierres esa pantalla**:
   esos valores van al paso 3.4.

### 3.2 Activar los métodos de acceso

En **Compilación → Authentication → Comenzar**, pestaña **Sign-in method**:

- Habilita **Correo electrónico/contraseña**.
- Habilita **Google** y selecciona un correo de soporte del proyecto.

### 3.3 Crear la base de datos

En **Compilación → Firestore Database → Crear base de datos**:

- Elige **modo de producción** y la ubicación más cercana.
- Abre la pestaña **Reglas**, pega el contenido de
  [`firestore.rules`](../firestore.rules) de este repositorio y pulsa **Publicar**.

### 3.4 Escribir el archivo `.env`

```bash
cp .env.example .env
```

Abre `.env` y pega los valores del bloque `firebaseConfig` del paso 3.1:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rent-smart-xxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rent-smart-xxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rent-smart-xxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef
```

> Estas claves **no son secretas**: identifican el proyecto, no autorizan
> operaciones. Quien autoriza es `firestore.rules` (en la raíz del repositorio), que se evalúa en el
> servidor. Aun así, `.env` está excluido del repositorio porque también
> guarda la contraseña del script de carga.

### 3.5 Acceso con Google (opcional)

El acceso por correo y contraseña ya funciona. Para habilitar el botón de
Google hacen falta identificadores de cliente OAuth:

1. Entra a [console.cloud.google.com](https://console.cloud.google.com),
   selecciona tu proyecto de Firebase y abre
   **APIs y servicios → Credenciales**.
2. **Crear credenciales → ID de cliente de OAuth → Aplicación web**.
   En *URI de redireccionamiento autorizados* agrega `https://auth.expo.io/@tu-usuario-expo/rent-smart-movil`.
3. Copia el identificador en `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` dentro de `.env`.

Si estas variables quedan vacías, el botón de Google **no se muestra** y el
resto de la aplicación funciona con normalidad.

---

## 4. Cargar el catálogo inicial

Firestore empieza vacío. El script `npm run seed` escribe los ocho vehículos
de la flota, pero las reglas de seguridad solo permiten escribir en
`vehiculos` a un administrador:

1. Abre la aplicación y **regístrate** con tu correo (paso 5).
2. En la consola de Firebase, abre **Firestore → usuarios → {tu uid}** y
   cambia el campo `rol` de `cliente` a `administrador`.
3. Añade a `.env`:

   ```
   SEED_EMAIL=tu-correo@ejemplo.com
   SEED_PASSWORD=tu-contraseña
   ```

4. Ejecuta:

   ```bash
   npm run seed
   ```

El script inicia sesión, escribe los vehículos y comprueba el resultado.

---

## 5. Ejecutar la aplicación

```bash
npm start
```

Aparece un código QR:

- **Android:** abre Expo Go y pulsa *Scan QR code*.
- **iPhone:** escanea el QR con la cámara del sistema.

Otros comandos:

| Comando | Para qué |
| --- | --- |
| `npm run android` | Abre en el emulador de Android |
| `npm run ios` | Abre en el simulador de iOS (solo macOS) |
| `npm run web` | Abre en el navegador |
| `npm run limpiar` | Arranca vaciando la caché del empaquetador |

> La opción web está **plenamente soportada**: `react-dom` y `react-native-web`
> figuran entre las dependencias y la exportación estática se verifica con
> `npx expo export --platform web`.

Tras cambiar `.env` hay que reiniciar el servidor: Expo inyecta las variables
al construir el paquete.

---

## 6. Pruebas automatizadas

```bash
npm test              # ejecuta la suite
npm run test:informe  # ejecuta la suite y escribe PRUEBAS.md
```

| Archivo | Qué verifica |
| --- | --- |
| `pruebas/validaciones.test.js` | Reglas de los formularios de acceso, registro y reserva |
| `pruebas/autenticacion.test.js` | Inicio de sesión, registro, Google y traducción de errores |
| `pruebas/reservas.test.js` | Creación, traslape de fechas, cancelación y máquina de estados |
| `pruebas/vehiculos.test.js` | Contrato de los datos del vehículo frente a documentos incompletos |
| `pruebas/negocio.test.js` | Tarifa por volumen, IVA, depósito y solape de intervalos |

Firebase se sustituye por dobles de prueba: lo que se verifica es la lógica
propia, no el servicio de Google. El informe **[PRUEBAS.md](PRUEBAS.md)**
recoge el resultado observado de cada caso, con fecha, entorno y duración.

---

## 7. Estructura del proyecto

```
.
├── app/                        Rutas (expo-router: un archivo = una pantalla)
│   ├── _layout.jsx             Proveedor de sesión y guardia de rutas
│   ├── index.jsx               Redirección de entrada
│   ├── login.jsx               Acceso con correo y con Google
│   ├── registro.jsx            Alta de cuenta
│   ├── recuperar.jsx           Restablecimiento de contraseña
│   ├── (tabs)/                 Módulo principal, cinco pestañas
│   │   ├── inicio.jsx          Resumen del cliente
│   │   ├── vehiculos.jsx       Catálogo con búsqueda y filtros
│   │   ├── reservas.jsx        Reservas activas e historial
│   │   ├── historial.jsx       Bitácora de registros almacenados
│   │   └── perfil.jsx          Perfil, proveedor de acceso y estado de conexión
│   ├── vehiculo/[id].jsx       Detalle del vehículo
│   ├── reservar/[id].jsx       Nueva reserva con cotización en vivo
│   └── reserva/[id].jsx        Detalle y cancelación
│
├── src/
│   ├── firebase/               Inicialización de Firebase (único punto)
│   ├── servicios/              Un servicio por entidad; nadie más habla con Firebase
│   ├── contexto/               AuthContext sobre onAuthStateChanged
│   ├── componentes/            Botón, campos, tarjetas, estados
│   ├── lib/                    Validaciones, formato y reglas de negocio
│   ├── datos/                  Datos de respaldo sin conexión
│   └── tema.js                 Tokens de diseño tomados de Figma
│
├── pruebas/                    Suite de Jest
├── scripts/                    Carga del catálogo e informe de pruebas
└── ../firestore.rules          Reglas de seguridad del servidor (compartidas)
```

---

## 8. Arquitectura

```
Pantalla → Servicio → SDK de Firebase → Firebase Auth / Cloud Firestore
                 ↓ (si no hay red)
            datos de respaldo locales
```

Ninguna pantalla importa `firebase/auth` ni `firebase/firestore`: llama al
servicio correspondiente. Esa separación es la que permitió sustituir el API
REST sobre MySQL de la entrega anterior por Firestore **sin modificar la capa
de presentación**.

| Decisión | Motivo |
| --- | --- |
| Firebase Authentication sobre un API propio | Contraseñas con `scrypt` y tokens JWT firmados, en lugar de texto plano y un token simulado |
| Cloud Firestore sobre MySQL | La aplicación deja de depender de un servidor local encendido y de la IP de la red |
| Reglas de seguridad en el servidor | La autorización no depende de que el cliente se comporte bien |
| `onAuthStateChanged` sobre guardar la sesión a mano | Firebase renueva el token y avisa; se elimina el estado de sesión divergente |
| Context API + `useReducer` sobre Redux | Un solo dominio de estado compartido |
| `FlatList` sobre recorrer con `map` | Solo dibuja las filas visibles |

---

## 9. Modelo de datos y seguridad

| Colección | Documento | Contenido |
| --- | --- | --- |
| `usuarios` | `{uid}` | Nombre, correo, DUI, teléfono y rol |
| `vehiculos` | `{id}` | Flota: marca, modelo, placa, precio y estado |
| `reservas` | automático | Reserva con `uid`, fechas, importes y estado |
| `contratos` | `{idReserva}` | Contrato emitido; comparte id con su reserva |
| `actividad` | automático | Bitácora: quién hizo qué y cuándo |

La colección `contratos` la escribe el panel web de la arrendadora; la
aplicación móvil solo la lee.

Las reglas de [`firestore.rules`](../firestore.rules) establecen que:

- Cada usuario lee y escribe **solo su propio** documento de perfil, y no puede
  elevarse el rol a sí mismo.
- El catálogo es de lectura para cualquier autenticado y de escritura solo para
  administradores.
- Una reserva solo es **modificable** por su dueño o por el personal; el campo
  `uid` no puede reasignarse después de creada, y las reservas **no se borran**:
  se cancelan. La lectura sí está abierta a cualquier autenticado, porque para
  saber si un vehículo está libre hay que ver qué fechas están tomadas, y esas
  fechas están en reservas ajenas; el propio archivo de reglas explica el
  compromiso y la alternativa.
- La bitácora solo admite inserciones y lecturas propias. Un registro que se
  puede editar no sirve como evidencia.

---

## 10. Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| «Firebase no está configurado» en el acceso | Falta el archivo `.env` o alguna variable `EXPO_PUBLIC_FIREBASE_*`. Reinicia `npm start` después de crearlo. |
| `auth/operation-not-allowed` | El método de acceso no está habilitado en **Authentication → Sign-in method**. |
| `permission-denied` al reservar | Las reglas de `firestore.rules` no se publicaron en la consola. |
| El catálogo sale vacío | Falta ejecutar `npm run seed` (apartado 4). |
| El botón de Google no aparece | No hay identificadores OAuth en `.env`. Es el comportamiento previsto. |
| Franja amarilla «sin conexión» | El dispositivo no alcanza Firestore; la app sigue navegable con datos de respaldo. |
| El QR no carga nada | Firewall de Windows. Permite Node.js en redes privadas o usa `npx expo start --tunnel`. |
