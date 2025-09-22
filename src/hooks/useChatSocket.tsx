import { useEffect } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Message } from '@/models/messageModel';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import { normalizeJSX } from "@/utils/handlers/jsxUtils";

interface Target {
  kind: "project" | "window" | "component";
  id: string;
  windowId?: string;
}

export function useChatSocket(
  target: Target,
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
      let topic = "";
      if (target.kind === "project") {
        topic = `/topic/project-conversation/${target.id}`;
      } else if (target.kind === "window") {
        topic = `/topic/conversation/${target.id}`;
      } else if (target.kind === "component") {
        topic = `/topic/component-conversation/${target.id}`;
      }

      client.subscribe(topic, (msg: IMessage) => {
        try {
          const parsed: { code: string; message: string } = JSON.parse(msg.body);

          onCode(normalizeJSX(parsed.code));

          setMessages(prev => [
            ...prev,
            {
              content: parsed.message,
              createdAt: new Date().toISOString(),
              type: "response",
              projectId: target.kind === "project" ? Number(target.id) : undefined,
              windowId: target.kind === "window"
                ? Number(target.id)
                : target.kind === "component"
                ? Number(target.windowId)
                : undefined,
              componentId: target.kind === "component"
                ? Number(target.id)
                : undefined,
            } as Message,
          ]);

          setResponse(false);
          if (msg && setIsSaving) setIsSaving(false);
        } catch {
          toast.error(`No es JSON válido: ${msg.body}`);
        }
      });
    };

    const auth = getAuth();
    auth.currentUser?.getIdToken().then(token => {
      if (token) {
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      }
      client.activate();
    });

    return () => {
      client.deactivate();
    };
  }, [target, onCode, setMessages, setResponse, setIsSaving]);
}
