import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { AppWindow } from "@/models/windowModel";
import ChatInterface from "../chat-interface/ChatInterface";
import CodeInterface from "../code-interface/CodeInterface";
import { Sidebar } from "@/components/created-components/Sidebar";
import { SavingStatus } from "@/components/created-components/SavingStatus";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditing } from "@/contexts/EditingContext";

const DesignInterfaceRender: React.FC = () => {
  const { projectId, projectName } = useParams<{
    projectId: string;
    projectName: string;
  }>();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [liveCode, setLiveCode] = useState("");

  const { target, showChat, closeChat, clearTarget } = useEditing();

  useEffect(() => {
    // Cada vez que cambie el proyecto → cerrar chat y limpiar target
    closeChat();
    clearTarget();
  }, [projectId]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden relative">
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          projectId={projectId ?? ""}
          projectName={projectName ?? ""}
          setIsSaving={setIsSaving}
          onSelectWindow={setSelectedWindow}
        />

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[var(--dashboard-background)] p-4 relative">
          <div className="w-full flex justify-between items-center">
            <SavingStatus isSaving={isSaving} />
          </div>
          <CodeInterface
            projectId={projectId ?? ""}
            webSocketCode={liveCode}
            onWindowSelect={(window) => setSelectedWindow(window ?? null)}
            setIsSaving={setIsSaving}
            selectedWindow={selectedWindow}
          />
        </div>
      </div>

      <div
        className={`absolute rounded-2xl top-14 right-4 w-250 h-9/10 bg-transparent text-[var(--sidebar-foreground)] shadow-2xl z-50 flex flex-col transform transition-all duration-300
          ${showChat ? "translate-x-0 w-1/3 opacity-100 pointer-events-auto" : "translate-x-full w-0 opacity-0 pointer-events-none"}
        `}
      >
        <div className="justify-end w-full p-4 flex absolute">
          <Button
            onClick={closeChat}
            className="p-2 rounded-md transition"
            aria-label="Cerrar chat"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto rounded-md">
          {target && (
            <ChatInterface
              onCode={setLiveCode}
              projectId={projectId ?? ""}
              setIsSaving={setIsSaving}
              target={target}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;
