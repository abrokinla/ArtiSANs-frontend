'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getConversations } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ConversationList from '@/components/messages/ConversationList';

export default function MessagesPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }
    loadConversations();
  }, [token]);

  const loadConversations = async () => {
    if (!token) return;
    try {
      const data = await getConversations(token);
      setConversations(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f23]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Messages</h1>
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm dark:shadow-gray-900/60 dark:border dark:border-gray-700 overflow-hidden">
          <ConversationList conversations={conversations} currentUsername={user?.username} />
        </div>
      </div>
    </div>
  );
}
