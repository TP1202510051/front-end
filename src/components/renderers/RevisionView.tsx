import { RegistryRenderer } from '@/components/renderers/RegistryRenderer'
import { StoreSurface } from '@/components/renderers/StoreSurface'
import { RenderSkeleton } from '@/components/skeletons/RenderSkeleton'
import { useRegistryPublication } from '@/registry/useRegistryPublication'
import { publicationForProject } from '@/registry/publication'
import type { StoreProject } from '@/api/projects'

interface RevisionViewProps {
  project: StoreProject
  /** La pagina que se esta mirando; sin ella se dibuja la primera. */
  pageId?: string | null
}

/**
 * La revision aceptada tal como la pinta el registro verificado.
 *
 * <p>Es el mismo renderizador que dibuja la vista previa de una propuesta o una revision
 * inspeccionada: un solo camino de pintado, para que lo que se ve sea lo que hay. No ejecuta
 * nada que venga del proyecto; el documento se valida contra la publicacion y se compone con los
 * componentes del registro.
 */
export function RevisionView({ project, pageId }: RevisionViewProps) {
  const revision = project.acceptedRevision
  const { publication, failed } = useRegistryPublication(revision.registryVersion, revision.templateVersion)
  const projectPublication = publication ? publicationForProject(publication, project) : null
  return (
    <main className="box-border min-h-[500px] flex-1 overflow-auto p-10 text-[var(--dialog-foreground)]">
      {!publication && !failed && <RenderSkeleton />}
      {failed && <p role="alert">No se pudo cargar el template verificado.</p>}
      {publication && !projectPublication && <p role="alert">La revisión no coincide con el registro verificado.</p>}
      {projectPublication && (
        <section aria-label="Vista de la revisión aceptada">
          <StoreSurface projectId={project.id} document={revision.document}>
            <RegistryRenderer publication={projectPublication} pageId={pageId} projectId={project.id} />
          </StoreSurface>
        </section>
      )}
    </main>
  )
}
