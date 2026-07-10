"use client";

import React, { useRef } from 'react';
import { Sparkles, Paperclip, ArrowUp } from 'lucide-react';
import ModelDropdown from '../ModelDropdown';
import { useAppSelector } from '../../store/hooks';

interface ChatControlsProps {
  isCreativeMode: boolean;
  onToggleCreativeMode: () => void;
  isTheoMode: boolean;
  onToggleTheoMode: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: any[]) => void;
  onFileUploadStart: (files: any[]) => void;
  onSubmit: () => void;
  status?: "submitted" | "streaming" | "ready" | "error";
  input?: string;
  uploadedFiles?: any[];
}

export default function ChatControls({
  isCreativeMode,
  onToggleCreativeMode,
  isTheoMode,
  onToggleTheoMode,
  selectedModel,
  onModelChange,
  onFileUpload,
  onFileUploadStart,
  onSubmit,
  status = "ready",
  input = "",
  uploadedFiles = []
}: ChatControlsProps) {
  const theme = useAppSelector((state) => state.theme.theme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length > 5) {
      alert("You can only upload up to 5 files at once.");
      return;
    }

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 20MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an accepted file type.`);
        return;
      }
    }
    
    const loadingFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: true,
    }));
    onFileUploadStart(loadingFiles);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      onFileUpload(result.files);

    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreativeToggle = () => {
    onToggleCreativeMode();
  };

  // Only disable during active processing - when status is not ready
  const isDisabled = status !== "ready";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={selectedModel.toLowerCase().includes('llama') ? undefined : handleAttachClick}
          disabled={selectedModel.toLowerCase().includes('llama')}
          title={selectedModel.toLowerCase().includes('llama') ? "Not working with llama models" : "Attach files"}
          className={`p-2.5 rounded-3xl font-medium transition-colors ${
            selectedModel.toLowerCase().includes('llama') 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          } ${
            theme === 'dark' 
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' 
              : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
        >
          <Paperclip className="h-4 w-4" />
        </button>
        
        <button
          className={`px-3 py-2 rounded-3xl font-medium transition-colors flex items-center gap-2 text-sm ${
            isTheoMode
              ? theme === 'dark'
                ? 'bg-base/50 text-white border border-violet-500/70 shadow-lg shadow-violet-500/20'
                : 'bg-gray-500/80 text-white border border-gray-500/70 shadow-lg shadow-gray-500/20'
              : theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
          onClick={onToggleTheoMode}
        >
          <span>🧠</span>
          <span>Theo Mode</span>
        </button>
        
        <button
          className={`px-3 py-2 rounded-3xl font-medium transition-colors flex items-center gap-2 text-sm ${
            isCreativeMode
              ? theme === 'dark'
                ? 'bg-base/50 text-white border border-violet-500/70 shadow-lg shadow-violet-500/20'
                : 'bg-base/50 text-white border border-gray-500/70 shadow-lg shadow-gray-500/20'
              : theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
          onClick={handleCreativeToggle}
        >
          <Sparkles className="h-4 w-4" />
          <span>Creative</span>
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <ModelDropdown selectedModel={selectedModel} onModelChange={onModelChange} />
        <button  
          className={`p-3 rounded-3xl transition-colors ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            theme === 'dark' 
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' 
              : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
          onClick={isDisabled ? undefined : onSubmit}
          disabled={isDisabled}
        >
          <ArrowUp className="h-4 w-4 " />
        </button>
      </div>
    </div>
  );
} 