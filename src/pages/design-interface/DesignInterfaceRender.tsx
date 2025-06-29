import React, { useState, useEffect } from 'react';
import ChatInterface from '../chat-interface/ChatInterface';
import { ProductFormDialog } from '@/components/created-components/ProductFormDialog';
import { useParams } from 'react-router-dom';
import WindowInterface from '../window-interface/WindowInterface';


const DesignInterfaceRender: React.FC = () => {
  const { projectId, projectName } = useParams<{ projectId: string; projectName: string }>();
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const [liveCode, setLiveCode] = useState<string>('');

  useEffect(() => {
    console.log('Nuevo liveCode recibido:', liveCode);
  }, [liveCode]);
  

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden">
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/4 bg-[#343540] flex flex-col overflow-auto p-4">
          <h2 className="text-white font-semibold mb-4">Componentes</h2>
          <ProductFormDialog projectId={projectId ?? ''}/>
        </div>

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[#202123] overflow-auto p-4">
          <WindowInterface projectId={projectId ?? ''} webSocketCode={liveCode} onWindowSelect={setSelectedWindowId}/>
        </div>

        <div className="w-1/2 bg-gray-900 flex flex-col overflow-auto">
          {selectedWindowId && ( 
            <ChatInterface onCode={setLiveCode} windowId={selectedWindowId} projectName={projectName ?? ''}/>
            )}
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;