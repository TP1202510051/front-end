import React, { useState, useEffect } from 'react';
import ChatInterface from '../chat-interface/ChatInterface';
import { useParams } from 'react-router-dom';
import WindowInterface from '../window-interface/WindowInterface';
import type { Window } from '@/models/windowModel';
import ProductInterface from '../products-interface/ProductInterface';
import { Button } from '@/components/ui/button';

const DesignInterfaceRender: React.FC = () => {
  const { projectId, projectName } = useParams<{
    projectId: string;
    projectName: string;
  }>();
  const [selectedWindow, setSelectedWindow] = useState<Window>();

  const [liveCode, setLiveCode] = useState<string>('');

  useEffect(() => {
    console.log('Nuevo liveCode recibido:', liveCode);
  }, [liveCode]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden">
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/4 bg-[#2C2C2C] flex flex-col overflow-auto p-4 gap-3">
          <Button className='p-6 bg-white rounded-4xl w-1/8'>
          </Button>
          <h2 className="text-white font-bold mb-4 text-2xl">{projectName}</h2>
          <ProductInterface projectId={projectId ?? ''} projectName={projectName ?? ''} />
        </div>

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[#202123] p-4">
          <WindowInterface
            projectId={projectId ?? ''}
            webSocketCode={liveCode}
            onWindowSelect={setSelectedWindow}
          />
        </div>

        <div className="w-1/3 bg-[#2C2C2C] flex flex-col overflow-auto">
          {selectedWindow && (
            <ChatInterface
              onCode={setLiveCode}
              window={selectedWindow}
              projectId={projectId ?? ''}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;
