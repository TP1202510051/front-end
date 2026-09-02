import type { components } from '@/api/schema'

export type RegistryPublication = components['schemas']['RegistryPublicationView']
export type RegistryInstance = components['schemas']['RegistryInstanceView']

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

export function isRegistryPublication(value: unknown): value is RegistryPublication {
  if (!record(value)) return false
  const publication = value as Partial<RegistryPublication>
  if (publication.registryVersion !== 'textile-store@1.0.0'
    || !Array.isArray(publication.components)
    || publication.template?.templateVersion !== 'verified-textile-start@1.0.0') return false
  const composition = publication.template.composition
  if (composition.registryVersion !== publication.registryVersion
    || composition.templateVersion !== publication.template.templateVersion
    || composition.schemaVersion !== 'registry-composition@1.0.0'
    || !Array.isArray(composition.pages)) return false
  return publication.components.every(component => typeof component.type === 'string'
      && record(component.properties) && Object.values(component.properties).every(property => record(property)
        && property.type === 'TEXT' && typeof property.required === 'boolean'
        && Number.isInteger(property.minLength) && Number.isInteger(property.maxLength)
        && Number(property.minLength) >= 0 && Number(property.maxLength) >= Number(property.minLength))
      && record(component.slots) && Object.values(component.slots).every(slot => record(slot)
        && strings(slot.allowedTypes) && Number.isInteger(slot.minimum) && Number.isInteger(slot.maximum)
        && Number(slot.minimum) >= 0 && Number(slot.maximum) >= Number(slot.minimum))
      && Array.isArray(component.bindings) && component.bindings.every(binding => record(binding)
        && typeof binding.name === 'string' && typeof binding.source === 'string'
        && typeof binding.required === 'boolean')
      && Array.isArray(component.constraints)
      && component.constraints.every(constraint => constraint === 'TOP_LEVEL_ONLY'))
    && composition.pages.every(page => typeof page.id === 'string' && typeof page.path === 'string'
      && typeof page.rootComponentId === 'string' && Array.isArray(page.components)
      && page.components.every(instance => typeof instance.id === 'string' && typeof instance.type === 'string'
        && record(instance.properties) && Object.values(instance.properties).every(item => typeof item === 'string')
        && record(instance.bindings) && Object.values(instance.bindings).every(item => typeof item === 'string')
        && record(instance.slots) && Object.values(instance.slots).every(strings)))
}

export function publicationIssue(publication: RegistryPublication): string | null {
  const definitions = new Map(publication.components.map(component => [component.type, component]))
  const pageIds = new Set<string>()
  const pagePaths = new Set<string>()
  for (const page of publication.template.composition.pages) {
    if (pageIds.has(page.id)) return 'PAGE_ID_DUPLICATED'
    if (pagePaths.has(page.path)) return 'PAGE_PATH_DUPLICATED'
    pageIds.add(page.id)
    pagePaths.add(page.path)
    const instances = new Map<string, RegistryInstance>()
    for (const instance of page.components) {
      if (instances.has(instance.id)) return 'COMPONENT_ID_DUPLICATED'
      instances.set(instance.id, instance)
    }
    if (!instances.has(page.rootComponentId)) return 'ROOT_COMPONENT_NOT_FOUND'
    for (const instance of page.components) {
      const definition = definitions.get(instance.type)
      if (!definition || !['layout.hero', 'action.link'].includes(instance.type)) return 'COMPONENT_TYPE_UNKNOWN'
      if (definition.constraints.includes('TOP_LEVEL_ONLY') && instance.id !== page.rootComponentId) {
        return 'TOP_LEVEL_ONLY_REQUIRED'
      }
      for (const name of Object.keys(instance.properties).sort()) {
        if (!(name in definition.properties)) return 'PROPERTY_NOT_ALLOWED'
      }
      for (const [name, property] of Object.entries(definition.properties).sort(([left], [right]) => left.localeCompare(right))) {
        const propertyValue = instance.properties[name]
        if (property.required && propertyValue == null) return 'REQUIRED_PROPERTY_MISSING'
        if (propertyValue != null && (propertyValue.length < property.minLength || propertyValue.length > property.maxLength)) {
          return 'PROPERTY_LENGTH_INVALID'
        }
      }
      const bindings = new Map(definition.bindings.map(binding => [binding.name, binding]))
      for (const name of Object.keys(instance.bindings).sort()) {
        if (!bindings.has(name)) return 'BINDING_NOT_ALLOWED'
        if (!instance.bindings[name].trim()) return 'BINDING_VALUE_EMPTY'
      }
      for (const binding of definition.bindings) {
        if (binding.required && instance.bindings[binding.name] == null) return 'REQUIRED_BINDING_MISSING'
      }
      for (const name of Object.keys(instance.slots).sort()) {
        if (!(name in definition.slots)) return 'SLOT_NOT_ALLOWED'
      }
      for (const [name, slot] of Object.entries(definition.slots).sort(([left], [right]) => left.localeCompare(right))) {
        const childIds = instance.slots[name] ?? []
        if (childIds.length < slot.minimum) return 'SLOT_MINIMUM_NOT_MET'
        if (childIds.length > slot.maximum) return 'SLOT_MAXIMUM_EXCEEDED'
        for (const childId of childIds) {
          const child = instances.get(childId)
          if (!child) return 'SLOT_COMPONENT_NOT_FOUND'
          if (!slot.allowedTypes.includes(child.type)) return 'SLOT_COMPONENT_TYPE_NOT_ALLOWED'
        }
      }
    }
    const reachable = new Set<string>()
    const pending = [page.rootComponentId]
    while (pending.length) {
      const id = pending.shift()!
      if (reachable.has(id)) continue
      reachable.add(id)
      const instance = instances.get(id)
      if (instance) Object.values(instance.slots).forEach(children => pending.push(...children))
    }
    if (page.components.some(instance => !reachable.has(instance.id))) return 'COMPONENT_UNREACHABLE'
  }
  return null
}
