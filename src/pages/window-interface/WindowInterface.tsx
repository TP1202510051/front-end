import React, { useState, useEffect } from 'react';
import JsxParser from 'react-jsx-parser';
import { getLatestCodeByWindowId } from '@/services/code.service';
import { getWindowsByProjectId } from '@/services/windows.service';
import type { Window } from '@/models/windowModel';
import WindowCreationDialog from '@/components/created-components/WindowCreationDialog';

interface WindowInterfaceProps {
  projectId: string;
  webSocketCode?: string;
  onWindowSelect: (windowId: string) => void;
}

const WindowInterface: React.FC<WindowInterfaceProps> = ({
  projectId,
  webSocketCode,
  onWindowSelect
}) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [liveCode, setLiveCode] = useState<string>('');

  useEffect(() => {
    const loadWindows = async () => {
      try {
        const data = await getWindowsByProjectId(Number(projectId));
        setWindows(data);
      } catch (error) {
        console.error('Error al obtener las ventanas', error);
      }
    };
    loadWindows();
  }, [projectId]);

  useEffect(() => {
    if (webSocketCode) {
      setLiveCode(webSocketCode);
    }
  }, [webSocketCode]);

  const fetchCodeForWindow = async (windowId: string) => {
    try {
      const data = await getLatestCodeByWindowId(Number(windowId));
      setLiveCode(data?.code ?? '');
    } catch (error) {
      console.error('Error al obtener el código para la ventana', error);
    }
  };

  const normalizeJSX = (raw: string) => {
    const code = raw.trim();
    if (code.startsWith('<>') || /^<[^/][\s\S]*>[\s\S]*<\/[^>]+>$/.test(code)) {
      return code;
    }
    return `<>${code}</>`;
  };

  return (
    <>
      <div className="w-full h-16 bg-[#343540] flex items-center justify-center mb-4">
        {windows.map((win) => (
          <button
            key={win.id}
            className="bg-[#202123] text-white rounded-lg px-4 py-2 mr-2 hover:bg-gray-600 transition-colors"
            onClick={() => {
              onWindowSelect(win.id);
              fetchCodeForWindow(win.id);
            }}
          >
            {win.windowName}
          </button>
        ))}
        <WindowCreationDialog projectId={projectId} onWindow={(newWin) => setWindows((prev) => [...prev, newWin])}/>
      </div>

      <div style={{ width: '100%', height: '100%' }}>
        {liveCode ? (
          <JsxParser
            jsx={normalizeJSX(liveCode)}
            renderInWrapper={false}
            allowUnknownElements
            showWarnings
            bindings={{ Array, Math, Date, JSON }}
          />
        ) : (
          <p className="text-gray-500">Aquí se mostrará…</p>
        )}
      </div>
    </>
  );
};

export default WindowInterface;
