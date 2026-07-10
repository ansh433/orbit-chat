"use client";

import React, { useRef, useState } from 'react';
import { useAppSelector } from '../../store/hooks';

interface FileUploadProps {
  onUploadStart?: (files: any[]) => void;
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; 
  acceptedFileTypes?: string[];
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({
  onUploadStart,
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxFileSize = 4,
  acceptedFileTypes = ['image/*'],
  className = '',
  children
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useAppSelector((state) => state.theme.theme);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      onUploadError?.(` You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    for (const file of files) {
      if (file.size > maxFileSize * 1024 * 1024) {
        onUploadError?.(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return;
      }

      const isValidType = acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        onUploadError?.(`File ${file.name} is not an accepted file type.`);
        return;
      }
    }

    setIsUploading(true);

    const loadingFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: true,
    }));
    onUploadStart?.(loadingFiles);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      onUploadComplete?.(result.files);

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);  
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const defaultClassName = `border rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-xl cursor-pointer ${
    theme === 'dark' 
      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
      : 'bg-black/10 hover:bg-black/20 text-black border-black/20'
  } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <button
        onClick={handleClick}
        disabled={isUploading}
        className={className || defaultClassName}
      >
        {children || (isUploading ? 'Uploading...' : '📎 Attach')}
      </button>
    </>
  );
} 