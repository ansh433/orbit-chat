"use client";

import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

interface ErrorNotificationProps {
  error: string | null;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function ErrorNotification({ 
  error, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: ErrorNotificationProps) {
  const theme = useAppSelector((state) => state.theme.theme);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for fade out animation
  };

  if (!error) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 max-w-sm transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className={`backdrop-blur-xl rounded-xl shadow-xl border-2 p-4 ${
        theme === 'dark' 
          ? 'bg-red-900/90 border-red-500/50 text-red-100' 
          : 'bg-red-50/90 border-red-300/50 text-red-900'
      }`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">Invalid API Key</p>
            <p className="text-xs opacity-80 break-words">
              {error}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-md transition-colors ${
              theme === 'dark'
                ? 'hover:bg-red-800/50 text-red-300 hover:text-red-100'
                : 'hover:bg-red-200/50 text-red-600 hover:text-red-800'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 