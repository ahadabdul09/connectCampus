import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Code,
  Radio,
  Music,
} from 'lucide-react';
import { communityService } from '../services/communityService.js';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function CommunitiesPage() {
  usePageTitle('Communities');
  const { user } = useAuthStore();
  const { selectConversation, conversations } = useChatStore();
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CLUBS, DEPARTMENTS, PLACEMENT
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [depts, clbs] = await Promise.all([
          communityService.getDepartments(),
          communityService.getClubs(),
        ]);
        setDepartments(depts);
        setClubs(clbs);
      } catch (err) {
        console.error('Failed to load communities:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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
      console.error('Club action error:', err);
    }
  };

  const handleOpenCommunityChat = (title) => {
    const match = conversations.find((c) =>
      c.title.toLowerCase().includes(title.toLowerCase())
    );
    if (match) {
      selectConversation(match.id);
      navigate('/chat');
    } else {
      navigate('/chat');
    }
  };

  const placementCommunities = [
    {
      title: 'Placement Preparation 2026',
      type: 'CAREER',
      membersCount: 145,
      description: 'Official campus drive interview preparation, mock aptitude rounds, Deloitte/Microsoft questions, and resume reviews.',
      recentActivity: 'Aptitude test syllabus shared by Dr. Kavitha Sundaram',
      isJoined: true,
    },
    {
      title: 'Internship & Research Fellowships Hub',
      type: 'INTERNSHIP',
      membersCount: 88,
      description: 'Summer industrial training, DRDO/IISc research intern applications, and off-campus tech fellowship openings.',
      recentActivity: 'Research fellowship openings posted for 3rd year students',
      isJoined: false,
    },
  ];

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-campus-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
              Campus Communities
            </h1>
            <p className="text-xs text-campus-text-secondary mt-1 max-w-xl">
              Academic departments, student-led technical and cultural clubs, batch channels, and placement forums.
            </p>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-campus-secondary/60 rounded-btn border border-campus-border/70 self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:text-campus-text-primary'
              }`}
            >
              All Hubs
            </button>
            <button
              onClick={() => setActiveTab('DEPARTMENTS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'DEPARTMENTS'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:text-campus-text-primary'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab('CLUBS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CLUBS'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:text-campus-text-primary'
              }`}
            >
              Clubs & Guilds
            </button>
            <button
              onClick={() => setActiveTab('PLACEMENT')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'PLACEMENT'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:text-campus-text-primary'
              }`}
            >
              Placement
            </button>
          </div>
        </div>
      </div>

      {/* 1. Placement Communities (Feature Cards) */}
      {(activeTab === 'ALL' || activeTab === 'PLACEMENT') && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-campus-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-primary">
              Placement & Career Communities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placementCommunities.map((comm, idx) => (
              <div
                key={idx}
                className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-base text-campus-text-primary">
                      {comm.title}
                    </span>
                    <Badge variant="accent">{comm.type}</Badge>
                  </div>
                  <p className="text-xs text-campus-text-secondary leading-relaxed mb-4">
                    {comm.description}
                  </p>
                  <div className="p-2.5 rounded bg-campus-secondary/40 border border-campus-border/60 text-xs text-campus-text-secondary mb-4">
                    <span className="font-semibold text-campus-text-primary block mb-0.5">
                      Recent Activity:
                    </span>
                    {comm.recentActivity}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-campus-border/60 text-xs">
                  <span className="text-campus-text-muted font-medium">
                    {comm.membersCount} students enrolled
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleOpenCommunityChat('Placement')}
                  >
                    Open Community Channel
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Student Clubs (Grid Layout) */}
      {(activeTab === 'ALL' || activeTab === 'CLUBS') && (
        <section className="flex flex-col gap-3 pt-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-campus-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-primary">
              Active Student Clubs & Societies
            </h2>
          </div>

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
                  <p className="text-xs text-campus-text-secondary leading-relaxed mb-4">
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
                  <Button
                    size="sm"
                    variant={club.isJoined ? 'secondary' : 'primary'}
                    onClick={() => handleJoinLeaveClub(club.id, club.isJoined)}
                  >
                    {club.isJoined ? 'Leave Club' : 'Join Club'}
                  </Button>
                  <button
                    onClick={() => handleOpenCommunityChat(club.name)}
                    className="text-xs text-campus-primary hover:underline font-semibold"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Academic Departments (List & Metrics Table) */}
      {(activeTab === 'ALL' || activeTab === 'DEPARTMENTS') && (
        <section className="flex flex-col gap-3 pt-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-campus-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-campus-text-primary">
              Academic Departments
            </h2>
          </div>

          <div className="border border-campus-border rounded-container overflow-hidden bg-campus-surface shadow-subtle">
            <div className="divide-y divide-campus-border/70">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-campus-secondary/20 transition-colors"
                >
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-campus-text-primary">
                        {dept.name}
                      </span>
                      <Badge variant="primary">{dept.code}</Badge>
                    </div>
                    <p className="text-xs text-campus-text-secondary leading-relaxed">
                      {dept.description || 'Undergraduate and postgraduate engineering programs.'}
                    </p>
                    <p className="text-[11px] text-campus-text-muted mt-1">
                      Head of Department: <span className="text-campus-text-primary font-medium">{dept.headOfDepartment}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right text-xs">
                      <span className="font-semibold text-campus-text-primary block">
                        {dept._count?.users || 0} Members
                      </span>
                      <span className="text-campus-text-muted text-[11px]">
                        {dept._count?.resources || 0} Resources
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCommunityChat(dept.code)}
                    >
                      Department Channel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
