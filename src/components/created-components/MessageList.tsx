import { AbstractifyLogo } from '@/assets/icons/AbstractifyLogo';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/models/messageModel';
import { Button } from '../ui/button';

interface MessageListProps {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  promptMap: { mini: string; full: string }[];
  onPromptClick: (full: string) => void;
}

export function MessageList({ messages, bottomRef, promptMap, onPromptClick }: MessageListProps) {
  const { firebaseUser } = useAuth();
  if (messages.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 w-full px-4">
        {promptMap.map(({ mini, full }, idx) => (
          <Button
            key={idx}
            onClick={() => onPromptClick(full)}
            className="py-14 px-4 rounded-lg transition w-full truncate text-left"
            variant="inverseDark"
          >
            {mini}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col space-y-3 px-4 py-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end gap-2 ${
            msg.type === "prompt" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.type !== "prompt" && (
            <AbstractifyLogo width={28} height={28} />
          )}
          <div
            className={`max-w-xs px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap
              ${
                msg.type === "prompt"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-none"
                  : "bg-[var(--accent)] text-[var(--accent-foreground)] rounded-bl-none"
              }`}
          >
            <div
              className={`text-xs font-semibold mb-1 ${
                msg.type === "prompt" ? "text-right" : "text-left"
              }`}
            >
              {msg.type === "prompt"
                ? firebaseUser?.displayName ?? "User"
                : "Abstractify"}
            </div>
            <div>{msg.content}</div>
          </div>
          {msg.type === "prompt" && (
            <img
              src={firebaseUser?.photoURL ?? undefined}
              alt="user avatar"
              className="w-7 h-7 rounded-full"
            />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
