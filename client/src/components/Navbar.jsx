import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  LogOut,
  User,
  Settings,
  ShieldAlert,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useNotificationStore } from '../stores/notificationStore.js';
import { Avatar } from './Avatar.jsx';
import { SearchModal } from './SearchModal.jsx';
import { NotificationsDrawer } from './NotificationsDrawer.jsx';

export function Navbar({ onToggleMobileSidebar, onOpenAiAssistant }) {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-14 border-b border-campus-border bg-campus-surface sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden text-campus-text-secondary hover:text-campus-text-primary p-1.5 rounded-btn hover:bg-campus-secondary transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-btn bg-campus-primary flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-subtle">
              cC
            </div>
            <span className="font-serif font-bold text-lg text-campus-text-primary tracking-tight">
              connectCampus
            </span>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-campus-secondary/60 hover:bg-campus-secondary border border-campus-border/80 rounded-input text-xs text-campus-text-muted transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-campus-text-secondary" />
              <span>Search people, conversations, resources...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-campus-surface border border-campus-border rounded text-campus-text-secondary">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-1.5 rounded-btn text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Campus Assistant Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn text-xs font-medium bg-campus-primary-light text-campus-primary hover:bg-[#DEE9E4] transition-colors border border-campus-primary/20"
            title="Open Campus Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-campus-primary shrink-0" />
            <span className="hidden md:inline">Campus Assistant</span>
            <span className="md:hidden">AI</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-btn text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-campus-accent rounded-full ring-2 ring-campus-surface" />
            )}
          </button>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-btn hover:bg-campus-secondary transition-colors"
              aria-label="User account menu"
            >
              <Avatar
                name={user?.fullName || 'User'}
                src={user?.avatarUrl}
                size="sm"
                isOnline={true}
                showStatus
              />
              <span className="hidden lg:inline text-xs font-medium text-campus-text-primary max-w-[120px] truncate">
                {user?.fullName?.split(' ')[0] || 'Account'}
              </span>
            </button>

            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-campus-surface border border-campus-border rounded-card shadow-elevated z-30 py-1 divide-y divide-campus-border/60">
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-campus-text-primary truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-campus-text-secondary truncate mt-0.5">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-campus-primary bg-campus-primary-light px-1.5 py-0.5 rounded">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-campus-text-primary hover:bg-campus-secondary transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-campus-text-secondary" />
                      <span>Academic Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-campus-text-primary hover:bg-campus-secondary transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-campus-text-secondary" />
                      <span>Settings & Preferences</span>
                    </button>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-campus-accent hover:bg-campus-secondary transition-colors text-left font-medium"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-campus-accent" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-campus-state-error hover:bg-campus-secondary transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}
