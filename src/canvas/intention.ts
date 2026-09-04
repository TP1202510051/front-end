import type { components } from '@/api/schema'

export type ProjectDocument = components['schemas']['ProjectDocumentView']
export type ProjectOperation = components['schemas']['ProjectOperationInput']

/**
 * Lo que el Canvas sabe hacer con una intención antes de que el servidor opine.
 *
 * <p>El cambio se ve al instante porque se aplica aquí sobre una copia del documento aceptado. Esa
 * copia no es la verdad: es lo que la empresaria acaba de pedir, y se marca como pendiente hasta
 * que vuelve una revisión aceptada. Si no vuelve, se descarta; nunca se asciende a aceptada por su
 * cuenta.
 */
export function setPropertyOperation(
  pageId: string, componentId: string, property: string, value: string,
): ProjectOperation {
  return { kind: 'SET_PROPERTY', pageId, componentId, property, value }
}

/**
 * El mismo efecto que tendrá la operación en el servidor, aplicado sobre una copia.
 *
 * <p>Devuelve el documento intacto cuando el objetivo no está, en lugar de crearlo: inventar aquí un
 * componente que el servidor no tiene enseñaría un Canvas que no se corresponde con nada.
 */
export function withProperty(
  document: ProjectDocument, pageId: string, componentId: string, property: string, value: string,
): ProjectDocument {
  return {
    ...document,
    pages: document.pages.map(page => page.id !== pageId ? page : {
      ...page,
      components: page.components.map(component => component.id !== componentId ? component : {
        ...component,
        properties: { ...component.properties, [property]: value },
      }),
    }),
  }
}

/**
 * Una identidad por intención, no por envío.
 *
 * <p>La distinción es la que hace que la idempotencia sirva de algo: si se generase una clave en
 * cada envío, un reintento seria una intención nueva a ojos del servidor y acabaria escribiendo una
 * segunda revisión con el mismo cambio.
 */
export function intentionKey(): string {
  return crypto.randomUUID()
}

/** Una intención concreta, con la identidad que la acompaña mientras no se resuelva. */
export interface Intention {
  key: string
  heading: string
}

/**
 * Si el servidor contestó de verdad o se quedó sin contestar.
 *
 * <p>Un rechazo -no cabe en el proyecto, la base se quedó vieja- es una respuesta: la intención está
 * resuelta y su clave no vuelve a usarse. Una caída de red o un fallo del servidor no dicen si
 * llegó a aceptarse, y ahi es donde reintentar con la misma clave evita duplicar lo ya aceptado.
 */
export function outcomeIsUnknown(action: string): boolean {
  return action === 'RETRY_LATER' || action === 'CONTACT_SUPPORT'
}
