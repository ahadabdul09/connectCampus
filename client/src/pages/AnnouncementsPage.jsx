import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Calendar, User, Building, Paperclip, AlertCircle, Trash2 } from 'lucide-react';
import { announcementService } from '../services/announcementService.js';
import { communityService } from '../services/communityService.js';
import { useAuthStore } from '../stores/authStore.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input } from '../components/Input.jsx';
import { formatDate } from '../utils/formatDate.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { cn } from '../utils/cn.js';

export function AnnouncementsPage() {
  usePageTitle('Announcements');
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Create Announcement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    departmentId: '',
  });

  const canCreateAnnouncement =
    user?.role === 'FACULTY' ||
    user?.role === 'DEPT_ADMIN' ||
    user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [anns, depts] = await Promise.all([
          announcementService.getAnnouncements(),
          communityService.getDepartments(),
        ]);
        setAnnouncements(anns);
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      await announcementService.createAnnouncement({
        ...formData,
        departmentId: formData.departmentId || null,
      });
      setIsModalOpen(false);
      setFormData({ title: '', content: '', priority: 'NORMAL', departmentId: '' });

      const updated = await announcementService.getAnnouncements();
      setAnnouncements(updated);
    } catch (err) {
      alert(err.message || 'Failed to post announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    if (selectedDept !== 'ALL' && ann.departmentId !== selectedDept) return false;
    if (selectedPriority !== 'ALL' && ann.priority !== selectedPriority) return false;
    return true;
  });

  return (
    <div className="py-6 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-border gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
            Institutional Announcements
          </h1>
          <p className="text-xs text-campus-text-secondary mt-1">
            Official department notices, examination circulars, and university guidelines.
          </p>
        </div>

        {canCreateAnnouncement && (
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="w-3.5 h-3.5" />
            Publish Notice
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-campus-secondary/30 rounded-card border border-campus-border text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-campus-text-secondary">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-campus-surface border border-campus-border rounded px-2.5 py-1 text-campus-text-primary focus:outline-none focus:border-campus-primary"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold text-campus-text-secondary mr-1">Priority:</span>
          {['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={cn(
                'px-2.5 py-1 rounded transition-colors text-[11px]',
                selectedPriority === p
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'bg-campus-surface border border-campus-border/70 text-campus-text-secondary hover:bg-campus-secondary'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Editorial List */}
      <div className="flex flex-col gap-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
            No announcements match your current filter parameters.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isUrgent = ann.priority === 'URGENT';
            const isImportant = ann.priority === 'IMPORTANT';

            return (
              <article
                key={ann.id}
                className={cn(
                  'bg-campus-surface rounded-container p-6 shadow-subtle border transition-colors flex flex-col justify-between gap-4',
                  isUrgent
                    ? 'border-campus-accent/50 bg-[#FBF8F6]' // restrained terracotta tint, no violent red
                    : isImportant
                    ? 'border-campus-primary/40 bg-[#F9FBFA]'
                    : 'border-campus-border'
                )}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isUrgent ? 'urgent' : isImportant ? 'primary' : 'neutral'
                        }
                      >
                        {ann.priority}
                      </Badge>
                      {ann.department && (
                        <span className="text-xs font-semibold text-campus-primary">
                          {ann.department.name} ({ann.department.code})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-campus-text-muted">
                      <span>{formatDate(ann.createdAt)}</span>
                      {(user?.id === ann.authorId || user?.role === 'SUPER_ADMIN') && (
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-campus-state-error hover:opacity-75 p-1"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="font-serif text-lg sm:text-xl font-bold text-campus-text-primary tracking-tight mb-2.5">
                    {ann.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-campus-text-secondary leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-campus-border/60 text-xs text-campus-text-muted">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-campus-text-secondary" />
                    <span>
                      Posted by{' '}
                      <strong className="text-campus-text-primary font-medium">
                        {ann.author?.fullName}
                      </strong>{' '}
                      ({ann.author?.role?.replace('_', ' ')})
                    </span>
                  </div>

                  {ann.attachmentUrl && (
                    <a
                      href={ann.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-campus-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Official Handout</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal: Publish Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Academic Announcement"
        description="Notices are broadcast across department channels and notification centers."
      >
        <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-4">
          <Input
            label="Notice Headline"
            placeholder="e.g. Midterm Laboratory Examination Schedule Released"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-campus-surface border border-campus-border rounded-input px-3 py-2 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent Notice</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Target Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-campus-surface border border-campus-border rounded-input px-3 py-2 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
              >
                <option value="">Campus Wide (All Branches)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
              Announcement Body
            </label>
            <textarea
              rows={4}
              placeholder="Enter full details, eligibility rules, and instructions..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-campus-surface border border-campus-border rounded-input p-3 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
