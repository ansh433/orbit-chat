"use client"

import React, { useState } from 'react'
import Sidebar from "../../components/Sidebar"
import ChatArea from "../../components/chatarea"

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
    <div className="relative w-screen h-screen">
      <div className="absolute"></div>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onShareChat={handleShareChat}
      />
      <ChatArea 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        shareModalData={shareModalData}
        onCloseShareModal={handleCloseShareModal}
      />
    </div>
  )
}

export default Page