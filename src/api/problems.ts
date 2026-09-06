import type { components } from './schema'
import { isUuid } from './validators'

type ProblemCode = components['schemas']['ProblemCode']
export type RecoveryAction = components['schemas']['RecoveryAction']
type Recovery = { message: string; action: RecoveryAction }

const recovery = {
  BAD_REQUEST: { message: 'Revisa los datos de la solicitud.', action: 'EDIT_REQUEST' },
  AUTHENTICATION_REQUIRED: { message: 'Inicia sesión nuevamente para continuar.', action: 'SIGN_IN' },
  RESOURCE_NOT_FOUND: { message: 'El recurso no está disponible.', action: 'RETURN_TO_PROJECTS' },
  METHOD_NOT_ALLOWED: { message: 'La operación no está disponible para este recurso.', action: 'EDIT_REQUEST' },
  NOT_ACCEPTABLE: { message: 'El formato de respuesta solicitado no está disponible.', action: 'EDIT_REQUEST' },
  CONFLICT: { message: 'El estado cambió. Actualiza antes de volver a intentarlo.', action: 'REFRESH' },
  IDEMPOTENCY_KEY_REUSED: { message: 'La clave ya corresponde a otra solicitud. Revisa los datos.', action: 'EDIT_REQUEST' },
  UNSUPPORTED_MEDIA_TYPE: { message: 'El formato de la solicitud no es compatible.', action: 'EDIT_REQUEST' },
  SEMANTIC_VALIDATION_FAILED: { message: 'La solicitud no cumple las reglas del proyecto.', action: 'EDIT_REQUEST' },
  RATE_LIMITED: { message: 'Espera un momento antes de volver a intentarlo.', action: 'RETRY_LATER' },
  DEPENDENCY_UNAVAILABLE: { message: 'El servicio no está disponible temporalmente.', action: 'RETRY_LATER' },
  INTERNAL_ERROR: { message: 'No se pudo completar la solicitud.', action: 'CONTACT_SUPPORT' },
} satisfies Record<ProblemCode, Recovery>

/**
 * Never displays server detail/title or arbitrary provider/transport messages.
 *
 * <p>{@link ApiProblem.issues} es la excepcion, y viaja con la misma desconfianza con la que llego:
 * el servidor ya solo manda sitios y codigos, y aqui se vuelve a comprobar que eso es lo que hay.
 * Un mensaje de error se pinta sin pensarlo mucho, asi que es justo por donde volveria lo que la
 * validacion nego. Comprobarlo dos veces cuesta una linea.
 */
export class ApiProblem extends Error {
  readonly code: ProblemCode | 'AUTHORIZATION_DENIED' | 'CONTRACT_MISMATCH' | 'NETWORK_UNAVAILABLE'
    | 'REVISION_CONFLICT'
  readonly action: RecoveryAction
  readonly correlationId?: string
  /** Sitio y codigo de cada regla no admitida, ya filtrados por forma. */
  readonly issues: string[]

  constructor(code: ApiProblem['code'], guidance: Recovery, correlationId?: string, issues?: unknown) {
    super(guidance.message)
    this.name = 'ApiProblem'
    this.code = code
    this.action = guidance.action
    this.correlationId = correlationId
    this.issues = safeIssues(issues)
  }
}

const SAFE_ISSUE = /^\$[A-Za-z0-9_.[\]-]{0,200} [A-Z][A-Z_]{2,60}$/

export function safeIssues(issues: unknown): string[] {
  return Array.isArray(issues)
    ? issues.filter((issue): issue is string => typeof issue === 'string' && SAFE_ISSUE.test(issue)).slice(0, 20)
    : []
}

export type OperationConflict = components['schemas']['OperationConflictView']

/**
 * El unico desenlace que llega con detalle, y a proposito.
 *
 * <p>Un conflicto que no dice contra que se choco solo deja reintentar a ciegas. Lo que viaja aqui
 * son datos del propio proyecto de quien pregunta, no interioridades del servidor.
 */
export class RevisionConflictProblem extends ApiProblem {
  readonly baseRevisionId: string
  readonly headRevisionId: string
  readonly conflicts: OperationConflict[]

  constructor(baseRevisionId: string, headRevisionId: string, conflicts: OperationConflict[]) {
    super('REVISION_CONFLICT', {
      message: 'Alguien cambió esto mientras lo editabas.', action: 'REFRESH',
    })
    this.baseRevisionId = baseRevisionId
    this.headRevisionId = headRevisionId
    this.conflicts = conflicts
  }
}

const conflictKinds = ['PROPERTY_CHANGED', 'TARGET_MISSING', 'STRUCTURE_CHANGED']

function isConflict(value: unknown): value is OperationConflict {
  if (!value || typeof value !== 'object') return false
  const conflict = value as Record<string, unknown>
  // Ni la pagina ni el componente son obligatorios: un choque de la pagina entera no nombra
  // componente, y uno del Theme no nombra pagina. Exigirlos degradaba esos choques a
  // "respuesta incompatible", que le decia a la empresaria que actualizara en vez de decidir.
  return typeof conflict.kind === 'string' && conflictKinds.includes(conflict.kind)
    && (conflict.pageId == null || typeof conflict.pageId === 'string')
    && (conflict.componentId == null || typeof conflict.componentId === 'string')
    && (conflict.property == null || typeof conflict.property === 'string')
    && (conflict.attempted == null || typeof conflict.attempted === 'string')
    && (conflict.current == null || typeof conflict.current === 'string')
}

function revisionConflict(payload: unknown): RevisionConflictProblem | null {
  if (!payload || typeof payload !== 'object') return null
  const body = payload as Record<string, unknown>
  if (typeof body.baseRevisionId !== 'string' || typeof body.headRevisionId !== 'string') return null
  if (!Array.isArray(body.conflicts) || body.conflicts.length === 0
    || !body.conflicts.every(isConflict)) return null
  return new RevisionConflictProblem(body.baseRevisionId, body.headRevisionId, body.conflicts)
}

export function publicProblem(payload: unknown, status?: number): ApiProblem {
  if (status === 401) return new ApiProblem('AUTHENTICATION_REQUIRED', recovery.AUTHENTICATION_REQUIRED)
  if (status === 409) {
    const conflict = revisionConflict(payload)
    if (conflict) return conflict
  }
  if (status === 403) return new ApiProblem('AUTHORIZATION_DENIED', {
    message: 'No tienes permiso para realizar esta acción.', action: 'RETURN_TO_PROJECTS',
  })
  if (payload && typeof payload === 'object' && 'code' in payload
      && typeof payload.code === 'string' && Object.prototype.hasOwnProperty.call(recovery, payload.code)) {
    const code = payload.code as ProblemCode
    const correlationId = 'correlationId' in payload && isUuid(payload.correlationId)
      ? payload.correlationId : undefined
    return new ApiProblem(code, recovery[code], correlationId,
      'issues' in payload ? payload.issues : undefined)
  }
  return new ApiProblem('CONTRACT_MISMATCH', { message: 'La respuesta del servicio no es compatible. Actualiza la aplicación.', action: 'REFRESH' })
}

export function safeProblem(error: unknown): ApiProblem {
  return error instanceof ApiProblem ? error : new ApiProblem('NETWORK_UNAVAILABLE', {
    message: 'No se pudo conectar. Comprueba tu conexión e inténtalo nuevamente.', action: 'RETRY_LATER',
  })
}
