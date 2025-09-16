// src/components/design-interface/DesignInterfaceRender.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { AppWindow } from '@/models/windowModel';
import ChatInterface from '../chat-interface/ChatInterface';
import WindowInterface from '../window-interface/WindowInterface';
import { Sidebar } from '@/components/created-components/Sidebar';
import { SavingStatus } from '@/components/created-components/SavingStatus';

const DesignInterfaceRender: React.FC = () => {
  const { projectId, projectName } = useParams<{ projectId: string; projectName: string }>();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [liveCode, setLiveCode] = useState('');

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden">
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          projectId={projectId ?? ''}
          projectName={projectName ?? ''}
          setIsSaving={setIsSaving}
        />

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[var(--dashboard-background)] p-4">
          <SavingStatus isSaving={isSaving} />
          <WindowInterface
            projectId={projectId ?? ''}
            webSocketCode={liveCode}
            onWindowSelect={(window) => setSelectedWindow(window ?? null)}
            setIsSaving={setIsSaving}
          />
        </div>

        <div className="w-1/3 bg-[#2C2C2C] flex flex-col overflow-auto">
          {selectedWindow && (
            <ChatInterface
              onCode={setLiveCode}
              window={selectedWindow}
              projectId={projectId ?? ''}
              setIsSaving={setIsSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;
