"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { ArrowLeft, LogOut, Key, History, Paperclip } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { SettingsTab } from '../../types/settings';

interface SettingsNavigationProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export default function SettingsNavigation({ activeTab, onTabChange }: SettingsNavigationProps) {
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme.theme);

  const handleBackToChat = () => {
    router.push('/');
  };

  const tabs = [
    { id: 'api-keys' as SettingsTab, label: 'API Keys', icon: Key },
    { id: 'history' as SettingsTab, label: 'Chat History', icon: History },
    { id: 'attachments' as SettingsTab, label: 'Attachments', icon: Paperclip },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-6xl">
      {/* Back to Chat Button - Left Side */}
      <button
        onClick={handleBackToChat}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-white/10 text-white/70 hover:text-white' 
            : 'hover:bg-black/10 text-black/70 hover:text-black'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Tab Navigation - Center */}
      <div className={`flex items-center rounded-xl p-1 ${
        theme === 'dark' 
          ? 'bg-white/5 border border-white/10' 
          : 'bg-black/5 border border-black/10'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'bg-black/20 text-black shadow-lg'
                  : theme === 'dark'
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-black/70 hover:text-black hover:bg-black/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sign Out Button - Right Side */}
      <SignOutButton>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
            : 'hover:bg-red-500/20 text-red-600 hover:text-red-700'
        }`}>
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </SignOutButton>
    </div>
  );
} 