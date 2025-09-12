import type { Message } from '@/models/messageModel';

interface MessageListProps {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  promptMap: { mini: string; full: string }[];
  onPromptClick: (full: string) => void;
}

export function MessageList({ messages, bottomRef, promptMap, onPromptClick }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 w-full px-4">
        {promptMap.map(({ mini, full }, idx) => (
          <button
            key={idx}
            onClick={() => onPromptClick(full)}
            className="bg-[#20212c] text-white py-14 px-4 rounded-lg hover:bg-[#3c3d49] transition w-full truncate text-left"
          >
            {mini}
          </button>
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
            {msg.type === 'prompt' ? 'User' : 'Abstractify'}
          </div>
          {msg.content}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
