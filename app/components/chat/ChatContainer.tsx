"use client";

import React from 'react';
import MessageList from './MessageList';
import FilePreview from './FilePreview';
import ChatInput from './ChatInput';
import ChatControls from './ChatControls';
import { useAppSelector } from '../../store/hooks';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  createdAt?: Date;
  messageId?: string;
}

interface UploadedFile {
  name: string;
  type?: string;
  url?: string;
  serverData?: {
    fileUrl: string;
  };
  isUploading?: boolean;
}

interface ChatContainerProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isCreativeMode: boolean;
  onToggleCreativeMode: () => void;
  isTheoMode: boolean;
  onToggleTheoMode: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: any[]) => void;
  onFileUploadStart: (files: any[]) => void;
  status: "submitted" | "streaming" | "ready" | "error";
}

export default function ChatContainer({
  messages,
  messagesEndRef,
  uploadedFiles,
  onRemoveFile,
  input,
  onInputChange,
  onSubmit,
  isCreativeMode,
  onToggleCreativeMode,
  isTheoMode,
  onToggleTheoMode,
  selectedModel,
  onModelChange,
  onFileUpload,
  onFileUploadStart,
  status
}: ChatContainerProps) {
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <>
      <MessageList messages={messages} messagesEndRef={messagesEndRef} status={status} selectedModel={selectedModel} />
      
      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-3 transition-all duration-300 ease-in-out ${
          theme === 'dark' 
            ? 'border-white/30' 
            : 'border-black/30'
        }`}>
          <FilePreview uploadedFiles={uploadedFiles} onRemoveFile={onRemoveFile} />
          
          <ChatInput 
            input={input} 
            onInputChange={onInputChange} 
            onSubmit={onSubmit}
            uploadedFiles={uploadedFiles}
          />
          
          <ChatControls
            isCreativeMode={isCreativeMode}
            onToggleCreativeMode={onToggleCreativeMode}
            isTheoMode={isTheoMode}
            onToggleTheoMode={onToggleTheoMode}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            onFileUpload={onFileUpload}
            onFileUploadStart={onFileUploadStart}
            onSubmit={onSubmit}
            status={status}
            input={input}
            uploadedFiles={uploadedFiles}
          />
        </div>
      </div>
    </>
  );
} 