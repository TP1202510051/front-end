/**
 * La configuracion de la instalacion, leida al arrancar y no horneada en el build.
 *
 * El artefacto se construye una vez y se promueve por hash a la aceptacion local, a staging y a la
 * evidencia (front-end#89); lo unico que cambia entre instalaciones es este fichero, que el
 * despliegue deja junto al artefacto. Sin el, valen las variables que Vite inyecto: es lo que usan
 * el servidor de desarrollo y el modo e2e.
 *
 * Se carga antes de evaluar la aplicacion: los modulos que crean el cliente REST y Firebase lo
 * leen al importarse, y para entonces ya tiene que estar decidido.
 */
export const RUNTIME_CONFIG_PATH = '/runtime-config.json'

/** Las claves de Firebase, una sola vez: de aqui salen el tipo, la lectura y la validacion. */
const FIREBASE_KEYS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const
type FirebaseKey = typeof FIREBASE_KEYS[number]
/** Sin estas tres no hay identidad con la que iniciar sesion: sin ellas la instalacion no esta configurada. */
const IDENTITY_KEYS: readonly FirebaseKey[] = ['apiKey', 'projectId', 'appId']

export interface RuntimeConfig {
  apiBaseUrl: string
  apiWsUrl: string
  firebase: Record<FirebaseKey, string>
}

export type RuntimeConfigOutcome =
  | { status: 'loaded', config: RuntimeConfig }
  /** No hay fichero y el build tampoco trae identidad: la instalacion esta sin configurar. */
  | { status: 'missing' }
  /** Hay fichero pero no tiene la forma esperada: no se aplica a medias. */
  | { status: 'invalid' }

let loaded: RuntimeConfig | null = null

function fromBuild(): RuntimeConfig {
  const env = import.meta.env
  return {
    apiBaseUrl: env.VITE_API_BASE_URL ?? '',
    apiWsUrl: env.VITE_API_WS_URL ?? '',
    firebase: {
      apiKey: env.VITE_FIREBASE_API_KEY ?? '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: env.VITE_FIREBASE_APP_ID ?? '',
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown, fallback: string): string | null {
  if (value === undefined) return fallback
  return typeof value === 'string' ? value : null
}

/**
 * Lo servido sobre lo horneado, campo a campo; un campo con un tipo que no es el suyo invalida el
 * fichero entero, para que una instalacion mal escrita no arranque a medias.
 */
export function mergeRuntimeConfig(served: unknown, build: RuntimeConfig): RuntimeConfig | null {
  if (!isRecord(served)) return null
  const apiBaseUrl = optionalString(served.apiBaseUrl, build.apiBaseUrl)
  const apiWsUrl = optionalString(served.apiWsUrl, build.apiWsUrl)
  if (apiBaseUrl === null || apiWsUrl === null) return null
  const firebase = { ...build.firebase }
  if (served.firebase !== undefined) {
    if (!isRecord(served.firebase)) return null
    for (const key of FIREBASE_KEYS) {
      const value = optionalString(served.firebase[key], build.firebase[key])
      if (value === null) return null
      firebase[key] = value
    }
  }
  return { apiBaseUrl, apiWsUrl, firebase }
}

/** Una instalacion esta configurada cuando tiene con que iniciar sesion. */
export function isConfigured(config: RuntimeConfig): boolean {
  return IDENTITY_KEYS.every(key => config.firebase[key] !== '')
}

/** Un servidor de SPA contesta index.html a lo que no existe; eso no es un fichero de configuracion. */
function isJson(response: Response): boolean {
  return (response.headers.get('content-type') ?? '').toLowerCase().includes('json')
}

/**
 * Carga la configuracion una vez. Sin fichero vale la del build -el servidor de desarrollo y el
 * modo e2e-; un artefacto de release se construye sin identidad, asi que sin fichero se queda sin
 * configurar y lo dice, en vez de arrancar contra nada.
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfigOutcome> {
  const build = fromBuild()
  let response: Response | null = null
  try {
    response = await fetch(RUNTIME_CONFIG_PATH, { cache: 'no-store' })
  } catch {
    response = null
  }
  let served: unknown = undefined
  if (response && response.ok && isJson(response)) {
    try {
      served = await response.json()
    } catch {
      return { status: 'invalid' }
    }
  } else if (response && !response.ok && response.status !== 404) {
    return { status: 'invalid' }
  }
  const config = served === undefined ? build : mergeRuntimeConfig(served, build)
  if (!config) return { status: 'invalid' }
  if (!isConfigured(config)) return { status: 'missing' }
  loaded = config
  return { status: 'loaded', config }
}

/** La configuracion ya cargada; llamarla antes de cargar es un error de arranque, no de datos. */
export function runtimeConfig(): RuntimeConfig {
  if (!loaded) throw new Error('runtime configuration was read before it was loaded')
  return loaded
}
