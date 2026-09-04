import { useState } from 'react'
import type { StoreProject } from '@/api/projects'
import type { RegistryPublication } from '@/registry/publication'

type ProjectPage = StoreProject['acceptedRevision']['document']['pages'][number]
type Operation = Record<string, unknown>

interface PageNavigatorProps {
  project: StoreProject
  /** Lo que el registro exige de cada clase de página. */
  definitions: RegistryPublication['pages']
  selected: string | null
  onSelect: (pageId: string | null) => void
  onOperations: (operations: Operation[]) => void
  problem: string | null
}

/** De la ruta sale el identificador: legible, y el mismo que la empresaria acaba de escribir. */
function slugOf(path: string): string {
  return path.replace(/^\/+/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'pagina'
}

/**
 * Las páginas del proyecto, y lo que se puede hacer con ellas.
 *
 * <p>Cada acción emite una operación tipada -las mismas que valida el servidor- y no un cambio
 * suelto. Quitar no se ofrece para las páginas que el registro declara obligatorias: una tienda sin
 * catálogo deja de ser una tienda, y ofrecer el botón sería ofrecer un rechazo.
 */
export function PageNavigator({
  project, definitions, selected, onSelect, onOperations, problem,
}: PageNavigatorProps) {
  const [path, setPath] = useState('')
  const [title, setTitle] = useState('')

  const pages = project.acceptedRevision.document.pages
  const required = new Set(definitions.filter(definition => definition.required)
    .map(definition => definition.kind))

  function move(page: ProjectPage, to: number) {
    if (to < 0 || to >= pages.length) return
    onOperations([{ kind: 'MOVE_PAGE', pageId: page.id, index: to }])
  }

  function add() {
    const route = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`
    const slug = slugOf(route)
    onOperations([{
      kind: 'ADD_PAGE', pageId: slug, pageKind: 'CONTENT', path: route,
      component: {
        id: `seccion-${slug}`, type: 'content.section',
        properties: { heading: title.trim(), body: 'Cuenta aquí lo que quieras.' },
        bindings: {}, interactions: {}, slots: { actions: [] },
      },
    }])
    setPath('')
    setTitle('')
  }

  return (
    <section aria-label="Páginas del proyecto" className="w-full max-w-3xl space-y-2 text-xs">
      <h2 className="text-[var(--dashboard-foreground)]">Páginas</h2>
      {problem && <p role="alert">{problem}</p>}
      <ul className="space-y-1">
        {pages.map((page, index) => (
          <li key={page.id} className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--dashboard-foreground)]">
              {page.path}{required.has(page.kind) ? ' · obligatoria' : ''}
            </span>
            {selected === page.id
              ? <span aria-current="true">Se está viendo</span>
              : <button type="button" onClick={() => onSelect(page.id)}
                  className="rounded-md border px-2 py-0.5">Abrir {page.path}</button>}
            <button type="button" onClick={() => move(page, index - 1)}
              disabled={index === 0} className="rounded-md border px-2 py-0.5 disabled:opacity-40">
              Subir {page.path}
            </button>
            <button type="button" onClick={() => move(page, index + 1)}
              disabled={index === pages.length - 1}
              className="rounded-md border px-2 py-0.5 disabled:opacity-40">
              Bajar {page.path}
            </button>
            {!required.has(page.kind) && (
              <button type="button"
                onClick={() => onOperations([{ kind: 'REMOVE_PAGE', pageId: page.id }])}
                className="rounded-md border px-2 py-0.5">Quitar {page.path}</button>
            )}
          </li>
        ))}
      </ul>

      <form className="flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); add() }}>
        <label className="sr-only" htmlFor="page-path">Ruta de la página nueva</label>
        <input id="page-path" name="path" value={path} placeholder="/historia"
          onChange={event => setPath(event.target.value)}
          className="rounded-md border px-2 py-1 text-[var(--dashboard-foreground)]" />
        <label className="sr-only" htmlFor="page-title">Título de la página nueva</label>
        <input id="page-title" name="title" value={title} placeholder="Quiénes somos"
          onChange={event => setTitle(event.target.value)}
          className="rounded-md border px-2 py-1 text-[var(--dashboard-foreground)]" />
        <button type="submit" disabled={!path.trim() || !title.trim()}
          className="rounded-md border px-2 py-0.5 disabled:opacity-40">Añadir página</button>
      </form>
    </section>
  )
}
