import React, { useState } from "react";
import JsxParser from "react-jsx-parser";
import { useLiveCode } from "@/hooks/useLiveCodes";
import { normalizeJSX } from "@/utils/handlers/jsxUtils";
import type { AppWindow } from "@/models/windowModel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditIcon } from "@/assets/icons/EditIcon";
import { RenderSkeleton } from "@/components/skeletons/RenderSkeleton";
import { useWindows } from "@/hooks/useWindows";
import ComponentWrapper from "@/components/created-components/ComponentWrapper"; 

interface WindowInterfaceProps {
  projectId: string;
  webSocketCode?: string;
  onWindowSelect: (window: AppWindow | null) => void;
  setIsSaving?: (isSaving: boolean) => void;
  selectedWindow: AppWindow | null;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
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

  React.useEffect(() => {
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
  }, [selectedWindow]);

  const handleUpdateWindow = async () => {
    if (!selectedWindow) return;
    const updated = await updateWindow(selectedWindow, newWindowName);
    if (updated) onWindowSelect(updated);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full text-[var(--dashboard-foreground)]">
      {selectedWindow && (
        <div className="w-full flex justify-between">
          <div>
            {liveCode ? <p>Presiona un componente para editarlo</p> : <p></p>}
          </div>
          <Button
            variant="inverseDark"
            onClick={() => {
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

      <main className="flex-1 overflow-auto p-10 box-border">
        {loadingCode ? (
          <RenderSkeleton />
        ) : liveCode ? (
          <JsxParser
            jsx={normalizeJSX(liveCode)}
            renderInWrapper={false}
            allowUnknownElements
            showWarnings
            bindings={{ Array, Math, Date, JSON }}
            components={{
              ComponentWrapper: (props: Record<string, unknown>) => (
                <ComponentWrapper
                  id={String(props.id ?? "")}
                  name={String(props.name ?? "")}
                  windowId={selectedWindow?.id ?? 0}
                >
                  {props.children as React.ReactNode}
                </ComponentWrapper>
              ),
            }}
          />
        ) : (
          <p className="text-gray-500">Selecciona una ventana para ver su contenido…</p>
        )}
      </main>
    </div>
  );
};

export default CodeInterface;
