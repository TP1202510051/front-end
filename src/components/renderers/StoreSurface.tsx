import { useEffect, useState, type ReactNode } from 'react'
import { listAssets, readAssetObjectUrl } from '@/api/assets'
import type { ProjectDocument } from '@/canvas/intention'
import { SURFACE_CLASS, citedAssets, surfaceStyleSheet, surfaceTokens } from '@/canvas/theme'

interface StoreSurfaceProps {
  projectId: string
  document: ProjectDocument | undefined
  children: ReactNode
}

/**
 * El trozo de pantalla donde manda el Theme de la tienda, y solo ahi.
 *
 * <p>Los tokens viven en este elemento y no en la raiz del documento, y cada selector llega ya
 * acotado a su clase desde que se acepto. Las dos cosas juntas son lo que impide que el CSS de una
 * tienda tiña la aplicacion que la rodea.
 *
 * <p>Los assets que el CSS cita se traen aqui, con la autorizacion de quien mira, y se pintan como
 * URLs locales. La ruta del servidor no llega nunca al CSS: lo que el documento guarda es una
 * identidad, y una identidad solo se resuelve contra lo que el proyecto tiene.
 */
export function StoreSurface({ projectId, document, children }: StoreSurfaceProps) {
  const cited = citedAssets(document)
  const [assets, setAssets] = useState<Record<string, string>>({})
  const [missing, setMissing] = useState<string[]>([])
  const [attempt, setAttempt] = useState(0)
  const wanted = cited.join(',')

  useEffect(() => {
    let live = true
    const created: string[] = []
    const identifiers = wanted ? wanted.split(',') : []
    if (identifiers.length === 0) { setAssets({}); setMissing([]); return }
    void (async () => {
      // Se pinta una derivada y no el original: son las anchuras que la tienda ensena, y traer el
      // original entero para pintarlo pequeno gasta banda que nadie ve. La mas ancha que exista da
      // el mejor resultado en pantallas densas; si no hay ninguna, queda el canonico.
      const widths = new Map<string, number | undefined>()
      try {
        for (const asset of await listAssets(projectId)) {
          const widest = asset.derivatives.length === 0 ? undefined
            : asset.derivatives[asset.derivatives.length - 1].width
          widths.set(asset.id, widest)
        }
      } catch { /* Sin catalogo se pide el canonico, que siempre existe. */ }
      const results = await Promise.all(identifiers.map(async id => {
        try {
          const url = await readAssetObjectUrl(projectId, id, widths.get(id))
          created.push(url)
          return [id, url] as const
        } catch { return [id, null] as const }
      }))
      if (!live) return
      setAssets(Object.fromEntries(results.filter(([, url]) => url).map(([id, url]) => [id, url!])))
      setMissing(results.filter(([, url]) => !url).map(([id]) => id))
    })()
    // Una URL de objeto viva es memoria retenida, y la pantalla puede cambiar de proyecto.
    return () => { live = false; created.forEach(URL.revokeObjectURL) }
  }, [projectId, wanted, attempt])

  const css = surfaceStyleSheet(document, assets)
  return (
    <div className={SURFACE_CLASS} style={surfaceTokens(document?.theme)}>
      {css && <style>{css}</style>}
      {missing.length > 0 && (
        // Que falte una imagen se dice; lo que no se hace es pintar la tienda como si estuviera.
        <p role="status" className="mb-2 rounded border border-amber-500 px-2 py-1 text-sm">
          {missing.length === 1
            ? 'Una imagen del tema no está disponible y no se ha aplicado.'
            : `${missing.length} imágenes del tema no están disponibles y no se han aplicado.`}{' '}
          {/* Recuperable quiere decir que se puede volver a intentar, no solo que se avisa. */}
          <button type="button" className="underline" onClick={() => setAttempt(count => count + 1)}>
            Reintentar
          </button>
        </p>
      )}
      {children}
    </div>
  )
}
