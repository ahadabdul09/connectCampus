import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCheck, Bell, MessageSquare, Megaphone, Calendar, FileText } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore.js';
import { formatTimeAgo } from '../utils/formatDate.js';
import { Button } from './Button.jsx';
import { cn } from '../utils/cn.js';

export function NotificationsDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-campus-primary" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-campus-accent" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-campus-state-warning" />;
      case 'RESOURCE':
        return <FileText className="w-4 h-4 text-campus-primary" />;
      default:
        return <Bell className="w-4 h-4 text-campus-text-secondary" />;
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    if (n.link) {
      onClose();
      navigate(n.link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#242622]/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-campus-surface border-l border-campus-border h-full flex flex-col z-10 shadow-modal animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-campus-border bg-campus-secondary/30">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-campus-text-primary text-sm">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-campus-accent text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-campus-primary hover:underline font-medium inline-flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-campus-text-secondary hover:text-campus-text-primary p-1 rounded hover:bg-campus-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-campus-border/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-campus-text-secondary">
              No campus notifications right now.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  'p-3.5 cursor-pointer hover:bg-campus-secondary/40 transition-colors flex items-start gap-3',
                  !n.isRead && 'bg-campus-primary-light/30'
                )}
              >
                <div className="mt-0.5 p-1.5 rounded bg-campus-secondary shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-campus-text-primary truncate">
                      {n.title}
                    </p>
                    <span className="text-[11px] text-campus-text-secondary shrink-0">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-campus-text-secondary line-clamp-2 leading-relaxed">
                    {n.body}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-campus-accent shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
