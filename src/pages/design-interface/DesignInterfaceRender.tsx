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
          <div className="flex flex-row content-center items-center justify-center mb-4">
            <h2 className="text-white font-bold mb-4 text-xl">{projectName}</h2>
            <Button variant={'ghost'} className="ml-2" onClick={() => setLiveCode('')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </Button>

          </div>
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
