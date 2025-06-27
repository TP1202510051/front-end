import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createMessage } from '@/services/messaging.service';
import { getMessagesByProjectId } from '@/services/messaging.service';
import type { Message } from '@/models/messageModel';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatInterfaceProps {
  onCode: (jsx: string) => void;
  projectId: string;
  projectName: string;
}

const ChatInterface = ({onCode, projectId, projectName}: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const promptMap: { mini: string; full: string }[] = [
    {
      mini: 'Tienda básica sin carrito',
      full: `
  Sólo genera el fragmento JSX de la interfaz front-end en React+JSX. Debe incluir:
  - Estructura semántica (header, main, footer).
  - Cabecera con logo y menú (Inicio, Tienda, Contacto).
  - Grid responsive de tarjetas de producto con imagen, nombre y precio (usa etiquetas y className genéricos, sin Tailwind).
  - Pie de página con información de la empresa y enlaces legales.
      `.trim()
    },
    {
      mini: 'Tienda con carrito de compras',
      full: `
  Sólo genera el fragmento JSX de la interfaz front-end en React+JSX. Debe incluir:
  - Catálogo de productos en un grid con botón “Añadir al carrito” (usa etiquetas y className genéricos).
  - Componente <Cart> mock que muestre ítems, cantidades y subtotal.
  - Botones para incrementar, decrementar o eliminar ítems (solo UI).
      `.trim()
    },
    {
      mini: 'Tienda con pago online',
      full: `
  Sólo genera el fragmento JSX de la interfaz front-end en React+JSX. Debe incluir:
  - Página de checkout con formulario de facturación y tarjeta (solo UI).
  - Validación visual de campos (placeholders).
  - Indicadores de estado de envío y error.
  - Botón de “Pagar” que simule redirección a una página de confirmación.
      `.trim()
    },
    {
      mini: 'Panel de inventario',
      full: `
  Sólo genera el fragmento JSX de la interfaz front-end en React+JSX. Debe incluir:
  - Tabla o grid de productos con columnas: imagen, nombre, stock.
  - Filtros y búsqueda (solo UI).
  - Botones de “Editar” y “Eliminar” (solo UI).
  - Diseño responsivo usando CSS clásico o className genéricos.
      `.trim()
    },
  ];


  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/conversation/${projectId}`, (msg: IMessage) => {
        let parsed: { code: string; message: string };
        try {
          parsed = JSON.parse(msg.body);
          console.log('Mensaje recibido:', parsed);
        } catch {
          console.error('No es JSON válido:', msg.body);
          return;
        }

        if (parsed.code) {
          console.log('Código de la IA:', parsed.code);
        }
        console.log('Código de la IA:', parsed.code);

        const jsxOnly = parsed.code
          .replace(/import[\s\S]*?from ['"][\s\S]*?['"];?/g, '')
          .replace(/export\s+default\s+\w+\s*;?/, '');

        onCode(jsxOnly);

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            content: parsed.message,
            createdAt: Date.now().toString(),
            projectId: projectId || '',
            type: 'response',
          },
        ]);
      });
    };
      
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = async (overridePrompt?: string) => {
    const toSend = (overridePrompt ?? message).trim();

    if (!toSend || !projectId) return;

    try {
      if (projectId !== undefined) {
        const result = await createMessage(Number(projectId), toSend);
        console.log("Proyecto creado con éxito:", result);
      } else {
        console.error("projectId is undefined");
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    }
    if (toSend) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: toSend,
          createdAt: Date.now().toString(),
          projectId: projectId || '',
          type: 'prompt',
        }
      ]);
    }
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
  try {
    const data = await getMessagesByProjectId(Number(projectId));
    const filtered = data.filter(msg => msg.type !== 'system');
    setMessages(filtered);
  } catch (error) {
    console.error("Error al obtener los proyectos", error);
  }
};
  
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="bg-[#343540] text-white flex flex-col h-screen py-4">
      <h1 className="text-4xl font-extrabold mb-4 text-center">{projectName}</h1>
      <div className="flex-1 overflow-y-auto space-y-2 px-4">
        {messages.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 w-full">
            {promptMap.map(({mini, full}, idx) => (
              <button
                key={idx}
                className="
                  bg-[#20212c] text-white 
                  py-14 px-4 rounded-lg 
                  hover:bg-[#3c3d49] transition 
                  w-full overflow-hidden whitespace-nowrap truncate text-left
                "
                onClick={() => handleSendMessage(full)}
              >
                {mini}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`
                    bg-[#20212c] p-3 rounded-lg max-w-xs 
                    ${msg.type === 'prompt' ? 'self-end' : 'self-start bg-transparent'}
                    whitespace-pre-wrap break-words
                  `}
                >
                  {msg.content}
                </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button type="button" variant="ghost" className="cursor-pointer"  onClick={() => handleSendMessage()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </Button>
        <Input
          placeholder="Explica la interfaz que deseas diseñar..."
          className="flex-grow bg-[#343540] text-white p-2 rounded focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button type="button" variant="ghost" className="cursor-pointer"  onClick={() => handleSendMessage()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;