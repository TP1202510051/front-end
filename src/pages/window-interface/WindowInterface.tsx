import React, { useEffect, useState } from 'react';
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
import WindowCreationDialog from '@/components/created-components/WindowCreationDialog';
import { EditIcon } from '@/assets/icons/EditIcon';
import { RenderSkeleton } from '@/components/skeletons/RenderSkeleton';

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

  const [isFirstWindow, setIsFirstWindow] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    setIsFirstWindow(windows.length === 0);
  }, [windows]);

  const fetchWithLoading = async (winId: string) => {
    setLoadingCode(true);
    try {
      await fetchCode(winId);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleSelectWindow = (win: AppWindow) => {
    setSelectedWindow(win);
    onWindowSelect(win);
    setLiveCode('');
    fetchWithLoading(win.id);
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
              setSelectedWindow(null);
            }}
          >
            <EditIcon />
            Editar ventana
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
        <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none text-white">
          <DialogTitle>Editar nombre</DialogTitle>
          <Input value={newWindowName} onChange={(e) => setNewWindowName(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleUpdateWindow} variant={"primary"}>Guardar</Button>
            <Button onClick={handleDeleteWindow} variant="destructive">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-3 bg-[#2C2C2C] flex items-center mt-2 top-0 start-85 rounded-lg absolute z-10"> 
        {windows.map((win) => (
          <div key={win.id} className="flex flex-col items-center gap-1 mx-2 justify-center">
            <button
              className="inline-flex items-center bg-[#202123] text-white rounded-lg px-4 py-2 hover:bg-[#343540]"
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
          first={isFirstWindow}
        />
      </div>

      <div className="flex flex-col w-full h-full">
        <main className="flex-1 overflow-auto p-10 box-border">
          {
            loadingCode ? (
              <RenderSkeleton />
            ) : liveCode ? (
              <JsxParser
                jsx={normalizeJSX(liveCode)}
                renderInWrapper={false}
                allowUnknownElements
                showWarnings
                bindings={{ Array, Math, Date, JSON }}
              />
            ) : (
              <p className="text-gray-500">Aquí se mostrará…</p>
            )
          }
        </main>
      </div>
    </>
  );
};

export default WindowInterface;
