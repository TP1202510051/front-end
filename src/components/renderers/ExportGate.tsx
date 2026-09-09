import type { ReactNode } from 'react'
import type { ValidationLevel } from '@/api/readiness'

interface ExportGateProps {
  /** El nivel exportable de la revision exacta que se mira, o null mientras no se sabe. */
  exportable: ValidationLevel | null
  /** El control de generacion, cuando exista. Solo se pinta con la puerta abierta. */
  children?: ReactNode
}

const blockedStyle = 'rounded border border-slate-400 px-3 py-1 opacity-50'

/**
 * La puerta de la exportacion: nada de generar sale de aqui sin que el servidor lo autorice.
 *
 * <p>Quien decide es el backend y solo el. La SPA no vuelve a juzgar si la revision esta entera -no
 * tiene delante ni los assets del proyecto ni lo que el catalogo contiene- y tampoco se guarda un
 * criterio propio: con dos criterios acabaria abriendo el control por el mas flojo de los dos.
 *
 * <p>Que sea un componente y no un {@code if} suelto es lo que hace que solo haya una puerta. El
 * control de generacion llega con su propia entrega, y entrara aqui dentro: asi no puede aparecer
 * en la pantalla por un camino que no pase por esta decision.
 *
 * <p>Sin informe la puerta esta cerrada. Es la direccion segura: una respuesta que no se entiende o
 * que no llego no puede leerse como permiso.
 */
export function ExportGate({ exportable, children }: ExportGateProps) {
  const open = exportable?.reached === true

  return <div className="space-y-2" data-testid="export-gate">
    {open
      ? children ?? <p role="status">
          Esta revisión ya es exportable. Generar la tienda llega en una entrega posterior.
        </p>
      : <>
          <button type="button" disabled aria-disabled="true" className={blockedStyle}>
            Generar tienda
          </button>
          <p role="status">
            {exportable
              ? 'Esta revisión todavía no se puede entregar. Resuelve lo que falta para exportarla.'
              : 'Todavía no se sabe si esta revisión se puede entregar.'}
          </p>
        </>}
  </div>
}
