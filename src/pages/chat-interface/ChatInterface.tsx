import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageList } from '@/components/created-components/MessageList';
import { ThinkingIndicator } from '@/assets/icons/ThinkingIcon';
import { MicIcon } from '@/assets/icons/MicIcon';
import { SendIcon } from '@/assets/icons/SendIcon';
import { promptMapWindows } from '@/utils/constants/promptMapWindows';
import { promptMapComponents } from '@/utils/constants/promptMapComponents';
import { promptMapProject } from '@/utils/constants/promptMapProject';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { 
  createMessage, 
  getMessagesByWindowId, 
  getMessagesByComponentId, 
  getMessagesByProjectId 
} from '@/services/messaging.service';
import type { Message } from '@/models/messageModel';
import { toast } from 'react-toastify';
import { useEditing } from '@/contexts/EditingContext';
import { getComponentsByWindowId, type Component } from '@/services/component.service';
import { Trash2 } from "lucide-react";
import { deleteMessagesByComponentId } from "@/services/messaging.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [activeComponents, setActiveComponents] = useState<Component[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [promptMap, setPromptMap] = useState<{ mini: string; full: string }[]>([]);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const { openComponent } = useEditing();
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; compId: number | null }>({
    open: false,
    compId: null,
  });
  const [loadingComponents, setLoadingComponents] = useState(false); // 👈 nuevo estado


  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

    useEffect(() => {
    const fetchActiveComponents = async () => {
      if (target.kind !== "window" && target.kind !== "component") {
        setActiveComponents([]);
        return;
      }

      try {
        setLoadingComponents(true);
        const windowId = target.kind === "window" ? target.id : Number(target.windowId);
        const comps = await getComponentsByWindowId(Number(windowId));

        const compsWithMessages: Component[] = [];
        for (const comp of comps) {
          const compMessages = await getMessagesByComponentId(Number(comp.id));
          if (compMessages.length > 0) {
            compsWithMessages.push(comp);
          }
        }

        setActiveComponents(compsWithMessages);
      } catch (error) {
        toast.error(`Error al obtener componentes con conversación: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoadingComponents(false);
      }
    };

    fetchActiveComponents();
  }, [target]);


  useChatSocket(target, onCode, setMessages, setResponse, setIsSaving);
  useAutoScroll(bottomRef, [messages]);

  // carga de mensajes según target
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let data: Message[] = [];
        if (target.kind === "project") {
          data = await getMessagesByProjectId(Number(target.id));
          setPromptMap(promptMapProject);
        } else if (target.kind === "window") {
          data = await getMessagesByWindowId(Number(target.id));
          setPromptMap(promptMapWindows);
        } else if (target.kind === "component" && target.id) {
          data = await getMessagesByComponentId(Number(target.id));
          setPromptMap(promptMapComponents);
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

  // reconocimiento de voz -> input
  useEffect(() => {
    if (isListening && transcript.trim()) {
      setMessage(prev => {
        if (prev.endsWith(transcript)) return prev;
        return prev + ' ' + transcript;
      });
    }
  }, [isListening, transcript]);

  useEffect(() => {
    const fetchActiveComponents = async () => {
      if (target.kind !== "window") {
        setActiveComponents([]);
        return;
      }

      try {
        const comps = await getComponentsByWindowId(Number(target.id));

        const compsWithMessages: Component[] = [];
        for (const comp of comps) {
          const compMessages = await getMessagesByComponentId(Number(comp.id));
          if (compMessages.length > 0) {
            compsWithMessages.push(comp);
          }
        }

        setActiveComponents(compsWithMessages);
      } catch (error) {
        toast.error(`Error al obtener componentes con conversación: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchActiveComponents();
  }, [target]);

  const handleSendMessage = async (overridePrompt?: string) => {
    if (response) return; // 👈 evita múltiples envíos mientras hay uno en curso

    const toSend = (overridePrompt ?? message).trim();
    if (!toSend) return;

    if (setIsSaving) setIsSaving(true);

    try {
      setResponse(true);

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
      // setResponse(false); 
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-row h-full w-full max-w-[1400px] mx-auto">
      {/* Sidebar de componentes activos */}
      {(loadingComponents || activeComponents.length > 0) && (
        <div className="w-48 border-r border-[var(--sidebar-ring)] p-2">
          <h2 className="font-semibold mb-2">Componentes</h2>
          <div className="flex flex-col gap-2">
            {loadingComponents &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-full rounded bg-[var(--sidebar-ring)] animate-pulse"
                />
              ))}
            {!loadingComponents &&
              activeComponents.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between">
                  <Button
                    variant="design"
                    className="flex-grow justify-start"
                    onClick={() =>
                      openComponent(comp.id.toString(), {
                        name: comp.name,
                        windowId:
                          target.kind === "window"
                            ? target.id.toString()
                            : Number(target.windowId).toString(),
                      })
                    }
                  >
                    {comp.name}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDelete({ open: true, compId: Number(comp.id) })}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ open, compId: null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar conversación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar este hilo de conversación? Esta acción no se puede deshacer.
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete({ open: false, compId: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirmDelete.compId) {
                  try {
                    await deleteMessagesByComponentId(confirmDelete.compId);
                    setActiveComponents((prev) =>
                      prev.filter((c) => Number(c.id) !== confirmDelete.compId)
                    );
                    toast.success("Conversación eliminada");
                  } catch {
                    toast.error("Error al eliminar conversación");
                  } finally {
                    setConfirmDelete({ open: false, compId: null });
                  }
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat principal */}
      <div className="flex flex-col flex-grow py-4 justify-between">
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
            <textarea
              ref={textareaRef}
              placeholder="Explica la interfaz que deseas diseñar..."
              className="flex-grow border-1 bg-transparent p-2 rounded placeholder:text-[var(--sidebar-foreground)] focus:outline-none border-[var(--sidebar-foreground)] focus:border-[var(--sidebar-primary)] focus:ring-1 focus:ring-[var(--sidebar-ring)]"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={response}
              onKeyDown={handleKeyPress}
              rows={1}
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
    </div>
  );
}
