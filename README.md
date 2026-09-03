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

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VITE_API_BASE_URL` | Origen de la API de la plataforma |
| `VITE_API_WS_URL` | Origen del canal de tiempo real |
| `VITE_CLOUD_RUN_URL` | Origen del servicio de inferencia del asistente |
| `VITE_FIREBASE_*` | Configuración de Firebase para la autenticación |

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

## Contribuir

Ramas `feature/*`, `fix/*` y `chore/*` sobre `develop`, con mensajes en Conventional Commits. Una
capacidad que toca los dos repositorios usa el mismo sufijo de rama en ambos, con pull requests
enlazados entre sí; no está terminada hasta que las comprobaciones de los dos pasan.

El vocabulario del producto está en [`CONTEXT.md`](CONTEXT.md).
