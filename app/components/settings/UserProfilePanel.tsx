"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

export default function UserProfilePanel() {
  const { user } = useUser();
  const theme = useAppSelector((state) => state.theme.theme);
  const convexUser = useQuery(api.users.current);

  if (!user) {
    return (
      <div className={`backdrop-blur-xl rounded-2xl border p-6 h-full flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-white/5 border-white/10' 
          : 'bg-black/5 border-black/20'
      }`}>
        <div className="animate-pulse text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 ${
            theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
          }`}></div>
          <div className={`h-4 rounded mb-2 ${
            theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
          }`}></div>
          <div className={`h-3 rounded mb-1 ${
            theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
          }`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl rounded-2xl border p-8 h-full flex flex-col ${
      theme === 'dark' 
        ? 'bg-white/5 border-white/10' 
        : 'bg-black/5 border-black/20'
    }`}>
      {/* Profile Picture - Much larger and more prominent */}
      <div className="text-center mb-10">
        {user.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt="Profile" 
            className={`w-32 h-32 rounded-full mx-auto border-4 shadow-2xl ${
              theme === 'dark' ? 'border-white/20' : 'border-black/20'
            }`}
          />
        ) : (
          <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center border-4 shadow-2xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-white/20 to-white/10 border-white/20' 
              : 'bg-gradient-to-br from-black/15 to-black/8 border-black/20'
          }`}>
            <User className={`w-16 h-16 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`} />
          </div>
        )}
      </div>

      {/* User Name - Enhanced typography */}
      <div className="text-center mb-12">
        <h2 className={`text-3xl font-bold mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          {user.firstName} {user.lastName}
        </h2>
        <p className={`text-lg ${
          theme === 'dark' ? 'text-white/60' : 'text-black/60'
        }`}>
          @{user.username || user.firstName?.toLowerCase()}
        </p>
      </div>

      {/* User Details - Redesigned with better spacing and styling */}
      <div className="space-y-8 flex-1">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20' 
            : 'bg-gradient-to-r from-black/8 to-black/4 border border-black/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/20'
            }`}>
              <Mail className={`w-6 h-6 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-white/70' : 'text-black/70'
              }`}>Email Address</p>
              <p className={`text-base font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20' 
            : 'bg-gradient-to-r from-black/8 to-black/4 border border-black/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-500/20'
            }`}>
              <Calendar className={`w-6 h-6 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-white/70' : 'text-black/70'
              }`}>Member Since</p>
              <p className={`text-base font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20' 
            : 'bg-gradient-to-r from-black/8 to-black/4 border border-black/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/20'
            }`}>
              <Shield className={`w-6 h-6 ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-white/70' : 'text-black/70'
              }`}>Account Status</p>
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${
                  theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                }`}></span>
                <p className={`text-base font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Premium Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 