import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageList } from '@/components/created-components/MessageList';
import { ThinkingIndicator } from '@/assets/icons/ThinkingIcon';
import { MicIcon } from '@/assets/icons/MicIcon';
import { SendIcon } from '@/assets/icons/SendIcon';
import { promptMap } from '@/utils/constants/promptMap';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { createMessage, getMessagesByWindowId, getMessagesByComponentId, getMessagesByProjectId } from '@/services/messaging.service';
import type { Message } from '@/models/messageModel';
import { toast } from 'react-toastify';


interface ChatInterfaceProps {
  onCode: (jsx: string) => void;
  projectId: string;
  setIsSaving?: (saving: boolean) => void;
  target: { kind: "project" | "window" | "component"; id: string; name?: string; windowId?: string };
}

export default function ChatInterface({ onCode, projectId, setIsSaving, target }: ChatInterfaceProps) {
  const [response, setResponse] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  useChatSocket(target, onCode, setMessages, setResponse, setIsSaving);
  useAutoScroll(bottomRef, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let data: Message[] = [];
        if (target.kind === "project") {
          data = await getMessagesByProjectId(Number(target.id));
        } else if (target.kind === "window") {
          data = await getMessagesByWindowId(Number(target.id));
        } else if (target.kind === "component" && target.id) {
          data = await getMessagesByComponentId(Number(target.id));
        }
        setMessages(data.filter(msg => msg.type !== "system"));
        setResponse(false);
      } catch (error) {
        toast.error(`Error al obtener mensajes: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    setMessages([]);
    fetchMessages();
  }, [target]);

  useEffect(() => {
    if (isListening && transcript.trim()) {
      setMessage(prev => {
        if (prev.endsWith(transcript)) return prev;
        return prev + ' ' + transcript;
      });
    }
  }, [isListening, transcript]);

  const handleSendMessage = async (overridePrompt?: string) => {
    const toSend = (overridePrompt ?? message).trim();
    if (!toSend) return;

    if (setIsSaving) setIsSaving(true);

    try {
      await createMessage({
        message: toSend,
        projectId,
        ...(target.kind === "window" && { windowId: target.id }),
        ...(target.kind === "component" && { 
          windowId: target.windowId, 
          componentId: target.id 
        }),
      });

      setMessages(prev => [
        ...prev,
        {
          content: toSend,
          createdAt: new Date().toISOString(),
          type: "prompt",
          projectId: Number(projectId),
          windowId: target.kind === "window"
            ? Number(target.id)
            : target.kind === "component"
            ? Number(target.windowId)
            : undefined,
          componentId: target.kind === "component" ? Number(target.id) : undefined,
        } as Message,
      ]);
    } catch (error) {
      toast.error(`Error al crear mensaje: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setMessage('');
      setResponse(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col h-screen py-4 justify-between">
      <h1 className="text-2xl mb-4 text-center">{target.name ?? target.kind}</h1>

      <MessageList messages={messages} bottomRef={bottomRef} promptMap={promptMap} onPromptClick={handleSendMessage} />

      {response && <ThinkingIndicator />}

      <div className="mx-4 flex items-center gap-2 mt-4">
        <Button
          disabled={response}
          type="button"
          variant="ghost"
          className="cursor-pointer"
          onClick={() => (isListening ? stopListening() : startListening())}
        >
          <MicIcon active={isListening} />
        </Button>

        <Input
          placeholder="Explica la interfaz que deseas diseñar..."
          className="flex-grow bg-transparent p-2 rounded placeholder:text-[var(--sidebar-foreground)] focus:outline-none border-[var(--sidebar-foreground)] focus:border-[var(--sidebar-primary)] focus:ring-1 focus:ring-[var(--sidebar-ring)]"
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={response}
          onKeyPress={handleKeyPress}
        />

        <Button
          type="button"
          variant="ghost"
          className="cursor-pointer"
          disabled={response}
          onClick={() => handleSendMessage()}
        >
          <SendIcon />
        </Button>
      </div>
    </div>
  );
}
