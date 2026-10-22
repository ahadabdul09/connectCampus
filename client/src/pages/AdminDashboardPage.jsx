import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Building,
  Calendar,
  Folder,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Plus,
  Search,
  Mail,
  Send,
  Trash2,
  Edit,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../services/adminService.js';
import { communityService } from '../services/communityService.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input } from '../components/Input.jsx';
import { formatDate } from '../utils/formatDate.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { cn } from '../utils/cn.js';

export function AdminDashboardPage() {
  usePageTitle('Admin Console');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: ANALYTICS, USERS, DEPARTMENTS, CLUBS, REPORTS
  const [activeTab, setActiveTab] = useState('ANALYTICS');

  // Filters for User Management
  const [userSearch, setUserSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal: Invite User
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('FACULTY');
  const [inviteDeptId, setInviteDeptId] = useState('');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Modal: Edit User (Role & Department)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('STUDENT');
  const [editDeptId, setEditDeptId] = useState('');

  // Modal: Create Department
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', headOfDepartment: '' });

  // Modal: Create Club
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [clubForm, setClubForm] = useState({ name: '', code: '', description: '', category: 'TECHNICAL' });

  // Data Loader
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, deptsData, clubsData, invitesData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({
          search: userSearch || undefined,
          role: filterRole,
          departmentId: filterDept,
          status: filterStatus,
        }),
        communityService.getDepartments(),
        communityService.getClubs(),
        adminService.getInvitations().catch(() => []),
      ]);
      setStats(statsData);
      setUsersList(usersData.users);
      setDepartments(deptsData);
      setClubs(clubsData);
      setInvitations(invitesData);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [userSearch, filterRole, filterDept, filterStatus]);

  // Handle User Activation / Deactivation
  const handleToggleUserStatus = async (user) => {
    const actionName = user.isActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionName} ${user.fullName}'s account?`)) return;

    try {
      await adminService.updateUser(user.id, { isActive: !user.isActive });
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  // Open Edit User Modal
  const openEditUser = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditDeptId(user.department?.id || '');
    setIsEditUserModalOpen(true);
  };

  // Save Edit User
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser.id, {
        role: editRole,
        departmentId: editDeptId || null,
      });
      setIsEditUserModalOpen(false);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user role/department.');
    }
  };

  // Handle Send Invitation (Method B)
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setGeneratedInviteUrl('');
    try {
      const result = await adminService.inviteUser({
        email: inviteEmail.trim(),
        role: inviteRole,
        departmentId: inviteDeptId || null,
      });

      const fullUrl = `${window.location.origin}${result.inviteUrl}`;
      setGeneratedInviteUrl(fullUrl);
      setInviteEmail('');
      const invitesData = await adminService.getInvitations();
      setInvitations(invitesData);
    } catch (err) {
      alert(err.message || 'Failed to generate invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  // Copy Invite Link to Clipboard
  const handleCopyInvite = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  // Handle Revoke Invitation
  const handleRevokeInvite = async (id) => {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return;
    try {
      await adminService.revokeInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to revoke invitation.');
    }
  };

  // Handle Create Department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim() || !deptForm.code.trim()) return;

    try {
      await adminService.createDepartment(deptForm);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '', headOfDepartment: '' });
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create department.');
    }
  };

  // Handle Delete Department
  const handleDeleteDepartment = async (id) => {
    if (!confirm('Delete this department? Enrolled users must be reassigned first.')) return;
    try {
      await adminService.deleteDepartment(id);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete department.');
    }
  };

  // Handle Create Club
  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!clubForm.name.trim() || !clubForm.code.trim() || !clubForm.description.trim()) return;

    try {
      await adminService.createClub(clubForm);
      setIsClubModalOpen(false);
      setClubForm({ name: '', code: '', description: '', category: 'TECHNICAL' });
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create club.');
    }
  };

  // Handle Delete Club
  const handleDeleteClub = async (id) => {
    if (!confirm('Delete this club community and associated member records?')) return;
    try {
      await adminService.deleteClub(id);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete club.');
    }
  };

  // Handle Moderation Reports
  const handleResolveReport = async (reportId, status) => {
    try {
      await adminService.resolveReport(reportId, status, 'Resolved by campus administrator.');
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Report action failed.');
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="p-12 max-w-7xl mx-auto text-center text-xs text-campus-text-secondary">
        Loading institutional administration console...
      </div>
    );
  }

  const { overview, departmentDistribution, messageVolumeTrend, recentReports } =
    stats || {
      overview: { totalUsers: 0, activeUsers: 0, totalMessages: 0, messagesToday: 0, totalDepartments: 0, totalClubs: 0, totalResources: 0, pendingReportsCount: 0 },
      departmentDistribution: [],
      messageVolumeTrend: [],
      recentReports: [],
    };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-campus-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-campus-primary">
              Campus Administration & Governance
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
            Institutional Administration Console
          </h1>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-campus-secondary/60 rounded-btn border border-campus-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={cn(
              'px-3 py-1.5 rounded transition-colors',
              activeTab === 'ANALYTICS'
                ? 'bg-campus-primary text-white font-semibold'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            )}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={cn(
              'px-3 py-1.5 rounded transition-colors',
              activeTab === 'USERS'
                ? 'bg-campus-primary text-white font-semibold'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            )}
          >
            User Management ({usersList.length})
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
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={cn(
              'px-3 py-1.5 rounded transition-colors',
              activeTab === 'REPORTS'
                ? 'bg-campus-primary text-white font-semibold'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            )}
          >
            Moderation ({overview.pendingReportsCount})
          </button>
        </div>
      </div>

      {/* 1. Analytics & Metrics View */}
      {activeTab === 'ANALYTICS' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Total Users
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.totalUsers}
              </span>
              <span className="text-[10px] text-campus-state-success font-medium mt-1">
                Enrolled records
              </span>
            </div>

            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Active Online
              </span>
              <span className="font-serif text-2xl font-bold text-campus-primary mt-1">
                {overview.activeUsers}
              </span>
              <span className="text-[10px] text-campus-text-muted mt-1">
                Live sessions
              </span>
            </div>

            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Messages Today
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.messagesToday}
              </span>
              <span className="text-[10px] text-campus-text-muted mt-1">
                Total sent: {overview.totalMessages}
              </span>
            </div>

            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Departments
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.totalDepartments}
              </span>
              <span className="text-[10px] text-campus-text-muted mt-1">
                Academic branches
              </span>
            </div>

            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Clubs
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.totalClubs}
              </span>
              <span className="text-[10px] text-campus-text-muted mt-1">
                Student societies
              </span>
            </div>

            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Resources
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.totalResources}
              </span>
              <span className="text-[10px] text-campus-text-muted mt-1">
                Course files
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real Visual Weekly Message Trend Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-campus-text-primary">
                      Weekly Messaging Volume
                    </h2>
                    <p className="text-xs text-campus-text-secondary">
                      Real-time message traffic logged in database over the past 7 days
                    </p>
                  </div>
                  <Badge variant="primary">7-Day Activity</Badge>
                </div>

                {messageVolumeTrend.length === 0 || messageVolumeTrend.every((m) => m.messages === 0) ? (
                  <div className="h-48 flex items-center justify-center text-xs text-campus-text-secondary">
                    No messaging activity recorded over the past 7 days.
                  </div>
                ) : (
                  <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4">
                    {messageVolumeTrend.map((item, idx) => {
                      const maxCount = Math.max(...messageVolumeTrend.map((m) => m.messages), 1);
                      const heightPercent = Math.max(8, Math.round((item.messages / maxCount) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[10px] font-mono font-medium text-campus-text-secondary">
                            {item.messages}
                          </span>
                          <div className="w-full max-w-[36px] bg-campus-secondary/60 rounded-t overflow-hidden flex flex-col justify-end h-full">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-campus-primary hover:bg-campus-primary-hover transition-all rounded-t"
                              title={`${item.day} (${item.date}): ${item.messages} messages, ${item.activeUsers} active`}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-campus-text-primary">
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-campus-border/60 text-[11px] text-campus-text-muted flex justify-between mt-4">
                <span>Calculated dynamically from real database message timestamps</span>
                <span>Socket.IO events active</span>
              </div>
            </div>

            {/* Department Distribution (5 Cols) */}
            <div className="lg:col-span-5 bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-campus-text-primary">
                    Department Enrollment
                  </h2>
                  <p className="text-xs text-campus-text-secondary">
                    User distribution across academic branches
                  </p>
                </div>
              </div>

              {departmentDistribution.length === 0 ? (
                <div className="py-8 text-center text-xs text-campus-text-secondary">
                  No academic departments created yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {departmentDistribution.map((dept, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-campus-text-primary">
                          {dept.name} ({dept.code})
                        </span>
                        <span className="text-campus-text-secondary font-medium">
                          {dept.userCount} users • {dept.resourceCount} docs
                        </span>
                      </div>
                      <div className="w-full h-2 bg-campus-secondary rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              overview.totalUsers > 0
                                ? Math.min(100, (dept.userCount / overview.totalUsers) * 100)
                                : 0
                            }%`,
                          }}
                          className="h-full bg-campus-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. User Management Tab */}
      {activeTab === 'USERS' && (
        <div className="flex flex-col gap-6">
          {/* Action Header & Filters */}
          <div className="bg-campus-surface border border-campus-border rounded-container p-4 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-campus-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, roll..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-campus-secondary/40 border border-campus-border rounded text-xs text-campus-text-primary focus:bg-campus-surface focus:border-campus-primary focus:outline-none"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-campus-surface border border-campus-border rounded px-2.5 py-1.5 text-xs text-campus-text-primary focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="FACULTY">Faculty</option>
                <option value="CLUB_COORDINATOR">Club Coordinators</option>
                <option value="DEPT_ADMIN">Department Admins</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>

              {/* Department Filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-campus-surface border border-campus-border rounded px-2.5 py-1.5 text-xs text-campus-text-primary focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-campus-surface border border-campus-border rounded px-2.5 py-1.5 text-xs text-campus-text-primary focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Deactivated Only</option>
              </select>
            </div>

            {/* Invite Button (Method B) */}
            <Button
              onClick={() => {
                setGeneratedInviteUrl('');
                setIsInviteModalOpen(true);
              }}
              size="sm"
              className="shrink-0 font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              Invite Member
            </Button>
          </div>

          {/* Users Table */}
          <div className="bg-campus-surface border border-campus-border rounded-container shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-campus-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-campus-text-primary">
                Enrolled Campus Accounts ({usersList.length})
              </h2>
              <span className="text-xs text-campus-text-secondary">
                Verified institutional directory
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-campus-secondary/50 border-b border-campus-border uppercase font-semibold text-campus-text-muted text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Member Name</th>
                    <th className="py-2.5 px-4">Academic Email</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Roll ID</th>
                    <th className="py-2.5 px-4">Account Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-campus-border/60">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-campus-text-secondary">
                        No enrolled campus users match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-campus-secondary/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2.5 font-medium text-campus-text-primary">
                          <Avatar name={u.fullName} size="sm" isOnline={u.isOnline} showStatus />
                          <span>{u.fullName}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-campus-text-secondary">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              u.role === 'SUPER_ADMIN'
                                ? 'accent'
                                : u.role === 'FACULTY' || u.role === 'DEPT_ADMIN'
                                ? 'primary'
                                : 'neutral'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-campus-text-secondary font-medium">
                          {u.department ? `${u.department.name} (${u.department.code})` : 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 font-mono text-campus-text-muted">
                          {u.studentId || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border',
                              u.isActive !== false
                                ? 'bg-[#EBF3EE] text-campus-state-success border-campus-state-success/30'
                                : 'bg-[#F9ECEB] text-campus-state-error border-campus-state-error/30'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                u.isActive !== false ? 'bg-campus-state-success' : 'bg-campus-state-error'
                              )}
                            />
                            {u.isActive !== false ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditUser(u)}
                              className="px-2 py-1 rounded bg-campus-secondary/60 hover:bg-campus-secondary text-campus-text-primary text-[11px] font-medium border border-campus-border"
                              title="Edit Role & Department"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={cn(
                                'px-2 py-1 rounded text-[11px] font-medium border transition-colors',
                                u.isActive !== false
                                  ? 'border-campus-state-error/40 text-campus-state-error hover:bg-[#F9ECEB]'
                                  : 'border-campus-state-success/40 text-campus-state-success hover:bg-[#EBF3EE]'
                              )}
                            >
                              {u.isActive !== false ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations Table */}
          <div className="bg-campus-surface border border-campus-border rounded-container shadow-subtle p-5">
            <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-3">
              <div>
                <h3 className="text-sm font-semibold text-campus-text-primary">
                  Pending Administrative Invitations ({invitations.length})
                </h3>
                <p className="text-xs text-campus-text-secondary">
                  Active invitation tokens generated for faculty, club leads, and administrators
                </p>
              </div>
            </div>

            {invitations.length === 0 ? (
              <div className="py-8 text-center text-xs text-campus-text-secondary">
                No pending invitations. Click "Invite Member" above to invite faculty or department administrators.
              </div>
            ) : (
              <div className="divide-y divide-campus-border/60">
                {invitations.map((inv) => {
                  const inviteLink = `${window.location.origin}/register?token=${inv.token}`;
                  return (
                    <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-campus-text-primary">{inv.email}</span>
                          <Badge variant="primary">{inv.role}</Badge>
                          {inv.department && (
                            <span className="text-campus-text-muted">({inv.department.code})</span>
                          )}
                        </div>
                        <p className="text-[11px] text-campus-text-secondary font-mono truncate max-w-md">
                          Token: {inv.token.slice(0, 16)}... • Expires: {formatDate(inv.expiresAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyInvite(inviteLink)}
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeInvite(inv.id)}
                          className="text-campus-state-error hover:bg-[#F9ECEB]"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Departments Management Tab */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-campus-text-primary">
                Academic Departments
              </h2>
              <p className="text-xs text-campus-text-secondary">
                Official college faculties, academic divisions, and branch codes
              </p>
            </div>
            <Button size="sm" onClick={() => setIsDeptModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Department
            </Button>
          </div>

          {departments.length === 0 ? (
            <div className="py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
              No academic departments created yet. Click "Add Department" to establish your institution's faculties.
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
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-campus-text-muted hover:text-campus-state-error p-1 transition-colors"
                        title="Delete department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-campus-text-primary">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-campus-text-secondary mt-1 line-clamp-2">
                      {dept.description || 'Academic branch.'}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-campus-border/60 text-[11px] text-campus-text-muted flex justify-between">
                    <span>HOD: {dept.headOfDepartment || 'Unassigned'}</span>
                    <span>{dept._count?.users || 0} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Clubs Management Tab */}
      {activeTab === 'CLUBS' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-campus-text-primary">
                Student Clubs & Societies
              </h2>
              <p className="text-xs text-campus-text-secondary">
                Registered student organizations, technical chapters, and cultural guilds
              </p>
            </div>
            <Button size="sm" onClick={() => setIsClubModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Club Community
            </Button>
          </div>

          {clubs.length === 0 ? (
            <div className="py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
              No campus clubs created yet. Click "Add Club Community" to establish student societies.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="neutral">{club.category}</Badge>
                      <button
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-campus-text-muted hover:text-campus-state-error p-1 transition-colors"
                        title="Delete club"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-campus-text-primary">
                      {club.name} ({club.code})
                    </h3>
                    <p className="text-xs text-campus-text-secondary mt-1 line-clamp-3">
                      {club.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-campus-border/60 text-[11px] text-campus-text-muted flex justify-between">
                    <span>Lead: {club.lead?.fullName || 'Unassigned'}</span>
                    <span>{club.memberCount || 0} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Moderation Reports Tab */}
      {activeTab === 'REPORTS' && (
        <div className="bg-campus-surface border border-campus-border rounded-container shadow-subtle p-5">
          <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-4">
            <div>
              <h2 className="text-sm font-semibold text-campus-text-primary">
                Community Moderation Reports
              </h2>
              <p className="text-xs text-campus-text-secondary">
                User-submitted flags regarding message conduct or policy adherence
              </p>
            </div>
            <Badge variant="urgent">{recentReports.length} Active</Badge>
          </div>

          <div className="flex flex-col gap-3">
            {recentReports.length === 0 ? (
              <div className="py-8 text-center text-xs text-campus-text-secondary">
                No active moderation incidents pending review.
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-card border border-campus-border bg-campus-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="urgent">{report.targetType}</Badge>
                      <span className="text-xs font-semibold text-campus-text-primary">
                        Reported by {report.reporter?.fullName}
                      </span>
                      <span className="text-[10px] text-campus-text-muted">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-campus-text-secondary leading-relaxed">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleResolveReport(report.id, 'RESOLVED')}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Invite User (Method B) */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Academic Member"
      >
        <form onSubmit={handleSendInvite} className="flex flex-col gap-4 text-xs">
          <p className="text-campus-text-secondary leading-relaxed">
            Generate an official invitation token and onboarding link for faculty, department administrators, or student leaders.
          </p>

          <Input
            label="Academic Email"
            type="email"
            placeholder="e.g. professor@college.edu"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Assigned Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
            >
              <option value="FACULTY">Faculty Member</option>
              <option value="CLUB_COORDINATOR">Club Coordinator</option>
              <option value="DEPT_ADMIN">Department Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Assigned Department (Optional)
            </label>
            <select
              value={inviteDeptId}
              onChange={(e) => setInviteDeptId(e.target.value)}
              className="bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
            >
              <option value="">Campus Wide / None</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" isLoading={isInviting} className="w-full mt-2 font-semibold">
            Generate Invitation Token
          </Button>

          {/* Generated Link Display */}
          {generatedInviteUrl && (
            <div className="mt-3 p-3 rounded-card bg-[#EAF1EE] border border-campus-primary/30 flex flex-col gap-2">
              <span className="font-semibold text-campus-primary">Invitation Link Created:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInviteUrl}
                  className="flex-1 bg-white border border-campus-border rounded px-2.5 py-1.5 font-mono text-[11px] text-campus-text-primary"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleCopyInvite(generatedInviteUrl)}
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedInvite ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <span className="text-[10px] text-campus-text-muted">
                Send this link to the invited member to complete their account registration.
              </span>
            </div>
          )}
        </form>
      </Modal>

      {/* MODAL: Edit User Role & Department */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title={`Edit Permissions: ${editingUser?.fullName}`}
      >
        <form onSubmit={handleSaveEditUser} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Campus Role
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty Member</option>
              <option value="CLUB_COORDINATOR">Club Coordinator</option>
              <option value="DEPT_ADMIN">Department Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Assigned Department
            </label>
            <select
              value={editDeptId}
              onChange={(e) => setEditDeptId(e.target.value)}
              className="bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
            >
              <option value="">Campus Wide (No Department)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-campus-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Create Department */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Add Academic Department"
      >
        <form onSubmit={handleCreateDepartment} className="flex flex-col gap-3.5 text-xs">
          <Input
            label="Department Name"
            placeholder="e.g. Computer Science & Engineering"
            value={deptForm.name}
            onChange={(e) => setDeptForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Department Code"
            placeholder="e.g. CSE"
            value={deptForm.code}
            onChange={(e) => setDeptForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-campus-text-secondary uppercase tracking-wider text-[11px]">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Academic disciplines, research focus, and curriculum outline..."
              value={deptForm.description}
              onChange={(e) => setDeptForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
            />
          </div>

          <Input
            label="Head of Department / Dean (Optional)"
            placeholder="e.g. Dr. Alan Turing"
            value={deptForm.headOfDepartment}
            onChange={(e) => setDeptForm((prev) => ({ ...prev, headOfDepartment: e.target.value }))}
          />

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-campus-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Create Club */}
      <Modal
        isOpen={isClubModalOpen}
        onClose={() => setIsClubModalOpen(false)}
        title="Add Campus Club Community"
      >
        <form onSubmit={handleCreateClub} className="flex flex-col gap-3.5 text-xs">
          <Input
            label="Club Name"
            placeholder="e.g. Robotics & Automation Guild"
            value={clubForm.name}
            onChange={(e) => setClubForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Club Code / Acronym"
            placeholder="e.g. ROBOTICS"
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
              placeholder="Outline the club's objectives, regular workshops, and membership criteria..."
              value={clubForm.description}
              onChange={(e) => setClubForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-campus-surface border border-campus-border rounded p-2 text-xs text-campus-text-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-campus-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsClubModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Create Club Community
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
