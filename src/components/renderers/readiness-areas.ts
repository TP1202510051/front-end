import type { MissingRequirement } from '@/api/readiness'

/**
 * A donde lleva cada area, y con que rotulo.
 *
 * <p>Vive aparte de los dos componentes que lo usan porque los dos tienen que estar de acuerdo: uno
 * escribe el enlace y el otro pone el ancla a la que apunta. Con la lista repetida en cada sitio,
 * anadir un area sale bien en uno y deja el otro enlazando a algo que no existe.
 *
 * <p>{@code PROJECT} no lleva destino, y no es un hueco por rellenar: nombra al proyecto entero, que
 * no tiene panel que abrir. Son los requisitos que no se resuelven editando -una forma de documento
 * que esta version no conoce, una publicacion retirada- y fingirles un sitio llevaria a la
 * empresaria a una pantalla donde no hay nada que tocar. Se dice, no se enlaza.
 */
export const destinations: Record<MissingRequirement['area'], { label: string; anchor: string } | null> = {
  PROJECT: null,
  PAGES: { label: 'Ir a las páginas', anchor: 'readiness-paginas' },
  THEME: { label: 'Ir al tema', anchor: 'readiness-tema' },
  ASSETS: { label: 'Ir a los medios', anchor: 'readiness-medios' },
  CATALOG: { label: 'Ir al catálogo', anchor: 'readiness-catalogo' },
}

/** Lo que se le dice a quien tiene delante un requisito que no se arregla desde la pantalla. */
export const NO_DESTINATION = 'Esto no se resuelve desde aquí.'
