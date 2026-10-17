# RENT SMART · Aplicación móvil (Etapa 3)

Versión móvil del sistema de alquiler de vehículos de Rosales Rent A Car,
construida con **React Native** sobre **Expo**. Consume el mismo API REST que
la versión web de la Etapa 2, de modo que las dos plataformas comparten base de
datos, reglas de negocio y validaciones.

| | |
| --- | --- |
| Asignatura | Diseño y Programación de Software Multiplataforma |
| Institución | Universidad Don Bosco |
| Tecnología | React Native 0.86 · Expo SDK 57 · expo-router 57 |
| Lenguaje | JavaScript (.js / .jsx) |

---

## 1. Requisitos

- **Node.js 20 o superior** — comprueba con `node -v`.
- **Un teléfono Android o iPhone** con la aplicación **Expo Go** instalada
  (gratuita, en Play Store y App Store). El teléfono y la computadora deben
  estar en la misma red Wi-Fi.
- Opcionalmente, un emulador de Android Studio o el simulador de iOS.

No hace falta Android Studio ni Xcode para la demostración: Expo Go ejecuta la
aplicación directamente.

---

## 2. Ejecutar la aplicación

```bash
cd mobile
npm install
npm start
```

Aparece un código QR en la terminal.

- **Android:** abre Expo Go y pulsa *Scan QR code*.
- **iPhone:** escanea el código con la cámara del sistema.

La aplicación se abre en el teléfono y se recarga sola cada vez que se guarda
un archivo.

---

## 3. Conectar con el API

La app lee la dirección del API de la variable `EXPO_PUBLIC_API_URL`. Copia el
archivo de ejemplo y ajústala:

```bash
cp .env.example .env
```

| Situación | Valor |
| --- | --- |
| El proyecto web está desplegado en Vercel | `https://tu-proyecto.vercel.app/api` |
| El proyecto web corre en tu computadora | `http://TU_IP_LOCAL:3000/api` |

Para la segunda opción, averigua tu IP con `ipconfig` (Windows) y usa la
*Dirección IPv4*, por ejemplo `http://192.168.1.10:3000/api`.

> `localhost` **no funciona** desde el teléfono: el teléfono lo interpretaría
> como sí mismo, no como la computadora.

Después de cambiar el `.env` hay que reiniciar el servidor con `npm start`,
porque Expo inyecta las variables al compilar el paquete.

### Si el API no responde

La aplicación no se queda en blanco: muestra los datos de demostración de
`src/datos/demo.js` y lo advierte con una franja amarilla. Esto permite
revisar la interfaz sin tener el backend encendido. La pestaña **Perfil**
indica en todo momento de dónde vienen los datos.

---

## 4. Estructura del proyecto

```
mobile/
├── app/                        Rutas (expo-router: un archivo = una pantalla)
│   ├── _layout.jsx             Proveedor de sesión y guardia de rutas
│   ├── index.jsx               Redirección de entrada
│   ├── login.jsx               Pantalla 1 · Inicio de sesión
│   ├── registro.jsx            Pantalla 2 · Registro
│   ├── recuperar.jsx           Pantalla 3 · Recuperar contraseña
│   ├── (tabs)/                 Módulo principal con navegación por pestañas
│   │   ├── _layout.jsx         Definición de las cuatro pestañas
│   │   ├── inicio.jsx          Pantalla 4 · Resumen del cliente
│   │   ├── vehiculos.jsx       Pantalla 5 · Catálogo con búsqueda y filtros
│   │   ├── reservas.jsx        Pantalla 6 · Mis reservas
│   │   └── perfil.jsx          Pantalla 7 · Perfil y estado de conexión
│   ├── vehiculo/[id].jsx       Pantalla 8 · Detalle del vehículo
│   ├── reservar/[id].jsx       Pantalla 9 · Nueva reserva
│   └── reserva/[id].jsx        Pantalla 10 · Detalle de la reserva
│
└── src/
    ├── tema.js                 Tokens de diseño tomados de Figma
    ├── componentes/            Botón, campos, tarjetas, estados
    ├── contexto/               AuthContext (Context API + useReducer)
    ├── lib/                    Validaciones, formato y reglas de negocio
    ├── servicios/              apiClient y un servicio por entidad
    └── datos/                  Datos de respaldo
```

---

## 5. Arquitectura

```
Pantalla → Servicio → apiClient → API REST (Etapa 2) → MySQL
                 ↓ (si no hay red)
             datos de respaldo
```

Es la misma separación en capas de la versión web. Ninguna pantalla llama a
`fetch` ni conoce una URL: solo invoca al servicio correspondiente. El cambio
de plataforma afectó únicamente a la capa de presentación.

| Decisión | Motivo |
| --- | --- |
| **Expo** sobre React Native puro | Permite ejecutar la app en un teléfono real sin compilar nada, lo que hace reproducible la demostración. |
| **expo-router** sobre React Navigation manual | Enrutamiento por archivos, igual que el App Router de Next.js que ya usa la web. |
| **Context API + useReducer** sobre Redux | Un solo dominio de estado compartido (la sesión); Redux añadiría archivos sin resolver nada. |
| **AsyncStorage** sobre localStorage | El teléfono no tiene localStorage; es la API equivalente en React Native. |
| **FlatList** sobre ScrollView + map | Solo dibuja las filas visibles; la lista no se traba al crecer la flota. |

---

## 6. Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | cliente@rentsmart.com | Cliente123 |
| Administrador | admin@rentsmart.com | Admin123 |
| Operador | operador@rentsmart.com | Operador123 |

En la pantalla de inicio de sesión se pueden pulsar directamente para llenar el
formulario. Son credenciales de demostración académica.

---

## 7. Generar el archivo instalable (opcional)

Para entregar un `.apk` en lugar de usar Expo Go:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

El servicio devuelve un enlace de descarga. Requiere una cuenta gratuita de
Expo y unos 15 minutos de compilación en la nube.
