import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Megaphone,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
  Download,
  Clock,
  Pin,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { announcementService } from '../services/announcementService.js';
import { eventService } from '../services/eventService.js';
import { resourceService } from '../services/resourceService.js';
import { communityService } from '../services/communityService.js';
import { Badge } from '../components/Badge.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';
import { CardSkeleton } from '../components/LoadingSkeleton.jsx';
import { formatDate, formatTimeAgo } from '../utils/formatDate.js';
import { formatFileSize } from '../utils/formatFileSize.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function DashboardPage() {
  usePageTitle('Dashboard');
  const { user } = useAuthStore();
  const { conversations, fetchConversations, selectConversation } = useChatStore();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [anns, evts, res, clbs] = await Promise.all([
          announcementService.getAnnouncements({ limit: 4 }),
          eventService.getEvents(),
          resourceService.getResources({ sortBy: 'recent' }),
          communityService.getClubs(),
        ]);
        setAnnouncements(anns);
        setEvents(evts.slice(0, 4));
        setResources(res.slice(0, 4));
        setClubs(clbs.slice(0, 4));
        await fetchConversations();
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [fetchConversations]);

  const handleOpenChat = (conversationId) => {
    selectConversation(conversationId);
    navigate('/chat');
  };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-campus-primary">
              {user?.department?.name || 'Academic Campus'}
            </span>
            <span className="text-campus-text-muted">•</span>
            <span className="text-xs text-campus-text-secondary">
              {user?.batch ? `Batch ${user.batch}` : 'Spring Term'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
            Welcome back, {user?.fullName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/chat">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-3.5 h-3.5" />
              Open Chat
            </Button>
          </Link>
          <Link to="/resources">
            <Button size="sm">
              <BookOpen className="w-3.5 h-3.5" />
              Resource Library
            </Button>
          </Link>
        </div>
      </div>

      {/* Asymmetric Dashboard Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center Column (7 Cols): Recent Conversations & Recent Resources */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Recent Conversations */}
          <section className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle">
            <div className="flex items-center justify-between pb-3.5 border-b border-campus-border mb-4">
              <div>
                <h2 className="text-base font-semibold text-campus-text-primary">
                  Recent Conversations
                </h2>
                <p className="text-xs text-campus-text-secondary">
                  Active department channels, groups, and direct messages
                </p>
              </div>
              <Link
                to="/chat"
                className="text-xs font-semibold text-campus-primary hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-campus-text-secondary">
                No active conversations yet. Start a discussion with peers from your department.
              </div>
            ) : (
              <div className="divide-y divide-campus-border/60">
                {conversations.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleOpenChat(conv.id)}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-campus-secondary/40 p-2 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar
                        name={conv.title}
                        isOnline={conv.peerUser?.isOnline}
                        showStatus={conv.type === 'DIRECT'}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-campus-text-primary truncate">
                            {conv.title}
                          </span>
                          {conv.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-campus-accent shrink-0" />
                          )}
                          <span className="text-[10px] text-campus-text-muted">
                            {conv.type === 'DIRECT' ? 'Direct' : `${conv.membersCount} members`}
                          </span>
                        </div>
                        <p className="text-xs text-campus-text-secondary truncate mt-0.5">
                          {conv.latestMessage ? (
                            <span>
                              <span className="font-medium text-campus-text-primary">
                                {conv.latestMessage.senderName}:{' '}
                              </span>
                              {conv.latestMessage.content}
                            </span>
                          ) : (
                            <span className="italic text-campus-text-muted">No messages yet</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-campus-text-muted shrink-0 mt-0.5">
                      {formatTimeAgo(conv.lastMessageAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recently Uploaded Resources */}
          <section className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle">
            <div className="flex items-center justify-between pb-3.5 border-b border-campus-border mb-4">
              <div>
                <h2 className="text-base font-semibold text-campus-text-primary">
                  Academic Documents & Handouts
                </h2>
                <p className="text-xs text-campus-text-secondary">
                  Recent materials uploaded by faculty and department leads
                </p>
              </div>
              <Link
                to="/resources"
                className="text-xs font-semibold text-campus-primary hover:underline flex items-center gap-1"
              >
                <span>Browse library</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-3 border border-campus-border rounded-card bg-campus-secondary/20 flex flex-col justify-between hover:bg-campus-secondary/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <Badge variant="neutral">{res.category}</Badge>
                      <span className="text-[10px] font-mono font-medium text-campus-text-secondary">
                        {res.fileType}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-campus-text-primary line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-[11px] text-campus-text-secondary line-clamp-2 mt-1">
                      {res.description || 'Academic reference guide.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-campus-border/50 text-[11px] text-campus-text-muted">
                    <span>{formatFileSize(res.fileSize)}</span>
                    <span className="font-medium text-campus-primary">
                      {res.downloadsCount} downloads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (5 Cols): Urgent Notices, Events, Campus AI */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Important Notices */}
          <section className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-campus-accent" />
                <h2 className="text-sm font-semibold text-campus-text-primary">
                  Official Announcements
                </h2>
              </div>
              <Link
                to="/announcements"
                className="text-xs text-campus-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-card border border-campus-border/70 bg-campus-secondary/30 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-campus-text-primary line-clamp-1">
                      {ann.title}
                    </span>
                    <Badge
                      variant={
                        ann.priority === 'URGENT'
                          ? 'urgent'
                          : ann.priority === 'IMPORTANT'
                          ? 'primary'
                          : 'neutral'
                      }
                    >
                      {ann.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-campus-text-secondary line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-campus-text-muted flex items-center justify-between mt-1">
                    <span>{ann.author?.fullName}</span>
                    <span>{formatDate(ann.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Registered & Campus Events */}
          <section className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-campus-primary" />
                <h2 className="text-sm font-semibold text-campus-text-primary">
                  Upcoming Campus Events
                </h2>
              </div>
              <Link
                to="/events"
                className="text-xs text-campus-primary hover:underline"
              >
                Full calendar
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-card border border-campus-border bg-campus-secondary/20 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-campus-text-primary line-clamp-1">
                      {ev.title}
                    </span>
                    <p className="text-[11px] text-campus-text-secondary mt-0.5 truncate">
                      {ev.location}
                    </p>
                    <span className="text-[10px] text-campus-text-muted block mt-1">
                      {formatDate(ev.eventDate)}
                    </span>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {ev.isRegistered ? (
                      <Badge variant="success">Registered</Badge>
                    ) : (
                      <span className="text-[11px] text-campus-text-muted font-medium">
                        {ev.registeredCount}/{ev.maxCapacity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Campus Assistant Highlight Box */}
          <div className="p-4 rounded-container bg-[#EAF1EE] border border-campus-primary/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-campus-primary">
              <span className="w-2 h-2 rounded-full bg-campus-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Grounded Campus Intelligence
              </h3>
            </div>
            <p className="text-xs text-campus-text-primary leading-relaxed">
              Have a question regarding exam regulations, Deloitte drive cutoffs, or past placement papers? Ask the verified Campus Assistant anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
