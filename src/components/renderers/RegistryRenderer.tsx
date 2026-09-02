import type { RegistryInstance, RegistryPublication } from '@/registry/publication'
import { isRegistryPublication, publicationIssue } from '@/registry/publication'

interface RegistryRendererProps {
  publication: RegistryPublication
}

const issueMessages: Record<string, string> = {
  ROOT_COMPONENT_NOT_FOUND: 'No se encontró el componente raíz del template.',
  COMPONENT_ID_DUPLICATED: 'El template contiene componentes duplicados.',
  COMPONENT_TYPE_UNKNOWN: 'El template usa un tipo de componente no verificado.',
  COMPONENT_UNREACHABLE: 'El template contiene componentes fuera de su composición.',
  TOP_LEVEL_ONLY_REQUIRED: 'La jerarquía de componentes del template no es válida.',
  PROPERTY_NOT_ALLOWED: 'El template contiene una propiedad no permitida.',
  REQUIRED_PROPERTY_MISSING: 'Al template le falta una propiedad requerida.',
  PROPERTY_LENGTH_INVALID: 'Una propiedad del template tiene una longitud no válida.',
  BINDING_NOT_ALLOWED: 'El template contiene una vinculación no permitida.',
  BINDING_VALUE_EMPTY: 'El template contiene una vinculación vacía.',
  REQUIRED_BINDING_MISSING: 'Al template le falta una vinculación requerida.',
  SLOT_NOT_ALLOWED: 'El template contiene un espacio de composición no permitido.',
  SLOT_MINIMUM_NOT_MET: 'Al template le falta contenido requerido.',
  SLOT_MAXIMUM_EXCEEDED: 'El template contiene demasiado contenido en un espacio.',
  SLOT_COMPONENT_NOT_FOUND: 'El template referencia un componente inexistente.',
  SLOT_COMPONENT_TYPE_NOT_ALLOWED: 'El template contiene un componente en una posición no permitida.',
}

function invalid(issue = 'CONTRACT_INVALID') {
  return <p role="alert">{issueMessages[issue] ?? 'La estructura del template no es válida.'}</p>
}

function Hero({ instance, action }: { instance: RegistryInstance, action: RegistryInstance }) {
  return (
    <section aria-label="Template verificado" data-collection={instance.bindings.collection}
      className="mx-auto max-w-5xl rounded-3xl bg-slate-950 p-12 text-white">
      <h1 className="text-5xl font-semibold">{instance.properties.heading}</h1>
      <p className="mt-5 text-xl text-slate-200">{instance.properties.subheading}</p>
      <a className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-slate-950" href="#catalog">
        {action.properties.label}
      </a>
    </section>
  )
}

export function RegistryRenderer({ publication }: RegistryRendererProps) {
  if (!isRegistryPublication(publication)) return invalid()
  const issue = publicationIssue(publication)
  if (issue) return invalid(issue)
  const page = publication.template.composition.pages[0]
  const root = page?.components.find(component => component.id === page.rootComponentId)
  const actionId = root?.slots.actions?.[0]
  const action = page?.components.find(component => component.id === actionId)
  if (!root || root.type !== 'layout.hero' || !action || action.type !== 'action.link') return invalid()
  return <Hero instance={root} action={action} />
}
