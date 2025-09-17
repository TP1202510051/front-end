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
    <div className="flex-1 overflow-y-auto flex flex-col space-y-2 px-4">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`bg-transparent p-3 max-w-xs border-b-2 border-[#343540] break-words whitespace-pre-wrap rounded ${
            msg.type === 'prompt' ? 'self-end text-right' : 'self-start text-left'
          }`}
        >
          <div className="text-xs font-semibold mb-1">
            {msg.type === 'prompt' ? 
            <div className='flex items-center gap-2 justify-end'>User <img src={firebaseUser?.photoURL ?? undefined} alt="" className='w-6 h-6 rounded-full'/></div> : 
            <div className='flex items-center gap-2'><AbstractifyLogo width={24} height={24} />Abstractify</div>}
          </div>
          {msg.content}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
