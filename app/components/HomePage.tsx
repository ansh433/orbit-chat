"use client"

import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Menu } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setQuestion, clearAttachedFiles, setSelectedModel, setIsCreativeMode, setIsTheoMode } from '../store/chatSlice';
import FilePreview from './chat/FilePreview';
import ChatInput from './chat/ChatInput';
import ChatControls from './chat/ChatControls';
import ErrorNotification from './ErrorNotification';

interface HomePageProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const HomePage = ({ isSidebarOpen, onToggleSidebar }: HomePageProps) => {
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const { selectedModel, isCreativeMode, isTheoMode } = useAppSelector((state) => state.chat);

  useEffect(() => {
    return () => {
      setUploadedFiles([]);
      setInput("");
      setIsSubmitting(false);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && uploadedFiles.length === 0) || isSubmitting) return;
    
    dispatch(setQuestion(input || ""));
    
    if (uploadedFiles.length > 0) {
      sessionStorage.setItem('pendingFiles', JSON.stringify(uploadedFiles));
    }
    
    setIsSubmitting(true);
    setInput("");
    setUploadedFiles([]);
    
    const id = crypto.randomUUID();
    
    router.push(`/chat/${id}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleQuestionClick = (question: string) => {
    setUploadedFiles([]);
    dispatch(clearAttachedFiles());
    
    const id = crypto.randomUUID();
    dispatch(setQuestion(question));
    router.push(`/chat/${id}`);
  };

  const handleFileUploadStart = (files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(prev => {
      const nonLoadingFiles = prev.filter(f => !f.isUploading);
      return [...nonLoadingFiles, ...files];
    });
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleCreativeMode = () => {
    dispatch(setIsCreativeMode(!isCreativeMode));
  };

  const handleToggleTheoMode = () => {
    dispatch(setIsTheoMode(!isTheoMode));
  };

  const handleModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
  };

  const handleCloseError = () => {
    setApiError(null);
  };

  const questions = [
    "Explain quantum computing like I'm 5 years old",
    "Help me design a cool logo for my startup",
    "What's the future of AI and should I be worried?",
    "Build a simple game in JavaScript with me"
  ];

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow-2xl rounded-3xl border flex flex-col transition-all duration-300 ${
      isSidebarOpen ? 'left-[24rem]' : 'left-8'
    } ${
      theme === 'dark' 
        ? 'border-white/20 bg-white/5' 
        : 'border-black/20 bg-black/5'
    }`}>
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className={`absolute -left-12 top-4 p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
            theme === 'dark' 
              ? 'hover:bg-white/20 text-white' 
              : 'hover:bg-black/10 text-black'
          }`}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 text-center ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Ask me anything
          </h1>
          
          <div className="space-y-4 mb-8">
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className={`w-full p-4 text-left rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15 text-white'
                    : 'bg-black/10 hover:bg-black/15 text-black'
                }`}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <div className={`backdrop-blur-xl rounded-3xl shadow-xl border p-3 transition-all duration-300 ease-in-out ${
          theme === 'dark' 
            ? 'border-white/30' 
            : 'border-black/30'
        }`}>
          {!isSubmitting && uploadedFiles.length > 0 && <FilePreview uploadedFiles={uploadedFiles} onRemoveFile={handleRemoveFile} />}
          
          <ChatInput 
            input={input} 
            onInputChange={handleInputChange} 
            onSubmit={handleSubmit}
            placeholder="Ask me anything..."
            uploadedFiles={uploadedFiles}
          />
          
          <ChatControls
            isCreativeMode={isCreativeMode}
            onToggleCreativeMode={handleToggleCreativeMode}
            isTheoMode={isTheoMode}
            onToggleTheoMode={handleToggleTheoMode}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            onFileUpload={handleFileUpload}
            onFileUploadStart={handleFileUploadStart}
            onSubmit={handleSubmit}
            status={isSubmitting ? "submitted" : "ready"}
            input={input}
            uploadedFiles={uploadedFiles}
          />
        </div>
      </div>
      
      <ErrorNotification 
        error={apiError}
        onClose={handleCloseError}
      />
    </div>
  );
};

export default HomePage;