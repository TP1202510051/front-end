import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createMessage } from '@/services/messaging.service';
import { getMessagesByWindowId } from '@/services/messaging.service';
import type { Message } from '@/models/messageModel';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Window } from '@/models/windowModel';


interface ChatInterfaceProps {
  onCode: (jsx: string) => void;
  window: Window;
  projectId: string;
}

const ChatInterface = ({onCode, window, projectId}: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const promptMap: { mini: string; full: string }[] = [
    {
      mini: 'Tienda sencilla',
      full: `
  Me gustaría una página de tienda online muy básica:
  - Una cabecera con el logo y un menú (Inicio, Tienda, Contacto).
  - Un área donde se muestren los productos en tarjetas con foto, nombre y precio.
  - Un pie de página con información de la empresa y enlaces de contacto.
  `.trim()
    },
    {
      mini: 'Tienda con carrito',
      full: `
  Necesito una tienda donde se pueda “añadir al carrito”:
  - Muestra los productos con su foto, nombre y precio.
  - Cada producto tiene un botón para agregar al carrito.
  - Ver un carrito con la lista de productos, la cantidad y el total (solo la apariencia).
  - Incluye cabecera y pie de página simples.
  `.trim()
    },
    {
      mini: 'Checkout de pago',
      full: `
  Quiero la parte de pago de la tienda:
  - Un formulario para ingresar datos de facturación (nombre, dirección) y datos de tarjeta.
  - Mensajes de error si falta algo.
  - Un botón “Pagar” que lleve a una página de confirmación (solo apariencia).
  - Mantén una cabecera y un pie de página discretos.
  `.trim()
    },
    {
      mini: 'Gestión de inventario',
      full: `
  Necesito una vista para controlar existencias:
  - Muestra una lista de productos con su foto, nombre y cantidad disponible.
  - Un espacio para buscar o filtrar productos.
  - Botones para “Editar” o “Eliminar” cada producto (solo apariencia).
  - Añade una cabecera y un pie de página sencillos.
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
      client.subscribe(`/topic/conversation/${window.id}`, (msg: IMessage) => {
        let parsed: { code: string; message: string };
        try {
          parsed = JSON.parse(msg.body);
        } catch {
          console.error('No es JSON válido:', msg.body);
          return;
        }

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
            windowId: window.id,
            type: 'response',
          },
        ]);
      });
    };
      
    client.activate();
    return () => { client.deactivate(); };
  }, [window.id, onCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = async (overridePrompt?: string) => {
    const toSend = (overridePrompt ?? message).trim();
    if (!toSend) return;

    try {
      await createMessage(Number(window.id), toSend, Number(projectId));
    } catch (error) {
      console.error('Error al crear mensaje', error);
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: toSend,
        createdAt: Date.now().toString(),
        windowId: window.id,
        type: 'prompt',
      },
    ]);
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
      const data = await getMessagesByWindowId(Number(window.id));
      setMessages(data.filter(msg => msg.type !== 'system'));
    } catch (error) {
      console.error('Error al obtener los mensajes', error);
    }
  };
  useEffect(() => {
    setMessages([]);
    fetchMessages();
  }, [window.id]);

  return (
    <div className="bg-[#2C2C2C] text-white flex flex-col h-screen py-4">
      <h1 className="text-2xl mb-4 text-center">{window.windowName}</h1>
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
                    bg-transparent rounded-none p-3 max-w-xs 
                    ${msg.type === 'prompt' ? 'self-end ' : 'self-start'}
                    whitespace-pre-wrap break-words
                    border-b-2 border-[#343540]
                  `}
                >
                  <div className='text-xs font-semibold'>
                    {msg.type !== 'prompt' && <p>Abstractify</p>}
                    {msg.type == 'prompt' && <p className='w-full text-end justify-end'>User</p>}
                  </div>
                  {msg.content}
                </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div className="mt-4 mx-4 flex items-center gap-2">
        <Button type="button" variant="ghost" className="cursor-pointer"  onClick={() => handleSendMessage()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </Button>
        <Input
          placeholder="Explica la interfaz que deseas diseñar..."
          className="flex-grow bg-transparent text-white p-2 rounded focus:outline-none"
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