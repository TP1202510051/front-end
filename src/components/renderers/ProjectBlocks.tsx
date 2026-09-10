import { useState } from 'react'
import { acceptRevision, getStoreProject, type OperationBatch, type StoreProject } from '@/api/projects'
import { intentionKey, outcomeIsUnknown, type ProjectOperation } from '@/canvas/intention'
import { blockDestinations, linkedInstanceOf, propertyOperation, sharedPaths,
  type BlockInstance } from '@/canvas/blocks'
import type { RegistryPublication } from '@/registry/publication'
import { safeProblem } from '@/api/problems'
import { DetachBlockDialog } from '@/components/renderers/DetachBlockDialog'
import { SharedBlockEditor } from '@/components/renderers/SharedBlockEditor'

interface ProjectBlocksProps {
  project: StoreProject
  pageId: string | null
  onAccepted: (project: StoreProject) => void
  readOnly: boolean
  publication: RegistryPublication | null
}
const textNames: Record<string, string> = {
  heading: 'Titular', subheading: 'Subtítulo', body: 'Texto', label: 'Texto del enlace',
}
const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

/**
 * Los bloques del proyecto y las instancias que viven en la página abierta.
 *
 * <p>Todo lo que se enseña aquí sale de una revisión aceptada, nunca de una vista optimista: el
 * panel decide con qué operación se toca cada nodo, y esa decisión depende de quién está vinculado
 * ahora mismo. Enseñar una copia pendiente ofrecería gestos contra un estado que aún no existe.
 *
 * <p>Una petición cuyo resultado nadie llegó a saber conserva su lote exacto, para que reintentarla
 * traiga de vuelta la revisión que ya exista en vez de escribir otra igual.
 */
export function ProjectBlocks({ project, pageId, onAccepted, readOnly, publication }: ProjectBlocksProps) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState('')
  const [destinationId, setDestinationId] = useState('root')
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [uncertain, setUncertain] = useState<OperationBatch | null>(null)
  const [detaching, setDetaching] = useState<BlockInstance | null>(null)
  const document = project.acceptedRevision.document
  const pages = document.pages
  const page = pages.find(item => item.id === pageId) ?? pages[0]
  if (!page) return null
  const blocks = document.blocks ?? []
  const instances = document.blockInstances ?? []
  const sourceId = page.components.some(node => node.id === selected) ? selected : page.rootComponentId
  // Capturar un nodo vinculado daría dos bloques mandando sobre él. Uno desvinculado ya no escucha a
  // nadie, y su contenido puede volver a ser un bloque: el servidor lo permite y aquí también.
  const sourceIsLinked = Boolean(linkedInstanceOf(document, page.id, sourceId))
  const disabled = pending || Boolean(uncertain)

  const chosenBlock = blocks.find(block => block.id === selectedBlockId) ?? blocks[0]
  const pageHasInstances = instances.some(instance => instance.pageId === page.id)
  const destinations = blockDestinations(document, publication, page, chosenBlock)
  const target = destinations.find(item => item.id === destinationId) ?? destinations[0]

  async function send(batch: OperationBatch) {
    setPending(true); setProblem(null)
    try {
      const accepted = await acceptRevision(project.id, batch)
      setUncertain(null); setDetaching(null)
      onAccepted(accepted)
    } catch (error) {
      const failure = safeProblem(error)
      const sharedRequired = failure.issues.some(issue => issue.includes(' SET_BLOCK_')
        || issue.includes(' INSERT_BLOCK_COMPONENT') || issue.includes(' REMOVE_BLOCK_COMPONENT')
        || issue.includes(' MOVE_BLOCK_COMPONENT'))
      setProblem(sharedRequired
        ? 'Usa la edición compartida para cambiar todas las instancias, o desvincula esta instancia para editarla por separado.'
        : failure.message)
      if (outcomeIsUnknown(failure.action)) setUncertain(batch)
      else {
        setUncertain(null); setDetaching(null)
        if (failure.action === 'REFRESH')
          await getStoreProject(project.id).then(onAccepted).catch(() => undefined)
      }
    } finally { setPending(false) }
  }

  function apply(operation: ProjectOperation) {
    return send({ baseRevisionId: project.acceptedRevision.id, idempotencyKey: intentionKey(), operations: [operation] })
  }

  return <section aria-label="Bloques del proyecto" className="w-full max-w-3xl max-h-64 overflow-y-auto space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Bloques del proyecto</h2>
    {!readOnly && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault()
      void apply({ kind: 'CREATE_BLOCK', pageId: page.id, componentId: sourceId,
        blockId: intentionKey(), instanceId: intentionKey(), name: name.trim() })
    }}>
      <label>Composición de origen
        <select className={fieldStyle} value={sourceId} disabled={disabled}
          onChange={event => setSelected(event.target.value)}>
          {page.components.map(node => <option key={node.id} value={node.id}>
            {node.properties.heading ?? node.properties.label ?? node.type}
          </option>)}
        </select>
      </label>
      <label>Nombre del bloque
        <input className={fieldStyle} value={name} disabled={disabled}
          onChange={event => setName(event.target.value)} maxLength={120} required />
      </label>
      <button className={buttonStyle} disabled={disabled || sourceIsLinked || !name.trim()} type="submit">Crear bloque</button>
    </form>}
    {!readOnly && blocks.length > 0 && <form className="flex flex-wrap gap-2" onSubmit={event => {
      event.preventDefault()
      if (chosenBlock && target) void apply({ kind: 'INSTANTIATE_BLOCK', pageId: page.id,
        blockId: chosenBlock.id, instanceId: intentionKey(), parentComponentId: target.parentComponentId,
        slot: target.slot, index: target.index })
    }}>
      <label>Bloque para colocar
        <select className={fieldStyle} value={chosenBlock?.id ?? ''} disabled={disabled}
          onChange={event => setSelectedBlockId(event.target.value)}>
          {blocks.map(block => <option key={block.id} value={block.id}>{block.name}</option>)}
        </select>
      </label>
      <label>Destino del bloque
        <select className={fieldStyle} value={target?.id ?? ''} disabled={disabled || !target}
          onChange={event => setDestinationId(event.target.value)}>
          {destinations.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      {target?.id === 'root' && <p>Reemplaza la composición actual de esta página. La revisión anterior permanece en el historial.</p>}
      {!target && pageHasInstances && <p>Esta página ya tiene una instancia, así que no puede recibir otra raíz.</p>}
      {!target && !pageHasInstances && <p>Esta página no tiene un destino compatible con el bloque.</p>}
      <button className={buttonStyle} disabled={disabled || !target} type="submit">Colocar bloque</button>
    </form>}
    {instances.filter(instance => instance.pageId === page.id).map(instance => {
      const block = blocks.find(item => item.id === instance.blockId)
      const blockName = block?.name ?? 'Bloque'
      const state = instance.detached ? 'Desvinculada' : 'Vinculada'
      return <div key={instance.id} role="group" aria-label={`${state}: ${blockName} en ${page.path}`}
        className="space-y-2 border-t border-slate-500 pt-2">
        <p>{state}: {blockName}</p>
        {!instance.detached && <p>Páginas vinculadas: {sharedPaths(document, instance.blockId).join(', ')}</p>}
        {!readOnly && <>
          {page.components.filter(node => Object.values(instance.componentIds).includes(node.id)).map(node =>
            Object.entries(node.properties).map(([property, value]) => {
              const title = textNames[property] ?? property
              const scope = instance.detached ? 'de esta instancia' : 'compartido'
              return <form key={`${instance.id}-${node.id}-${property}-${value}`} className="flex flex-wrap gap-2"
                onSubmit={event => {
                  event.preventDefault()
                  const content = String(new FormData(event.currentTarget).get('content') ?? '')
                  void apply(propertyOperation(document, page.id, node.id, property, content))
                }}>
                <label>{title} {scope}
                  <input className={fieldStyle} name="content" defaultValue={value} disabled={disabled} required />
                </label>
                <button className={buttonStyle} disabled={disabled} type="submit">Guardar {title.toLowerCase()} {scope}</button>
              </form>
            }))}
          {!instance.detached && <SharedBlockEditor document={document} page={page} instance={instance}
            publication={publication} disabled={disabled} apply={operation => { void apply(operation) }} />}
          {!instance.detached && <button type="button" className={buttonStyle} disabled={disabled}
            onClick={() => setDetaching(instance)}>Desvincular instancia</button>}
        </>}
      </div>
    })}
    {readOnly && <p>Identidad guardada en esta revisión. Vuelve a la última para editar.</p>}
    {pending && <p role="status">Cambio pendiente de confirmación…</p>}
    {problem && <p role="alert">{problem}</p>}
    {uncertain && !readOnly && <button type="button" className={buttonStyle} disabled={pending}
      onClick={() => void send(uncertain)}>Reintentar operación de bloque</button>}
    <DetachBlockDialog buttonStyle={buttonStyle} pending={pending}
      path={detaching && !readOnly ? pages.find(item => item.id === detaching.pageId)?.path : undefined}
      blockName={blocks.find(block => block.id === detaching?.blockId)?.name ?? 'el bloque'}
      stillShared={detaching ? sharedPaths(document, detaching.blockId, detaching.id) : []}
      onCancel={() => setDetaching(null)}
      onConfirm={() => {
        if (detaching) void apply({ kind: 'DETACH_BLOCK', pageId: detaching.pageId, instanceId: detaching.id })
      }} />
  </section>
}
