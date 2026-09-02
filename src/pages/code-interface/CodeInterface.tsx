import { MessageCircle } from 'lucide-react'
import { RegistryRenderer } from '@/components/renderers/RegistryRenderer'
import { RenderSkeleton } from '@/components/skeletons/RenderSkeleton'
import { Button } from '@/components/ui/button'
import { useEditing } from '@/contexts/EditingContext'
import type { AppWindow } from '@/models/windowModel'
import { useRegistryPublication } from '@/registry/useRegistryPublication'

interface CodeInterfaceProps {
  selectedWindow: AppWindow | null
  reloadKey?: number
}

export default function CodeInterface({ selectedWindow, reloadKey }: CodeInterfaceProps) {
  const { publication, failed } = useRegistryPublication(reloadKey)
  const { openWindow } = useEditing()

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
        {!selectedWindow && <p className="text-gray-500">Selecciona una ventana para ver su contenido…</p>}
        {selectedWindow && !publication && !failed && <RenderSkeleton />}
        {selectedWindow && failed && <p role="alert">No se pudo cargar el template verificado.</p>}
        {selectedWindow && publication && (
          <section aria-label={`Vista de ${selectedWindow.name}`}>
            <RegistryRenderer publication={publication} />
          </section>
        )}
      </main>
    </div>
  )
}
