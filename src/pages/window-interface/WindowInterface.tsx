import React, { useState } from 'react';
import JsxParser from 'react-jsx-parser';
import { useWindows } from '@/hooks/useWindows';
import { useLiveCode } from '@/hooks/useLiveCodes';
import { normalizeJSX } from '@/utils/handlers/jsxUtils';
import type { AppWindow } from '@/models/windowModel';
import {
  Dialog, DialogContent, DialogFooter, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';
import WindowCreationDialog from '@/components/created-components/WindowCreationDialog';
import { EditIcon } from '@/assets/icons/EditIcon';

interface WindowInterfaceProps {
  projectId: string;
  webSocketCode?: string;
  onWindowSelect: (window: AppWindow | null) => void;
  setIsSaving?: (isSaving: boolean) => void;
}

const WindowInterface: React.FC<WindowInterfaceProps> = ({
  projectId, webSocketCode, onWindowSelect, setIsSaving,
}) => {
  const { windows, selectedWindow, setSelectedWindow, setWindows, updateWindow, removeWindow } =
    useWindows(projectId, setIsSaving);
  const { liveCode, setLiveCode, fetchCode } = useLiveCode(webSocketCode);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWindowToEdit, setSelectedWindowToEdit] = useState<AppWindow | null>(null);
  const [newWindowName, setNewWindowName] = useState('');

  const handleSelectWindow = (win: AppWindow) => {
    setSelectedWindow(win);
    onWindowSelect(win);
    setLiveCode('');
    fetchCode(win.id);
  };

  const handleUpdateWindow = async () => {
    if (!selectedWindowToEdit) return;
    const updated = await updateWindow(selectedWindowToEdit, newWindowName);
    if (updated) onWindowSelect(updated);
    setIsDialogOpen(false);
  };

  const handleDeleteWindow = async () => {
    if (!selectedWindowToEdit) return;
    await removeWindow(selectedWindowToEdit);
    onWindowSelect(null);
    setIsDialogOpen(false);
  };

  return (
    <>
      {selectedWindow && (
        <div className="w-full flex justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedWindowToEdit(selectedWindow);
              setNewWindowName(selectedWindow.name);
              setIsDialogOpen(true);
            }}
          >
            <EditIcon />
            Editar ventana
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>Editar nombre</DialogTitle>
          <Input value={newWindowName} onChange={(e) => setNewWindowName(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleUpdateWindow}><Save className="mr-2 h-4 w-4" />Guardar</Button>
            <Button onClick={handleDeleteWindow} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-3 bg-[#2C2C2C] flex items-center justify-center mb-4 absolute bottom-0 rounded-lg">
        {windows.map((win) => (
          <div key={win.id} className="flex flex-col items-center gap-1 mx-2 w-full">
            <button
              className="bg-[#202123] text-white rounded-lg px-4 py-2 hover:bg-[#343540]"
              onClick={() => handleSelectWindow(win)}
            >
              {win.name}
            </button>
          </div>
        ))}
        <WindowCreationDialog
          projectId={projectId}
          onWindow={(newWin) => setWindows((prev) => [...prev, newWin])}
          setIsSaving={setIsSaving}
        />
      </div>

      <div className="flex flex-col w-full h-full">
        <main className="flex-1 overflow-auto p-10 box-border">
          {liveCode ? (
            <JsxParser
              jsx={normalizeJSX(liveCode)}
              renderInWrapper={false}
              allowUnknownElements
              showWarnings
              bindings={{ Array, Math, Date, JSON }}
            />
          ) : (
            <p className="text-gray-500">Aquí se mostrará…</p>
          )}
        </main>
      </div>
    </>
  );
};

export default WindowInterface;
