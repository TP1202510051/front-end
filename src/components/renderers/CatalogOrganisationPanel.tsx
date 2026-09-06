import { useCallback, useEffect, useState } from 'react'
import { listAssets, type ProjectAsset } from '@/api/assets'
import {
  classifyProduct, createCategory, createCollection, curateCollection, illustrateProduct,
  listCategories, listCollections, listProducts, removeCategory, removeCollection,
  type ProductCategory, type ProductCollection, type TextileProduct,
} from '@/api/catalog'
import { explainProblem, safeProblem } from '@/api/problems'

interface CatalogOrganisationPanelProps {
  projectId: string
  readOnly: boolean
}

const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

/**
 * Por que algo no se pudo organizar, dicho de manera que se pueda arreglar.
 *
 * <p>Cada uno se arregla distinto: un nombre repetido eligiendo otro, una prenda repetida quitando
 * una, y una foto ajena eligiendo una del proyecto. Un solo mensaje obligaria a probar.
 */
const refusals: Record<string, string> = {
  NAME_REQUIRED: 'Hace falta un nombre.',
  NAME_ALREADY_USED: 'Ya hay algo con ese nombre en esta tienda. Elige otro.',
  CATEGORY_UNKNOWN: 'Esa categoría ya no está en la tienda.',
  PRODUCT_UNKNOWN: 'Esa prenda no es de esta tienda.',
  ASSET_UNKNOWN: 'Esa foto no está en el proyecto. Súbela primero.',
  TOO_MANY_MEDIA: 'Son demasiadas fotos para una prenda. El máximo son 12.',
  DUPLICATE_MEMBER: 'Has puesto lo mismo dos veces. Quita la repetida.',
}

const authorizations: Record<string, string> = {
  AUTHENTICATION_REQUIRED: 'Tu sesión caducó. Inicia sesión otra vez.',
  AUTHORIZATION_DENIED: 'No tienes permiso sobre esta tienda.',
  RESOURCE_NOT_FOUND: 'Eso ya no está en la tienda.',
}

const explain = (problem: Parameters<typeof explainProblem>[0]) =>
  explainProblem(problem, refusals, authorizations)

/**
 * Como se organiza el catalogo: en que se clasifica, que se cura, y con que se ilustra.
 *
 * <p>Una categoria clasifica -la prenda pertenece a una sola- y una coleccion cura -esta en las que
 * haga falta, en el orden que alguien decidio-. Son dos cosas distintas y se editan por separado,
 * porque mezclarlas haria creer que reordenar una coleccion cambia donde esta clasificada la prenda.
 */
export function CatalogOrganisationPanel({ projectId, readOnly }: CatalogOrganisationPanelProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [collections, setCollections] = useState<ProductCollection[]>([])
  const [products, setProducts] = useState<TextileProduct[]>([])
  const [assets, setAssets] = useState<ProjectAsset[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Envuelta y no suprimida: el efecto la necesita como dependencia, y una funcion nueva en cada
  // render lo haria repetirse sin parar. Callar el aviso dejaria el bucle esperando a alguien.
  const reload = useCallback(async () => {
    const [found, curated, catalog, media] = await Promise.all([
      listCategories(projectId), listCollections(projectId),
      listProducts(projectId, null, 100), listAssets(projectId),
    ])
    setCategories(found)
    setCollections(curated)
    setProducts(catalog.items)
    setAssets(media)
  }, [projectId])

  useEffect(() => {
    let live = true
    reload()
      .then(() => { if (live) setLoaded(true) })
      .catch(error => { if (live) { setProblem(explain(safeProblem(error))); setLoaded(true) } })
    return () => { live = false }
  }, [reload])

  async function attempt(action: () => Promise<unknown>) {
    setPending(true); setProblem(null)
    try {
      await action()
      await reload()
      setCategoryName('')
      setCollectionName('')
    } catch (error) {
      setProblem(explain(safeProblem(error)))
    } finally { setPending(false) }
  }

  /** Poner o quitar de una coleccion se manda como la lista entera, que es lo que el servidor toma. */
  function toggleMember(collection: ProductCollection, productId: string) {
    const members = collection.productIds.includes(productId)
      ? collection.productIds.filter(id => id !== productId)
      : [...collection.productIds, productId]
    void attempt(() => curateCollection(projectId, collection.id, members))
  }

  function toggleMedia(product: TextileProduct, assetId: string) {
    const gallery = product.media.includes(assetId)
      ? product.media.filter(id => id !== assetId)
      : [...product.media, assetId]
    void attempt(() => illustrateProduct(projectId, product.id, gallery))
  }

  return <section aria-label="Organización del catálogo"
    className="w-full max-w-3xl max-h-96 overflow-y-auto space-y-4 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Organización del catálogo</h2>
    {pending && <p role="status">Guardando…</p>}
    {problem && <p role="alert">{problem}</p>}

    <div className="space-y-2">
      <h3 className="font-medium">Categorías</h3>
      <p className="text-xs">Clasifican: cada prenda pertenece a una sola.</p>
      {!readOnly && <div className="flex flex-wrap items-end gap-2">
        <label>Nueva categoría
          <input className={fieldStyle} value={categoryName} disabled={pending} maxLength={120}
            onChange={event => setCategoryName(event.target.value)} />
        </label>
        <button type="button" className={buttonStyle} disabled={pending || !categoryName.trim()}
          onClick={() => void attempt(() => createCategory(projectId, categoryName.trim()))}>
          Añadir categoría
        </button>
      </div>}
      {loaded && categories.length === 0 && <p>Todavía no hay categorías.</p>}
      <ul className="space-y-1">
        {categories.map(category => (
          <li key={category.id} className="flex flex-wrap items-center gap-2">
            <span>{category.name}</span>
            {!readOnly && <button type="button" className={buttonStyle} disabled={pending}
              onClick={() => void attempt(() => removeCategory(projectId, category.id))}>
              Quitar
            </button>}
          </li>
        ))}
      </ul>
    </div>

    <div className="space-y-2">
      <h3 className="font-medium">Colecciones</h3>
      <p className="text-xs">Curan: una prenda está en las que haga falta, en el orden que elijas.</p>
      {!readOnly && <div className="flex flex-wrap items-end gap-2">
        <label>Nueva colección
          <input className={fieldStyle} value={collectionName} disabled={pending} maxLength={120}
            onChange={event => setCollectionName(event.target.value)} />
        </label>
        <button type="button" className={buttonStyle} disabled={pending || !collectionName.trim()}
          onClick={() => void attempt(() => createCollection(projectId, collectionName.trim()))}>
          Añadir colección
        </button>
      </div>}
      {loaded && collections.length === 0 && <p>Todavía no hay colecciones.</p>}
      <ul className="space-y-2">
        {collections.map(collection => (
          <li key={collection.id} className="space-y-1 border-t border-slate-500 pt-2">
            <p>{collection.name} · {collection.productIds.length} prendas</p>
            {!readOnly && <div className="flex flex-wrap items-center gap-2">
              {products.map(product => (
                <label key={product.id} className="flex items-center gap-1">
                  <input type="checkbox" disabled={pending}
                    checked={collection.productIds.includes(product.id)}
                    onChange={() => toggleMember(collection, product.id)} />
                  {product.name}
                </label>
              ))}
              <button type="button" className={buttonStyle} disabled={pending}
                onClick={() => void attempt(() => removeCollection(projectId, collection.id))}>
                Quitar colección
              </button>
            </div>}
          </li>
        ))}
      </ul>
    </div>

    <div className="space-y-2">
      <h3 className="font-medium">Prendas</h3>
      {loaded && products.length === 0 && <p>Todavía no hay prendas que organizar.</p>}
      <ul className="space-y-2">
        {products.map(product => (
          <li key={product.id} className="space-y-1 border-t border-slate-500 pt-2">
            <p>{product.name}</p>
            {!readOnly && <div className="flex flex-wrap items-end gap-2">
              <label>Categoría
                <select className={fieldStyle} disabled={pending} value={product.categoryId ?? ''}
                  onChange={event => void attempt(() => classifyProduct(projectId, product.id,
                    event.target.value || null))}>
                  <option value="">Sin clasificar</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              {assets.length === 0
                ? <p className="text-xs">Sube una imagen para poder ilustrar esta prenda.</p>
                : <fieldset className="flex flex-wrap items-center gap-2">
                    <legend className="text-xs">Fotos, en orden; la primera es la portada</legend>
                    {assets.map(asset => (
                      <label key={asset.id} className="flex items-center gap-1">
                        <input type="checkbox" disabled={pending}
                          checked={product.media.includes(asset.id)}
                          onChange={() => toggleMedia(product, asset.id)} />
                        {asset.alternativeText}
                      </label>
                    ))}
                  </fieldset>}
            </div>}
          </li>
        ))}
      </ul>
    </div>
  </section>
}
