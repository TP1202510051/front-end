import { useEffect } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Message } from '@/models/messageModel';
import { toast } from 'react-toastify';

export function useChatSocket(
  windowId: string,
  onCode: (jsx: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setResponse: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSaving?: (saving: boolean) => void
) {
    useEffect(() => {
        const socket = new SockJS(import.meta.env.VITE_API_WS_URL);
        const client = new Client({
          webSocketFactory: () => socket as WebSocket,
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
        });
    client.onConnect = () => {
      client.subscribe(`/topic/conversation/${windowId}`, (msg: IMessage) => {
        let parsed: { code: string; message: string };
        try {
          parsed = JSON.parse(msg.body);
        } catch {
          toast.error(`No es JSON válido: ${msg.body}`);
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
                windowId: windowId,
                type: 'response',
              },
            ]);
            setResponse(false);
            if (msg) {
              if (setIsSaving) setIsSaving(false);
            }
          });
        };
          
        client.activate();
        return () => { client.deactivate(); };
      }, [windowId, onCode, setMessages, setResponse, setIsSaving]);
}