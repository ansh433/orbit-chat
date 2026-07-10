"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useAppSelector } from '../../store/hooks';
import Image from 'next/image';

interface AttachmentListProps {
  messageId: string;
  messageRole: 'user' | 'assistant' | 'system';
}

export default function AttachmentList({ messageId, messageRole }: AttachmentListProps) {
  const theme = useAppSelector((state) => state.theme.theme);
  const attachments = useQuery(
    api.attachments.getAttachmentsByMessageId, 
    messageId && messageId.trim() !== "" ? { messageId } : "skip"
  );

  if (!messageId || !attachments || attachments.length === 0) {
    return null;
  }

  if (messageRole === 'user') {
    const columns = [];
    for (let i = 0; i < attachments.length; i += 3) {
      columns.push(attachments.slice(i, i + 3));
    }
    
    return (
      <div className="mt-3 ml-auto">
        <div className={`p-2 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-white/5 border-white/10' 
            : 'bg-black/5 border-black/10'
        }`}>
          <div className="flex flex-col gap-3">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex gap-2">
                {column.map((attachment) => (
                  <div key={attachment.attachmentId} className="flex-shrink-0">
                    <Image
                      src={attachment.attachmentUrl}
                      alt={attachment.fileName}
                      className="rounded-lg object-cover w-32 h-32"
                      loading="lazy"
                      width={128}
                      height={128}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-3 space-y-2 flex flex-col items-start ml-7">
      {attachments.map((attachment) => (
        <div key={attachment.attachmentId} className="max-w-[400px]">
          <Image
            src={attachment.attachmentUrl}
            alt={attachment.fileName}
            className="rounded-lg object-contain w-auto h-auto max-w-[400px] max-h-[400px]"
            loading="lazy"
            width={300}
            height={300}
          />
        </div>
      ))}
    </div>
  );
} 