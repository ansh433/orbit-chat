"use client"

import React from 'react';
import Image from 'next/image';
import { useTheme } from '../hooks/useTheme';

const ThemeBackground = () => {
  const theme = useTheme();
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <Image 
        src={theme === 'dark' ? '/boat.jpg' : '/white.jpg'}
        alt="background" 
        fill
        className="object-cover transition-opacity duration-500 scale-110"
        priority
        style={{ 
          transform: 'scale(1.1)',
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
};

export default ThemeBackground; 