import { useEffect, useState } from 'react'
import { listCategories, listCollections,
  type ProductCategory, type ProductCollection } from '@/api/catalog'
import { acceptRevision, getStoreProject,
  type OperationBatch, type StoreProject } from '@/api/projects'
import { safeProblem } from '@/api/problems'
import { intentionKey, outcomeIsUnknown } from '@/canvas/intention'
import type { RegistryPublication } from '@/registry/publication'

interface CatalogBindingEditorProps {
  publication: RegistryPublication | null
  project: StoreProject
  pageId?: string | null
  onAccepted: (project: StoreProject) => void
  readOnly: boolean
}

const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

const targetNames: Record<string, string> = {
  COLLECTION: 'Una colección',
  CATEGORY: 'Una categoría',
  PRODUCT: 'Una prenda',
  EVERYTHING: 'Todo el catálogo',
}

const orderNames: Record<string, string> = {
  CURATED: 'El orden que decidí',
  NEWEST: 'Lo más reciente',
  NAME: 'Por nombre',
  PRICE_ASCENDING: 'Precio, de menor a mayor',
  PRICE_DESCENDING: 'Precio, de mayor a menor',
}

/**
 * A que mira cada componente de la pagina, elegido entre lo que existe.
 *
 * <p>Lo que se puede elegir sale de dos sitios y de ninguno mas: los objetivos, del registro, que
 * dice lo que ese componente sabe ensenar; y las referencias, del catalogo de esta tienda. No hay
 * ningun campo libre, asi que no existe la posibilidad de escribir aqui una consulta.
 *
 * <p>Elegir de una lista tambien evita el fallo mas comun: apuntar a una coleccion que se borro. Lo
 * que ya no esta no aparece para elegirse.
 */
export function CatalogBindingEditor({ publication, project, pageId, onAccepted, readOnly }:
    CatalogBindingEditorProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [collections, setCollections] = useState<ProductCollection[]>([])
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, { target: string, reference: string, order: string, limit: string }>>({})

  useEffect(() => {
    let live = true
    Promise.all([listCategories(project.id), listCollections(project.id)])
      .then(([found, curated]) => { if (live) { setCategories(found); setCollections(curated) } })
      .catch(error => { if (live) setProblem(safeProblem(error).message) })
    return () => { live = false }
  }, [project.id])

  const document_ = project.acceptedRevision.document
  const page = document_.pages.find(item => item.id === pageId) ?? document_.pages[0]
  const definitions = new Map((publication?.components ?? []).map(item => [item.type, item]))

  async function send(batch: OperationBatch) {
    setPending(true); setProblem(null)
    try {
      onAccepted(await acceptRevision(project.id, batch))
      setDrafts({})
    } catch (error) {
      const failure = safeProblem(error)
      setProblem(failure.message)
      if (!outcomeIsUnknown(failure.action) && failure.action === 'REFRESH') {
        await getStoreProject(project.id).then(onAccepted).catch(() => undefined)
      }
    } finally { setPending(false) }
  }

  /** Lo que se puede elegir para una referencia depende del objetivo, y sale de lo que existe. */
  function options(target: string): { id: string, name: string }[] {
    if (target === 'COLLECTION') return collections.map(item => ({ id: item.id, name: item.name }))
    if (target === 'CATEGORY') return categories.map(item => ({ id: item.id, name: item.name }))
    return []
  }

  if (!page) return null

  const bound = page.components.flatMap(component => {
    const definition = definitions.get(component.type)
    return Object.entries(component.bindings).map(([name, binding]) => ({
      component, name, binding,
      // El registro manda: solo se ofrecen los objetivos que este componente sabe ensenar.
      targets: definition?.bindings.find(item => item.name === name)?.targets ?? [],
    }))
  })

  return <section aria-label="Qué muestra cada sección"
    className="w-full max-w-3xl space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Qué muestra cada sección</h2>
    {problem && <p role="alert">{problem}</p>}
    {bound.length === 0 && <p>Ninguna sección de esta página muestra catálogo.</p>}

    <ul className="space-y-3">
      {bound.map(({ component, name, binding, targets }) => {
        const key = `${component.id}.${name}`
        const draft = drafts[key] ?? {
          target: binding.target, reference: binding.reference ?? '',
          order: binding.order, limit: String(binding.limit),
        }
        const choices = options(draft.target)
        return <li key={key} className="space-y-2 border-t border-slate-500 pt-2">
          <p className="font-medium">{component.type}</p>
          <p className="text-xs">
            Ahora muestra: {targetNames[binding.target] ?? binding.target}
            {binding.reference ? ` · ${binding.reference}` : ''}
            {!binding.reference && binding.target !== 'EVERYTHING' ? ' · sin elegir' : ''}
          </p>
          {!readOnly && <div className="flex flex-wrap items-end gap-2">
            <label>Muestra
              <select className={fieldStyle} value={draft.target} disabled={pending}
                onChange={event => setDrafts(current => ({
                  ...current, [key]: { ...draft, target: event.target.value, reference: '' },
                }))}>
                {targets.map(target => (
                  <option key={target} value={target}>{targetNames[target] ?? target}</option>
                ))}
              </select>
            </label>
            {draft.target !== 'EVERYTHING' && draft.target !== 'PRODUCT' && <label>Cuál
              <select className={fieldStyle} value={draft.reference} disabled={pending}
                onChange={event => setDrafts(current => ({
                  ...current, [key]: { ...draft, reference: event.target.value },
                }))}>
                <option value="">Sin elegir</option>
                {choices.map(choice => (
                  <option key={choice.id} value={choice.id}>{choice.name}</option>
                ))}
              </select>
            </label>}
            <label>Orden
              <select className={fieldStyle} value={draft.order} disabled={pending}
                onChange={event => setDrafts(current => ({
                  ...current, [key]: { ...draft, order: event.target.value },
                }))}>
                {Object.entries(orderNames)
                  // El orden curado solo existe en una coleccion: es el que alguien escribio a mano.
                  .filter(([value]) => value !== 'CURATED' || draft.target === 'COLLECTION')
                  .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Cuántas
              <input className={fieldStyle} value={draft.limit} disabled={pending} inputMode="numeric"
                onChange={event => setDrafts(current => ({
                  ...current, [key]: { ...draft, limit: event.target.value },
                }))} />
            </label>
            <button type="button" className={buttonStyle} disabled={pending} onClick={() => {
              const limit = Number(draft.limit.trim())
              if (!Number.isInteger(limit) || limit < 1 || limit > 48) {
                setProblem('Cuántas prendas mostrar es un número entre 1 y 48.')
                return
              }
              void send({
                baseRevisionId: project.acceptedRevision.id,
                idempotencyKey: intentionKey(),
                operations: [{
                  kind: 'SET_BINDING', pageId: page.id, componentId: component.id, property: name,
                  binding: {
                    // Sin elegir se manda omitiendo la referencia, que es como el contrato lo dice.
                    target: draft.target, reference: draft.reference || undefined,
                    limit, order: draft.order,
                  },
                }],
              })
            }}>
              Guardar qué muestra
            </button>
          </div>}
        </li>
      })}
    </ul>
  </section>
}
