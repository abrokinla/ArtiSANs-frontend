'use client';

interface ChatBubbleProps {
  content: string;
  senderUsername: string;
  createdAt: string;
  isOwn: boolean;
}

export default function ChatBubble({ content, senderUsername, createdAt, isOwn }: ChatBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
        isOwn
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
      }`}>
        {!isOwn && (
          <p className="text-xs font-medium mb-1 opacity-70">{senderUsername}</p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
