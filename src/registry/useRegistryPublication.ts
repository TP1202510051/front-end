import { useEffect, useState } from 'react'
import { getRegistryPublication, REGISTRY_VERSION, TEMPLATE_VERSION } from '@/api/registry'
import type { RegistryPublication } from '@/registry/publication'

export function useRegistryPublication(reloadKey: unknown = null, registryVersion = REGISTRY_VERSION,
  templateVersion = TEMPLATE_VERSION) {
  const [publication, setPublication] = useState<RegistryPublication | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setPublication(null)
    setFailed(false)
    getRegistryPublication(registryVersion, templateVersion).then(value => {
      if (active) setPublication(value)
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [reloadKey, registryVersion, templateVersion])

  return { publication, failed }
}
