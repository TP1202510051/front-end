# Abstractify · Aplicación web

Interfaz con la que una emprendedora textil compone su tienda: el lienzo donde coloca y ajusta los
componentes verificados, el asistente al que le pide cambios por escrito o de viva voz, y el panel
desde el que la administra.

Un cambio se ve al momento y se marca como pendiente hasta que el servidor lo confirma; si lo
rechaza, se recupera lo anterior o se reconcilia con lo que el proyecto sea ahora, pero nunca se
queda pintado como si hubiera entrado.

La API que consume está en [`TP1202510051/back-end`](https://github.com/TP1202510051/back-end).

## Empezar

Necesita **Node.js 24** y el fichero de bloqueo que viene en el repositorio.

```bash
npm ci
npm run dev
```

## Verificar

```bash
npm run verify
npm run test:e2e
```

`verify` comprueba que el cliente generado sigue correspondiéndose con el contrato, ejecuta las
pruebas de contrato y de seguridad del renderizado, pasa ESLint y el chequeo de tipos, y construye
la versión de producción.

`test:e2e` levanta Vite en modo `e2e`, con autenticación determinista y sin salir a la red: sólo se
interceptan peticiones públicas del backend. Corre Playwright y axe en Chrome. El puerto 4173 tiene
que estar libre —la prueba arranca su propio servidor y se niega a reutilizar otro— y al fallar
conserva capturas, trazas y el informe HTML.

La puerta de accesibilidad rechaza violaciones críticas de axe y adjunta el análisis completo. No es
una comprobación de conformidad WCAG.

## La puerta de release

Chrome y Edge bloquean; Firefox es un humo informativo (`docs/release-gate.md`):

```bash
npm run test:e2e:gate      # Chrome y Edge
npm run test:e2e:firefox   # informativo: su fallo se registra y no bloquea
npm run blockers           # evidencia saneada de los bloqueos de seguridad, tras `npm run build`
```

`tests/e2e/responsive-journeys.spec.ts` recorre crear proyecto, editar la portada y aceptar una
propuesta a 360, 768, 1024 y 1440 px con axe (crítica o seria bloquea) y una captura por estado;
`tests/e2e/keyboard-journey.spec.ts` hace el mismo recorrido solo con teclado. `blockers` deja en
`release-evidence/` qué prueba demuestra cada bloqueo y si pasó, sin nada más.

## El cliente de la API no se escribe a mano

`src/api/schema.d.ts` se genera desde `contracts/openapi-v1.json`, que es el mismo fichero que
publica el backend. Editarlo a mano hace fallar la verificación a propósito.

```bash
npm run contract:generate   # tras revisar un contrato nuevo
npm run contract:check      # el cliente corresponde a su contrato
npm run contract:pair       # el contrato corresponde al del backend
```

La comparación con el backend es de igualdad exacta: una capacidad que cambia la forma de la API no
pasa hasta que los dos repositorios coinciden. Encima del cliente generado hay validadores que
rechazan una respuesta que no cumpla el contrato, para que una carga inesperada no llegue nunca a la
interfaz haciéndose pasar por datos buenos.

## Un solo artefacto, configurado al desplegar

El artefacto de release se construye una vez, sin identidad de instalación, y se promueve por el
hash de su contenido (`docs/release-artifact.md`):

```bash
npm run build               # el único build
npm run release:artifact    # release/frontend-artifact.json con el SHA-256 de ese dist
npm run test:artifact       # el dist identificado arranca y lee su runtime-config.json
node scripts/release-artifact.mjs verify dist release/frontend-artifact.json   # antes de desplegar
npm run release:evidence    # evidencia saneada a partir de los informes JSON de Playwright
```

Al arrancar, la aplicación lee `/runtime-config.json` junto al artefacto —la instalación lo escribe
al desplegar; `docs/runtime-config.example.json` es la forma— y solo sin ese fichero usa las
variables de Vite de abajo, que son las del servidor de desarrollo y del modo `e2e`. Un artefacto de
release sin el fichero dice que no está configurado en vez de arrancar contra nada.

## Variables de entorno (desarrollo y e2e)

| Variable | Para qué | Clave en `runtime-config.json` |
|---|---|---|
| `VITE_API_BASE_URL` | Origen de la API de la plataforma | `apiBaseUrl` |
| `VITE_API_WS_URL` | Origen del canal de tiempo real | `apiWsUrl` |
| `VITE_FIREBASE_*` | Configuración de Firebase para la autenticación | `firebase.*` |

Ningún secreto vive en el repositorio. El modo `e2e` sustituye la autenticación por una determinista
y una construcción de despliegue que lo use se rechaza.

## Estructura

| Ruta | Qué es |
|---|---|
| `src/api/` | Cliente generado, validadores de respuesta y problemas públicos |
| `src/canvas/` | Las reglas de una intención manual antes de enviarla |
| `src/components/renderers/` | La composición dibujada desde el documento del proyecto |
| `src/registry/` | El registro verificado de componentes |
| `contracts/` | El contrato REST versionado |
| `tests/e2e/` | Recorridos con Playwright y axe |
| `scripts/` | Contrato, seguridad del renderizado, secretos del artefacto y evidencia de bloqueos |

## Contribuir

Ramas `feature/*`, `fix/*` y `chore/*` sobre `develop`, con mensajes en Conventional Commits. Una
capacidad que toca los dos repositorios usa el mismo sufijo de rama en ambos, con pull requests
enlazados entre sí; no está terminada hasta que las comprobaciones de los dos pasan.

El vocabulario del producto está en [`CONTEXT.md`](CONTEXT.md).
