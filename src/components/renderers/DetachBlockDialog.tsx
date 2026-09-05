import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

interface DetachBlockDialogProps {
  /** La ruta de la página donde vive la instancia, o undefined si el diálogo está cerrado. */
  path: string | undefined
  blockName: string
  /** Las rutas que seguirán compartidas después de desvincular. */
  stillShared: string[]
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
  buttonStyle: string
}

/**
 * Desvincular se decide con las consecuencias delante.
 *
 * <p>Es la única acción del panel que no se deshace escribiendo otra vez: una instancia suelta
 * conserva lo que tenía, pero volver a vincularla no existe. Por eso se nombra lo que deja de
 * compartirse y lo que sigue compartido, en vez de pedir una confirmación a ciegas.
 */
export function DetachBlockDialog({
  path, blockName, stillShared, pending, onCancel, onConfirm, buttonStyle,
}: DetachBlockDialogProps) {
  return <Dialog open={Boolean(path)} onOpenChange={open => { if (!open && !pending) onCancel() }}>
    <DialogContent>
      <DialogTitle>Desvincular instancia</DialogTitle>
      <DialogDescription>
        {path ? `Esta instancia de ${blockName} en ${path} conservará su contenido actual y dejará de recibir los cambios del bloque.` : ''}
        {stillShared.length > 0
          ? ` Seguirá compartida en ${stillShared.join(', ')}.`
          : ' Ninguna otra página quedará compartida: el bloque dejará de tener instancias vinculadas.'}
      </DialogDescription>
      <button type="button" className={buttonStyle} disabled={pending} onClick={onCancel}>Cancelar</button>
      <button type="button" className={buttonStyle} disabled={pending} onClick={onConfirm}>Confirmar desvinculación</button>
    </DialogContent>
  </Dialog>
}
