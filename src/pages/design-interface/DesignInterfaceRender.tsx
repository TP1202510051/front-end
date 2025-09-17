import React, { useState } from "react";
import { useParams } from "react-router-dom";
import type { AppWindow } from "@/models/windowModel";
import ChatInterface from "../chat-interface/ChatInterface";
import WindowInterface from "../window-interface/WindowInterface";
import { Sidebar } from "@/components/created-components/Sidebar";
import { SavingStatus } from "@/components/created-components/SavingStatus";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DesignInterfaceRender: React.FC = () => {
  const { projectId, projectName } = useParams<{
    projectId: string;
    projectName: string;
  }>();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [liveCode, setLiveCode] = useState("");
  const [showChat, setShowChat] = useState(false);

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
          <div className="w-full flex justify-between items-center mb-4">
            <SavingStatus isSaving={isSaving} />
          </div>
          <WindowInterface
            projectId={projectId ?? ""}
            webSocketCode={liveCode}
            onWindowSelect={(window) => setSelectedWindow(window ?? null)}
            setIsSaving={setIsSaving}
            selectedWindow={selectedWindow}
            setShowChat={setShowChat}
          />
        </div>
      </div>

      <div
        className={`absolute top-0 right-0 h-full bg-[var(--nav-background)] text-[var(--sidebar-foreground)] shadow-lg border-l border-border z-50 flex flex-col transform transition-all duration-300
          ${showChat ? "translate-x-0 w-1/3 opacity-100 pointer-events-auto" : "translate-x-full w-0 opacity-0 pointer-events-none"}
        `}
      >
        <div className="justify-end w-full p-4 flex absolute">
          <Button
            onClick={() => setShowChat(false)}
            className="p-2 rounded-md transition"
            aria-label="Cerrar chat"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {selectedWindow && (
            <ChatInterface
              onCode={setLiveCode}
              window={selectedWindow}
              projectId={projectId ?? ""}
              setIsSaving={setIsSaving}
            />
          )}
        </div>
      </div>

    </div>
  );
};

export default DesignInterfaceRender;
