"use client";

import React, { useRef, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useParams } from 'next/navigation';
import MessageList from '../../components/chat/MessageList';
import { useAppSelector } from '../../store/hooks';
import { Eye } from 'lucide-react';

export default function SharedChatPage() {
  const { shareId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector((state) => state.theme.theme);

  const sharedChatData = useQuery(api.sharedChats.getSharedChatMessages, {
    shareId: shareId as string,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sharedChatData]);

  if (!shareId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'
      }`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Share Link</h1>
          <p className="text-gray-500">The share link you're trying to access is invalid.</p>
        </div>
      </div>
    );
  }

  if (!sharedChatData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (!sharedChatData.sharedChat) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'
      }`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Chat Not Found</h1>
          <p className="text-gray-500">
            This shared chat doesn't exist or may have expired.
          </p>
        </div>
      </div>
    );
  }

  const { sharedChat, messages } = sharedChatData;
  const displayMessages = messages.map(message => ({
    id: message.messageId,
    role: message.role as 'user' | 'assistant' | 'system',
    content: message.content,
    messageId: message.messageId,
    createdAt: new Date(message.createdAt),
    reasoning: message.modelParams?.reasoning
  }));

  return (
    <div className={`min-h-screen backdrop-blur-xl shadow rounded-2xl border flex flex-col mx-8 my-8 ${
      theme === 'dark' 
        ? 'border-white/20 bg-white/5' 
        : 'border-black/20 bg-black/5'
    }`}>
      {/* Read-only indicator */}
      <div className="absolute top-12 right-12 z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          theme === 'dark' 
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
            : 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
        }`}>
          <Eye className="h-3 w-3" />
          Read Only
        </div>
      </div>

      {/* Chat Messages - Same as original but without input */}
      <MessageList 
        messages={displayMessages} 
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        status="ready"
      />
    </div>
  );
} 