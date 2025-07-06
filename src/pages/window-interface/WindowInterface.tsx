import React, { useState, useEffect } from 'react';
import JsxParser from 'react-jsx-parser';
import { getLatestCodeByWindowId } from '@/services/code.service';
import { getWindowsByProjectId, updateWindowName, deleteWindow } from '@/services/windows.service';
import type { Window } from '@/models/windowModel';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Pencil } from 'lucide-react';
import WindowCreationDialog from '@/components/created-components/WindowCreationDialog';

interface WindowInterfaceProps {
  projectId: string;
  webSocketCode?: string;
  onWindowSelect: (window: Window) => void;
}

const WindowInterface: React.FC<WindowInterfaceProps> = ({
  projectId,
  webSocketCode,
  onWindowSelect
}) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [liveCode, setLiveCode] = useState<string>('');
  const [selectedWindowToEdit, setSelectedWindowToEdit] = useState<Window | null>(null);
  const [newWindowName, setNewWindowName] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<Window | null>(null);

  useEffect(() => {
    const loadWindows = async () => {
      try {
        const data = await getWindowsByProjectId(Number(projectId));
        setWindows(data);
      } catch (error) {
        console.error('Error al obtener las ventanas', error);
      }
    };
    loadWindows();
  }, [projectId]);

  useEffect(() => {
    if (webSocketCode) {
      setLiveCode(webSocketCode);
    }
  }, [webSocketCode]);

  const fetchCodeForWindow = async (windowId: string) => {
    try {
      const data = await getLatestCodeByWindowId(Number(windowId));
      setLiveCode(data?.code ?? '');
    } catch (error) {
      console.error('Error al obtener el código para la ventana', error);
    }
  };

  const normalizeJSX = (raw: string) => {
    const code = raw.trim();
    if (code.startsWith('<>') || /^<[^/][\s\S]*>[\s\S]*<\/[^>]+>$/.test(code)) {
      return code;
    }
    return `<>${code}</>`;
  };

  const openEditDialog = (win: Window) => {
    setSelectedWindowToEdit(win);
    setNewWindowName(win.windowName);
    setIsDialogOpen(true);
  };

  const handleUpdateWindow = async () => {
    if (!selectedWindowToEdit) return;
    try {
      await updateWindowName(selectedWindowToEdit.id.toString(), newWindowName);
      setWindows((prev) =>
        prev.map((w) => (w.id === selectedWindowToEdit.id ? { ...w, windowName: newWindowName } : w))
      );
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar la ventana:', error);
    }
  };

  const handleDeleteWindow = async () => {
    if (!selectedWindowToEdit) return;
    try {
      await deleteWindow(selectedWindowToEdit.id.toString());
      setWindows((prev) => prev.filter((w) => w.id !== selectedWindowToEdit.id));
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al eliminar la ventana:', error);
    }
  };

  return (
    <>
    {selectedWindow && (
      <div className="w-full flex justify-end">
        <Button
          variant="secondary"
          onClick={() => openEditDialog(selectedWindow)}
          className="flex items-center  gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Editar ventana
        </Button>
      </div>
    )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#2C2C2C] text-white rounded">
          <DialogTitle>Editar nombre de la ventana</DialogTitle>
          <div className="mt-4">
            <Input
              value={newWindowName}
              onChange={(e) => setNewWindowName(e.target.value)}
              className="text-white bg-[#1a1a1a] border border-gray-600"
            />
          </div>
          <DialogFooter className="pt-4 flex justify-between">
            <Button onClick={handleUpdateWindow} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button onClick={handleDeleteWindow} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-3 bg-[#2C2C2C] flex items-center justify-center mb-4 absolute bottom-0 rounded-lg">
        {windows.map((win) => (
          <div key={win.id} className="flex flex-col items-center gap-1 mx-2 w-full">
            <button
              className="bg-[#202123] text-white rounded-lg px-4 py-2 hover:bg-[#343540]"
              onClick={() => {
                onWindowSelect(win);
                fetchCodeForWindow(win.id);
                setSelectedWindow(win);
              }}
            >
              {win.windowName}
            </button>
          </div>
        ))}
        <WindowCreationDialog
          projectId={projectId}
          onWindow={(newWin) => setWindows((prev) => [...prev, newWin])}
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
