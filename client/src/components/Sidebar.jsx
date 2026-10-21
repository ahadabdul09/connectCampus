import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  Calendar,
  BookOpen,
  User,
  Settings,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { cn } from '../utils/cn.js';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const { conversations } = useChatStore();

  const unreadChatCount = conversations.filter((c) => c.isUnread).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Messages',
      path: '/chat',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : null,
    },
    { name: 'Communities', path: '/communities', icon: Users },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Resources', path: '/resources', icon: BookOpen },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldAlert });
  }

  const secondaryNavItems = [
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <aside className="w-60 bg-campus-secondary/40 border-r border-campus-border h-full flex flex-col justify-between py-4 select-none">
      <div className="flex flex-col gap-6 px-3">
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between pb-2 border-b border-campus-border px-2">
          <span className="font-serif font-bold text-campus-text-primary text-base">
            Navigation
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted mb-1">
            Campus Hub
          </span>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-btn text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-campus-primary-light text-campus-primary font-semibold'
                    : 'text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary/70'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-campus-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Preferences */}
        <nav className="flex flex-col gap-1">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted mb-1">
            Account
          </span>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-campus-primary-light text-campus-primary font-semibold'
                    : 'text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary/70'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info / Academic Semester Stamp */}
      <div className="px-5 pt-3 border-t border-campus-border/60">
        <div className="text-[11px] text-campus-text-muted flex flex-col gap-0.5">
          <span className="font-medium text-campus-text-secondary">
            Academic Year 2026-2027
          </span>
          <span>Semester V • Connected</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#242622]/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
