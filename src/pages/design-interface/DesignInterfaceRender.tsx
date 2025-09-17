import React, { useState } from "react";
import { useParams } from "react-router-dom";
import type { AppWindow } from "@/models/windowModel";
import ChatInterface from "../chat-interface/ChatInterface";
import WindowInterface from "../window-interface/WindowInterface";
import { Sidebar } from "@/components/created-components/Sidebar";
import { SavingStatus } from "@/components/created-components/SavingStatus";
import { MessageCircle, X } from "lucide-react";

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
        />

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[var(--dashboard-background)] p-4 relative">
          <div className="w-full flex justify-between items-center mb-4">
            <SavingStatus isSaving={isSaving} />
            <button
              onClick={() => setShowChat((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Abrir
              </div>
            </button>
          </div>
          <WindowInterface
            projectId={projectId ?? ""}
            webSocketCode={liveCode}
            onWindowSelect={(window) => setSelectedWindow(window ?? null)}
            setIsSaving={setIsSaving}
          />
        </div>
      </div>

      <div
        className={`absolute top-0 right-0 h-full w-1/3 bg-[var(--nav-background)] shadow-lg border-l border-border z-50 flex flex-col transform transition-transform duration-300 ${
          showChat ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="justify-end w-full p-4 flex absolute">
          <button
            onClick={() => setShowChat(false)}
            className="p-2 rounded-md hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition"
            aria-label="Cerrar chat"
          >
            <X className="h-5 w-5" />
          </button>
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
