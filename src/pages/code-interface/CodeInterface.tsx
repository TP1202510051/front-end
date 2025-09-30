import React, { useState, useEffect } from "react";
import { useLiveCode } from "@/hooks/useLiveCodes";
import type { AppWindow } from "@/models/windowModel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RenderSkeleton } from "@/components/skeletons/RenderSkeleton";
import { useWindows } from "@/hooks/useWindows";
import IframeRenderer from "@/components/renderers/IframeRenderer";
import { useEditing } from "@/contexts/EditingContext";
import { MessageCircle } from "lucide-react";


interface WindowInterfaceProps {
  projectId: string;
  webSocketCode?: string;
  onWindowSelect: (window: AppWindow | null) => void;
  setIsSaving?: (isSaving: boolean) => void;
  selectedWindow: AppWindow | null;
}

const CodeInterface: React.FC<WindowInterfaceProps> = ({
  projectId,
  webSocketCode,
  onWindowSelect,
  setIsSaving,
  selectedWindow,
}) => {
  const { updateWindow } = useWindows(projectId, setIsSaving);
  const { liveCode, fetchCode, setLiveCode } = useLiveCode(webSocketCode);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWindowName, setNewWindowName] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const { openWindow } = useEditing();

  useEffect(() => {
    const load = async () => {
      if (!selectedWindow) return;
      setLoadingCode(true);
      try {
        setLiveCode("");
        await fetchCode(selectedWindow.id);
      } finally {
        setLoadingCode(false);
      }
    };
    load();
  }, [selectedWindow, fetchCode, setLiveCode]);

  const handleUpdateWindow = async () => {
    if (!selectedWindow) return;
    const updated = await updateWindow(selectedWindow, newWindowName);
    if (updated) onWindowSelect(updated);
    setIsDialogOpen(false);
  };

  const handleOpenChat = () => {
    if (selectedWindow) {
      openWindow(selectedWindow);
    }
  };

  return (
    <div className="flex flex-col w-full h-full text-[var(--dialog-foreground)]">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[var(--dialog-background)] rounded-sm outline-none w-[90vw] max-w-md">
          <DialogTitle>Editar nombre</DialogTitle>
          <Input
            value={newWindowName}
            onChange={(e) => setNewWindowName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleUpdateWindow} variant="inverseDark">
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {
      selectedWindow ? (
        <div className="absolute bottom-4 right-20 z-10 rounded-full overflow-hidden shadow-lg">
          <Button 
            onClick={handleOpenChat} 
            variant="inverseDark"
            className="h-16 w-16 p-0 flex items-center justify-center rounded-full"
          >
            <MessageCircle className="h-12 w-12" />
          </Button>
        </div>
      ) : (
        <></>
      )
    }

      

      <main className="flex-1 overflow-auto p-10 box-border min-h-[500px]">
        {loadingCode ? (
          <RenderSkeleton />
        ) : liveCode ? (
          <>
            {/* {<>{liveCode}</>} */}
            <IframeRenderer code={liveCode} selectedWindow={selectedWindow} onWindowSelect={onWindowSelect} />

          </>
        ) : (
          <p className="text-gray-500">
            Selecciona una ventana para ver su contenido…
          </p>
        )}
      </main>
    </div>
  );
};

export default CodeInterface;
