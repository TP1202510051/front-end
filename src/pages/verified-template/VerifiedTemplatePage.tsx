import { RegistryRenderer } from '@/components/renderers/RegistryRenderer'
import { useRegistryPublication } from '@/registry/useRegistryPublication'

export default function VerifiedTemplatePage() {
  const { publication, failed } = useRegistryPublication()

  if (failed) return <p role="alert">No se pudo cargar el template verificado.</p>
  if (!publication) return <p role="status">Cargando template verificado…</p>
  return <RegistryRenderer publication={publication} />
}
