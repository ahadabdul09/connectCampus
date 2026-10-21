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
} from 'lucide-react';
import { adminService } from '../services/adminService.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { formatDate } from '../utils/formatDate.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function AdminDashboardPage() {
  usePageTitle('Admin Console');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // ANALYTICS, USERS, REPORTS

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      try {
        const [statsData, usersData] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(1, 20),
        ]);
        setStats(statsData);
        setUsersList(usersData.users);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleResolveReport = async (reportId, status) => {
    try {
      await adminService.resolveReport(reportId, status, 'Reviewed and verified by campus administrator.');
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (err) {
      alert(err.message || 'Report action failed.');
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-xs text-campus-text-secondary">
        Loading campus administrative metrics...
      </div>
    );
  }

  const { overview, departmentDistribution, messageVolumeTrend, recentUsers, recentReports } =
    stats;

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-campus-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-campus-accent">
              University Operations & Moderation
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
            Institutional Administration Console
          </h1>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-campus-secondary/60 rounded-btn border border-campus-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'ANALYTICS'
                ? 'bg-campus-primary text-white font-semibold'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'USERS'
                ? 'bg-campus-primary text-white font-semibold'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'REPORTS'
                ? 'bg-campus-primary text-white font-semibold'
                : 'text-campus-text-secondary hover:text-campus-text-primary'
            }`}
          >
            Moderation ({overview.pendingReportsCount})
          </button>
        </div>
      </div>

      {/* 1. Analytics & Metrics View */}
      {activeTab === 'ANALYTICS' && (
        <div className="flex flex-col gap-6">
          {/* Key Metric Numbers Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-campus-surface border border-campus-border rounded-card p-3.5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-muted">
                Total Users
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.totalUsers}
              </span>
              <span className="text-[10px] text-campus-state-success font-medium mt-1">
                Verified enrollment
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
                Concurrent sessions
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
                Channels & DMs
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
                Clubs & Guilds
              </span>
              <span className="font-serif text-2xl font-bold text-campus-text-primary mt-1">
                {overview.totalClubs}
              </span>
              <span className="text-[10px] text-campus-text-muted mt-1">
                Active societies
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
                Course documents
              </span>
            </div>
          </div>

          {/* Visual Data Composition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real Visual Weekly Message Trend Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-campus-border mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-campus-text-primary">
                      Weekly Messaging Volume & Engagement
                    </h2>
                    <p className="text-xs text-campus-text-secondary">
                      Daily campus message throughput across batch groups and clubs
                    </p>
                  </div>
                  <Badge variant="primary">7-Day Trend</Badge>
                </div>

                {/* Meaningful Visual Bar Chart */}
                <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4">
                  {messageVolumeTrend.map((item, idx) => {
                    const maxHeight = 100;
                    const heightPercent = Math.min(100, Math.round((item.messages / maxHeight) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[10px] font-mono font-medium text-campus-text-secondary">
                          {item.messages}
                        </span>
                        <div className="w-full max-w-[36px] bg-campus-secondary/60 rounded-t overflow-hidden flex flex-col justify-end h-full">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-campus-primary hover:bg-campus-primary-hover transition-all rounded-t"
                            title={`${item.day}: ${item.messages} messages (${item.activeUsers} active users)`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-campus-text-primary">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-campus-border/60 text-[11px] text-campus-text-muted flex justify-between mt-4">
                <span>Peak load: Friday (deloitte drive & assignments)</span>
                <span>Real-time Socket.IO events logged</span>
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
                    Student & faculty distribution by branch
                  </p>
                </div>
              </div>

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
                    {/* Progress track */}
                    <div className="w-full h-2 bg-campus-secondary rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (dept.userCount / overview.totalUsers) * 100)}%`,
                        }}
                        className="h-full bg-campus-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Directory Table View */}
      {activeTab === 'USERS' && (
        <div className="bg-campus-surface border border-campus-border rounded-container shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-campus-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-campus-text-primary">
              Enrolled Campus Users ({usersList.length})
            </h2>
            <span className="text-xs text-campus-text-secondary">
              Verified by registrar directory
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
                  <th className="py-2.5 px-4">Student Roll</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-campus-secondary/30 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5 font-medium text-campus-text-primary">
                      <Avatar name={u.fullName} size="sm" isOnline={u.isOnline} showStatus />
                      <span>{u.fullName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-campus-text-secondary">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral">{u.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-campus-text-secondary font-medium">
                      {u.department?.code || 'Campus Wide'}
                    </td>
                    <td className="py-3 px-4 font-mono text-campus-text-muted">
                      {u.studentId || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          u.isOnline ? 'text-campus-state-success' : 'text-campus-text-muted'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isOnline ? 'bg-campus-state-success' : 'bg-campus-text-muted'
                          }`}
                        />
                        {u.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Moderation Reports View */}
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
    </div>
  );
}
