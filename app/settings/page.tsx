"use client";

import React, { useState } from 'react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton } from '@clerk/nextjs';
import UserProfilePanel from '@/app/components/settings/UserProfilePanel';
import SettingsTabPanel from '@/app/components/settings/SettingsTabPanel';
import SettingsNavigation from '@/app/components/settings/SettingsNavigation';
import { SettingsTab } from '@/app/types/settings';
import { useAppSelector } from '@/app/store/hooks';
import ThemeBackground from '@/app/components/ThemeBackground';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api-keys');
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <div className="min-h-screen relative">
      <ThemeBackground />
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen">
          <div className={`backdrop-blur-xl p-8 rounded-2xl border ${
            theme === 'dark' 
              ? 'bg-white/10 border-white/20' 
              : 'bg-black/5 border-black/20'
          }`}>
            <h1 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Please sign in to access settings
            </h1>
            <SignInButton mode="modal">
              <button className={`px-6 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-black/80 hover:bg-black/90 text-white'
              }`}>
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

        <Authenticated>
          {/* Fixed positioned container matching chat area */}
          <div className={`fixed top-8 left-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow rounded-2xl border flex flex-col ${
            theme === 'dark' 
              ? 'border-white/20 bg-white/5' 
              : 'border-black/20 bg-black/5'
          }`}>
            
            {/* Simple Navigation Bar */}
            <div className={`flex items-center justify-center py-4 border-b ${
              theme === 'dark' ? 'border-white/10' : 'border-black/10'
            }`}>
              <SettingsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Content with scroll - Full width */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <SettingsTabPanel activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          </div>
        </Authenticated>
    </div>
  );
}
