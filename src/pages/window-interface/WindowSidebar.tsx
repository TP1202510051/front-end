// src/components/created-components/WindowSidebar.tsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWindows } from "@/hooks/useWindows";
import type { AppWindow } from "@/models/windowModel";
import { WindowSkeleton } from "@/components/skeletons/WindowSkeleton";
import { createWindow } from "@/services/windows.service";

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [newWindowName, setNewWindowName] = useState("");

  const handleCreateWindow = (win: AppWindow) => {
    setWindows((prev) => [...prev, win]);
    createWindow(Number(win.projectId), win.name);
    onSelect(win);
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
    setIsDialogOpen(false);
  };

  if(!windows) return <WindowSkeleton />;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b-2 border-border border-t-2 py-2 mb-2">
        <span className="text-lg font-semibold">Ventanas</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedWindow(null);
            setNewWindowName("");
            setIsDialogOpen(true);
          }}
        >
          <Plus />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {windows.map((win) => (
          <Button
            key={win.id}
            variant="design"
            className="justify-start"
            onClick={() => onSelect(win)}
            onDoubleClick={() => {
              setSelectedWindow(win);
              setNewWindowName(win.name);
              setIsDialogOpen(true);
            }}
          >
            {win.name}
          </Button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[var(--dialog-background)] text-[var(--dialog-foreground)] rounded-md w-[90vw] max-w-md">
          <DialogTitle>
            {selectedWindow ? "Editar ventana" : "Nueva ventana"}
          </DialogTitle>
          <Input
            value={newWindowName}
            onChange={(e) => setNewWindowName(e.target.value)}
            placeholder="Nombre de la ventana"
            className="mt-4"
          />
          <DialogFooter className="pt-4 flex justify-between">
            {selectedWindow ? (
              <>
                <Button variant="inverseDark" onClick={handleUpdateWindow}>
                  Aceptar
                </Button>
                <Button variant="destructive" onClick={handleDeleteWindow}>
                  Eliminar
                </Button>
              </>
            ) : (
              <>
                <Button
                variant="inverseDark"
                onClick={() =>
                  handleCreateWindow({
                    id: Date.now().toString(),
                    name: newWindowName,
                    projectId,
                    createdAt: new Date().toISOString(),
                  } as AppWindow)
                }
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
    </div>
  );
};
