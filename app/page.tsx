"use client"

import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomePage from './components/HomePage'
import ShareModal from './components/chat/ShareModal'

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [shareModalData, setShareModalData] = useState<{ threadId: string; title: string } | null>(null);
  
  const handleShareChat = (threadId: string, title: string) => {
    setShareModalData({ threadId, title });
  };

  const handleCloseShareModal = () => {
    setShareModalData(null);
  };

  return (
    <div className="relative w-full h-full">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onShareChat={handleShareChat}
      />
      <HomePage isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Share Modal */}
      {shareModalData && (
        <ShareModal
          threadId={shareModalData.threadId}
          threadTitle={shareModalData.title}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  )
}

export default Page