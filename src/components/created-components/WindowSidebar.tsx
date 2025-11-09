import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWindows } from "@/hooks/useWindows";
import type { AppWindow } from "@/models/windowModel";
import { WindowSkeleton } from "@/components/skeletons/WindowSkeleton";
import { createWindow } from "@/services/windows.service";
import { toast } from "react-toastify";
import { WindowDropDownMenu } from "./WindowDropDownMenu";
import { useEditing } from "@/contexts/EditingContext";
import CreationWindowCard from "./CreationWindowCard";
import AdviceDialog from "./AdviceDialog";

interface WindowSidebarProps {
  projectId: string;
  onSelect: (win: AppWindow | null) => void;
  setIsSaving?: (saving: boolean) => void;
}

export const WindowSidebar: React.FC<WindowSidebarProps> = ({
  projectId,
  onSelect,
  setIsSaving,
}) => {
  const { windows, setWindows, updateWindow, removeWindow } = useWindows(
    projectId,
    setIsSaving
  );

  const { openWindow } = useEditing();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [newWindowName, setNewWindowName] = useState("");
  const [adviceDialog, setAdviceDialog] = useState(false);
  const [nameInDialog, setNameInDialog] = useState("Actual");

  const handleCreateWindow = async () => {
    try {
      if (!newWindowName.trim()) return;

      const win = await createWindow(Number(projectId), newWindowName);

      const newWin = { ...win, projectId: String(win.projectId) } as AppWindow;
      setWindows(prev => [...prev, newWin]);
      onSelect(newWin);

      // abrir chat de la ventana recién creada
      openWindow(newWin);

      setIsDialogOpen(false);
      if(newWindowName === 'Detalle de Producto' || newWindowName === 'Vista de Producto' || newWindowName === 'Informacion de Producto'){
        setNameInDialog(newWindowName);
        setAdviceDialog(true);
      }
      setNewWindowName("");
    } catch (error) {
      toast.error(`❌ Error creando ventana: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleUpdateWindow = async () => {
    if (!selectedWindow) return;
    const updated = await updateWindow(selectedWindow, newWindowName);
    if (updated) onSelect(updated);
    setIsDialogOpen(false);
  };

  const handleDeleteWindow = async () => {
    if (!selectedWindow) return;
    await removeWindow(selectedWindow);
    onSelect(null);
    setIsDeleteDialogOpen(false);
  };

  const handleCreationWindow = async () => {
    setSelectedWindow(null);
    setNewWindowName("");
    setIsDialogOpen(true);
  }

  if(!windows) return <WindowSkeleton />;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b-2 border-border border-t-2 py-2 mb-2">
        <span className="text-lg font-semibold">Ventanas</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            handleCreationWindow();
          }}
        >
          <Plus />
        </Button>
      </div>

    <div className="flex flex-col gap-2">
      {windows.map((win) => (
        <WindowDropDownMenu
          key={win.id}
          win={win}
          onSelect={onSelect}
          onEdit={(w) => {
            setSelectedWindow(w);
            setNewWindowName(w.name);
            setIsDialogOpen(true);
          }}
          onDelete={(w) => {
            setSelectedWindow(w);
            setIsDeleteDialogOpen(true);
          }}
        />
      ))}
    </div>
      <AdviceDialog name={nameInDialog ?? "actual"} isDialogOpen={adviceDialog} setIsDialogOpen={setAdviceDialog}></AdviceDialog>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[var(--dialog-background)] text-[var(--dialog-foreground)] rounded-md w-[90vw] max-w-md">
          <DialogTitle>
            {selectedWindow ? "Editar ventana" : "Nueva ventana"}
          </DialogTitle>
          <CreationWindowCard onSelectName={setNewWindowName} />
          {newWindowName && (
            <div className="mt-3 text-sm ">
              Nombre seleccionado: <span className="font-semibold">{newWindowName}</span>
            </div>
          )}
          <DialogFooter className="pt-4 flex justify-between">
            {selectedWindow ? (
              <>
                <Button variant="inverseDark" onClick={handleUpdateWindow}>
                  Aceptar
                </Button>
              </>
            ) : (
              <>
                <Button
                variant="inverseDark"
                onClick={handleCreateWindow}
              >
                Aceptar
              </Button>
                <Button type="button" variant="inverseLight" className="cursor-pointer"  onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[var(--dialog-background)] text-[var(--dialog-foreground)] rounded-md w-[90vw] max-w-sm">
          <DialogTitle>¿Eliminar ventana?</DialogTitle>
          <p className="mt-2 text-sm">
            Esta acción no se puede deshacer. Se eliminará la ventana{" "}
            <strong>{selectedWindow?.name}</strong>.
          </p>
          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button
              variant="inverseLight"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteWindow}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
