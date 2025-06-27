// src/pages/design-interface/DesignInterfaceRender.tsx
import React, { useState, useEffect } from 'react';
import JsxParser from 'react-jsx-parser';
import Toolbar from '../../components/canvas-components/Toolbar';
import ChatInterface from '../chat-interface/ChatInterface';
import { ProductFormDialog } from '@/components/created-components/ProductFormDialog';
import { useParams } from 'react-router-dom';


const DesignInterfaceRender: React.FC = () => {
    const { projectId, projectName } = useParams<{ projectId: string; projectName: string }>();

  const [liveCode, setLiveCode] = useState<string>('');

  function normalizeJSX(raw: string): string {
  const code = raw.trim();
  // Si ya está envuelto en <>…</> o en un solo nodo, lo devolvemos tal cual
  if (code.startsWith('<>') || /^<[^/][\s\S]*>[\s\S]*<\/[^>]+>$/.test(code)) {
    return code;
  }
  // Si no, lo envolvemos
  return `<>${code}</>`;
}

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

        <div className="w-full flex-grow flex items-center justify-center bg-[#202123] overflow-auto p-4">
          <div style={{ width: '100%', height: '100%' }}>
            {liveCode ? (
              <JsxParser
                jsx={normalizeJSX(liveCode)}
                renderInWrapper={false}
                allowUnknownElements
                showWarnings={true}
                bindings={{ Array, Math, Date, JSON }}
              />
            ) : (
              <p className="text-gray-500">Aquí se mostrará…</p>
            )}
          </div>
        </div>

        <div className="w-1/2 bg-gray-900 flex flex-col overflow-auto">
          <ChatInterface onCode={setLiveCode} projectId={projectId ?? ''} projectName={projectName ?? ''}/>
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;