import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, IdCard, Edit3, Check, BookOpen, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function ProfilePage() {
  usePageTitle('Academic Profile');
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    studentId: '',
    batch: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        studentId: user.studentId || '',
        batch: user.batch || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccessMsg('Academic profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Editorial Profile Header */}
      <div className="bg-campus-surface border border-campus-border rounded-container p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar
            name={user?.fullName}
            src={user?.avatarUrl}
            size="xl"
            isOnline={true}
            showStatus
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-campus-text-primary tracking-tight">
                {user?.fullName}
              </h1>
              <Badge variant="primary">{user?.role?.replace('_', ' ')}</Badge>
            </div>
            <p className="text-xs text-campus-text-secondary font-mono">
              {user?.email}
            </p>
            <p className="text-xs text-campus-text-muted mt-1">
              {user?.department?.name || 'Department of Information Science'} •{' '}
              {user?.batch ? `Batch ${user.batch}` : 'Undergraduate Member'}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isEditing ? 'outline' : 'primary'}
          onClick={() => setIsEditing((prev) => !prev)}
        >
          <Edit3 className="w-3.5 h-3.5" />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-[#EBF5EE] border border-campus-state-success/40 rounded-card text-campus-state-success text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form & Academic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form / Info */}
        <div className="md:col-span-2 bg-campus-surface border border-campus-border rounded-container p-6 shadow-subtle">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-secondary pb-3 border-b border-campus-border mb-4">
            Academic Information
          </h2>

          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Batch / Year"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                />
                <Input
                  label="College Roll / Student ID"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                  Academic Bio & Areas of Interest
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your specialization, research topics, or club involvements..."
                  className="w-full bg-campus-surface border border-campus-border rounded-input p-3 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <span className="font-semibold text-campus-text-muted uppercase tracking-wider text-[11px] block mb-1">
                  Biography & Specialization
                </span>
                <p className="text-campus-text-primary leading-relaxed bg-campus-secondary/20 p-3.5 rounded-card border border-campus-border/60">
                  {user?.bio || 'No academic biography provided yet.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-semibold text-campus-text-muted uppercase tracking-wider text-[11px] block mb-1">
                    Student ID / Registration
                  </span>
                  <p className="text-campus-text-primary font-mono font-medium">
                    {user?.studentId || '1MS23IS002'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-campus-text-muted uppercase tracking-wider text-[11px] block mb-1">
                    Enrolled Batch
                  </span>
                  <p className="text-campus-text-primary font-medium">
                    {user?.batch || '2023-2027'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Enrolled Memberships & Badges */}
        <div className="flex flex-col gap-6">
          <div className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary pb-2 border-b border-campus-border">
              Affiliated Department
            </h3>
            <p className="text-sm font-semibold text-campus-text-primary">
              {user?.department?.name || 'Information Science & Engineering'}
            </p>
            <p className="text-xs text-campus-text-secondary leading-relaxed">
              Dean & Head of Department: Prof. K. N. Sharma
            </p>
          </div>

          <div className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary pb-2 border-b border-campus-border">
              Club Memberships
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded bg-campus-secondary/40 text-xs">
                <span className="font-medium text-campus-text-primary">
                  Campus Coding Club
                </span>
                <Badge variant="primary">Member</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-campus-secondary/40 text-xs">
                <span className="font-medium text-campus-text-primary">
                  Placement Preparation 2026
                </span>
                <Badge variant="accent">Participant</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
