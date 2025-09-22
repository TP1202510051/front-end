import { AbstractifyLogo } from '@/assets/icons/AbstractifyLogo';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/models/messageModel';
import { Button } from '../ui/button';
import { useProfileData } from '@/hooks/useProfileData';

interface MessageListProps {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  promptMap: { mini: string; full: string }[];
  onPromptClick: (full: string) => void;
}

export function MessageList({ messages, bottomRef, promptMap, onPromptClick }: MessageListProps) {
  const { profile } = useProfileData();
  const { firebaseUser } = useAuth();
  if (messages.length === 0) {
    return (
      <div className="h-full overflow-y-auto space-y-4 px-4">
        {promptMap.map(({ mini, full }, idx) => (
          <Button
            key={idx}
            onClick={() => onPromptClick(full)}
            className="w-full min-h-16 px-4 py-14 rounded-lg transition text-left whitespace-normal"
            variant="inverseDark"
          >
            <span className="block w-full whitespace-normal break-words [overflow-wrap:anywhere] leading-snug text-pretty">
              {mini}
            </span>
          </Button>
        ))}
      </div>
    );
  }

    const displayName =
    profile?.profilePictureUrl && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : firebaseUser?.displayName || "Usuario";

    const imageUrl = profile?.profilePictureUrl || firebaseUser?.photoURL || undefined;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col space-y-3 px-4 py-2">
      {messages.map((msg, index) => (
        <div
          key={msg.id ?? `msg-${index}`}
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
                ? displayName ?? "User"
                : "Abstractify"}
            </div>
            <div>{msg.content}</div>
          </div>
          {msg.type === "prompt" && (
            <img
              src={imageUrl}
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
