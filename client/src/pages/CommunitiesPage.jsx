import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  ArrowRight,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { communityService } from '../services/communityService.js';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input } from '../components/Input.jsx';
import { CardSkeleton } from '../components/LoadingSkeleton.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { cn } from '../utils/cn.js';

export function CommunitiesPage() {
  usePageTitle('Communities');
  const { user } = useAuthStore();
  const { conversations, selectConversation } = useChatStore();
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, DEPARTMENTS, CLUBS
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [clubForm, setClubForm] = useState({ name: '', code: '', description: '', category: 'TECHNICAL' });
  const [isSubmittingClub, setIsSubmittingClub] = useState(false);
  const navigate = useNavigate();

  const canCreateClub =
    user?.role === 'CLUB_COORDINATOR' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'DEPT_ADMIN';

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const [depts, clbs] = await Promise.all([
        communityService.getDepartments(),
        communityService.getClubs(),
      ]);
      setDepartments(depts || []);
      setClubs(clbs || []);
    } catch (err) {
      console.error('Failed to load communities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleJoinLeaveClub = async (clubId, isJoined) => {
    try {
      if (isJoined) {
        await communityService.leaveClub(clubId);
      } else {
        await communityService.joinClub(clubId);
      }
      const updatedClubs = await communityService.getClubs();
      setClubs(updatedClubs);
    } catch (err) {
      alert(err.message || 'Club membership action failed.');
    }
  };

  const handleOpenDepartmentChat = (code) => {
    const match = conversations.find((c) =>
      c.title?.toLowerCase().includes(code.toLowerCase())
    );
    if (match) {
      selectConversation(match.id);
      navigate('/chat');
    } else {
      navigate('/chat');
    }
  };

  const handleCreateClubSubmit = async (e) => {
    e.preventDefault();
    if (!clubForm.name.trim() || !clubForm.code.trim() || !clubForm.description.trim()) return;

    setIsSubmittingClub(true);
    try {
      await communityService.createClub({
        ...clubForm,
        code: clubForm.code.trim().toUpperCase(),
      });
      setIsCreateClubOpen(false);
      setClubForm({ name: '', code: '', description: '', category: 'TECHNICAL' });
      await loadCommunities();
    } catch (err) {
      alert(err.message || 'Failed to create club.');
    } finally {
      setIsSubmittingClub(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-campus-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
              Campus Communities & Clubs
            </h1>
            <p className="text-xs text-campus-text-secondary mt-1 max-w-xl">
              Academic departments, student-led technical and cultural societies, and collaborative spaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreateClub && (
              <Button size="sm" onClick={() => setIsCreateClubOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                Create Club
              </Button>
            )}

            {/* Navigation Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-campus-secondary/60 rounded-btn border border-campus-border/70 text-xs font-medium">
              <button
                onClick={() => setActiveTab('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded transition-colors',
                  activeTab === 'ALL'
                    ? 'bg-campus-primary text-white font-semibold'
                    : 'text-campus-text-secondary hover:text-campus-text-primary'
                )}
              >
                All Hubs
              </button>
              <button
                onClick={() => setActiveTab('DEPARTMENTS')}
                className={cn(
                  'px-3 py-1.5 rounded transition-colors',
                  activeTab === 'DEPARTMENTS'
                    ? 'bg-campus-primary text-white font-semibold'
                    : 'text-campus-text-secondary hover:text-campus-text-primary'
                )}
              >
                Departments ({departments.length})
              </button>
              <button
                onClick={() => setActiveTab('CLUBS')}
                className={cn(
                  'px-3 py-1.5 rounded transition-colors',
                  activeTab === 'CLUBS'
                    ? 'bg-campus-primary text-white font-semibold'
                    : 'text-campus-text-secondary hover:text-campus-text-primary'
                )}
              >
                Clubs ({clubs.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* 1. Academic Departments (Split List Layout) */}
          {(activeTab === 'ALL' || activeTab === 'DEPARTMENTS') && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-campus-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-primary">
                  Academic Departments & Faculties
                </h2>
              </div>

              {departments.length === 0 ? (
                <div className="py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
                  No academic departments created yet. Campus administrators can create faculties in the Admin console.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="primary">{dept.code}</Badge>
                          <span className="text-xs text-campus-text-muted">
                            {dept._count?.users || 0} enrolled
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-campus-text-primary">
                          {dept.name}
                        </h3>
                        <p className="text-xs text-campus-text-secondary leading-relaxed mt-2 line-clamp-3">
                          {dept.description || 'Official academic division curriculum and courses.'}
                        </p>
                      </div>

                      <div className="pt-3 mt-4 border-t border-campus-border/60 text-xs flex items-center justify-between">
                        <span className="text-campus-text-muted text-[11px]">
                          HOD: {dept.headOfDepartment || 'Unassigned'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDepartmentChat(dept.code)}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 2. Student Clubs (Grid Layout) */}
          {(activeTab === 'ALL' || activeTab === 'CLUBS') && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-campus-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-primary">
                  Student Clubs & Societies
                </h2>
              </div>

              {clubs.length === 0 ? (
                <div className="py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
                  No student clubs or societies have been created yet.
                  {canCreateClub && ' Click "Create Club" to start a new campus community.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between hover:border-campus-primary/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-bold text-base text-campus-text-primary">
                            {club.name}
                          </span>
                          <Badge variant="neutral">{club.code}</Badge>
                        </div>
                        <p className="text-xs text-campus-text-secondary leading-relaxed mb-4 line-clamp-3">
                          {club.description}
                        </p>

                        <div className="text-xs text-campus-text-muted mb-4 flex flex-col gap-1">
                          <span>
                            Coordinator:{' '}
                            <strong className="text-campus-text-primary font-medium">
                              {club.lead?.fullName || 'Elected Coordinator'}
                            </strong>
                          </span>
                          <span>
                            Active members:{' '}
                            <strong className="text-campus-text-primary font-medium">
                              {club.memberCount}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-campus-border/60">
                        <Badge variant="neutral" className="text-[10px]">
                          {club.category}
                        </Badge>
                        <Button
                          size="sm"
                          variant={club.isJoined ? 'outline' : 'primary'}
                          onClick={() => handleJoinLeaveClub(club.id, club.isJoined)}
                        >
                          {club.isJoined ? 'Leave Club' : 'Join Society'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* MODAL: Create Club */}
      <Modal
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        title="Create Student Club Society"
      >
        <form onSubmit={handleCreateClubSubmit} className="flex flex-col gap-3.5 text-xs">
          <Input
            label="Club Name"
            placeholder="e.g. Campus Robotics Society"
            value={clubForm.name}
            onChange={(e) => setClubForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Club Code / Acronym"
            placeholder="e.g. ROBO"
            value={clubForm.code}
            onChange={(e) => setClubForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Category
            </label>
            <select
              value={clubForm.category}
              onChange={(e) => setClubForm((prev) => ({ ...prev, category: e.target.value }))}
              className="bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
            >
              <option value="TECHNICAL">Technical & Engineering</option>
              <option value="CULTURAL">Cultural & Performing Arts</option>
              <option value="SPORTS">Sports & Athletics</option>
              <option value="SOCIAL">Social Service & Outreach</option>
              <option value="ACADEMIC">Academic & Research</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Mission & Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline regular workshops, hackathons, and membership criteria..."
              value={clubForm.description}
              onChange={(e) => setClubForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-campus-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateClubOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingClub} className="font-semibold">
              Create Society
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
