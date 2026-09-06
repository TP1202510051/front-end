import { useEffect, useState } from 'react'
import {
  addVariant, amountField, archiveProduct, archiveVariant, createProduct, formatMoney,
  listProducts, parseMoney, updateProduct, updateVariant,
  type SellableVariant, type TextileProduct,
} from '@/api/catalog'
import { explainProblem, safeProblem } from '@/api/problems'

interface TextileCatalogPanelProps {
  projectId: string
  readOnly: boolean
}

const CURRENCY = 'PEN'
const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

/**
 * Por que algo no entro en el catalogo, dicho en el idioma de quien lo escribe.
 *
 * <p>Se distinguen a proposito, porque cada uno se arregla de otra manera: un SKU repetido se
 * arregla eligiendo otro codigo, una talla repetida se arregla editando la variante que ya existe,
 * y un precio invalido se arregla escribiendo otro numero. Un solo mensaje obligaria a probar.
 */
const refusals: Record<string, string> = {
  NAME_REQUIRED: 'La prenda necesita un nombre.',
  PRICE_INVALID: 'El precio no puede ser negativo.',
  CURRENCY_INVALID: 'La moneda son tres letras, como PEN.',
  CURRENCY_MISMATCH: 'La variante tiene que cobrarse en la misma moneda que la prenda.',
  SKU_REQUIRED: 'La variante necesita un SKU.',
  SKU_ALREADY_USED: 'Ese SKU ya está en uso en esta tienda. Elige otro código.',
  SIZE_REQUIRED: 'Falta la talla.',
  COLOR_REQUIRED: 'Falta el color.',
  VARIANT_ALREADY_EXISTS: 'Ya existe esa talla en ese color. Edita la que hay en vez de repetirla.',
  STOCK_INVALID: 'El stock no puede ser negativo.',
  PRODUCT_ARCHIVED: 'La prenda está retirada. Ya no admite variantes nuevas.',
}

/**
 * Los fallos de autorizacion no vienen con codigo de catalogo, sino con el de la respuesta.
 *
 * <p>Lo ajeno y lo que no esta se contestan igual a proposito, asi que aqui tampoco se distinguen:
 * hacerlo convertiria un identificador en una forma de averiguar que existe.
 */
const authorizations: Record<string, string> = {
  AUTHENTICATION_REQUIRED: 'Tu sesión caducó. Inicia sesión otra vez para editar el catálogo.',
  AUTHORIZATION_DENIED: 'No tienes permiso sobre esta tienda.',
  RESOURCE_NOT_FOUND: 'Esa prenda ya no está en la tienda.',
}

const explain = (problem: Parameters<typeof explainProblem>[0]) =>
  explainProblem(problem, refusals, authorizations)

interface VariantDraft {
  sku: string
  size: string
  color: string
  price: string
  stock: string
}

const emptyVariant: VariantDraft = { sku: '', size: '', color: '', price: '', stock: '0' }

function draftOf(variant: SellableVariant): VariantDraft {
  return {
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    // Solo se rellena cuando la variante cobra aparte: un campo con el precio heredado ya escrito
    // convertiria cualquier guardado en un precio propio que nadie pidio.
    price: variant.pricedApart ? amountField(variant.price) : '',
    stock: String(variant.stock),
  }
}

/**
 * El catalogo de la tienda: prendas, sus variantes vendibles y su inventario.
 *
 * <p>Cada fila edita lo suyo. Con un formulario compartido, guardar una prenda escribia lo que se
 * habia tecleado para otra, que es un fallo que no se ve hasta que ya paso.
 */
export function TextileCatalogPanel({ projectId, readOnly }: TextileCatalogPanelProps) {
  const [products, setProducts] = useState<TextileProduct[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const [edits, setEdits] = useState<Record<string, { name: string, description: string, price: string }>>({})
  const [variantDrafts, setVariantDrafts] = useState<Record<string, VariantDraft>>({})
  const [newVariants, setNewVariants] = useState<Record<string, VariantDraft>>({})

  useEffect(() => {
    let live = true
    listProducts(projectId)
      .then(page => {
        if (!live) return
        setProducts(page.items)
        setCursor(page.nextCursor)
        setLoaded(true)
      })
      // Se explica igual que cualquier otro fallo: un catalogo ajeno o inexistente llegaba aqui
      // como la cadena cruda del servidor, que no dice que hacer.
      .catch(error => { if (live) { setProblem(explain(safeProblem(error))); setLoaded(true) } })
    return () => { live = false }
  }, [projectId])

  async function attempt(action: () => Promise<unknown>) {
    setPending(true); setProblem(null)
    try {
      await action()
      const page = await listProducts(projectId)
      setProducts(page.items)
      setCursor(page.nextCursor)
      setEdits({}); setVariantDrafts({}); setNewVariants({})
    } catch (error) {
      setProblem(explain(safeProblem(error)))
    } finally { setPending(false) }
  }

  async function more() {
    setPending(true); setProblem(null)
    try {
      const page = await listProducts(projectId, cursor)
      setProducts(current => [...current, ...page.items])
      setCursor(page.nextCursor)
    } catch (error) {
      setProblem(explain(safeProblem(error)))
    } finally { setPending(false) }
  }

  /**
   * La variante que se va a escribir, o nada si lo tecleado no es un precio.
   *
   * <p>Vacio y mal escrito no son lo mismo, aunque los dos den nulo al convertirlos: vacio quiere
   * decir "cobra el de la prenda", y mal escrito no quiere decir nada. Tratarlos igual haria que
   * teclear "6,9O" con una letra cobrara el precio base sin avisar, que es peor que rechazarlo.
   */
  function variantBody(draft: VariantDraft) {
    const written = draft.price.trim()
    const own = written === '' ? null : parseMoney(written, CURRENCY)
    if (written !== '' && own === null) return null
    const stock = Number(draft.stock.trim())
    if (!Number.isInteger(stock) || stock < 0) return null
    return {
      sku: draft.sku.trim(), size: draft.size.trim(), color: draft.color.trim(),
      price: own, stock,
    }
  }

  /** Escribe la variante, o dice que revisar sin llegar a mandar nada. */
  function writeVariant(draft: VariantDraft, send: (body: NonNullable<ReturnType<typeof variantBody>>) => Promise<unknown>) {
    const body = variantBody(draft)
    if (!body) { setProblem('Revisa el precio y el stock: el precio lleva como mucho dos decimales y el stock es un entero.'); return }
    void attempt(() => send(body))
  }

  return <section aria-label="Catálogo de la tienda"
    className="w-full max-w-3xl max-h-96 overflow-y-auto space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Catálogo de la tienda</h2>

    {!readOnly && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault()
      const money = parseMoney(price, CURRENCY)
      if (!money) { setProblem(refusals.PRICE_INVALID); return }
      void attempt(() => createProduct(projectId, {
        name: name.trim(), description: description.trim(), basePrice: money,
      }))
    }}>
      <label>Nombre de la prenda
        <input className={fieldStyle} value={name} disabled={pending} maxLength={160} required
          onChange={event => setName(event.target.value)} />
      </label>
      <label>Descripción
        <input className={fieldStyle} value={description} disabled={pending} maxLength={2000}
          onChange={event => setDescription(event.target.value)} />
      </label>
      <label>Precio base
        <input className={fieldStyle} value={price} disabled={pending} inputMode="decimal" required
          onChange={event => setPrice(event.target.value)} />
      </label>
      <button type="submit" className={buttonStyle} disabled={pending || !name.trim() || !price.trim()}>
        Añadir prenda
      </button>
      <p className="w-full text-xs">El precio va en {CURRENCY}, con dos decimales como máximo.</p>
    </form>}

    {pending && <p role="status">Guardando…</p>}
    {problem && <p role="alert">{problem}</p>}
    {loaded && products.length === 0 && !problem && <p>Todavía no hay prendas.</p>}

    <ul className="space-y-3">
      {products.map(product => {
        const edit = edits[product.id] ?? {
          name: product.name, description: product.description,
          price: amountField(product.basePrice),
        }
        const fresh = newVariants[product.id] ?? emptyVariant
        return <li key={product.id} className="space-y-2 border-t border-slate-500 pt-2">
          <p className="font-medium">
            {product.name}
            {product.status === 'ARCHIVED' && <span className="ml-2 text-xs">· retirada</span>}
          </p>
          <p className="text-xs">
            {formatMoney(product.basePrice)} · {product.variants.length} variantes ·{' '}
            {product.variants.reduce((total, variant) => total + variant.stock, 0)} en stock
          </p>

          {!readOnly && <div className="flex flex-wrap items-end gap-2">
            <label>Nombre
              <input className={fieldStyle} value={edit.name} disabled={pending} maxLength={160}
                onChange={event => setEdits(current => ({
                  ...current, [product.id]: { ...edit, name: event.target.value },
                }))} />
            </label>
            <label>Descripción de la prenda
              <input className={fieldStyle} value={edit.description} disabled={pending} maxLength={2000}
                onChange={event => setEdits(current => ({
                  ...current, [product.id]: { ...edit, description: event.target.value },
                }))} />
            </label>
            <label>Precio base
              <input className={fieldStyle} value={edit.price} disabled={pending} inputMode="decimal"
                onChange={event => setEdits(current => ({
                  ...current, [product.id]: { ...edit, price: event.target.value },
                }))} />
            </label>
            <button type="button" className={buttonStyle} disabled={pending} onClick={() => {
              const money = parseMoney(edit.price, product.basePrice.currency)
              if (!money) { setProblem(refusals.PRICE_INVALID); return }
              void attempt(() => updateProduct(projectId, product.id, {
                name: edit.name.trim(), description: edit.description.trim(), basePrice: money,
              }))
            }}>
              Guardar prenda
            </button>
            {product.status === 'ACTIVE' && <button type="button" className={buttonStyle}
              disabled={pending} onClick={() => void attempt(() => archiveProduct(projectId, product.id))}>
              Retirar prenda
            </button>}
          </div>}

          <ul className="space-y-1 pl-3">
            {product.variants.map(variant => {
              const draft = variantDrafts[variant.id] ?? draftOf(variant)
              return <li key={variant.id} className="space-y-1">
                <p className="text-xs">
                  {variant.sku} · {variant.size} · {variant.color} · {formatMoney(variant.price)}
                  {variant.pricedApart ? ' (precio propio)' : ' (precio de la prenda)'} ·{' '}
                  {variant.stock} en stock
                  {variant.status === 'ARCHIVED' && ' · retirada'}
                </p>
                {!readOnly && <div className="flex flex-wrap items-end gap-2">
                  <label>SKU
                    <input className={fieldStyle} value={draft.sku} disabled={pending} maxLength={64}
                      onChange={event => setVariantDrafts(current => ({
                        ...current, [variant.id]: { ...draft, sku: event.target.value },
                      }))} />
                  </label>
                  <label>Talla
                    <input className={fieldStyle} value={draft.size} disabled={pending} maxLength={32}
                      onChange={event => setVariantDrafts(current => ({
                        ...current, [variant.id]: { ...draft, size: event.target.value },
                      }))} />
                  </label>
                  <label>Color
                    <input className={fieldStyle} value={draft.color} disabled={pending} maxLength={48}
                      onChange={event => setVariantDrafts(current => ({
                        ...current, [variant.id]: { ...draft, color: event.target.value },
                      }))} />
                  </label>
                  <label>Stock
                    <input className={fieldStyle} value={draft.stock} disabled={pending}
                      inputMode="numeric"
                      onChange={event => setVariantDrafts(current => ({
                        ...current, [variant.id]: { ...draft, stock: event.target.value },
                      }))} />
                  </label>
                  <label>Precio propio
                    <input className={fieldStyle} value={draft.price} disabled={pending}
                      inputMode="decimal" placeholder="usa el de la prenda"
                      onChange={event => setVariantDrafts(current => ({
                        ...current, [variant.id]: { ...draft, price: event.target.value },
                      }))} />
                  </label>
                  <button type="button" className={buttonStyle} disabled={pending}
                    onClick={() => writeVariant(draft, body =>
                      updateVariant(projectId, product.id, variant.id, body))}>
                    Guardar variante
                  </button>
                  {variant.status === 'ACTIVE' && <button type="button" className={buttonStyle}
                    disabled={pending}
                    onClick={() => void attempt(() => archiveVariant(projectId, product.id, variant.id))}>
                    Retirar variante
                  </button>}
                </div>}
              </li>
            })}
          </ul>

          {!readOnly && product.status === 'ACTIVE' && <div className="flex flex-wrap items-end gap-2 pl-3">
            <label>SKU nuevo
              <input className={fieldStyle} value={fresh.sku} disabled={pending} maxLength={64}
                onChange={event => setNewVariants(current => ({
                  ...current, [product.id]: { ...fresh, sku: event.target.value },
                }))} />
            </label>
            <label>Talla nueva
              <input className={fieldStyle} value={fresh.size} disabled={pending} maxLength={32}
                onChange={event => setNewVariants(current => ({
                  ...current, [product.id]: { ...fresh, size: event.target.value },
                }))} />
            </label>
            <label>Color nuevo
              <input className={fieldStyle} value={fresh.color} disabled={pending} maxLength={48}
                onChange={event => setNewVariants(current => ({
                  ...current, [product.id]: { ...fresh, color: event.target.value },
                }))} />
            </label>
            <label>Stock inicial
              <input className={fieldStyle} value={fresh.stock} disabled={pending} inputMode="numeric"
                onChange={event => setNewVariants(current => ({
                  ...current, [product.id]: { ...fresh, stock: event.target.value },
                }))} />
            </label>
            <button type="button" className={buttonStyle}
              disabled={pending || !fresh.sku.trim() || !fresh.size.trim() || !fresh.color.trim()}
              onClick={() => writeVariant(fresh, body => addVariant(projectId, product.id, body))}>
              Añadir variante
            </button>
          </div>}
        </li>
      })}
    </ul>

    {cursor && <button type="button" className={buttonStyle} disabled={pending} onClick={() => void more()}>
      Ver más prendas
    </button>}
  </section>
}
