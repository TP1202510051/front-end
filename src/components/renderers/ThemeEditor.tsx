import { useState } from 'react'
import { acceptRevision, getStoreProject, type OperationBatch, type StoreProject } from '@/api/projects'
import { intentionKey, outcomeIsUnknown, type ProjectOperation } from '@/canvas/intention'
import { safeProblem } from '@/api/problems'
import { linkedInstanceOf } from '@/canvas/blocks'

interface ThemeEditorProps {
  project: StoreProject
  pageId: string | null
  onAccepted: (project: StoreProject) => void
  readOnly: boolean
}

const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

/** Lo que un codigo del servidor quiere decir, dicho una sola vez y en el idioma de quien edita. */
const issueNames: Record<string, string> = {
  SELECTOR_NOT_ALLOWED: 'Ese selector no se admite: solo clases y elementos dentro de la tienda.',
  PROPERTY_NOT_ALLOWED: 'Esa propiedad no se admite.',
  VALUE_NOT_ALLOWED: 'Ese valor no se admite.',
  THEME_TOKEN_UNKNOWN: 'Cita un token que el proyecto no declara.',
  THEME_TOKEN_IN_USE: 'El CSS todavía lo usa: quítalo de las reglas antes.',
  AT_RULE_NOT_ALLOWED: 'Solo se admite @media por ancho.',
  MEDIA_CONDITION_NOT_ALLOWED: 'De @media solo se admite min-width o max-width.',
  RULE_MALFORMED: 'A esa regla le falta cerrar algo.',
  DECLARATION_MALFORMED: 'A esa declaración le falta el valor.',
  STYLESHEET_TOO_LARGE: 'El CSS es demasiado largo.',
}

/** El sitio de un problema, tal como lo escribio quien valido: "$.styles[2].color CODIGO". */
function explain(issue: string): string {
  const separator = issue.lastIndexOf(' ')
  const place = issue.slice(0, separator)
  const code = issue.slice(separator + 1)
  return `${place}: ${issueNames[code] ?? code}`
}

/**
 * El Theme del proyecto: sus tokens y su CSS.
 *
 * <p>Lo que se escribe aqui no se pinta hasta que el servidor lo acepta. Es deliberado: el CSS que
 * llega a la pantalla es el que ya paso por la validacion, de modo que nunca haya una vista previa
 * enseñando algo que no se podria guardar -ni, peor, algo que no se habria admitido-.
 *
 * <p>Lo que no se admite se explica por su sitio y su codigo, sin repetir lo que se escribio.
 */
export function ThemeEditor({ project, pageId, onAccepted, readOnly }: ThemeEditorProps) {
  // El contrato lo declara obligatorio, pero una revision anterior al Theme no lo trae y se abre
  // igual -eso es lo que la tolerancia de esquemas promete-. El tipo dice una cosa y el historial
  // otra, y quien pinta tiene que sobrevivir a la segunda.
  const theme = project.acceptedRevision.document.theme ?? { tokens: {}, rules: [] }
  const [css, setCss] = useState<string | null>(null)
  const [tokenName, setTokenName] = useState('')
  const [tokenValue, setTokenValue] = useState('')
  const [styledId, setStyledId] = useState('')
  const [styleProperty, setStyleProperty] = useState('')
  const [styleValue, setStyleValue] = useState('')
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [issues, setIssues] = useState<string[]>([])
  const [uncertain, setUncertain] = useState<OperationBatch | null>(null)

  const written = css ?? sheetText(theme)
  const disabled = pending || Boolean(uncertain) || readOnly
  const document_ = project.acceptedRevision.document
  const page = document_.pages.find(item => item.id === pageId) ?? document_.pages[0]
  const styledComponentId = page?.components.some(node => node.id === styledId)
    ? styledId : page?.rootComponentId ?? ''
  // Un nodo enlazado se estiliza por su bloque, igual que se edita su texto: si no, el estilo lo
  // separaria de sus copias sin que nadie lo hubiera pedido, y el servidor lo rechaza.
  const linked = page ? linkedInstanceOf(document_, page.id, styledComponentId) : undefined

  async function send(batch: OperationBatch) {
    setPending(true); setProblem(null); setIssues([])
    try {
      const accepted = await acceptRevision(project.id, batch)
      setUncertain(null)
      setCss(null)
      onAccepted(accepted)
    } catch (error) {
      const failure = safeProblem(error)
      setProblem(failure.message)
      setIssues(failure.issues)
      if (outcomeIsUnknown(failure.action)) setUncertain(batch)
      else {
        setUncertain(null)
        if (failure.action === 'REFRESH')
          await getStoreProject(project.id).then(onAccepted).catch(() => undefined)
      }
    } finally { setPending(false) }
  }

  function apply(operation: ProjectOperation) {
    return send({
      baseRevisionId: project.acceptedRevision.id,
      idempotencyKey: intentionKey(),
      operations: [operation],
    })
  }

  return <section aria-label="Tema del proyecto"
    className="w-full max-w-3xl max-h-72 overflow-y-auto space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Tema del proyecto</h2>

    <ul className="flex flex-wrap gap-2">
      {Object.entries(theme.tokens).map(([name, value]) => (
        <li key={name} className="rounded border border-slate-400 px-2 py-0.5">
          <span aria-hidden="true" className="mr-1 inline-block h-3 w-3 rounded-full align-middle"
            style={{ backgroundColor: value }} />
          {name}: {value}
        </li>
      ))}
      {Object.keys(theme.tokens).length === 0 && <li>Todavía no hay tokens.</li>}
    </ul>

    {!readOnly && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault()
      void apply({ kind: 'SET_THEME_TOKEN', property: tokenName.trim(), value: tokenValue.trim() })
    }}>
      <label>Nombre del token
        <input className={fieldStyle} value={tokenName} disabled={disabled} maxLength={60}
          onChange={event => setTokenName(event.target.value)} required />
      </label>
      <label>Valor del token
        <input className={fieldStyle} value={tokenValue} disabled={disabled}
          onChange={event => setTokenValue(event.target.value)} />
      </label>
      <button type="submit" className={buttonStyle} disabled={disabled || !tokenName.trim()}>
        Guardar token
      </button>
      <p className="w-full text-xs">Un valor vacío quita el token, si ninguna regla lo usa.</p>
    </form>}

    {!readOnly && <form className="space-y-2" onSubmit={event => {
      event.preventDefault()
      void apply({ kind: 'SET_PROJECT_STYLES', css: written })
    }}>
      <label className="block">CSS del proyecto
        <textarea className={`${fieldStyle} block w-full font-mono`} rows={6} value={written}
          disabled={disabled} onChange={event => setCss(event.target.value)} />
      </label>
      <button type="submit" className={buttonStyle} disabled={disabled}>Guardar CSS</button>
    </form>}

    {!readOnly && page && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault()
      void apply(linked
        ? { kind: 'SET_BLOCK_STYLE', pageId: page.id, instanceId: linked.id,
            componentId: styledComponentId, property: styleProperty.trim(), value: styleValue.trim() }
        : { kind: 'SET_COMPONENT_STYLE', pageId: page.id,
            componentId: styledComponentId, property: styleProperty.trim(), value: styleValue.trim() })
    }}>
      <label>Componente de {page.path}
        <select className={fieldStyle} value={styledComponentId} disabled={disabled}
          onChange={event => setStyledId(event.target.value)}>
          {page.components.map(node => <option key={node.id} value={node.id}>
            {node.properties.heading ?? node.properties.label ?? node.type}
          </option>)}
        </select>
      </label>
      <label>Propiedad
        <input className={fieldStyle} value={styleProperty} disabled={disabled} maxLength={40}
          onChange={event => setStyleProperty(event.target.value)} required />
      </label>
      <label>Valor
        <input className={fieldStyle} value={styleValue} disabled={disabled}
          onChange={event => setStyleValue(event.target.value)} />
      </label>
      <button type="submit" className={buttonStyle} disabled={disabled || !styleProperty.trim()}>
        {linked ? 'Guardar estilo compartido' : 'Guardar estilo del componente'}
      </button>
      <p className="w-full text-xs">
        {linked
          ? 'Este componente pertenece a un bloque vinculado: el estilo entra en todas sus copias.'
          : 'Un valor vacío quita el estilo. Pisa al tema, porque se escribe después.'}
      </p>
    </form>}

    {readOnly && <>
      <p>Tema guardado en esta revisión. Vuelve a la última para editar.</p>
      <pre className="overflow-x-auto font-mono text-xs">{sheetText(theme)}</pre>
    </>}

    {pending && <p role="status">Cambio pendiente de confirmación…</p>}
    {problem && <p role="alert">{problem}</p>}
    {issues.length > 0 && <ul aria-label="Reglas no admitidas" className="space-y-1">
      {issues.map(issue => <li key={issue}>{explain(issue)}</li>)}
    </ul>}
    {uncertain && !readOnly && <button type="button" className={buttonStyle} disabled={pending}
      onClick={() => void send(uncertain)}>Reintentar cambio de tema</button>}
  </section>
}

/**
 * El CSS aceptado, escrito de vuelta para poder seguir editandolo.
 *
 * <p>No es el texto que se escribio: es lo que significa, que es lo unico que se guardo. Verlo asi
 * es parte de lo que la capacidad promete -lo aceptado es lo canonico- y evita que alguien siga
 * editando un texto que el proyecto ya no tiene.
 */
function sheetText(theme: StoreProject['acceptedRevision']['document']['theme']): string {
  return theme.rules.map(rule => {
    const body = Object.entries(rule.declarations)
      .map(([property, value]) => `  ${property}: ${value};`).join('\n')
    const text = `${rule.selector} {\n${body}\n}`
    return rule.media ? `@media ${rule.media} {\n${text}\n}` : text
  }).join('\n\n')
}
