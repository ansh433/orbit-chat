"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Paperclip, History } from 'lucide-react';
import { SettingsTabPanelProps } from '../../types/settings';
import { apiKeyUtils, ApiKeyConfig } from '../../utils/apiKeys';
import { useApiKeys } from '../../hooks/useApiKeys';
import { useAppSelector } from '../../store/hooks';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import Image from 'next/image';

export default function SettingsTabPanel({ activeTab, onTabChange }: SettingsTabPanelProps) {
  return (
    <div className="w-full">
      {activeTab === 'api-keys' && <ApiKeysContent />}
      {activeTab === 'history' && <HistoryContent />}
      {activeTab === 'attachments' && <AttachmentsContent />}
    </div>
  );
}

function ApiKeysContent() {
  const theme = useAppSelector((state) => state.theme.theme);
  const { apiKeys, saveApiKeys, removeApiKey, clearAllApiKeys } = useApiKeys();
  const [tempKeys, setTempKeys] = useState<ApiKeyConfig>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTempKeys(apiKeys);
  }, [apiKeys]);

  const handleKeyChange = (provider: keyof ApiKeyConfig, value: string) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }));
    
    if (validationErrors[provider]) {
      setValidationErrors(prev => ({ ...prev, [provider]: '' }));
    }
  };

  const handleSaveKey = (provider: keyof ApiKeyConfig) => {
    const key = tempKeys[provider];
    
    if (!key || !key.trim()) {
      removeApiKey(provider);
      setValidationErrors(prev => ({ ...prev, [provider]: '' }));
      return;
    }

    if (!apiKeyUtils.validateApiKey(provider, key)) {
      let errorMessage = '';
      switch (provider) {
        case 'openrouter':
          errorMessage = 'Invalid OpenRouter API key format (should start with sk-or-)';
          break;
        case 'openai':
          errorMessage = 'Invalid OpenAI API key format (should start with sk-)';
          break;
        case 'gemini':
          errorMessage = 'Invalid Gemini API key format';
          break;
        default:
          errorMessage = 'Invalid API key format';
      }
      setValidationErrors(prev => ({ ...prev, [provider]: errorMessage }));
      return;
    }

    saveApiKeys({ ...apiKeys, [provider]: key });
    setValidationErrors(prev => ({ ...prev, [provider]: '' }));
  };

  const handleRemoveKey = (provider: keyof ApiKeyConfig) => {
    removeApiKey(provider);
    setTempKeys(prev => ({ ...prev, [provider]: '' }));
  };

  const toggleShowKey = (provider: keyof ApiKeyConfig) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all API keys? This action cannot be undone.')) {
      clearAllApiKeys();
      setTempKeys({});
      setValidationErrors({});
    }
  };

  const renderApiKeySection = (
    provider: keyof ApiKeyConfig,
    title: string,
    description: string,
    placeholder: string
  ) => {
    const hasKey = !!(apiKeys[provider] && apiKeys[provider]!.trim());
    const tempKey = tempKeys[provider] || '';
    const error = validationErrors[provider];
    const isVisible = showKeys[provider];

    return (
      <div key={provider} className={`p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'bg-white/5 border-white/10' 
          : 'bg-black/5 border-black/20'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{title}</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}>{description}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            hasKey 
              ? theme === 'dark'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-green-100 text-green-700 border border-green-300'
              : theme === 'dark'
                ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            {hasKey ? 'Connected' : 'Not Set'}
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => handleKeyChange(provider, e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 pr-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? theme === 'dark'
                    ? 'bg-red-500/10 border-red-500/50 text-red-400 focus:ring-red-500/50'
                    : 'bg-red-50 border-red-300 text-red-700 focus:ring-red-200'
                  : theme === 'dark'
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-white/30'
                    : 'bg-white border-orange-200 text-gray-900 placeholder-gray-500 focus:ring-orange-200'
              }`}
            />
            {tempKey && (
              <button
                type="button"
                onClick={() => toggleShowKey(provider)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${
                  theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>

          {error && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleSaveKey(provider)}
              disabled={!tempKey.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                  : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
              }`}
            >
              Save Key
            </button>
            
            {hasKey && (
              <button
                onClick={() => handleRemoveKey(provider)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                }`}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>API Keys</h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-white/70' : 'text-gray-600'
          }`}>Configure your API keys to access different AI models</p>
        </div>
        
        {Object.values(apiKeys).some(key => key && key.trim()) && (
          <button
            onClick={handleClearAll}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
            }`}
          >
            Clear All Keys
          </button>
        )}
      </div>

      <div className="space-y-6">
        {renderApiKeySection(
          'openrouter',
          'OpenRouter API Key',
          'Access to GPT-4, Claude, Gemini, and other premium models',
          'sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        )}
        
        {renderApiKeySection(
          'openai',
          'OpenAI API Key',
          'Direct access to OpenAI models and image generation',
          'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        )}
        
        {renderApiKeySection(
          'gemini',
          'Google Gemini API Key',
          'Direct access to Google Gemini models and image generation',
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        )}
      </div>
    </div>
  );
}

function HistoryContent() {
  const theme = useAppSelector((state) => state.theme.theme);
  const { user } = useUser();
  const threads = useQuery(api.threads.getThread, user?.id ? { userId: user.id } : "skip");
  const deleteThread = useMutation(api.threads.deleteThread);
  const [deletingThreads, setDeletingThreads] = useState<Set<string>>(new Set());

  const handleDeleteThread = async (threadId: string) => {
    if (!user?.id) return;
    
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      setDeletingThreads(prev => new Set(prev).add(threadId));
      try {
        await deleteThread({ userId: user.id, threadId });
      } catch (error) {
        console.error('Failed to delete thread:', error);
      } finally {
        setDeletingThreads(prev => {
          const newSet = new Set(prev);
          newSet.delete(threadId);
          return newSet;
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Chat History</h2>
        <p className={`text-sm mt-1 ${
          theme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>Manage your conversation history</p>
      </div>

      {!threads ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`p-4 rounded-lg animate-pulse ${
              theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
            }`}>
              <div className={`h-7 rounded mb-2 ${
                theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
              }`} style={{ width: `${60 + Math.random() * 30}%` }}></div>
              <div className={`h-8 rounded ${
                theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
              }`} style={{ width: `${40 + Math.random() * 20}%` }}></div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className={`text-center py-12 ${
          theme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>
          <History className={`w-12 h-12 mx-auto mb-4 ${
            theme === 'dark' ? 'text-white/30' : 'text-gray-400'
          }`} />
          <p>No conversations yet</p>
          <p className="text-sm mt-1">Start a chat to see your history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((thread) => (
                          <div key={thread._id} className={`p-4 rounded-lg border transition-colors ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-black/5 border-black/20 hover:bg-black/10'
            }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {thread.title}
                    </h3>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${
                      theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      <span>
                        {new Date(thread.updatedAt).toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        theme === 'dark' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {thread.model}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteThread(thread.threadId)}
                    disabled={deletingThreads.has(thread.threadId)}
                    className={`ml-4 p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-red-500/20'
                        : 'text-red-600 hover:bg-red-100'
                    }`}
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function AttachmentsContent() {
  const theme = useAppSelector((state) => state.theme.theme);
  const { user } = useUser();
  const attachments = useQuery(api.attachments.getAttachmentsByUserId, user?.id ? { userId: user.id } : "skip");
  const deleteAttachment = useMutation(api.attachments.deleteAttachment);
  const [deletingAttachments, setDeletingAttachments] = useState<Set<string>>(new Set());

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!user?.id) return;
    
    if (confirm('Are you sure you want to delete this attachment? This action cannot be undone.')) {
      setDeletingAttachments(prev => new Set(prev).add(attachmentId));
      try {
        await deleteAttachment({ userId: user.id, attachmentId });
      } catch (error) {
        console.error('Failed to delete attachment:', error);
      } finally {
        setDeletingAttachments(prev => {
          const newSet = new Set(prev);
          newSet.delete(attachmentId);
          return newSet;
        });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Attachments</h2>
        <p className={`text-sm mt-1 ${
          theme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>Manage your uploaded files and generated content</p>
      </div>

      {!attachments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`p-4 rounded-lg animate-pulse ${
              theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
            }`}>
              <div className={`h-32 rounded mb-3 ${
                theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
              }`}></div>
              <div className={`h-4 rounded mb-2 ${
                theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
              }`}></div>
              <div className={`h-3 rounded ${
                theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
              }`} style={{ width: '60%' }}></div>
            </div>
          ))}
        </div>
      ) : attachments.length === 0 ? (
        <div className={`text-center py-12 ${
          theme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>
          <Paperclip className={`w-12 h-12 mx-auto mb-4 ${
            theme === 'dark' ? 'text-white/30' : 'text-gray-400'
          }`} />
          <p>No attachments yet</p>
          <p className="text-sm mt-1">Upload files in your conversations to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((attachment) => (
            <div key={attachment._id} className={`p-4 rounded-lg border transition-colors ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-black/5 border-black/20 hover:bg-black/10'
            }`}>
              <div className="relative">
                {attachment.fileType.startsWith('image/') ? (
                  <Image
                    src={attachment.attachmentUrl}
                    alt={attachment.fileName}
                    width={200}
                    height={128}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                ) : (
                            <div className={`w-full h-32 rounded mb-3 flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
          }`}>
                    <Paperclip className={`w-8 h-8 ${
                      theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                    }`} />
                  </div>
                )}
                
                <button
                  onClick={() => handleDeleteAttachment(attachment.attachmentId)}
                  disabled={deletingAttachments.has(attachment.attachmentId)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                  title="Delete attachment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div>
                <h3 className={`font-medium text-sm truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`} title={attachment.fileName}>
                  {attachment.fileName}
                </h3>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {formatFileSize(attachment.fileSize)} • {attachment.fileType}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 