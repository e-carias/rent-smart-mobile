# RENT SMART · Aplicación web

Panel de la arrendadora y portal del cliente.

**Next.js 16 (App Router)** · **React 19** · **Tailwind CSS 4** · **Firebase Authentication + Cloud Firestore**

> Esta carpeta es una de las dos aplicaciones del proyecto. La descripción
> general, los mockups y la licencia están en el [README de la raíz](../README.md);
> la aplicación móvil, en [`../mobile`](../mobile/README.md).

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Puesta en marcha](#2-puesta-en-marcha)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Qué cambió respecto a la etapa anterior](#4-qué-cambió-respecto-a-la-etapa-anterior)
5. [Arquitectura](#5-arquitectura)
6. [Roles y permisos](#6-roles-y-permisos)
7. [Pantallas](#7-pantallas)
8. [Reglas de negocio](#8-reglas-de-negocio)
9. [Despliegue en Vercel](#9-despliegue-en-vercel)
10. [Problemas frecuentes](#10-problemas-frecuentes)

---

## 1. Requisitos

- **Node.js 20.9** o superior.
- Un proyecto de **Firebase** con Authentication (correo/contraseña y Google) y
  Cloud Firestore activados. Es el mismo proyecto que usa la aplicación móvil:
  ahí está la persistencia compartida que pide la entrega.

No hace falta instalar ninguna base de datos: Firestore es un servicio
gestionado. La preparación del proyecto de Firebase, paso a paso, está en el
[README de la raíz](../README.md#3-configurar-firebase).

---

## 2. Puesta en marcha

```bash
npm install

cp .env.example .env.local        # Windows: copy .env.example .env.local
#   completa .env.local con las credenciales de tu proyecto de Firebase

npm run dev                       # http://localhost:3000
```

`npm install` termina sin avisos ni banderas: no hay conflictos de versiones
entre React, Next.js y el SDK de Firebase.

Para el catálogo inicial de vehículos se usa el script de la aplicación móvil,
que escribe en la misma base:

```bash
cd ../mobile && npm run seed
```

### Cuentas de demostración

La pantalla de acceso ofrece tres cuentas de ejemplo (administrador, operador y
cliente) que rellenan el formulario con un clic. **Deben existir en el
Authentication del proyecto**: no son usuarios de mentira dentro del código, y
el rol de cada una se define en su documento de `usuarios/{uid}` en Firestore.
El procedimiento para crearlas está en el README de la raíz.

---

## 3. Variables de entorno

Las seis variables `NEXT_PUBLIC_FIREBASE_*` que lista `.env.example`. El
prefijo `NEXT_PUBLIC_` hace que Next.js las incluya en el paquete que viaja al
navegador, y eso es correcto: identifican al proyecto, no autorizan nada. Quien
protege los datos es [`firestore.rules`](../firestore.rules), que se evalúa en
los servidores de Google con el `uid` de quien hace la petición.

Ningún archivo `.env` real se versiona; `.gitignore` solo admite
`.env.example`.

---

## 4. Qué cambió respecto a la etapa anterior

La etapa 2 guardaba los datos en **MySQL**, a los que se llegaba por un API REST
propio (`app/api/**`) y una capa de repositorios. La entrega final exige que las
dos plataformas compartan una sola base en la nube, así que la web se migró a
Firebase. El resumen del cambio:

| Antes (etapa 2) | Ahora |
| --- | --- |
| MySQL 8 + `mysql2` | Cloud Firestore |
| `app/api/**` (Route Handlers) | el SDK de Firebase desde el navegador |
| `app/lib/repositorios/**` | `app/services/**` |
| `app/lib/conexion.js` (pool) | `app/firebase/configuracion.js` |
| Sesión propia en `localStorage` + token | `onAuthStateChanged` de Firebase |
| `app/services/apiClient.js` (bus de carga y errores) | `app/services/progreso.js` |
| Autorización en el servidor Node | `firestore.rules`, en el servidor de Google |

Dos consecuencias de diseño merecen explicación:

- **Firestore no tiene JOIN.** Antes el API devolvía la reserva con el cliente y
  el vehículo incrustados (`reserva.vehiculo.marca`). Ahora la reserva guarda
  una **copia** del nombre del vehículo, su placa y el nombre del cliente. Es
  desnormalización deliberada: evita una lectura por fila en cada listado, al
  precio de que un cambio de placa no se propaga a las reservas ya emitidas
  —que es justamente lo correcto en un contrato ya firmado.
- **Firestore no agrega del lado del servidor.** Los reportes, que antes eran
  `GROUP BY` y `SUM` en SQL, se calculan ahora en el navegador a partir de dos
  lecturas (la flota y las reservas del período) en una sola pasada. Con el
  volumen de una arrendadora pequeña la diferencia no se nota; el límite de ese
  enfoque se documenta en el informe técnico.

---

## 5. Arquitectura

```
Pantalla (app/**/page.jsx)
    ↓  no conoce Firebase
Servicio (app/services/*.js)
    ↓
SDK de Firebase  →  Firebase Authentication / Cloud Firestore
                            ↓
                    firestore.rules (autorización, en el servidor)
```

Ninguna pantalla importa `firebase/*` directamente, y ningún servicio importa
`firebase/app`: la inicialización ocurre una sola vez en
`app/firebase/configuracion.js`. Cambiar de proveedor de datos volvería a ser un
trabajo contenido en `app/services/`, igual que lo fue esta migración.

```
web/
├── app/
│   ├── firebase/configuracion.js   Inicialización y nombres de colecciones
│   ├── services/                   Un servicio por entidad
│   │   ├── authService.js          Correo/contraseña y Google (ventana emergente)
│   │   ├── perfilService.js        Documento usuarios/{uid}
│   │   ├── vehiculoService.js      Catálogo y disponibilidad
│   │   ├── reservaService.js       Reservas y máquina de estados
│   │   ├── contratoService.js      Emisión idempotente de contratos
│   │   ├── clienteService.js       Lectura de perfiles (personal)
│   │   ├── reporteService.js       Agregados del período
│   │   ├── actividadService.js     Bitácora
│   │   └── progreso.js             Barra de carga y errores globales
│   ├── context/AuthContext.jsx     Sesión sobre onAuthStateChanged
│   ├── components/                 Navbar, tarjetas, mensajes, ruta protegida
│   ├── lib/                        Reglas de negocio puras, formato, validación
│   └── **/page.jsx                 Las pantallas
└── ../firestore.rules              Reglas de seguridad (compartidas con móvil)
```

### Colecciones

Son las mismas cinco que usa la aplicación móvil:

| Colección | Documento | Contenido |
| --- | --- | --- |
| `usuarios` | `{uid}` | Nombre, correo, DUI, licencia, teléfono, dirección y rol |
| `vehiculos` | placa normalizada | Flota: marca, modelo, placa, precio, estado |
| `reservas` | automático | `uid`, fechas, importes, estado y copia de vehículo y cliente |
| `contratos` | **id de la reserva** | Contrato emitido, condiciones y depósito |
| `actividad` | automático | Bitácora: quién hizo qué y cuándo |

Que el contrato comparta identificador con su reserva es lo que hace la emisión
**idempotente** sin necesidad de una transacción: pedirla dos veces devuelve el
contrato que ya existe.

---

## 6. Roles y permisos

| | Cliente | Operador | Administrador |
| --- | :-: | :-: | :-: |
| Buscar y reservar | ✓ | ✓ | ✓ |
| Ver y cancelar sus reservas | ✓ | ✓ | ✓ |
| Gestionar reservas de terceros | | ✓ | ✓ |
| Emitir y cerrar contratos | | ✓ | ✓ |
| Reportes | | ✓ | ✓ |
| Alta, edición y baja de vehículos | | | ✓ |
| Cambiar roles | | | ✓ |

El rol vive en `usuarios/{uid}.rol` y **no se puede elevar desde la
aplicación**: las reglas exigen que una actualización propia conserve el valor
anterior. `RutaProtegida` oculta lo que no corresponde en la interfaz, pero la
decisión que cuenta la toma el servidor.

---

## 7. Pantallas

| Ruta | Para | Qué hace |
| --- | --- | --- |
| `/` | público | Portada |
| `/login`, `/registro`, `/recuperar` | público | Acceso con correo o Google; enlace de restablecimiento |
| `/buscar` | autenticados | Disponibilidad por fechas y reserva |
| `/vehiculos` | personal | Catálogo, alta, edición y estados |
| `/vehiculos/[id]` | autenticados | Detalle, calendario ocupado y reserva |
| `/reservas` | personal | Flujo pendiente → confirmada → en curso → finalizada |
| `/contratos`, `/contratos/[id]` | personal y dueño | Emisión y documento imprimible |
| `/reportes` | personal | Ingresos, ocupación, categorías y mejores clientes |
| `/cliente`, `/mis-reservas` | cliente | Su panel, su historial y sus contratos |
| `/admin` | personal | Panel con pendientes, entregas y devoluciones |

---

## 8. Reglas de negocio

Viven en `app/lib/negocio.js`, son funciones **puras** y las comparten las dos
plataformas:

- **Traslape de fechas.** Dos rangos se solapan si `inicio₁ < fin₂ ∧ inicio₂ < fin₁`.
  Los intervalos son semiabiertos: una devolución el día 10 y una entrega el
  mismo día 10 **no** chocan.
- **Tarifa.** Descuento por volumen del 5 % desde 3 días, 10 % desde 7 y 20 %
  desde 30; luego el 13 % de IVA; el depósito en garantía es el 20 % del total.
- **Máquina de estados.** `pendiente → confirmada → en_curso → finalizada`, con
  cancelación posible mientras la renta no haya iniciado. Las transiciones
  inválidas se rechazan en el servicio, no en la pantalla.
- **Integridad.** No se elimina un vehículo con reservas activas, ni una reserva
  que no esté cancelada.

---

## 9. Despliegue en Vercel

```bash
npm i -g vercel
vercel            # primera vez: enlaza el proyecto
vercel --prod
```

En **Project → Settings → Environment Variables** se añaden las seis variables
`NEXT_PUBLIC_FIREBASE_*`. No hay nada más que configurar: al no haber base de
datos propia, no hay que abrir puertos ni contratar un MySQL gestionado —ese era
el motivo técnico de fondo para migrar a Firestore.

Después del primer despliegue hay que autorizar el dominio en **Firebase →
Authentication → Settings → Authorized domains**, o el acceso con Google
devolverá `auth/unauthorized-domain`.

---

## 10. Problemas frecuentes

| Síntoma | Causa |
| --- | --- |
| «Firebase no está configurado» | Falta `.env.local`, o el servidor no se reinició tras crearlo. |
| `auth/operation-not-allowed` | El proveedor (correo o Google) no está habilitado en la consola. |
| `auth/unauthorized-domain` | El dominio de Vercel no está en los dominios autorizados. |
| `permission-denied` | Las reglas de `../firestore.rules` no se han publicado. |
| La ventana de Google no abre | El navegador la bloqueó; la aplicación reintenta por redirección. |
| El catálogo aparece vacío | Falta ejecutar `npm run seed` en `../mobile`. |
