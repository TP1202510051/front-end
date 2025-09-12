import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogTrigger, DialogContent, DialogFooter, DialogClose, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { AppWindow } from '@/models/windowModel';
import { useCreateWindow } from '@/hooks/useCreateWindow';

interface WindowCreationDialogProps {
  onWindow: (win: AppWindow) => void;
  projectId: string;
  setIsSaving?: (isSaving: boolean) => void;
}

const WindowCreationDialog: React.FC<WindowCreationDialogProps> = ({
  onWindow,
  projectId,
  setIsSaving,
}) => {
  const { isOpen, setIsOpen, windowName, setWindowName, create } =
    useCreateWindow(projectId, setIsSaving);

  const handleAccept = async () => {
    const newWindow = await create();
    if (!newWindow) return;
    onWindow(newWindow);
    setWindowName('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="p-1">
          <Plus className="h-4 w-4" />
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
            value={windowName}
            onChange={(e) => setWindowName(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-2 sm:justify-around">
          <Button type="button" variant="secondary" className="cursor-pointer" onClick={handleAccept}>
            Aceptar
          </Button>
          <DialogClose asChild>
            <Button variant="default">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WindowCreationDialog;
