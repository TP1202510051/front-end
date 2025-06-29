import React, { useState } from 'react';
import { createWindow } from '@/services/windows.service';
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import type { Window } from '@/models/windowModel';

interface WindowCreationDialogProps {
    onWindow: (win: Window) => void;
    projectId: string;
}

const WindowCreationDialog: React.FC<WindowCreationDialogProps> = ({onWindow, projectId}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowName, setWindowName] = useState<string>("");
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWindowName(event.target.value);
  };

  const handleAccept = async () => {
    try {
      const result = await createWindow(Number(projectId), windowName);
      console.log("Ventana creada con éxito:", result);

        const newWindow: Window = {
            id: result.id,
            windowName: result.windowName,
            createdAt: result.createdAt,
            projectId: result.projectId.toString(),
        };
        onWindow(newWindow);
        setWindowName('');
        setIsOpen(false);
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    }
  };
  return (
    <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="p-1">
                    <Plus className="h-4 w-4 " />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none">
                <DialogTitle className="text-white .lato-regular">
                  Ingrese nombre de la nueva ventana
                </DialogTitle>
                <div className="mt-4">
                  <Input
                    id="link"
                    placeholder="Nombre..."
                    className="w-full p-2 text-white rounded border focus:outline-none selection:bg-gray-700/50"
                    onChange={handleInputChange}
                    value={windowName}
                  />
                </div>
                <DialogFooter className="pt-2 sm:justify-around">
                  <Button type="submit" variant="secondary" className="cursor-pointer"  onClick={handleAccept}>
                    Aceptar
                  </Button>
                    <DialogClose asChild>
                        <Button variant="default">Cancelar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
};

export default WindowCreationDialog;