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
import { createMessage, getMessagesByWindowId } from '@/services/messaging.service';
import type { Message } from '@/models/messageModel';
import type { Window } from '@/models/windowModel';

interface ChatInterfaceProps {
  onCode: (jsx: string) => void;
  window: Window;
  projectId: string;
  setIsSaving?: (saving: boolean) => void;
}

export default function ChatInterface({ onCode, window, projectId, setIsSaving }: ChatInterfaceProps) {
  const [response, setResponse] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  useChatSocket(window.id, onCode, setMessages, setResponse, setIsSaving);
  useAutoScroll(bottomRef, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessagesByWindowId(Number(window.id));
        setMessages(data.filter(msg => msg.type !== 'system'));
        setResponse(false);
      } catch (error) {
        console.error('Error al obtener los mensajes', error);
      }
    };

    setMessages([]); // limpiar para evitar mezcla
    fetchMessages();
  }, [window.id]);

  useEffect(() => {
  if (isListening && transcript.trim()) {
    setMessage(prev => {
      // Evitar duplicar texto
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
      await createMessage(Number(window.id), toSend, Number(projectId));
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
      setResponse(true);
    } catch (error) {
      console.error('Error al crear mensaje', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="bg-[#2C2C2C] text-white flex flex-col h-screen py-4">
      <h1 className="text-2xl mb-4 text-center">{window.windowName}</h1>

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
          className="flex-grow bg-transparent text-white p-2 rounded focus:outline-none"
          value={message}
          onChange={e => setMessage(e.target.value)}
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
