import type { ReactNode } from 'react'
import type { ProjectDocument } from '@/canvas/intention'
import { SURFACE_CLASS, surfaceStyleSheet, surfaceTokens } from '@/canvas/theme'

interface StoreSurfaceProps {
  document: ProjectDocument | undefined
  children: ReactNode
}

/**
 * El trozo de pantalla donde manda el Theme de la tienda, y solo ahi.
 *
 * <p>Los tokens viven en este elemento y no en la raiz del documento, y cada selector llega ya
 * acotado a su clase desde que se acepto. Las dos cosas juntas son lo que impide que el CSS de una
 * tienda tiña la aplicacion que la rodea: aunque alguien escribiera algo pensado para escaparse, el
 * servidor no lo habria aceptado, y si aun asi llegara, no tendria a donde llegar.
 */
export function StoreSurface({ document, children }: StoreSurfaceProps) {
  const css = surfaceStyleSheet(document)
  return (
    <div className={SURFACE_CLASS} style={surfaceTokens(document?.theme)}>
      {css && <style>{css}</style>}
      {children}
    </div>
  )
}
