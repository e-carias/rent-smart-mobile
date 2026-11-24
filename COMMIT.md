# RENT SMART · Parte 1 de 5 — Base del proyecto, Firebase y documentación

**Rama:** `parte-1-base-y-firebase`

Es el cimiento sobre el que se montan las otras cuatro partes: la estructura del repositorio, la conexión con Firebase, las reglas de seguridad, las reglas de negocio puras, los componentes de interfaz reutilizables y la documentación.

---

## Qué contiene este paquete

- `README.md`
- `LICENSE`
- `.gitignore`
- `firestore.rules`
- `firebase.json`
- `docs/capturas/README.md`
- `web/README.md`
- `web/.env.example`
- `web/.gitignore`
- `web/package.json`
- `web/package-lock.json`
- `web/next.config.ts`
- `web/tsconfig.json`
- `web/postcss.config.mjs`
- `web/eslint.config.mjs`
- `web/app/layout.tsx`
- `web/app/globals.css`
- `web/app/favicon.ico`
- `web/app/page.jsx`
- `web/app/error.jsx`
- `web/app/not-found.jsx`
- `web/app/firebase/configuracion.js`
- `web/app/services/progreso.js`
- `web/app/lib/constantes.js`
- `web/app/lib/utilidades.js`
- `web/app/lib/formato.js`
- `web/app/lib/validaciones.js`
- `web/app/lib/negocio.js`
- `web/app/components/Cargando.jsx`
- `web/app/components/Mensajes.jsx`
- `web/app/components/Etiqueta.jsx`
- `web/app/components/Tarjetas.jsx`
- `web/app/components/EstadoGlobal.jsx`
- `mobile/README.md`
- `mobile/.env.example`
- `mobile/.gitignore`
- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/app.json`
- `mobile/babel.config.js`
- `mobile/assets/` — 6 archivo(s)
- `mobile/src/firebase/configuracion.js`
- `mobile/src/tema.js`
- `mobile/src/datos/demo.js`
- `mobile/src/lib/formato.js`
- `mobile/src/lib/validaciones.js`
- `mobile/src/lib/negocio.js`
- `mobile/src/componentes/Boton.jsx`
- `mobile/src/componentes/CampoTexto.jsx`
- `mobile/src/componentes/CampoFecha.jsx`
- `mobile/src/componentes/Estados.jsx`
- `mobile/src/componentes/Etiqueta.jsx`
- `mobile/src/componentes/AvisoOrigen.jsx`
- `mobile/pruebas/configuracion.js`
- `mobile/pruebas/negocio.test.js`
- `mobile/scripts/cargar-catalogo.mjs`
- `mobile/scripts/informe-pruebas.mjs`

Los archivos vienen con la misma ruta que tendrán en el repositorio: basta con
copiarlos sobre la carpeta del proyecto respetando las carpetas.

---

## Cómo hacer el commit

Partiendo de una copia del repositorio ya clonada:

```bash
git clone https://github.com/<usuario>/<repositorio>.git rent-smart
cd rent-smart

# 1. Crear la rama de esta parte a partir de main
git checkout main
git pull
git checkout -b parte-1-base-y-firebase

# 2. Copiar aquí el contenido de este ZIP (respetando las carpetas)

# 3. Revisar qué se va a subir antes de confirmarlo
git status
git diff

# 4. Confirmar
git add .
git commit -m "feat(base): estructura del monorepo, configuracion de Firebase y reglas de seguridad"

# 5. Subir la rama y abrir el pull request hacia main
git push -u origin parte-1-base-y-firebase
```

### Mensaje de commit completo

Para usar el mensaje con su descripción —que es lo que conviene, porque explica
*por qué* se hizo cada cosa y no solo *qué* se hizo—, guardar el texto de
`MENSAJE_COMMIT.txt` y confirmar con:

```bash
git commit -F MENSAJE_COMMIT.txt
```

> Antes de confirmar, comprobar que **no** se incluye ningún archivo `.env` ni
> `node_modules`. El `.gitignore` de la parte 1 ya los excluye; `git status` lo
> confirma.

---

## Orden de las partes

Las cinco partes se integran en este orden, porque cada una se apoya en la
anterior:

| # | Rama | Parte |
| --- | --- | --- |
| 1 | `parte-1-base-y-firebase` | Base del proyecto, Firebase y documentación |
| 2 | `parte-2-autenticacion` | Autenticación con Firebase y perfiles de usuario |
| 3 | `parte-3-catalogo-vehiculos` | Catálogo de vehículos y disponibilidad |
| 4 | `parte-4-reservas` | Reservas, historial y bitácora de actividad |
| 5 | `parte-5-contratos-y-reportes` | Contratos, reportes y panel administrativo |

La **parte 1** debe estar en `main` antes que las demás: contiene la
configuración de Firebase, las reglas de negocio y los componentes que el resto
importa. Las partes 2 a 5 no se tocan entre sí, así que pueden trabajarse en
paralelo y fusionarse en cualquier orden una vez integrada la primera.
