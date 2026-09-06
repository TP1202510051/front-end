import { useEffect, useState } from 'react'
import { readAssetObjectUrl } from '@/api/assets'
import { formatMoney, resolveBinding, type CatalogBinding, type TextileProduct } from '@/api/catalog'
import { safeProblem } from '@/api/problems'

interface BoundCatalogGridProps {
  projectId: string
  binding: CatalogBinding
}

/**
 * Por que una rejilla no ensena nada, dicho de manera que se pueda arreglar.
 *
 * <p>Los cuatro se ven igual en la pagina -vacia- y se arreglan de maneras distintas. Sin
 * distinguirlos, quien edita tiene que probar: elegir, volver a crear lo que borro, o anadir
 * mercancia. Por eso el servidor los distingue y aqui se dicen.
 */
const outcomes: Record<string, string> = {
  UNCHOSEN: 'Todavía no has elegido qué muestra esta sección.',
  MISSING: 'Lo que esta sección mostraba ya no está en la tienda. Elige otra cosa.',
  EMPTY: 'Lo que elegiste no tiene prendas que ofrecer ahora mismo.',
}

/**
 * Una portada, traida con la autorizacion de quien mira.
 *
 * <p>La ruta de los bytes pide cabecera y un {@code <img src>} no las manda, asi que se traen y se
 * envuelven en una URL local. Quien la pide la suelta: una URL de objeto viva es memoria retenida.
 */
function Cover({ projectId, product }: { projectId: string, product: TextileProduct }) {
  const [source, setSource] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  const cover = product.media[0]

  useEffect(() => {
    if (!cover) return
    let live = true
    let created: string | null = null
    setMissing(false)
    readAssetObjectUrl(projectId, cover, 360)
      .then(url => {
        created = url
        if (live) setSource(url); else URL.revokeObjectURL(url)
      })
      .catch(() => { if (live) setMissing(true) })
    return () => {
      live = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [projectId, cover])

  if (!cover) return <p className="text-xs">Sin foto todavía.</p>
  // Lo que se cita y ya no esta se ensena como ausente, no se calla: retirar un medio no avisa a
  // quien lo citaba, y esa fue una decision deliberada.
  if (missing) return <p className="text-xs" role="status">Esta foto ya no está en el proyecto.</p>
  if (!source) return <p className="text-xs">Cargando la foto…</p>
  return <img src={source} alt={product.name} className="h-40 w-full rounded object-cover" />
}

/**
 * Las prendas que una seccion ensena, resueltas por el servidor.
 *
 * <p>El Canvas no resuelve la binding por su cuenta ni guarda una copia de los productos en el
 * documento. Una copia se queda vieja en cuanto alguien cambia un precio, y entonces la vista previa
 * y la tienda dicen cosas distintas sin que nadie lo note; preguntando, las dos ensenan lo mismo
 * porque las dos preguntan a lo mismo.
 */
export function BoundCatalogGrid({ projectId, binding }: BoundCatalogGridProps) {
  const [products, setProducts] = useState<TextileProduct[]>([])
  const [outcome, setOutcome] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let live = true
    setProblem(null)
    resolveBinding(projectId, binding)
      .then(resolved => {
        if (!live) return
        setProducts(resolved.products)
        setOutcome(resolved.outcome)
      })
      .catch(error => { if (live) setProblem(safeProblem(error).message) })
    return () => { live = false }
  }, [projectId, binding, attempt])

  if (problem) {
    return <div className="mt-4">
      <p role="alert">{problem}</p>
      <button type="button" className="mt-2 rounded border px-3 py-1"
        onClick={() => setAttempt(current => current + 1)}>Reintentar</button>
    </div>
  }
  if (outcome && outcome !== 'SHOWING') {
    return <p className="mt-4 text-sm" role="status">{outcomes[outcome] ?? 'No hay nada que mostrar.'}</p>
  }

  return <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Prendas de la sección">
    {products.map(product => (
      <li key={product.id} data-product-id={product.id} className="rounded border p-3">
        <Cover projectId={projectId} product={product} />
        <p className="mt-2 font-medium">{product.name}</p>
        <p className="text-sm">{formatMoney(product.basePrice)}</p>
      </li>
    ))}
  </ul>
}
