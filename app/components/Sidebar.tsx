"use client"

import React, { useState } from 'react';
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Authenticated, Unauthenticated, useQuery, useMutation } from 'convex/react';
import { MenuIcon, PlusIcon, Settings, Share2, Trash2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '~/convex/_generated/api';
import { useAppSelector } from '../store/hooks';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onShareChat?: (threadId: string, title: string) => void;
}

const Sidebar = ({ isOpen, onToggle, onShareChat }: SidebarProps) => {
  const { user } = useUser();
  const router = useRouter();
  const threads = useQuery(api.threads.getThread, {
    userId: user?.id || ""
  });
  const theme = useAppSelector((state) => state.theme.theme);


  const deleteThread = useMutation(api.threads.deleteThread);

  const handleNewChat = () => {
    router.push('/');
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!user?.id) return;
    
    try {
      await deleteThread({
        threadId,
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };

  const handleShareClick = (threadId: string, title: string) => {
    if (onShareChat) {
      onShareChat(threadId, title);
    }
  };

  return (
    <div className={`fixed top-8 h-[calc(100vh-4rem)] w-80 backdrop-blur-xl shadow-lg rounded-2xl border flex flex-col transition-all duration-300 ${
      isOpen ? 'left-8' : '-left-80'
    } ${
      theme === 'dark' 
        ? 'bg-white/5 border-white/10' 
        : 'bg-black/5 border-black/10'
    }`}>
      <div className="p-4 flex items-center justify-between">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
          theme === 'dark' ? 'bg-white/30' : 'bg-black/20'
        }`}>
          <span className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>lx</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-white/20 text-white' 
                : 'hover:bg-black/10 text-black'
            }`}
          >
            <MenuIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={handleNewChat}
          className={`w-full font-medium py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2 ${
            theme === 'dark' 
              ? 'bg-white/30 hover:bg-white/40 text-white' 
              : 'bg-black/20 hover:bg-black/30 text-black'
          }`}
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className={`text-sm font-medium mb-3 ${
          theme === 'dark' ? 'text-white/70' : 'text-black/70'
        }`}>Recent Chats</h2>
        <div>
          {threads?.slice().reverse().map((thread) => (
            <div key={thread.threadId} className="relative">
              <div 
                onClick={() => handleThreadClick(thread.threadId)}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                  theme === 'dark' 
                    ? 'hover:bg-white/20' 
                    : 'hover:bg-black/10'
                }`}
              >
                <p className={`text-sm font-medium flex-1 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>{thread.title || "New Chat"}</p>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareClick(thread.threadId, thread.title);
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                        : 'hover:bg-black/20 text-black/70 hover:text-black'
                    }`}
                    title="Share chat"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteThread(thread.threadId);
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-500/20 text-red-600 hover:text-red-500'
                    }`}
                    title="Delete chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>


            </div>
          ))}
        </div>
      </div>

      <Unauthenticated>
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        }`}>
          <SignInButton>
            <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' 
                : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
            }`}>
              Sign In
            </button>
          </SignInButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-black/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
            }`}>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{user?.firstName?.charAt(0)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{user?.firstName} {user?.lastName}</p>
              <p className={`text-xs truncate ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}>{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleSettingsClick}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                    : 'hover:bg-black/10 text-black/70 hover:text-black'
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <SignOutButton>
                <button className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                    : 'hover:bg-black/10 text-black/70 hover:text-black'
                }`}
                title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </Authenticated>
    </div>
  );
};

export default Sidebar;
