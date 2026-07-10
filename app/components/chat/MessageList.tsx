"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, ImageIcon } from 'lucide-react';
import MessageFormatter from '../MessageFormatter';
import AttachmentList from './AttachmentList';
import { useAppSelector } from '../../store/hooks';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  createdAt?: Date;
  messageId?: string;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  status: "submitted" | "streaming" | "ready" | "error";
  selectedModel?: string;
}

export default function MessageList({ messages, messagesEndRef, status, selectedModel }: MessageListProps) {
  const [expandedReasonings, setExpandedReasonings] = useState<Record<string, boolean>>({});
  const [copiedMessages, setCopiedMessages] = useState<Record<string, boolean>>({});
  const [showImageShimmer, setShowImageShimmer] = useState(false);
  const theme = useAppSelector((state) => state.theme.theme);

  const toggleReasoning = (messageId: string) => {
    setExpandedReasonings(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessages(prev => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setCopiedMessages(prev => ({ ...prev, [messageId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy message: ', err);
    }
  }
  
  const isStreamingAssistantMessage = (status === 'submitted' || status === 'streaming') && 
    messages.length > 0 && 
    messages[messages.length - 1]?.role === 'assistant';

  const isImageGenModel = selectedModel === "gpt-image-1" || selectedModel === "gemini-2.0-flash-preview-image-generation";
  
  const shouldShowLoading = (status === 'submitted') && 
    (messages.length === 0 || 
     (messages.length > 0 && messages[messages.length - 1]?.role === 'user') ||
     (messages.length > 0 && 
      messages[messages.length - 1]?.role === 'assistant' && 
      (!messages[messages.length - 1]?.content || messages[messages.length - 1]?.content.trim() === '')));

  // Handle image generation shimmer timing
  React.useEffect(() => {
    if (isImageGenModel && status === 'submitted') {
      setShowImageShimmer(true);
    } else if (isImageGenModel && status === 'ready') {
      // Keep shimmer for 2 more seconds after stream completes to cover image loading gap
      const timer = setTimeout(() => {
        setShowImageShimmer(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (!isImageGenModel) {
      setShowImageShimmer(false);
    }
  }, [isImageGenModel, status]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-[95%] max-w-4xl mx-auto py-8">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isStreamingThisMessage = isStreamingAssistantMessage && isLastMessage;
          return (
            <div key={message.id || message.messageId} className="mb-6">
              {message.role === 'assistant' && message.reasoning && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleReasoning(message.id || message.messageId || '')}
                    className={`flex items-center gap-2 ml-4 text-base transition-colors ${
                      theme === 'dark' 
                        ? 'text-white/70 hover:text-white' 
                        : 'text-black/70 hover:text-black'
                    }`}
                  >
                    {expandedReasonings[message.id || message.messageId || ''] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                    Show Reasoning
                  </button>
                  {expandedReasonings[message.id || message.messageId || ''] && (
                    <div className={`mt-3 ml-4 p-4 rounded-lg text-base leading-relaxed ${
                      theme === 'dark' 
                        ? 'bg-white/5 text-white/80' 
                        : 'bg-black/5 text-black/80'
                    }`}>
                      {message.reasoning}
                    </div>
                  )}
                </div>
              )}
              <div 
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`rounded-2xl px-6 py-3 text-base leading-relaxed ${
                    message.role === 'user' 
                      ? `max-w-[70%] ${
                          theme === 'dark' 
                            ? 'bg-white/10 text-white' 
                            : 'bg-black/10 text-black'
                        }` 
                      : `w-full ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MessageFormatter content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
                
                {/* Render attachments for this message */}
                {(message.id || message.messageId) && (
                  <AttachmentList messageId={(message.id || message.messageId)!} messageRole={message.role} />
                )}
              </div>
              
              {/* Copy button for assistant messages - only show when not streaming */}
              {message.role === 'assistant' && !isStreamingThisMessage && (
                <div className="flex justify-start ml-5 mt-1">
                  <button
                    onClick={() => copyMessage(message.id || message.messageId || '', message.content)}
                    className={`flex items-center gap-2 text-sm transition-colors px-2 py-1 rounded-lg ${
                      theme === 'dark' 
                        ? 'text-white/50 hover:text-white/80 hover:bg-white/5' 
                        : 'text-black/50 hover:text-black/80 hover:bg-black/5'
                    }`}
                  >
                    {copiedMessages[message.id || message.messageId || ''] ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Show loading indicator or image shimmer */}
        {(shouldShowLoading || showImageShimmer) && (
          <div className="flex justify-start mb-6 w-full">
            {(selectedModel === "gpt-image-1" || selectedModel === "gemini-2.0-flash-preview-image-generation" || showImageShimmer) ? (
              // Image shimmer for image generation models
              <div className="max-w-[400px]">
                <div className={`rounded-lg w-[300px] h-[300px] max-w-[400px] max-h-[400px] animate-pulse ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                }`}>
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className={`w-12 h-12 ${
                      theme === 'dark' ? 'text-white/30' : 'text-black/30'
                    }`} />
                  </div>
                </div>
              </div>
            ) : (
              // Regular loading dots for text models
              <div className={`rounded-2xl px-6 py-3 text-base leading-relaxed ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <div className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white/70' : 'text-black/70'
                }`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'dark' ? 'bg-white/50' : 'bg-black/50'
                    }`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'dark' ? 'bg-white/50' : 'bg-black/50'
                    }`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'dark' ? 'bg-white/50' : 'bg-black/50'
                    }`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 