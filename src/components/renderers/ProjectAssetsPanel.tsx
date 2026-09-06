import { useEffect, useState } from 'react'
import { listAssets, removeAsset, uploadAsset, describeAsset, type ProjectAsset } from '@/api/assets'
import { safeProblem } from '@/api/problems'

interface ProjectAssetsPanelProps {
  projectId: string
  readOnly: boolean
}

const fieldStyle = 'rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

/**
 * Por que unos bytes no llegaron a ser un asset, dicho en el idioma de quien sube.
 *
 * <p>Se distinguen a proposito, porque cada una se arregla de otra manera: cambiando de fichero,
 * reduciendolo, o escribiendo la descripcion. Un solo mensaje para todas obligaria a probar.
 */
const refusals: Record<string, string> = {
  FORMAT_NOT_ALLOWED: 'Ese formato no se admite. Solo PNG y JPEG; un SVG no es una imagen sino un documento.',
  CONTENT_TYPE_MISMATCH: 'El fichero no es del tipo que dice ser.',
  CONTENT_UNREADABLE: 'El fichero está dañado y no se pudo leer como imagen.',
  TOO_LARGE: 'Pesa demasiado. El máximo son 5 MB.',
  DIMENSIONS_NOT_ALLOWED: 'Es demasiado pequeña. El mínimo son 16 píxeles por lado.',
  PIXEL_LIMIT_EXCEEDED: 'Tiene demasiados píxeles. Redúcela antes de subirla.',
  ALTERNATIVE_TEXT_REQUIRED: 'Falta la descripción, y es obligatoria para que la tienda sea accesible.',
  STORAGE_UNAVAILABLE: 'El almacén no está disponible. Lo que ya subiste se sigue viendo.',
}

/**
 * Los fallos de autorizacion no vienen con codigo de asset, sino con el de la respuesta.
 *
 * <p>Lo ajeno y lo que no esta se contestan igual a proposito, asi que aqui no se distinguen: hacerlo
 * convertiria un identificador en una forma de averiguar que existe. Lo que si se distingue es haber
 * perdido la sesion, que se arregla de otra manera.
 */
const authorizations: Partial<Record<string, string>> = {
  AUTHENTICATION_REQUIRED: 'Tu sesión caducó. Inicia sesión otra vez para subir medios.',
  AUTHORIZATION_DENIED: 'No tienes permiso sobre este proyecto.',
  RESOURCE_NOT_FOUND: 'Ese medio ya no está en el proyecto.',
}

/** El desglose viene como "$.asset CODIGO"; lo que se pinta es lo que el codigo significa. */
function explain(problem: { issues: string[], code: string, message: string }): string {
  for (const issue of problem.issues) {
    const code = issue.slice(issue.lastIndexOf(' ') + 1)
    if (refusals[code]) return refusals[code]
  }
  return authorizations[problem.code] ?? problem.message
}

/**
 * Los medios del proyecto: subirlos, describirlos y retirarlos.
 *
 * <p>Nada se pinta desde el fichero local: lo que se ensena es lo que el servidor acepto y verifico,
 * de modo que la vista previa no pueda ensenar algo que no se habria admitido.
 */
export function ProjectAssetsPanel({ projectId, readOnly }: ProjectAssetsPanelProps) {
  const [assets, setAssets] = useState<ProjectAsset[]>([])
  const [alternativeText, setAlternativeText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [uploaded, setUploaded] = useState<number | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  // Un texto por fila, no uno compartido: con uno solo, guardar la descripcion de una imagen
  // escribia lo que se habia tecleado para otra.
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})

  useEffect(() => {
    let live = true
    listAssets(projectId)
      .then(found => { if (live) { setAssets(found); setLoaded(true) } })
      .catch(error => { if (live) { setProblem(safeProblem(error).message); setLoaded(true) } })
    return () => { live = false }
  }, [projectId])

  async function attempt(action: () => Promise<unknown>) {
    setPending(true); setProblem(null)
    try {
      await action()
      setAssets(await listAssets(projectId))
      setFile(null)
      setAlternativeText('')
      setDescriptions({})
    } catch (error) {
      setProblem(explain(safeProblem(error)))
    } finally { setPending(false); setUploaded(null) }
  }

  return <section aria-label="Medios del proyecto"
    className="w-full max-w-3xl max-h-72 overflow-y-auto space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Medios del proyecto</h2>

    {!readOnly && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault()
      if (file) void attempt(() => uploadAsset(projectId, file, alternativeText.trim(), setUploaded))
    }}>
      <label>Imagen
        <input className={fieldStyle} type="file" accept="image/png,image/jpeg" disabled={pending}
          onChange={event => setFile(event.target.files?.[0] ?? null)} />
      </label>
      <label>Descripción
        <input className={fieldStyle} value={alternativeText} disabled={pending} maxLength={300}
          onChange={event => setAlternativeText(event.target.value)} required />
      </label>
      <button type="submit" className={buttonStyle} disabled={pending || !file || !alternativeText.trim()}>
        Subir imagen
      </button>
      <p className="w-full text-xs">PNG o JPEG, hasta 5 MB. La descripción es obligatoria.</p>
    </form>}

    {pending && (uploaded === null
      ? <p role="status">Subiendo…</p>
      : <p role="status">
          Subiendo…{' '}
          <progress aria-label="Progreso de la subida" value={uploaded} max={1} />{' '}
          {Math.round(uploaded * 100)}%
        </p>)}
    {problem && <p role="alert">{problem}</p>}
    {loaded && assets.length === 0 && !problem && <p>Todavía no hay medios.</p>}

    <ul className="space-y-2">
      {assets.map(asset => (
        <li key={asset.id} className="space-y-1 border-t border-slate-500 pt-2">
          <p>{asset.alternativeText}</p>
          <p className="text-xs">
            {asset.contentType} · {asset.width}×{asset.height} ·{' '}
            anchuras {asset.derivatives.map(derivative => derivative.width).join(', ') || 'sin derivadas'}
          </p>
          {/* La identidad es lo que el CSS cita; por eso se puede copiar de aqui. */}
          <code className="block overflow-x-auto text-xs">asset({asset.id})</code>
          {!readOnly && <div className="flex flex-wrap items-end gap-2">
            <label>Descripción de esta imagen
              <input className={fieldStyle} maxLength={300} disabled={pending}
                value={descriptions[asset.id] ?? asset.alternativeText}
                onChange={event => setDescriptions(current =>
                  ({ ...current, [asset.id]: event.target.value }))} />
            </label>
            <button type="button" className={buttonStyle} disabled={pending}
              onClick={() => void attempt(() => describeAsset(projectId, asset.id,
                (descriptions[asset.id] ?? asset.alternativeText).trim()))}>
              Guardar descripción
            </button>
            <button type="button" className={buttonStyle} disabled={pending}
              onClick={() => void attempt(() => removeAsset(projectId, asset.id))}>
              Retirar imagen
            </button>
          </div>}
        </li>
      ))}
    </ul>
  </section>
}
