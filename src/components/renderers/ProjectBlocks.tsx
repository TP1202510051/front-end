import { useState } from 'react'
import { acceptRevision, getStoreProject, type OperationBatch, type StoreProject } from '@/api/projects'
import { intentionKey, outcomeIsUnknown, type ProjectOperation } from '@/canvas/intention'
import type { RegistryPublication } from '@/registry/publication'
import { safeProblem } from '@/api/problems'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

type BlockInstance = NonNullable<StoreProject['acceptedRevision']['document']['blockInstances']>[number]
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

/** All content shown here comes from an accepted revision; an uncertain request keeps its exact batch. */
export function ProjectBlocks({ project, pageId, onAccepted, readOnly, publication }: ProjectBlocksProps) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState('')
  const [selectedBlock, setSelectedBlock] = useState('')
  const [destination, setDestination] = useState('root')
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [uncertain, setUncertain] = useState<OperationBatch | null>(null)
  const [separating, setSeparating] = useState<BlockInstance | null>(null)
  const document = project.acceptedRevision.document
  const pages = document.pages
  const page = pages.find(item => item.id === pageId) ?? pages[0]
  if (!page) return null
  const blocks = document.blocks ?? []
  const instances = document.blockInstances ?? []
  const componentId = page.components.some(node => node.id === selected) ? selected : page.rootComponentId
  const sourceIsLinked = instances.some(instance => instance.pageId === page.id
    && Object.values(instance.componentIds).includes(componentId))
  const disabled = pending || Boolean(uncertain)

  const chosenBlock = blocks.find(block => block.id === selectedBlock) ?? blocks[0]
  const rootType = chosenBlock?.components.find(node => node.id === chosenBlock.rootComponentId)?.type
  // Poner un bloque como raíz sustituye la página entera. Si ya vive ahí una instancia, eso sería
  // desvincularla —o borrar lo que ya se desvinculó— sin que nadie lo pidiera, y el servidor lo
  // rechaza. Ofrecerlo sería ofrecer un rechazo, así que la página ocupada no lleva ese destino.
  const pageHasInstances = instances.some(instance => instance.pageId === page.id)
  const destinations: { id: string, label: string, parentComponentId?: string, slot?: string, index: number }[] = []
  if (rootType && publication?.registryVersion === document.registryVersion) {
    if (!pageHasInstances
      && publication.pages.find(definition => definition.kind === page.kind)?.rootTypes.includes(rootType))
      destinations.push({ id: 'root', label: 'Página completa', index: 0 })
    for (const node of page.components) {
      if (instances.some(instance => !instance.detached && instance.pageId === page.id
        && Object.values(instance.componentIds).includes(node.id))) continue
      const definition = publication.components.find(item => item.type === node.type)
      for (const [slot, rules] of Object.entries(definition?.slots ?? {})) {
        const count = node.slots[slot]?.length ?? 0
        if (rules.allowedTypes.includes(rootType) && count < rules.maximum)
          destinations.push({ id: `${node.id}/${slot}`, label: `${node.properties.heading ?? node.type} · ${slot}`,
            parentComponentId: node.id, slot, index: count })
      }
    }
  }
  const target = destinations.find(item => item.id === destination) ?? destinations[0]

  // Lo que la desvinculación se lleva y lo que deja: se calcula aquí para que el diálogo solo lo diga.
  const separatingPage = separating ? pages.find(item => item.id === separating.pageId)?.path : undefined
  const separatingBlockName = blocks.find(block => block.id === separating?.blockId)?.name ?? 'el bloque'
  const stillSharing = separating
    ? pages.filter(item => instances.some(copy => !copy.detached && copy.id !== separating.id
      && copy.blockId === separating.blockId && copy.pageId === item.id)).map(item => item.path)
    : []

  async function send(batch: OperationBatch) {
    setPending(true); setProblem(null)
    try {
      const accepted = await acceptRevision(project.id, batch)
      setUncertain(null); setSeparating(null)
      onAccepted(accepted)
    } catch (error) {
      const failure = safeProblem(error)
      setProblem(failure.message)
      if (outcomeIsUnknown(failure.action)) setUncertain(batch)
      else {
        setUncertain(null); setSeparating(null)
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
      void apply({ kind: 'CREATE_BLOCK', pageId: page.id, componentId,
        blockId: intentionKey(), instanceId: intentionKey(), name: name.trim() })
    }}>
      <label>Composición de origen
        <select className={fieldStyle} value={componentId} disabled={disabled}
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
          onChange={event => setSelectedBlock(event.target.value)}>
          {blocks.map(block => <option key={block.id} value={block.id}>{block.name}</option>)}
        </select>
      </label>
      <label>Destino del bloque
        <select className={fieldStyle} value={target?.id ?? ''} disabled={disabled || !target}
          onChange={event => setDestination(event.target.value)}>
          {destinations.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      {target?.id === 'root' && <p>Reemplaza la composición actual de esta página. La revisión anterior permanece en el historial.</p>}
      {!target && pageHasInstances && <p>Esta página ya tiene una instancia. Quítala antes de darle otra raíz.</p>}
      {!target && !pageHasInstances && <p>Esta página no tiene un destino compatible con el bloque.</p>}
      <button className={buttonStyle} disabled={disabled || !target} type="submit">Colocar bloque</button>
    </form>}
    {instances.filter(instance => instance.pageId === page.id).map(instance => {
      const block = blocks.find(item => item.id === instance.blockId)
      const affected = pages.filter(item => instances.some(copy => !copy.detached
        && copy.blockId === instance.blockId && copy.pageId === item.id)).map(item => item.path)
      return <div key={instance.id} className="space-y-2 border-t border-slate-500 pt-2">
        <p>{instance.detached ? 'Desvinculada' : 'Vinculada'}: {block?.name ?? 'Bloque'}</p>
        {!instance.detached && <p>Páginas vinculadas: {affected.join(', ')}</p>}
        {!readOnly && <>
          {page.components.filter(node => Object.values(instance.componentIds).includes(node.id)).map(node =>
            Object.entries(node.properties).map(([property, value]) => {
              const title = textNames[property] ?? property
              const scope = instance.detached ? 'de esta instancia' : 'compartido'
              return <form key={`${instance.id}-${node.id}-${property}-${value}`} className="flex flex-wrap gap-2"
                onSubmit={event => {
                  event.preventDefault()
                  const content = String(new FormData(event.currentTarget).get('content') ?? '')
                  void apply({ kind: instance.detached ? 'SET_PROPERTY' : 'SET_BLOCK_PROPERTY', pageId: page.id,
                    instanceId: instance.detached ? undefined : instance.id,
                    componentId: node.id, property, value: content })
                }}>
                <label>{title} {scope}
                  <input className={fieldStyle} name="content" defaultValue={value} disabled={disabled} required />
                </label>
                <button className={buttonStyle} disabled={disabled} type="submit">Guardar {title.toLowerCase()} {scope}</button>
              </form>
            }))}
          {!instance.detached && <button className={buttonStyle} disabled={disabled} onClick={() => setSeparating(instance)}>Desvincular instancia</button>}
        </>}
      </div>
    })}
    {readOnly && <p>Identidad guardada en esta revisión. Vuelve a la última para editar.</p>}
    {pending && <p role="status">Cambio pendiente de confirmación…</p>}
    {problem && <p role="alert">{problem}</p>}
    {uncertain && !readOnly && <button className={buttonStyle} disabled={pending}
      onClick={() => void send(uncertain)}>Reintentar operación de bloque</button>}
    <Dialog open={Boolean(separating) && !readOnly} onOpenChange={open => { if (!open && !pending) setSeparating(null) }}>
      <DialogContent>
        <DialogTitle>Desvincular instancia</DialogTitle>
        <DialogDescription>
          {separatingPage ? `Esta instancia de ${separatingBlockName} en ${separatingPage} conservará su contenido actual y dejará de recibir los cambios del bloque.` : ''}
          {stillSharing.length > 0
            ? ` Seguirá compartida en ${stillSharing.join(', ')}.`
            : ' Ninguna otra página quedará compartida: el bloque dejará de tener instancias vinculadas.'}
        </DialogDescription>
        <button className={buttonStyle} disabled={pending} onClick={() => setSeparating(null)}>Cancelar</button>
        <button className={buttonStyle} disabled={disabled} onClick={() => {
          if (separating) void apply({ kind: 'DETACH_BLOCK', pageId: separating.pageId, instanceId: separating.id })
        }}>Confirmar desvinculación</button>
      </DialogContent>
    </Dialog>
  </section>
}
