import { useEffect, useState } from 'react'
import { getRevisionReadiness, type MissingRequirement, type RevisionReadiness,
  type ValidationLevel } from '@/api/readiness'
import { safeProblem } from '@/api/problems'
import { ExportGate } from './ExportGate'

interface ReadinessPanelProps {
  projectId: string
  /** La revision exacta que se esta mirando: la cabecera, o la que se inspecciona. */
  revisionNumber: number
  /** Sube cada vez que se acepta una revision, para volver a preguntar por la nueva. */
  reloadKey?: string
  onSelectPage: (pageId: string) => void
}

/**
 * Que significa cada requisito, en el idioma de quien tiene la tienda.
 *
 * <p>Se escriben aqui y no llegan del servidor a proposito: el servidor manda codigos estables y
 * quien pinta los explica. Un texto que viajara por la red seria un texto que hay que desconfiar
 * antes de ensenarlo, y ademas ataria el idioma de la pantalla a una respuesta HTTP.
 */
const explanations: Record<MissingRequirement['code'], string> = {
  DOCUMENT_SCHEMA_UNSUPPORTED:
    'Esta revisión se guardó con una versión posterior de Abstractify. Actualiza para poder abrirla.',
  PUBLICATION_UNAVAILABLE:
    'El catálogo de componentes con el que se aceptó esta revisión ya no está disponible.',
  COMPOSITION_INVALID:
    'La composición dejó de ser válida: falta una página obligatoria, o un componente ya no encaja donde está.',
  ASSET_MISSING:
    'Un estilo usa una imagen que ya no está en el proyecto. Vuelve a subirla o quita el estilo.',
  BINDING_TARGET_MISSING:
    'Una sección muestra algo del catálogo que ya no existe. Elige otra cosa o restaura lo que se borró.',
  BINDING_UNCHOSEN:
    'Una sección todavía no tiene elegido qué mostrar del catálogo.',
}

/** A donde lleva cada area, y con que rotulo. Sin sitio a donde ir no hay nada que enlazar. */
const destinations: Record<MissingRequirement['area'], { label: string; anchor: string } | null> = {
  PROJECT: null,
  PAGES: { label: 'Ir a las páginas', anchor: '#readiness-paginas' },
  THEME: { label: 'Ir al tema', anchor: '#readiness-tema' },
  ASSETS: { label: 'Ir a los medios', anchor: '#readiness-medios' },
  CATALOG: { label: 'Ir al catálogo', anchor: '#readiness-catalogo' },
}

const levelStyle = 'rounded border border-slate-400 p-2 space-y-1'

/**
 * Los tres niveles de una revision aceptada, cada uno por su cuenta.
 *
 * <p>No se resumen en un solo estado. Poder abrir una revision, poder verla como tienda y poder
 * entregarla son tres cosas distintas que se arreglan en tres sitios distintos, y un unico "lista"
 * o "no lista" obligaria a quien tiene la tienda a probar hasta descubrir cual de las tres tenia
 * delante.
 *
 * <p>Habla siempre de una revision exacta y lo dice con su numero: el veredicto envejece -se retira
 * un asset, se borra una coleccion- y quien lo lee tiene que poder decir sobre que se pronuncio.
 */
export function ReadinessPanel({ projectId, revisionNumber, reloadKey, onSelectPage }: ReadinessPanelProps) {
  const [readiness, setReadiness] = useState<RevisionReadiness | null>(null)
  const [problem, setProblem] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    setReadiness(null)
    setProblem(null)
    getRevisionReadiness(projectId, String(revisionNumber))
      .then(found => { if (live) setReadiness(found) })
      .catch(error => { if (live) setProblem(safeProblem(error).message) })
    return () => { live = false }
  }, [projectId, revisionNumber, reloadKey])

  return <section aria-label="Estado de la revisión"
    className="w-full max-w-3xl space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Estado de la revisión {revisionNumber}</h2>

    {problem && <p role="alert">{problem}</p>}

    <ExportGate exportable={readiness?.exportable ?? null} />

    {readiness && <ul className="space-y-2">
      <Level name="Editable" hint="Se puede abrir y seguir cambiando."
        level={readiness.editable} onSelectPage={onSelectPage} />
      <Level name="Previsualizable" hint="Se puede ver como se verá la tienda."
        level={readiness.previewable} onSelectPage={onSelectPage} />
      <Level name="Exportable" hint="Se puede entregar como tienda independiente."
        level={readiness.exportable} onSelectPage={onSelectPage} />
    </ul>}
  </section>
}

interface LevelProps {
  name: string
  hint: string
  level: ValidationLevel
  onSelectPage: (pageId: string) => void
}

function Level({ name, hint, level, onSelectPage }: LevelProps) {
  return <li aria-label={name} className={levelStyle}>
    <p>
      <strong>{name}</strong>: {level.reached ? 'sí' : 'todavía no'}
      <span className="block text-xs opacity-80">{hint}</span>
    </p>
    {level.missing.length > 0 && <ul className="space-y-1">
      {level.missing.map((requirement, index) =>
        <Requirement key={`${requirement.code}-${requirement.pageId ?? ''}-${requirement.componentId ?? ''}-${index}`}
          requirement={requirement} onSelectPage={onSelectPage} />)}
    </ul>}
  </li>
}

/**
 * Un requisito que falta, con el sitio donde se arregla.
 *
 * <p>Cuando el requisito nombra una pagina, el enlace ademas la abre: llevar a la lista de paginas
 * sin abrir la que tiene el problema dejaria a medias justo el paso que hace falta.
 */
function Requirement({ requirement, onSelectPage }: {
  requirement: MissingRequirement
  onSelectPage: (pageId: string) => void
}) {
  const destination = destinations[requirement.area]
  return <li className="flex flex-wrap items-baseline gap-2 pl-3">
    <span>{explanations[requirement.code]}</span>
    {requirement.pageId && <span className="text-xs opacity-80">Página «{requirement.pageId}»</span>}
    {destination && <a href={destination.anchor} className="underline"
      onClick={() => { if (requirement.pageId) onSelectPage(requirement.pageId) }}>
      {destination.label}
    </a>}
  </li>
}
