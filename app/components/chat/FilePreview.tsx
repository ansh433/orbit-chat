"use client";

import React from 'react';
import { useAppSelector } from '../../store/hooks';

interface UploadedFile {
  name: string;
  type?: string;
  url?: string;
  serverData?: {
    fileUrl: string;
  };
  isUploading?: boolean;
}

interface FilePreviewProps {
  uploadedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
}

export default function FilePreview({ uploadedFiles, onRemoveFile }: FilePreviewProps) {
  const theme = useAppSelector((state) => state.theme.theme);
  
  if (uploadedFiles.length === 0) return null;

  return (
    <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
      <div className={`flex flex-wrap gap-3 p-3 rounded-2xl border ${
        theme === 'dark' 
          ? 'bg-white/5 border-white/10' 
          : 'bg-black/5 border-black/10'
      }`}>
        {uploadedFiles.map((uploadedFile, index) => {
          console.log(`File ${index}:`, {
            name: uploadedFile.name,
            type: uploadedFile.type,
            url: uploadedFile.url,
            isUploading: uploadedFile.isUploading,
            isImage: uploadedFile.type?.startsWith('image/')
          });
          
          return (
          <div 
            key={index}
            className="relative group animate-in fade-in-0 zoom-in-95 duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`relative rounded-xl border p-2 transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                : 'bg-black/10 border-black/20 hover:bg-black/20'
            }`}>
              {uploadedFile.isUploading ? (
                <div className={`w-20 h-20 flex items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                }`}>
                  <div className={`animate-spin rounded-full h-8 w-8 border-2 ${
                    theme === 'dark' 
                      ? 'border-white/30 border-t-white' 
                      : 'border-black/30 border-t-black'
                  }`}></div>
                </div>
              ) : uploadedFile.type?.startsWith('image/') ? (
                <img 
                  src={uploadedFile.url} 
                  alt={uploadedFile.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => console.log('Image load error:', e, 'File:', uploadedFile)}
                  onLoad={() => console.log('Image loaded successfully:', uploadedFile)}
                />
              ) : (
                <div className={`w-20 h-20 flex items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                }`}>
                  <span className={`text-xs font-medium text-center ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    {uploadedFile.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                  </span>
                </div>
              )}
              
              {!uploadedFile.isUploading && (
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
            
            <p className={`text-xs mt-1 text-center truncate max-w-20 ${
              theme === 'dark' ? 'text-white/70' : 'text-black/70'
            }`}>
              {uploadedFile.isUploading ? 'Uploading...' : uploadedFile.name}
            </p>
          </div>
          );
        })}
      </div>
    </div>
  );
} 