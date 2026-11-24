# RENT SMART

### Plataforma Inteligente para la Gestión y Alquiler de Vehículos

[![Licencia: CC BY-NC-SA 4.0](https://img.shields.io/badge/Licencia-CC%20BY--NC--SA%204.0-blue.svg)](LICENSE)
[![Web](https://img.shields.io/badge/Web-Next.js%2016%20%C2%B7%20React%2019-black.svg)](web/README.md)
[![Móvil](https://img.shields.io/badge/M%C3%B3vil-Expo%2057%20%C2%B7%20React%20Native-blue.svg)](mobile/README.md)
[![Datos](https://img.shields.io/badge/Datos-Firebase%20%C2%B7%20Cloud%20Firestore-orange.svg)](firestore.rules)
[![Pruebas](https://img.shields.io/badge/Pruebas-105%20Jest-success.svg)](mobile/PRUEBAS.md)

Universidad Don Bosco · Diseño y Programación de Software Multiplataforma · Grupo 02T
**Entrega final — Ciclo 02/2026**

---

RENT SMART digitaliza la operación de una arrendadora de vehículos: el
catálogo, la disponibilidad real por fechas, la reserva, el contrato y los
reportes del negocio. Son **dos aplicaciones sobre una sola base de datos en la
nube**: un panel web para la arrendadora y su portal de clientes, y una
aplicación móvil para el cliente. Una cuenta creada en el teléfono entra en la
web, y una reserva hecha en el mostrador aparece en el teléfono del cliente,
porque ambas hablan con el mismo proyecto de Firebase.

```
┌──────────────────────┐     ┌──────────────────────┐
│   web/               │     │   mobile/            │
│   Next.js 16         │     │   Expo 57            │
│   React 19           │     │   React Native 0.86  │
│   Tailwind CSS 4     │     │   expo-router        │
└──────────┬───────────┘     └───────────┬──────────┘
           │                             │
           │      SDK de Firebase        │
           └──────────────┬──────────────┘
                          ▼
          ┌───────────────────────────────┐
          │  Firebase Authentication      │  correo/contraseña + Google
          │  Cloud Firestore              │  usuarios · vehiculos · reservas
          │  firestore.rules              │  contratos · actividad
          └───────────────────────────────┘
```

---

## Índice

1. [Qué incluye la entrega final](#1-qué-incluye-la-entrega-final)
2. [Estructura del repositorio](#2-estructura-del-repositorio)
3. [Configurar Firebase](#3-configurar-firebase)
4. [Ejecutar el proyecto](#4-ejecutar-el-proyecto)
5. [Mockups y diseño](#5-mockups-y-diseño)
6. [Funcionalidades](#6-funcionalidades)
7. [Arquitectura y decisiones técnicas](#7-arquitectura-y-decisiones-técnicas)
8. [Pruebas](#8-pruebas)
9. [Despliegue](#9-despliegue)
10. [Equipo y ramas](#10-equipo-y-ramas)
11. [Licencia](#11-licencia)

---

## 1. Qué incluye la entrega final

| Requisito de la entrega | Dónde está |
| --- | --- |
| Autenticación con Firebase (correo y Google) | `web/app/services/authService.js` · `mobile/src/servicios/authService.js` |
| Persistencia de datos por usuario | Cloud Firestore, colección `usuarios/{uid}` y `reservas` filtradas por `uid` |
| Módulos secundarios además del principal | Perfil, historial, contratos, reportes y bitácora de actividad |
| Historial de registros almacenados | `mobile/app/(tabs)/historial.jsx` · `web/app/mis-reservas` · colección `actividad` |
| Una sola base de datos para las dos plataformas | Mismo proyecto de Firebase; las cinco colecciones son compartidas |
| Navegación entre pantallas | `expo-router` en móvil · App Router de Next.js en web |
| Reglas de seguridad del lado del servidor | [`firestore.rules`](firestore.rules) |
| Pruebas automatizadas | 105 pruebas de Jest — [`mobile/PRUEBAS.md`](mobile/PRUEBAS.md) |
| Licencia abierta | [`LICENSE`](LICENSE) — Creative Commons BY-NC-SA 4.0 |
| Documentación | este README, [`web/README.md`](web/README.md), [`mobile/README.md`](mobile/README.md) |

### Lo que cambió en esta entrega

La etapa anterior tenía la web sobre **MySQL** con un API REST propio y la móvil
ya sobre Firebase. Eso dejaba dos bases de datos distintas, y la entrega final
pide una sola. Por eso la web se migró completa a Firebase + Firestore:
desaparecieron `app/api/**`, la capa de repositorios y el pool de conexiones, y
en su lugar los servicios hablan con el SDK. El efecto secundario útil es que
ahora la web se puede desplegar en Vercel sin contratar un MySQL gestionado.
El detalle del cambio está en [`web/README.md`](web/README.md#4-qué-cambió-respecto-a-la-etapa-anterior).

---

## 2. Estructura del repositorio

```
rent-smart/
├── README.md                 Este archivo
├── LICENSE                   Creative Commons BY-NC-SA 4.0
├── firestore.rules           Reglas de seguridad (las dos plataformas)
├── firebase.json             Para 'firebase deploy --only firestore:rules'
├── .gitignore
│
├── web/                      Aplicación web — panel y portal del cliente
│   ├── app/
│   │   ├── firebase/         Inicialización de Firebase (único punto)
│   │   ├── services/         Un servicio por entidad
│   │   ├── context/          Sesión sobre onAuthStateChanged
│   │   ├── components/       Navbar, tarjetas, mensajes, ruta protegida
│   │   ├── lib/              Reglas de negocio puras, formato, validación
│   │   └── **/page.jsx       Pantallas
│   ├── .env.example
│   └── README.md
│
├── mobile/                   Aplicación móvil — cliente
│   ├── app/                  Rutas de expo-router
│   ├── src/
│   │   ├── firebase/
│   │   ├── servicios/
│   │   ├── contexto/
│   │   ├── componentes/
│   │   └── lib/
│   ├── pruebas/              105 pruebas de Jest
│   ├── scripts/              Carga del catálogo e informe de pruebas
│   ├── .env.example
│   ├── PRUEBAS.md
│   └── README.md
│
└── docs/
    └── capturas/             Mockups y capturas de pantalla
```

---

## 3. Configurar Firebase

Un solo proyecto sirve a las dos aplicaciones. Se hace una vez.

**1. Crear el proyecto.** En [console.firebase.google.com](https://console.firebase.google.com)
→ *Agregar proyecto*. Nombre sugerido: `rent-smart-udb`. Google Analytics no es
necesario.

**2. Habilitar los proveedores de acceso.** *Authentication* → *Comenzar* →
pestaña *Sign-in method*:

- **Correo electrónico/contraseña** → habilitar.
- **Google** → habilitar y elegir un correo de soporte.

**3. Crear la base de datos.** *Firestore Database* → *Crear base de datos* →
modo **producción** → región `us-central1` (o la más cercana). El modo
producción deniega todo por defecto; el paso siguiente abre exactamente lo
necesario.

**4. Publicar las reglas.** Pestaña *Reglas*: pegar el contenido de
[`firestore.rules`](firestore.rules) y *Publicar*. O, con la CLI:

```bash
npm i -g firebase-tools
firebase login
firebase use --add            # elegir el proyecto
firebase deploy --only firestore:rules
```

**5. Registrar las aplicaciones.** *Configuración del proyecto* → *Tus
aplicaciones*:

- Icono **`</>`** (web) → nombre `rent-smart-web`. Copiar el objeto
  `firebaseConfig` que muestra.
- Para la móvil basta con la misma configuración web: Expo usa el SDK de
  JavaScript.

**6. Completar las variables de entorno.** En cada aplicación:

```bash
cd web    && cp .env.example .env.local   # NEXT_PUBLIC_FIREBASE_*
cd mobile && cp .env.example .env         # EXPO_PUBLIC_FIREBASE_*
```

Los valores son los mismos; solo cambia el prefijo que exige cada
herramienta.

**7. Cargar el catálogo inicial.**

```bash
cd mobile && npm install && npm run seed
```

**8. Crear las cuentas de demostración.** En *Authentication* → *Users* →
*Agregar usuario*:

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `admin@rentsmart.com` | `Admin123` | administrador |
| `operador@rentsmart.com` | `Operador123` | operador |
| `cliente@rentsmart.com` | `Cliente123` | cliente |

El rol **no** se guarda en Authentication, sino en Firestore. Para las dos
primeras cuentas hay que editar su documento en la colección `usuarios` (se
crea en el primer acceso) y poner `rol: "administrador"` o `rol: "operador"`.
Las reglas impiden que un usuario se eleve el rol a sí mismo, que es
precisamente la razón de que este paso sea manual.

> **Las claves `NEXT_PUBLIC_*` y `EXPO_PUBLIC_*` viajan al cliente, y eso es
> correcto.** Identifican al proyecto; no autorizan nada. Quien protege los
> datos es `firestore.rules`, que se evalúa en los servidores de Google con el
> `uid` de quien hace la petición. Ningún archivo `.env` real se versiona.

---

## 4. Ejecutar el proyecto

### Aplicación web

```bash
cd web
npm install
npm run dev            # http://localhost:3000
```

### Aplicación móvil

```bash
cd mobile
npm install
npm start              # luego: 'a' para Android, 'w' para el navegador
```

Para abrirla en un teléfono real, instalar **Expo Go** y escanear el código QR
con el teléfono en la misma red Wi-Fi.

Ambos `npm install` terminan sin avisos y sin banderas adicionales: las
versiones de React, React DOM y los paquetes de Expo están fijadas de forma
coherente, que fue una de las observaciones corregidas de la entrega anterior.

---

## 5. Mockups y diseño

El diseño se trabajó en Figma antes de escribir las pantallas; los tokens de
color, tipografía y espaciado se trasladaron literalmente al código
(`mobile/src/tema.js` y la configuración de Tailwind en la web).

- **Tablero de Figma:** <!-- Pegar aquí el enlace del tablero --> _(pendiente de enlazar)_
- **Capturas de la aplicación terminada:** [`docs/capturas/`](docs/capturas/)

| Pantalla | Web | Móvil |
| --- | :-: | :-: |
| Acceso y registro | ✓ | ✓ |
| Catálogo de vehículos | ✓ | ✓ |
| Detalle con calendario de ocupación | ✓ | ✓ |
| Búsqueda por fechas y reserva | ✓ | ✓ |
| Mis reservas / historial | ✓ | ✓ |
| Perfil del usuario | ✓ | ✓ |
| Gestión de reservas (mostrador) | ✓ | |
| Contratos y documento imprimible | ✓ | |
| Reportes e indicadores | ✓ | |

---

## 6. Funcionalidades

**Para el cliente.** Registro con correo o con Google; búsqueda de vehículos
libres en un rango de fechas; cotización antes de confirmar, con el descuento
por volumen y el IVA ya aplicados; reserva; cancelación mientras la renta no
haya iniciado; historial de sus rentas y de su actividad; consulta y descarga
de su contrato; perfil editable.

**Para la arrendadora.** Alta, edición y baja de unidades, con estados
(disponible, mantenimiento, no disponible); gestión de reservas por el flujo
`pendiente → confirmada → en curso → finalizada`; emisión de contratos;
reportes de ingresos mensuales, ocupación por unidad, demanda por categoría y
mejores clientes, exportables a CSV; panel con pendientes, entregas del día y
devoluciones.

**Reglas de negocio** (las comparten las dos plataformas, como funciones puras
en `lib/negocio.js`):

- **Traslape de fechas.** Dos rangos se solapan si `inicio₁ < fin₂ ∧ inicio₂ < fin₁`.
  Los intervalos son **semiabiertos**: una devolución el día 10 y una entrega el
  mismo día 10 no chocan, porque el vehículo queda libre ese día.
- **Tarifa.** Descuento del 5 % desde 3 días, 10 % desde 7 y 20 % desde 30;
  sobre el subtotal, el 13 % de IVA; el depósito en garantía es el 20 % del
  total.
- **Integridad.** No se elimina un vehículo con reservas activas, ni una reserva
  que no esté cancelada; las transiciones de estado inválidas se rechazan en el
  servicio, no en la pantalla.

---

## 7. Arquitectura y decisiones técnicas

Las dos aplicaciones siguen la misma separación en capas:

```
Pantalla  →  Servicio  →  SDK de Firebase  →  Firebase Auth / Cloud Firestore
                                                        ↓
                                              firestore.rules (autorización)
```

Ninguna pantalla importa `firebase/*`. La inicialización ocurre en un único
archivo por aplicación (`firebase/configuracion.js`), y toda escritura o lectura
pasa por un servicio. Esa disciplina es la que permitió migrar la web entera de
MySQL a Firestore sin reescribir las pantallas.

Tres decisiones merecen explicación, porque no son obvias:

**El observador de sesión es la única fuente de verdad.** En vez de guardar el
usuario en `localStorage` y confiar en esa copia, el contexto se suscribe a
`onAuthStateChanged`. Si el token caduca, si la cuenta se desactiva o si se
cierra la sesión en otra pestaña, la interfaz se actualiza sola. No existe
estado de sesión que pueda contradecir a Firebase.

**Desnormalización deliberada.** Firestore no tiene `JOIN`. La reserva guarda
una copia del nombre del vehículo, su placa y el nombre del cliente, en lugar de
solo las referencias. Evita una lectura por fila en cada listado y, además,
congela los datos tal como estaban al momento de reservar —que es lo correcto en
un documento contractual.

**El contrato comparte identificador con su reserva.** Por eso emitirlo es
idempotente sin necesidad de una transacción: pedirlo dos veces devuelve el que
ya existe. Un detalle pequeño que elimina una clase entera de errores.

---

## 8. Pruebas

```bash
cd mobile
npm test                # 105 pruebas, 5 suites
npm run test:informe    # informe legible por módulo
```

Cubren las reglas de negocio (traslape, tarifas, transiciones de estado), la
validación de formularios, la autenticación y los servicios de vehículos y
reservas contra un doble de Firestore. El detalle de qué cubre cada suite, y qué
error real encontró cada una, está en [`mobile/PRUEBAS.md`](mobile/PRUEBAS.md).

---

## 9. Despliegue

**Web — Vercel.**

```bash
cd web
npm i -g vercel
vercel --prod
```

Añadir las seis variables `NEXT_PUBLIC_FIREBASE_*` en *Project → Settings →
Environment Variables*, y después autorizar el dominio en *Firebase →
Authentication → Settings → Authorized domains*, o el acceso con Google
devolverá `auth/unauthorized-domain`.

**Móvil — APK con EAS.**

```bash
cd mobile
npm i -g eas-cli
eas login
eas build -p android --profile preview
```

También se puede entregar por **Expo Go** con `npm start`, que es suficiente
para la demostración en clase.

---

## 10. Equipo y ramas

El trabajo se dividió en cinco partes, una por integrante, cada una en su propia
rama. Las ramas se integran a `main` por *pull request*.

| Rama | Parte | Integrante |
| --- | --- | --- |
| `parte-1-base-y-firebase` | Estructura del repositorio, configuración de Firebase, reglas de seguridad, licencia y documentación | |
| `parte-2-autenticacion` | Authentication con correo y Google, perfiles en Firestore, contexto de sesión, rutas protegidas | |
| `parte-3-catalogo-vehiculos` | Catálogo, disponibilidad por fechas, alta, edición y estados de las unidades | |
| `parte-4-reservas` | Reservas, cotización, máquina de estados, historial y bitácora de actividad | |
| `parte-5-contratos-y-reportes` | Emisión de contratos, documento imprimible, reportes e indicadores | |

> Completar la columna de integrantes antes de entregar.

Cada parte se entrega como un ZIP aparte, con sus archivos y el mensaje de
commit sugerido, de modo que cada integrante haga su propio commit en su rama.

---

## 11. Licencia

[Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional](LICENSE)
(CC BY-NC-SA 4.0).

Se puede compartir y adaptar citando la fuente, sin uso comercial y
manteniendo la misma licencia. Las bibliotecas de terceros conservan sus
propias licencias, que el `package.json` de cada aplicación enumera.
