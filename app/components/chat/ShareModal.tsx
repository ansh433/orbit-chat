"use client";

import React, { useState } from 'react';
import { Share2, Copy, Check, Trash2, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useAppSelector } from '../../store/hooks';

interface ShareModalProps {
  threadId: string;
  threadTitle: string;
  onClose: () => void;
}

export default function ShareModal({ threadId, threadTitle, onClose }: ShareModalProps) {
  const { user } = useUser();
  const theme = useAppSelector((state) => state.theme.theme);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const createSharedChat = useMutation(api.sharedChats.createSharedChat);
  const deleteSharedChat = useMutation(api.sharedChats.deleteSharedChat);

  const handleShare = async () => {
    if (!user?.id) return;
    
    setIsCreating(true);
    try {
      const result = await createSharedChat({
        threadId,
        ownerId: user.id,
        title: threadTitle,
        isPublic: true,
      });
      setShareId(result.shareId);
    } catch (error) {
      console.error('Failed to create shared chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareId) return;
    
    const shareUrl = `${window.location.origin}/shared/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDeleteShare = async () => {
    if (!shareId || !user?.id) return;
    
    try {
      await deleteSharedChat({
        shareId,
        ownerId: user.id,
      });
      setShareId(null);
    } catch (error) {
      console.error('Failed to delete shared chat:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="bg-base border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, var(--color-base) 0%, #1a1b2e 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: theme === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-button ' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Share Chat
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Create a public link to your conversation
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-600 hover:text-black'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!shareId ? (
              <div className="space-y-6">
                {/* Chat info */}
                <div className={`p-4 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Chat to share:
                  </div>
                  <div className={`text-lg font-semibold mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    "{threadTitle}"
                  </div>
                </div>

                {/* Description */}
                <div className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Anyone with the link will be able to view this conversation in read-only mode. 
                  Your personal information and API keys remain private.
                </div>

                {/* Create button */}
                <button
                  onClick={handleShare}
                  disabled={isCreating}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                    isCreating 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'transform hover:scale-[1.02] active:scale-[0.98]'
                  } ${
                    theme === 'dark'
                      ? 'bg-button'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25'
                  }`}
                >
                  <Share2 className="h-5 w-5" />
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Share Link...
                    </>
                  ) : (
                    'Create Share Link'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success message */}
                <div className={`p-4 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">Share link created successfully!</span>
                  </div>
                </div>

                {/* Share URL */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Share URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={`${window.location.origin}/shared/${shareId}`}
                      readOnly
                      className={`flex-1 p-4 rounded-xl border text-sm font-mono ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/10 text-gray-300 focus:border-blue-500/50' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-500/50'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-6 py-4 rounded-xl border transition-all duration-200 font-medium ${
                        copied
                          ? theme === 'dark'
                            ? 'bg-green-500/20 border-green-500/30 text-green-400'
                            : 'bg-green-50 border-green-200 text-green-700'
                          : theme === 'dark'
                            ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-black'
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This link will remain active until you delete it. Viewers can only read the conversation.
                </div>

                {/* Delete button */}
                <button
                  onClick={handleDeleteShare}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border ${
                    theme === 'dark'
                      ? 'border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 hover:border-red-500/30'
                      : 'border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-300'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Share Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 