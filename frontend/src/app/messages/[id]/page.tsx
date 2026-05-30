'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getConversation, getMessages, sendMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ChatBubble from '@/components/messages/ChatBubble';
import MessageInput from '@/components/messages/MessageInput';
import Link from 'next/link';

export default function ConversationPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, token } = useAuth();
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [latestId, setLatestId] = useState<number>(0);

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }
    if (id) {
      loadConversation();
    }
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;
    const interval = setInterval(() => {
      pollMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, token, latestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    if (!token) return;
    try {
      const [convData, msgsData] = await Promise.all([
        getConversation(id, token),
        getMessages(id, token),
      ]);
      setConversation(convData);
      setMessages(msgsData);
      if (msgsData.length > 0) {
        setLatestId(msgsData[msgsData.length - 1].id);
      }
    } catch (err) {
      setError('Could not load conversation');
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async () => {
    if (!token) return;
    try {
      const newMsgs = await getMessages(id, token, latestId);
      if (newMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newMsgs]);
        setLatestId(newMsgs[newMsgs.length - 1].id);
      }
    } catch {
      // silent poll failure
    }
  };

  const handleSend = async (content: string) => {
    if (!token) return;
    const msg = await sendMessage(id, content, token);
    setMessages((prev) => [...prev, msg]);
    setLatestId(msg.id);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (error || !conversation) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">{error || 'Conversation not found'}</div>;
  }

  const otherUser = user?.username === conversation.client_username
    ? conversation.artisan_username
    : conversation.client_username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a2e] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-4 py-3">
            <Link
              href="/messages"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              {otherUser.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{otherUser}</h2>
              <Link
                href={`/jobs/${conversation.job}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Job: {conversation.job_title}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            content={msg.content}
            senderUsername={msg.sender_username}
            createdAt={msg.created_at}
            isOwn={msg.sender === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
