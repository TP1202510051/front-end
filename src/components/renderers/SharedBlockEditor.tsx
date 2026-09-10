import { useState } from 'react'
import type { components } from '@/api/schema'
import type { ProjectOperation } from '@/canvas/intention'
import type { BlockInstance } from '@/canvas/blocks'
import type { RegistryPublication } from '@/registry/publication'

type ProjectDocument = components['schemas']['ProjectDocumentView']
type ProjectPage = components['schemas']['ProjectPageView']

interface SharedBlockEditorProps {
  document: ProjectDocument
  page: ProjectPage
  instance: BlockInstance
  publication: RegistryPublication | null
  disabled: boolean
  apply: (operation: ProjectOperation) => void
}

const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

interface Insertion {
  id: string
  parentId: string
  slot: string
  index: number
  type: string
}

/** Shared structure is edited only after its complete reach is visible. */
export function SharedBlockEditor({ document, page, instance, publication, disabled, apply }:
    SharedBlockEditorProps) {
  const linkedCount = (document.blockInstances ?? [])
    .filter(candidate => !candidate.detached && candidate.blockId === instance.blockId).length
  const nodes = page.components.filter(node => Object.values(instance.componentIds).includes(node.id))
  const compatiblePublication = publication?.registryVersion === document.registryVersion ? publication : null
  const definitions = new Map((compatiblePublication?.components ?? []).map(item => [item.type, item]))
  const insertions = (() => {
    const found: Insertion[] = []
    for (const parent of nodes) {
      const parentDefinition = definitions.get(parent.type)
      for (const [slot, rules] of Object.entries(parentDefinition?.slots ?? {})) {
        if ((parent.slots[slot]?.length ?? 0) >= rules.maximum) continue
        for (const type of rules.allowedTypes) {
          const child = definitions.get(type)
          if (!child || child.constraints.includes('TOP_LEVEL_ONLY')
            || child.bindings.some(binding => binding.required)
            || Object.values(child.slots).some(candidate => candidate.minimum > 0)) continue
          found.push({ id: `${parent.id}\u0000${slot}\u0000${type}`, parentId: parent.id,
            slot, index: parent.slots[slot]?.length ?? 0, type })
        }
      }
    }
    return found
  })()
  const [selected, setSelected] = useState('')
  const insertion = insertions.find(candidate => candidate.id === selected) ?? insertions[0]
  const insertionDefinition = insertion ? definitions.get(insertion.type) : undefined

  return <section aria-label={`Editar composición compartida ${instance.id}`} className="space-y-2 rounded border border-slate-500 p-2">
    <h3 className="font-medium">Composición compartida</h3>
    <p>Este cambio alcanzará {linkedCount} {linkedCount === 1 ? 'instancia vinculada' : 'instancias vinculadas'}.</p>

    {nodes.map(node => {
      const parent = nodes.find(candidate => Object.values(candidate.slots).some(children => children.includes(node.id)))
      const placement = parent && Object.entries(parent.slots)
        .find(([, children]) => children.includes(node.id))
      const siblings = placement?.[1] ?? []
      const position = siblings.indexOf(node.id)
      const definition = definitions.get(node.type)
      return <div key={node.id} className="space-y-2 border-t border-slate-500 pt-2">
        <p>{node.properties.heading ?? node.properties.label ?? node.type}</p>
        {parent && placement && <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonStyle} disabled={disabled || position <= 0}
            onClick={() => apply({ kind: 'MOVE_BLOCK_COMPONENT', pageId: page.id, instanceId: instance.id,
              componentId: node.id, parentComponentId: parent.id, slot: placement[0], index: position - 1 })}>
            Mover antes
          </button>
          <button type="button" className={buttonStyle} disabled={disabled || position >= siblings.length - 1}
            onClick={() => apply({ kind: 'MOVE_BLOCK_COMPONENT', pageId: page.id, instanceId: instance.id,
              componentId: node.id, parentComponentId: parent.id, slot: placement[0], index: position + 1 })}>
            Mover después
          </button>
          <button type="button" className={buttonStyle} disabled={disabled}
            onClick={() => apply({ kind: 'REMOVE_BLOCK_COMPONENT', pageId: page.id,
              instanceId: instance.id, componentId: node.id })}>
            Quitar de todas las instancias
          </button>
        </div>}
        {(definition?.interactions ?? []).map(interaction => <form key={interaction.name}
          className="flex flex-wrap items-end gap-2" onSubmit={event => {
            event.preventDefault()
            const target = String(new FormData(event.currentTarget).get('target') ?? '')
            apply({ kind: 'SET_BLOCK_INTERACTION', pageId: page.id, instanceId: instance.id,
              componentId: node.id, property: interaction.name, value: target })
          }}>
          <label>Destino compartido de {interaction.name}
            <select key={`${node.id}:${interaction.name}:${node.interactions[interaction.name] ?? ''}`}
              className={fieldStyle} name="target" defaultValue={node.interactions[interaction.name] ?? ''}
              disabled={disabled} required={interaction.required}>
              <option value="">Sin destino</option>
              {document.pages.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.path}</option>)}
            </select>
          </label>
          <button type="submit" className={buttonStyle} disabled={disabled}>Guardar interacción compartida</button>
        </form>)}
      </div>
    })}

    {insertion && insertionDefinition && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      const properties = Object.fromEntries(Object.keys(insertionDefinition.properties)
        .map(name => [name, String(form.get(`property:${name}`) ?? '')])
        .filter(([, value]) => value !== ''))
      const interactions = Object.fromEntries((insertionDefinition.interactions ?? [])
        .map(item => [item.name, String(form.get(`interaction:${item.name}`) ?? '')])
        .filter(([, value]) => value !== ''))
      apply({ kind: 'INSERT_BLOCK_COMPONENT', pageId: page.id, instanceId: instance.id,
        parentComponentId: insertion.parentId, slot: insertion.slot, index: insertion.index,
        component: { id: crypto.randomUUID(), type: insertion.type, properties, bindings: {},
          interactions, slots: Object.fromEntries(Object.keys(insertionDefinition.slots).map(name => [name, []])) } })
    }}>
      <label>Componente verificado
        <select className={fieldStyle} value={insertion.id} disabled={disabled}
          onChange={event => setSelected(event.target.value)}>
          {insertions.map(candidate => <option key={candidate.id} value={candidate.id}>
            {candidate.type} en {candidate.slot}
          </option>)}
        </select>
      </label>
      {Object.entries(insertionDefinition.properties).map(([name, property]) => <label key={name}>{name}
        <input className={fieldStyle} name={`property:${name}`} disabled={disabled}
          minLength={property.minLength} maxLength={property.maxLength} required={property.required} />
      </label>)}
      {(insertionDefinition.interactions ?? []).map(interaction => <label key={interaction.name}>
        Destino de {interaction.name}
        <select className={fieldStyle} name={`interaction:${interaction.name}`} disabled={disabled}
          required={interaction.required}>
          <option value="">Sin destino</option>
          {document.pages.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.path}</option>)}
        </select>
      </label>)}
      <button type="submit" className={buttonStyle} disabled={disabled}>Insertar en todas las instancias</button>
    </form>}
    {insertions.length === 0 && <p>No hay componentes compatibles que añadir en esta composición.</p>}
  </section>
}
