import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { useApiKeys } from '../hooks/useApiKeys';
import Image from 'next/image';

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector((state) => state.theme.theme);
  const { hasOpenRouterKey, hasOpenAIKey, hasGeminiKey } = useApiKeys();
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const allModels = [
    { id: "openai/gpt-4.1-mini", name: "GPT-4.1", logo: "/openai.jpg", company: "OpenAI", requiresKey: "openrouter" },
    { id: "openai/o4-mini", name: "O4-mini", logo: "/openai.jpg", company: "OpenAI", requiresKey: "openrouter" },
    { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7", logo: "/claude.png", company: "Anthropic", requiresKey: "openrouter" },
    { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", logo: "/openai.jpg", company: "OpenAI", requiresKey: null }, // Free model via Groq
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0", logo: "/gemini.jpg", company: "Google", requiresKey: "openrouter" },
    { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5", logo: "/gemini.jpg", company: "Google", requiresKey: "openrouter" },
    { id: "openai/gpt-4o-2024-11-20", name: "GPT-4o", logo: "/openai.jpg", company: "OpenAI", requiresKey: "openrouter" },
    { id: "gpt-image-1", name: "GPT ImageGen", logo: "/openai.jpg", company: "OpenAI", requiresKey: "openai" }, 
    { id: "gemini-2.0-flash-preview-image-generation", name: "Gemini ImageGen", logo: "/gemini.jpg", company: "Google", requiresKey: "gemini" }, 
  ];

  const isModelAvailable = (model: any) => {
    if (!model.requiresKey) return true; 
    
    switch (model.requiresKey) {
      case "openrouter":
        return hasOpenRouterKey();
      case "openai":
        return hasOpenAIKey();
      case "gemini":
        return hasGeminiKey();
      default:
        return false;
    }
  };

  // Only filter models after hydration to prevent SSR/client mismatch
  const availableModels = isHydrated ? allModels.filter(isModelAvailable) : allModels.filter(m => !m.requiresKey);
  const unavailableModels = isHydrated ? allModels.filter(model => !isModelAvailable(model)) : allModels.filter(m => m.requiresKey);

  const selectedModelData = allModels.find(m => m.id === selectedModel);
  
  // During SSR, show a consistent default to prevent hydration mismatch
  const displaySelectedModel = isHydrated ? selectedModelData : allModels.find(m => m.id === "openai/gpt-oss-20b");

  useEffect(() => {
    if (isHydrated && selectedModelData && !isModelAvailable(selectedModelData)) {
      const freeModel = allModels.find(m => !m.requiresKey) || allModels.filter(isModelAvailable)[0];
      if (freeModel) {
        onModelChange(freeModel.id);
      }
    }
  }, [isHydrated, selectedModelData, onModelChange, hasOpenRouterKey, hasOpenAIKey, hasGeminiKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
          theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' 
            : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
        } ${isOpen ? 'scale-105' : ''}`}
      >
        <div className="relative">
          {displaySelectedModel?.logo && (
            <Image
              src={displaySelectedModel.logo}
              alt={displaySelectedModel.name}
              width={20}
              height={20}
              className="rounded-md transition-transform duration-300 group-hover:rotate-3"
            />
          )}
        </div>
        <span className="transition-colors duration-300">
          {displaySelectedModel?.name || 'Select Model'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-all duration-500 ease-out ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`} />
      </button>

      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setIsOpen(false)}
      />

      <div className={`absolute bottom-full mb-3 right-0 w-80 transform transition-all duration-500 ease-out ${
        isOpen 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className={`backdrop-blur-xl rounded-xl shadow-xl border-2 overflow-hidden ${
          theme === 'dark' 
            ? 'bg-base' 
            : 'bg-gradient-to-br from-white/95 via-slate-100/95 to-orange-100/95 border-orange-400/30 shadow-orange-500/10'
        }`}>
          <div className={`px-5 py-3 border-b ${
            theme === 'dark' ? 'border-orange-500/10' : 'border-orange-400/20'
          }`}>
            <h3 className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-slate-200' : 'text-orange-700'
            }`}>
              Select Model
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {availableModels.map((model, index) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`w-full text-left px-5 py-4 transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${
                  isOpen ? 'animate-slideInUp' : ''
                } ${
                  theme === 'dark'
                    ? `text-slate-200 hover:bg-gradient-to-r hover:from-slate-700/50 hover:via-slate-600/30 hover:to-slate-700/50 hover:shadow-md ${selectedModel === model.id ? 'bg-gradient-to-r from-slate-700/60 via-slate-600/40 to-slate-700/60 shadow-md' : ''}`
                    : `text-slate-700 hover:bg-gradient-to-r hover:from-slate-200/60 hover:via-orange-200/40 hover:to-slate-200/60 hover:shadow-md ${selectedModel === model.id ? 'bg-gradient-to-r from-slate-200/80 via-orange-200/50 to-slate-200/80 shadow-md' : ''}`
                }`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-orange-600/3 to-slate-600/10' 
                    : 'bg-gradient-to-r from-orange-400/5 to-slate-400/5'
                }`}></div>

                <div className="relative flex-shrink-0 z-10">
                  {model.logo ? (
                    <div className="relative">
                      <Image
                        src={model.logo}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="rounded-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-2"
                      />
                      <div className={`absolute -inset-1 rounded-md transition-opacity duration-300 group-hover:opacity-100 opacity-0 ${
                        theme === 'dark' ? 'bg-orange-500/8' : 'bg-orange-400/10'
                      } blur-sm`}></div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500/60 to-slate-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 shadow-md">
                      <span className="text-white text-sm font-bold">
                        {model.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 z-10">
                  <div className={`text-xs font-medium truncate transition-colors duration-300 ${
                    theme === 'dark' ? 'text-slate-300 group-hover:text-orange-300/80' : 'text-slate-600 group-hover:text-orange-600'
                  }`}>
                    {model.company}
                    {!model.requiresKey && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                        theme === 'dark' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-green-500/20 text-green-600'
                      }`}>
                        Free
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold tracking-wide truncate transition-colors duration-300 ${
                    theme === 'dark' ? 'group-hover:text-slate-100' : 'group-hover:text-slate-800'
                  }`}>
                    {model.name}
                  </div>
                </div>

                {selectedModel === model.id && (
                  <div className="flex-shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-orange-500/80 animate-pulse"></div>
                  </div>
                )}

                <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 group-hover:w-full w-0 ${
                  theme === 'dark' ? 'bg-gradient-to-r from-orange-400/40 to-slate-400' : 'bg-gradient-to-r from-orange-500/60 to-slate-500'
                }`}></div>
              </button>
            ))}

            {unavailableModels.map((model, index) => (
              <div
                key={`disabled-${model.id}`}
                style={{ animationDelay: `${(availableModels.length + index) * 50}ms` }}
                className={`w-full text-left px-5 py-4 flex items-center gap-4 relative opacity-50 cursor-not-allowed ${
                  isOpen ? 'animate-slideInUp' : ''
                } ${
                  theme === 'dark' ? 'text-white/40' : 'text-black/40'
                }`}
              >
                <div className="relative flex-shrink-0 z-10">
                  {model.logo ? (
                    <Image
                      src={model.logo}
                      alt={model.name}
                      width={32}
                      height={32}
                      className="rounded-md grayscale"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-gray-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {model.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <div className="text-xs font-medium truncate">
                    {model.company}
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                      theme === 'dark' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      API Key Required
                    </span>
                  </div>
                  <div className="text-sm font-semibold tracking-wide truncate">
                    {model.name}
                  </div>
                </div>
              </div>
            ))}
            
            {availableModels.length === 0 && (
              <div className={`px-5 py-6 text-center ${
                theme === 'dark' ? 'text-white/70' : 'text-black/70'
              }`}>
                <p className="text-sm">No models available</p>
                <p className="text-xs mt-1">Configure API keys in settings to access models</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(255, 165, 0, 0.03)' : 'rgba(255, 165, 0, 0.05)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 165, 0, 0.4)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 165, 0, 0.6)'};
        }
      `}</style>
    </div>
  );
};

export default ModelDropdown;
