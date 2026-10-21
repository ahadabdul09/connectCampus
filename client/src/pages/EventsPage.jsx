import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { eventService } from '../services/eventService.js';
import { communityService } from '../services/communityService.js';
import { useAuthStore } from '../stores/authStore.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input } from '../components/Input.jsx';
import { formatDate, formatDateTime } from '../utils/formatDate.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { cn } from '../utils/cn.js';

export function EventsPage() {
  usePageTitle('Events');
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [viewMode, setViewMode] = useState('UPCOMING'); // UPCOMING, MY_EVENTS, ALL
  const [isLoading, setIsLoading] = useState(true);

  // Modal for creating event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    registrationDeadline: '',
    maxCapacity: 100,
    departmentId: '',
  });

  const canCreateEvent =
    user?.role === 'FACULTY' ||
    user?.role === 'CLUB_COORDINATOR' ||
    user?.role === 'DEPT_ADMIN' ||
    user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    async function loadEventsData() {
      setIsLoading(true);
      try {
        const [evts, depts] = await Promise.all([
          eventService.getEvents(),
          communityService.getDepartments(),
        ]);
        setEvents(evts);
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEventsData();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId);
      const updated = await eventService.getEvents();
      setEvents(updated);
    } catch (err) {
      alert(err.message || 'Registration failed.');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!confirm('Cancel your event seat registration?')) return;
    try {
      await eventService.cancelRegistration(eventId);
      const updated = await eventService.getEvents();
      setEvents(updated);
    } catch (err) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent({
        ...formData,
        eventDate: new Date(formData.eventDate).toISOString(),
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : null,
        maxCapacity: parseInt(formData.maxCapacity, 10),
        departmentId: formData.departmentId || null,
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        eventDate: '',
        registrationDeadline: '',
        maxCapacity: 100,
        departmentId: '',
      });
      const updated = await eventService.getEvents();
      setEvents(updated);
    } catch (err) {
      alert(err.message || 'Failed to create event.');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (viewMode === 'MY_EVENTS') return ev.isRegistered;
    return true;
  });

  return (
    <div className="py-6 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-border gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
            Academic Calendar & Campus Events
          </h1>
          <p className="text-xs text-campus-text-secondary mt-1">
            Workshops, symposia, coding hackathons, guest lectures, and student competitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreateEvent && (
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Publish Event
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-campus-secondary/50 rounded-btn border border-campus-border self-start text-xs font-medium">
        <button
          onClick={() => setViewMode('UPCOMING')}
          className={cn(
            'px-3 py-1.5 rounded transition-colors',
            viewMode === 'UPCOMING'
              ? 'bg-campus-primary text-white font-semibold'
              : 'text-campus-text-secondary hover:text-campus-text-primary'
          )}
        >
          All Scheduled Events ({events.length})
        </button>
        <button
          onClick={() => setViewMode('MY_EVENTS')}
          className={cn(
            'px-3 py-1.5 rounded transition-colors',
            viewMode === 'MY_EVENTS'
              ? 'bg-campus-primary text-white font-semibold'
              : 'text-campus-text-secondary hover:text-campus-text-primary'
          )}
        >
          My Registrations ({events.filter((e) => e.isRegistered).length})
        </button>
      </div>

      {/* Calendar & List Hybrid Layout */}
      <div className="flex flex-col gap-4">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
            No events found for this filter.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const eventDate = new Date(ev.eventDate);
            const isFull = ev.registeredCount >= ev.maxCapacity;

            return (
              <div
                key={ev.id}
                className="bg-campus-surface border border-campus-border rounded-container p-5 sm:p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-campus-primary/50 transition-colors"
              >
                {/* Left Date Block + Content */}
                <div className="flex items-start gap-5">
                  {/* Calendar Date Block */}
                  <div className="w-16 h-16 rounded-card bg-campus-secondary border border-campus-border flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-campus-accent">
                      {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="font-serif text-2xl font-bold text-campus-text-primary leading-tight">
                      {eventDate.getDate()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base sm:text-lg font-bold text-campus-text-primary">
                        {ev.title}
                      </span>
                      {ev.department && (
                        <Badge variant="primary">{ev.department.code}</Badge>
                      )}
                      {ev.club && <Badge variant="neutral">{ev.club.code}</Badge>}
                    </div>

                    <p className="text-xs text-campus-text-secondary leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-campus-text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-campus-text-secondary" />
                        {ev.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-campus-text-secondary" />
                        {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-campus-text-secondary" />
                        {ev.registeredCount}/{ev.maxCapacity} Seats Filled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Block */}
                <div className="flex flex-col items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-campus-border/60">
                  {ev.isRegistered ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="py-1 px-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Seat Confirmed
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRegistration(ev.id)}
                        className="text-xs text-campus-state-error hover:bg-[#F9ECEB]"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      disabled={isFull}
                      onClick={() => handleRegister(ev.id)}
                      variant={isFull ? 'secondary' : 'primary'}
                    >
                      {isFull ? 'Capacity Full' : 'Register for Seat'}
                    </Button>
                  )}

                  <span className="text-[11px] text-campus-text-muted">
                    Organized by {ev.organizer?.fullName}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Publish Event */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Campus Event"
        description="Add a technical workshop, symposium, or student session to the calendar."
      >
        <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
          <Input
            label="Event Name"
            placeholder="e.g. Autonomous Rover Prototyping Workshop"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Campus Location"
              placeholder="e.g. Seminar Hall 2, Block A"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <Input
              label="Seat Capacity"
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Event Date & Time"
              type="datetime-local"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              required
            />
            <Input
              label="Registration Deadline"
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={(e) =>
                setFormData({ ...formData, registrationDeadline: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
              Description & Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Agenda details, speaker bio, and kit requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
