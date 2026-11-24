# RENT SMART · Informe de pruebas automatizadas

> Generado automáticamente con `npm run test:informe`.
> Las columnas recogen el resultado **observado** en la ejecución, no el esperado.

## Resumen de la ejecución

| Dato | Valor |
| --- | --- |
| Fecha y hora | 6/11/2026, 10:10:00 a. m. |
| Sistema operativo | Linux 6.18.44-fc-v242 |
| Node.js | v22.22.0 |
| Suites ejecutadas | 5 |
| Casos ejecutados | 105 |
| Casos correctos | 105 |
| Casos fallidos | 0 |
| Duración total | 0.93 s |
| Resultado global | TODAS LAS PRUEBAS PASARON |

## pruebas/reservas.test.js

31 de 31 casos correctos · 0.32 s

| # | Caso de prueba | Resultado observado | ms |
| --- | --- | --- | --- |
| 1 | crearReserva › guarda la reserva con el uid del usuario autenticado | Correcto | 3 |
| 2 | crearReserva › copia el nombre y la placa del vehículo en la reserva | Correcto | 0 |
| 3 | crearReserva › calcula el importe con las reglas del negocio (7 días a $38) | Correcto | 1 |
| 4 | crearReserva › la reserva nace en estado pendiente | Correcto | 0 |
| 5 | crearReserva › asigna un código legible con prefijo RS- | Correcto | 1 |
| 6 | crearReserva › deja constancia en la bitácora de actividad | Correcto | 1 |
| 7 | crearReserva › rechaza la reserva sin sesión iniciada | Correcto | 16 |
| 8 | crearReserva › rechaza un vehículo que no existe | Correcto | 1 |
| 9 | crearReserva › rechaza un vehículo en mantenimiento | Correcto | 1 |
| 10 | crearReserva › rechaza fechas que se traslapan con una reserva activa | Correcto | 1 |
| 11 | crearReserva › acepta una reserva que empieza el día en que termina la anterior | Correcto | 1 |
| 12 | crearReserva › una reserva cancelada deja libres sus fechas | Correcto | 1 |
| 13 | cancelarReserva › cambia el estado a cancelada | Correcto | 0 |
| 14 | cancelarReserva › registra la cancelación en la bitácora | Correcto | 1 |
| 15 | cancelarReserva › no permite cancelar la reserva de otro usuario | Correcto | 0 |
| 16 | cancelarReserva › no permite cancelar dos veces | Correcto | 1 |
| 17 | cancelarReserva › informa cuando la reserva no existe | Correcto | 0 |
| 18 | máquina de estados › de pendiente a confirmada → true | Correcto | 1 |
| 19 | máquina de estados › de pendiente a cancelada → true | Correcto | 0 |
| 20 | máquina de estados › de pendiente a finalizada → false | Correcto | 0 |
| 21 | máquina de estados › de confirmada a en_curso → true | Correcto | 0 |
| 22 | máquina de estados › de confirmada a finalizada → false | Correcto | 0 |
| 23 | máquina de estados › de en_curso a finalizada → true | Correcto | 1 |
| 24 | máquina de estados › de en_curso a cancelada → false | Correcto | 0 |
| 25 | máquina de estados › de finalizada a cancelada → false | Correcto | 0 |
| 26 | máquina de estados › de cancelada a pendiente → false | Correcto | 0 |
| 27 | máquina de estados › los estados terminales no admiten ninguna transición | Correcto | 0 |
| 28 | máquina de estados › no se puede pasar de pendiente a en curso saltando la confirmación | Correcto | 0 |
| 29 | máquina de estados › el ciclo completo pendiente → confirmada → en curso → finalizada | Correcto | 1 |
| 30 | generarCodigo › respeta el formato RS- más seis dígitos | Correcto | 0 |
| 31 | resumen › cuenta las activas y suma lo contratado sin las canceladas | Correcto | 1 |

## pruebas/vehiculos.test.js

13 de 13 casos correctos · 0.09 s

| # | Caso de prueba | Resultado observado | ms |
| --- | --- | --- | --- |
| 1 | mapearVehiculo · contrato de datos › conserva el identificador del documento | Correcto | 0 |
| 2 | mapearVehiculo · contrato de datos › todos los campos numéricos salen como número | Correcto | 1 |
| 3 | mapearVehiculo · contrato de datos › todos los campos de texto salen como cadena | Correcto | 0 |
| 4 | mapearVehiculo · contrato de datos › convierte a número un precio guardado como texto | Correcto | 1 |
| 5 | mapearVehiculo · contrato de datos › un documento vacío no produce undefined ni NaN | Correcto | 2 |
| 6 | mapearVehiculo · contrato de datos › el estado por defecto es disponible | Correcto | 0 |
| 7 | mapearVehiculo · contrato de datos › descarta los campos que no forman parte del contrato | Correcto | 0 |
| 8 | mapearVehiculo · contrato de datos › la forma del objeto es siempre la misma, falten o sobren campos | Correcto | 1 |
| 9 | datos de respaldo › todos los vehículos cumplen el mismo contrato que Firestore | Correcto | 6 |
| 10 | datos de respaldo › los identificadores coinciden con los que escribe el script de carga | Correcto | 0 |
| 11 | datos de respaldo › las placas no se repiten | Correcto | 0 |
| 12 | datos de respaldo › todos los estados pertenecen al catálogo | Correcto | 0 |
| 13 | datos de respaldo › todos los precios por día son positivos | Correcto | 2 |

## pruebas/autenticacion.test.js

18 de 18 casos correctos · 0.07 s

| # | Caso de prueba | Resultado observado | ms |
| --- | --- | --- | --- |
| 1 | iniciarSesion › normaliza el correo a minúsculas y sin espacios | Correcto | 1 |
| 2 | iniciarSesion › devuelve el usuario cuando las credenciales son correctas | Correcto | 0 |
| 3 | iniciarSesion › traduce la credencial inválida a un mensaje en español | Correcto | 4 |
| 4 | iniciarSesion › no revela si el fallo fue del correo o de la contraseña | Correcto | 0 |
| 5 | registrar › crea la cuenta, guarda el nombre y crea el perfil en Firestore | Correcto | 1 |
| 6 | registrar › informa cuando el correo ya está registrado | Correcto | 7 |
| 7 | iniciarSesionConGoogle › convierte el id_token en credencial y abre sesión | Correcto | 1 |
| 8 | iniciarSesionConGoogle › traduce el conflicto de proveedores | Correcto | 0 |
| 9 | recuperar contraseña › envía el correo de restablecimiento | Correcto | 1 |
| 10 | recuperar contraseña › responde igual aunque el correo no exista, para no filtrar cuentas | Correcto | 0 |
| 11 | recuperar contraseña › sí propaga un fallo de red | Correcto | 0 |
| 12 | traducirError › devuelve un ErrorAuth con el código original | Correcto | 0 |
| 13 | traducirError › tiene un mensaje por defecto para códigos desconocidos | Correcto | 1 |
| 14 | mapearUsuario › null si no hay sesión | Correcto | 0 |
| 15 | mapearUsuario › usa el nombre del perfil de Firestore por encima del displayName | Correcto | 0 |
| 16 | mapearUsuario › cae al displayName y luego al correo si no hay perfil | Correcto | 1 |
| 17 | mapearUsuario › el rol por defecto es cliente | Correcto | 0 |
| 18 | mapearUsuario › identifica el proveedor de acceso | Correcto | 0 |

## pruebas/validaciones.test.js

24 de 24 casos correctos · 0.06 s

| # | Caso de prueba | Resultado observado | ms |
| --- | --- | --- | --- |
| 1 | validarLogin › acepta credenciales con formato correcto | Correcto | 1 |
| 2 | validarLogin › rechaza el formulario vacío e informa los dos campos | Correcto | 0 |
| 3 | validarLogin › rechaza un correo sin arroba | Correcto | 0 |
| 4 | validarLogin › rechaza un correo sin dominio | Correcto | 1 |
| 5 | validarLogin › rechaza un correo sin extensión | Correcto | 0 |
| 6 | validarLogin › rechaza un correo con espacio | Correcto | 0 |
| 7 | validarRegistro › acepta un registro completo y correcto | Correcto | 0 |
| 8 | validarRegistro › exige que las contraseñas coincidan | Correcto | 0 |
| 9 | validarRegistro › exige al menos ocho caracteres en la contraseña | Correcto | 1 |
| 10 | validarRegistro › exige combinar letras y números | Correcto | 0 |
| 11 | validarRegistro › rechaza un DUI con formato incorrecto | Correcto | 0 |
| 12 | validarRegistro › acepta el DUI con y sin guion | Correcto | 0 |
| 13 | validarRegistro › rechaza un teléfono que no tenga ocho dígitos | Correcto | 0 |
| 14 | validarRegistro › rechaza un nombre de menos de tres caracteres | Correcto | 1 |
| 15 | validarReserva › acepta un rango de fechas correcto | Correcto | 0 |
| 16 | validarReserva › rechaza una devolución anterior al inicio | Correcto | 0 |
| 17 | validarReserva › rechaza una devolución el mismo día del inicio | Correcto | 0 |
| 18 | validarReserva › exige seleccionar un vehículo | Correcto | 0 |
| 19 | validarReserva › exige el lugar de entrega | Correcto | 1 |
| 20 | validarRecuperar › acepta un correo válido | Correcto | 0 |
| 21 | validarRecuperar › rechaza un correo vacío | Correcto | 0 |
| 22 | expresiones regulares › REGEX_EMAIL distingue correos válidos de inválidos | Correcto | 0 |
| 23 | expresiones regulares › REGEX_DUI admite nueve dígitos con guion opcional | Correcto | 1 |
| 24 | expresiones regulares › REGEX_TELEFONO admite separador opcional | Correcto | 0 |

## pruebas/negocio.test.js

19 de 19 casos correctos · 0.05 s

| # | Caso de prueba | Resultado observado | ms |
| --- | --- | --- | --- |
| 1 | calcularTarifa · tramos de descuento por volumen › sin descuento por debajo de tres días | Correcto | 1 |
| 2 | calcularTarifa · tramos de descuento por volumen › 5 % desde tres días | Correcto | 0 |
| 3 | calcularTarifa · tramos de descuento por volumen › 10 % desde siete días | Correcto | 0 |
| 4 | calcularTarifa · tramos de descuento por volumen › 20 % desde treinta días | Correcto | 0 |
| 5 | calcularTarifa · tramos de descuento por volumen › el IVA se aplica sobre el subtotal, no sobre el bruto | Correcto | 1 |
| 6 | calcularTarifa · tramos de descuento por volumen › el depósito es el 20 % del total | Correcto | 0 |
| 7 | calcularTarifa · tramos de descuento por volumen › todos los importes salen con dos decimales como máximo | Correcto | 1 |
| 8 | calcularTarifa · tramos de descuento por volumen › un precio ausente no rompe el cálculo | Correcto | 0 |
| 9 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva empieza dentro | Correcto | 0 |
| 10 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva termina dentro | Correcto | 1 |
| 11 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva está contenida | Correcto | 0 |
| 12 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva la contiene | Correcto | 0 |
| 13 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva termina el día en que empieza la otra | Correcto | 0 |
| 14 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva empieza el día en que termina la otra | Correcto | 1 |
| 15 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva es muy anterior | Correcto | 0 |
| 16 | hayTraslape · intervalos semiabiertos [inicio, fin) › la nueva es muy posterior | Correcto | 0 |
| 17 | hayTraslape · intervalos semiabiertos [inicio, fin) › la relación es simétrica | Correcto | 1 |
| 18 | estados que ocupan el vehículo › pendiente, confirmada y en curso bloquean fechas | Correcto | 0 |
| 19 | estados que ocupan el vehículo › finalizada y cancelada no bloquean fechas | Correcto | 0 |

---

## Cobertura de los requerimientos

| Requerimiento | Archivo de pruebas |
| --- | --- |
| Validaciones de formularios | `pruebas/validaciones.test.js` |
| Autenticación (correo y Google) | `pruebas/autenticacion.test.js` |
| Creación y cancelación de reservas | `pruebas/reservas.test.js` |
| Formato de los datos del vehículo | `pruebas/vehiculos.test.js` |
| Reglas de negocio (tarifa y traslape) | `pruebas/negocio.test.js` |

