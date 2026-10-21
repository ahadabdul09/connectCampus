import React, { useState } from 'react';
import { User, Bell, Shield, Eye, Lock, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function SettingsPage() {
  usePageTitle('Settings');
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('ACCOUNT'); // ACCOUNT, NOTIFICATIONS, PRIVACY, SECURITY
  const [savedNotice, setSavedNotice] = useState('');

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailAnnouncements: true,
    directMessages: true,
    eventReminders: true,
    weeklyDigest: false,
  });

  // Privacy Preferences
  const [privacyPrefs, setPrivacyPrefs] = useState({
    showOnlineStatus: true,
    allowDirectMessages: true,
    showDepartmentBio: true,
  });

  const handleSavePreferences = () => {
    setSavedNotice('Preferences saved successfully.');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-campus-border">
        <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
          Settings & Account Preferences
        </h1>
        <p className="text-xs text-campus-text-secondary mt-1">
          Manage your notification frequency, online presence visibility, and academic security credentials.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-[#EBF5EE] border border-campus-state-success/40 rounded-card text-campus-state-success text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Settings Tab Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start">
        {/* Left Column Tabs */}
        <div className="sm:col-span-4 flex flex-col gap-1 p-2 bg-campus-secondary/40 rounded-card border border-campus-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('ACCOUNT')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${
              activeTab === 'ACCOUNT'
                ? 'bg-campus-surface text-campus-primary font-bold shadow-subtle'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Account Details</span>
          </button>
          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${
              activeTab === 'NOTIFICATIONS'
                ? 'bg-campus-surface text-campus-primary font-bold shadow-subtle'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notification Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab('PRIVACY')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${
              activeTab === 'PRIVACY'
                ? 'bg-campus-surface text-campus-primary font-bold shadow-subtle'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>Privacy & Presence</span>
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${
              activeTab === 'SECURITY'
                ? 'bg-campus-surface text-campus-primary font-bold shadow-subtle'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Security & Sessions</span>
          </button>
        </div>

        {/* Right Column Content Panel */}
        <div className="sm:col-span-8 bg-campus-surface border border-campus-border rounded-container p-6 shadow-subtle">
          {/* 1. Account Details */}
          {activeTab === 'ACCOUNT' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-secondary pb-2 border-b border-campus-border">
                Registered Student / Faculty Account
              </h2>
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="font-semibold text-campus-text-secondary block mb-1">
                    College Email Address
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-campus-secondary/50 border border-campus-border rounded-input px-3 py-2 text-campus-text-muted cursor-not-allowed font-mono text-xs"
                  />
                  <span className="text-[10px] text-campus-text-muted mt-1 block">
                    Institutional email addresses are verified by campus IT registrar.
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-campus-text-secondary block mb-1">
                    Academic Department
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.department?.name || 'Information Science & Engineering'}
                    className="w-full bg-campus-secondary/50 border border-campus-border rounded-input px-3 py-2 text-campus-text-muted cursor-not-allowed text-xs"
                  />
                </div>

                <div>
                  <span className="font-semibold text-campus-text-secondary block mb-1">
                    System Role
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.role?.replace('_', ' ') || 'Student'}
                    className="w-full bg-campus-secondary/50 border border-campus-border rounded-input px-3 py-2 text-campus-text-muted cursor-not-allowed text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Notification Preferences */}
          {activeTab === 'NOTIFICATIONS' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-secondary pb-2 border-b border-campus-border">
                Notification Delivery Settings
              </h2>
              <div className="flex flex-col gap-3.5 text-xs">
                <label className="flex items-center justify-between p-3 rounded-card bg-campus-secondary/30 border border-campus-border cursor-pointer">
                  <div>
                    <span className="font-semibold text-campus-text-primary block">
                      Urgent Campus Announcements
                    </span>
                    <span className="text-campus-text-secondary text-[11px]">
                      Receive immediate alerts for exam circulars and placement deadlines.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.emailAnnouncements}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, emailAnnouncements: e.target.checked })
                    }
                    className="rounded border-campus-border text-campus-primary focus:ring-campus-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-card bg-campus-secondary/30 border border-campus-border cursor-pointer">
                  <div>
                    <span className="font-semibold text-campus-text-primary block">
                      Direct Messages & Mentions
                    </span>
                    <span className="text-campus-text-secondary text-[11px]">
                      Desktop and tray push notification on direct peer messages.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.directMessages}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, directMessages: e.target.checked })
                    }
                    className="rounded border-campus-border text-campus-primary focus:ring-campus-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-card bg-campus-secondary/30 border border-campus-border cursor-pointer">
                  <div>
                    <span className="font-semibold text-campus-text-primary block">
                      Event Reminders
                    </span>
                    <span className="text-campus-text-secondary text-[11px]">
                      Reminder notice 24 hours prior to registered campus events.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.eventReminders}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, eventReminders: e.target.checked })
                    }
                    className="rounded border-campus-border text-campus-primary focus:ring-campus-primary"
                  />
                </label>

                <Button size="sm" onClick={handleSavePreferences} className="self-end mt-2">
                  Save Notification Settings
                </Button>
              </div>
            </div>
          )}

          {/* 3. Privacy & Presence */}
          {activeTab === 'PRIVACY' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-secondary pb-2 border-b border-campus-border">
                Online Presence & Visibility
              </h2>
              <div className="flex flex-col gap-3.5 text-xs">
                <label className="flex items-center justify-between p-3 rounded-card bg-campus-secondary/30 border border-campus-border cursor-pointer">
                  <div>
                    <span className="font-semibold text-campus-text-primary block">
                      Display Active Online Presence
                    </span>
                    <span className="text-campus-text-secondary text-[11px]">
                      Allows classmates and professors to see when you are currently active in channels.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyPrefs.showOnlineStatus}
                    onChange={(e) =>
                      setPrivacyPrefs({ ...privacyPrefs, showOnlineStatus: e.target.checked })
                    }
                    className="rounded border-campus-border text-campus-primary focus:ring-campus-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-card bg-campus-secondary/30 border border-campus-border cursor-pointer">
                  <div>
                    <span className="font-semibold text-campus-text-primary block">
                      Allow Direct Messages from Classmates
                    </span>
                    <span className="text-campus-text-secondary text-[11px]">
                      Permit enrolled students from your department to initiate direct chats.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyPrefs.allowDirectMessages}
                    onChange={(e) =>
                      setPrivacyPrefs({ ...privacyPrefs, allowDirectMessages: e.target.checked })
                    }
                    className="rounded border-campus-border text-campus-primary focus:ring-campus-primary"
                  />
                </label>

                <Button size="sm" onClick={handleSavePreferences} className="self-end mt-2">
                  Update Privacy
                </Button>
              </div>
            </div>
          )}

          {/* 4. Security & Sessions */}
          {activeTab === 'SECURITY' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-secondary pb-2 border-b border-campus-border">
                Security & Active Sessions
              </h2>
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3.5 rounded-card bg-campus-secondary/30 border border-campus-border flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-campus-text-primary block">
                      Current Web Session
                    </span>
                    <span className="text-campus-text-muted text-[11px]">
                      Active from current browser • Secure JWT token expires in 7 days
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-campus-state-success">
                    Active Now
                  </span>
                </div>

                <div className="pt-2">
                  <span className="font-semibold text-campus-text-primary block mb-1">
                    Password Management
                  </span>
                  <p className="text-campus-text-secondary text-xs leading-relaxed mb-3">
                    Passwords must meet university security guidelines (minimum 8 characters, upper/lower case letters, and numbers).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Password reset link has been dispatched to your verified college email.')}
                  >
                    Request Password Reset Link
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
