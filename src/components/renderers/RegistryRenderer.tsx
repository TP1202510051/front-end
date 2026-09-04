import type { RegistryInstance, RegistryPage, RegistryPublication } from '@/registry/publication'
import { isRegistryPublication, publicationIssue } from '@/registry/publication'

interface RegistryRendererProps {
  publication: RegistryPublication
  /** La página que se está mirando; sin ella se dibuja la primera. */
  pageId?: string | null
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
  INTERACTION_NOT_ALLOWED: 'El template contiene una interacción no permitida.',
  REQUIRED_INTERACTION_MISSING: 'A un enlace del template le falta su destino.',
  INTERACTION_TARGET_NOT_FOUND: 'Un enlace del template apunta a una página que no existe.',
  SLOT_NOT_ALLOWED: 'El template contiene un espacio de composición no permitido.',
  SLOT_MINIMUM_NOT_MET: 'Al template le falta contenido requerido.',
  SLOT_MAXIMUM_EXCEEDED: 'El template contiene demasiado contenido en un espacio.',
  SLOT_COMPONENT_NOT_FOUND: 'El template referencia un componente inexistente.',
  SLOT_COMPONENT_TYPE_NOT_ALLOWED: 'El template contiene un componente en una posición no permitida.',
}

function invalid(issue = 'CONTRACT_INVALID') {
  return <p role="alert">{issueMessages[issue] ?? 'La estructura del template no es válida.'}</p>
}

/**
 * A dónde lleva un enlace.
 *
 * <p>Sale de su interacción declarada y de la ruta de la página que nombra. Escribir aquí un destino
 * fijo seria poner en el renderizador una decisión que pertenece al documento.
 */
function destination(action: RegistryInstance, pages: RegistryPage[]): string {
  const target = action.interactions?.activate
  return pages.find(page => page.id === target)?.path ?? '#'
}

function Link({ action, pages }: { action: RegistryInstance, pages: RegistryPage[] }) {
  return (
    <a className="mt-6 inline-block rounded-full bg-white px-5 py-2 text-slate-950"
      href={destination(action, pages)}>
      {action.properties.label}
    </a>
  )
}

function children(root: RegistryInstance, page: RegistryPage): RegistryInstance[] {
  return (root.slots.actions ?? [])
    .map(id => page.components.find(component => component.id === id))
    .filter((component): component is RegistryInstance => Boolean(component))
}

function Hero({ root, page, pages }: { root: RegistryInstance, page: RegistryPage, pages: RegistryPage[] }) {
  const actions = children(root, page)
  return (
    <section aria-label="Portada" data-collection={root.bindings.collection}
      className="mx-auto w-full rounded-3xl bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-semibold">{root.properties.heading}</h1>
      <p className="mt-4 text-lg text-slate-200">{root.properties.subheading}</p>
      {actions.map(action => <Link key={action.id} action={action} pages={pages} />)}
    </section>
  )
}

function Grid({ root, page, pages }: { root: RegistryInstance, page: RegistryPage, pages: RegistryPage[] }) {
  return (
    <section aria-label="Catálogo" data-collection={root.bindings.collection}
      className="mx-auto w-full rounded-3xl border p-8">
      <h1 className="text-3xl font-semibold">{root.properties.heading}</h1>
      <p className="mt-3 text-sm text-slate-500">
        Las prendas de la colección se listan aquí al publicar la tienda.
      </p>
      {children(root, page).map(action => <Link key={action.id} action={action} pages={pages} />)}
    </section>
  )
}

function Section({ root, page, pages }: { root: RegistryInstance, page: RegistryPage, pages: RegistryPage[] }) {
  return (
    <section aria-label="Contenido" className="mx-auto w-full rounded-3xl border p-8">
      <h1 className="text-3xl font-semibold">{root.properties.heading}</h1>
      <p className="mt-3 whitespace-pre-line">{root.properties.body}</p>
      {children(root, page).map(action => <Link key={action.id} action={action} pages={pages} />)}
    </section>
  )
}

/**
 * Dibuja una página del documento aceptado.
 *
 * <p>Nada de esto ejecuta fuente generada: se lee el documento y se elige el componente verificado
 * que le corresponde a cada tipo. Un tipo que este renderizador no sabe dibujar se dice, no se
 * improvisa.
 */
export function RegistryRenderer({ publication, pageId }: RegistryRendererProps) {
  if (!isRegistryPublication(publication)) return invalid()
  const issue = publicationIssue(publication)
  if (issue) return invalid(issue)
  const pages = publication.template.composition.pages
  const page = pages.find(candidate => candidate.id === pageId) ?? pages[0]
  const root = page?.components.find(component => component.id === page.rootComponentId)
  if (!page || !root) return invalid()

  switch (root.type) {
    case 'layout.hero': return <Hero root={root} page={page} pages={pages} />
    case 'catalog.grid': return <Grid root={root} page={page} pages={pages} />
    case 'content.section': return <Section root={root} page={page} pages={pages} />
    default: return invalid('COMPONENT_TYPE_UNKNOWN')
  }
}
