import { MessageCircle } from 'lucide-react'
import { RegistryRenderer } from '@/components/renderers/RegistryRenderer'
import { RenderSkeleton } from '@/components/skeletons/RenderSkeleton'
import { Button } from '@/components/ui/button'
import { useEditing } from '@/contexts/EditingContext'
import type { AppWindow } from '@/models/windowModel'
import { useRegistryPublication } from '@/registry/useRegistryPublication'
import { publicationForProject } from '@/registry/publication'
import type { StoreProject } from '@/api/projects'

interface CodeInterfaceProps {
  selectedWindow: AppWindow | null
  reloadKey?: number
  project: StoreProject
  /** La pagina que se esta mirando; sin ella se dibuja la primera. */
  pageId?: string | null
}

export default function CodeInterface({ selectedWindow, reloadKey, project, pageId }: CodeInterfaceProps) {
  const revision = project.acceptedRevision
  const { publication, failed } = useRegistryPublication(
    reloadKey, revision.registryVersion, revision.templateVersion,
  )
  const { openWindow } = useEditing()
  const projectPublication = publication ? publicationForProject(publication, project) : null

  return (
    <div className="flex h-full w-full flex-col text-[var(--dialog-foreground)]">
      {selectedWindow && (
        <div className="absolute bottom-4 right-20 z-10 overflow-hidden rounded-full shadow-lg">
          <Button onClick={() => openWindow(selectedWindow)} variant="inverseDark"
            className="flex h-16 w-16 items-center justify-center rounded-full p-0"
            aria-label="Abrir asistente para la página seleccionada">
            <MessageCircle className="h-12 w-12" />
          </Button>
        </div>
      )}
      <main className="box-border min-h-[500px] flex-1 overflow-auto p-10">
        {!publication && !failed && <RenderSkeleton />}
        {failed && <p role="alert">No se pudo cargar el template verificado.</p>}
        {publication && !projectPublication && <p role="alert">La revisión no coincide con el registro verificado.</p>}
        {projectPublication && (
          <section aria-label={selectedWindow ? `Vista de ${selectedWindow.name}` : 'Vista de la revisión aceptada'}>
            <RegistryRenderer publication={projectPublication} pageId={pageId} />
          </section>
        )}
      </main>
    </div>
  )
}
