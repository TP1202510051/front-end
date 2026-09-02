import { useEffect, useState } from 'react'
import { getRegistryPublication } from '@/api/registry'
import type { RegistryPublication } from '@/registry/publication'

export function useRegistryPublication(reloadKey: unknown = null) {
  const [publication, setPublication] = useState<RegistryPublication | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setPublication(null)
    setFailed(false)
    getRegistryPublication().then(value => {
      if (active) setPublication(value)
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [reloadKey])

  return { publication, failed }
}
