"use client";

import React from 'react';
import { useAppSelector } from '../../store/hooks';

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  placeholder?: string;
  uploadedFiles?: any[];
}

export default function ChatInput({ input, onInputChange, onSubmit, placeholder = "Type your message...", uploadedFiles = [] }: ChatInputProps) {
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <div className="relative mb-2">
      <textarea
        value={input}
        onChange={(e) => {
          onInputChange(e);
          e.target.style.height = 'auto';
          e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() || uploadedFiles.length > 0) {
              onSubmit(e);
            }
          }
        }}
        placeholder={placeholder}
        className={`w-full rounded-xl py-2 px-4 pr-12 text-base focus:outline-none resize-none overflow-hidden min-h-[48px] ${
          theme === 'dark' 
            ? 'text-white placeholder-white/50' 
            : 'text-black placeholder-black/50'
        }`}
        rows={1}
        style={{ 
          minHeight: '48px',
          maxHeight: '240px'
        }}
      />
    </div>
  );
} 