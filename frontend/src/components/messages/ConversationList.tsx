'use client';

import Link from 'next/link';

interface Conversation {
  id: number;
  job: number;
  job_title: string;
  client_username: string;
  artisan_username: string;
  last_message_at: string;
  unread_count: number;
  last_message?: {
    content: string;
    sender_username: string;
    created_at: string;
  } | null;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUsername?: string;
}

export default function ConversationList({ conversations, currentUsername }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">No conversations yet</p>
        <p className="text-sm">Conversations start when a client accepts your bid or you hire an artisan.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {conversations.map((conv) => {
        const otherUser = currentUsername === conv.client_username
          ? conv.artisan_username
          : conv.client_username;
        const initials = otherUser.charAt(0).toUpperCase();

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  {otherUser}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                  {conv.last_message
                    ? new Date(conv.last_message.created_at).toLocaleDateString()
                    : new Date(conv.last_message_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {conv.last_message
                  ? conv.last_message.content
                  : `Regarding: ${conv.job_title}`}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Job: {conv.job_title}
              </p>
            </div>
            {conv.unread_count > 0 && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {conv.unread_count > 9 ? '9+' : conv.unread_count}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
