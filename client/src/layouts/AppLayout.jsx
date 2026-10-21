import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useSocket } from '../hooks/useSocket.js';
import { Navbar } from '../components/Navbar.jsx';
import { Sidebar } from '../components/Sidebar.jsx';
import { CampusAiDrawer } from '../components/CampusAiDrawer.jsx';

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Initialize Socket.IO connection and event listeners
  useSocket();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-campus-bg text-campus-text-primary">
      {/* Top Application Bar */}
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Body Area with Sidebar and Dynamic Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Campus AI Assistant Drawer */}
      <CampusAiDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
}
