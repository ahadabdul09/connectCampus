import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { DEMO_ACCOUNTS } from '../constants/index.js';
import { useAuthStore } from '../stores/authStore.js';

export function LandingPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoLogin = async (account) => {
    try {
      await login(account.email, account.password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Editorial Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-start max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-campus-secondary border border-campus-border text-xs font-semibold text-campus-text-secondary mb-6">
            <span className="w-2 h-2 rounded-full bg-campus-primary" />
            Institutional Communication Infrastructure
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-campus-text-primary leading-[1.12] mb-6 tracking-tight">
            Your campus community, academic resources, and conversations in one place.
          </h1>

          <p className="text-base sm:text-lg text-campus-text-secondary leading-relaxed mb-8 max-w-2xl font-normal">
            connectCampus replaces fragmented chat apps, lost email chains, and outdated notice boards with a dedicated, trusted network for college students, faculty, clubs, and departments.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link to="/register">
              <Button size="lg" className="px-6">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In with College ID
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Interface Preview Showcase */}
        <div className="mt-16 border border-campus-border rounded-container bg-campus-surface shadow-modal overflow-hidden">
          {/* Mock Browser/App Header */}
          <div className="bg-campus-secondary/70 border-b border-campus-border px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D1CECA]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D1CECA]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D1CECA]" />
              </div>
              <span className="text-[11px] font-mono text-campus-text-muted ml-2">
                connectCampus.edu / placement-prep-2026
              </span>
            </div>
            <span className="text-[11px] font-medium text-campus-text-secondary bg-campus-surface px-2 py-0.5 rounded border border-campus-border">
              Live Preview
            </span>
          </div>

          {/* Realistic Editorial UI Preview Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-campus-border bg-campus-bg/40">
            {/* Column 1: Channel List */}
            <div className="md:col-span-3 p-4 bg-campus-secondary/30 flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-campus-text-muted">
                  Active Channels
                </span>
                <div className="flex flex-col gap-1 mt-2 text-xs">
                  <div className="p-2 rounded bg-campus-primary-light font-semibold text-campus-primary border border-campus-primary/20 flex justify-between items-center">
                    <span># placement-prep</span>
                    <span className="w-2 h-2 rounded-full bg-campus-accent" />
                  </div>
                  <div className="p-2 rounded text-campus-text-secondary hover:bg-campus-secondary">
                    <span># ise-3rd-year</span>
                  </div>
                  <div className="p-2 rounded text-campus-text-secondary hover:bg-campus-secondary">
                    <span># coding-club</span>
                  </div>
                  <div className="p-2 rounded text-campus-text-secondary hover:bg-campus-secondary">
                    <span># final-year-projects</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-campus-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-campus-text-muted">
                  Department Notices
                </span>
                <div className="p-2.5 rounded bg-campus-surface border border-campus-border mt-2">
                  <p className="text-xs font-semibold text-campus-text-primary">
                    Deloitte Drive Released
                  </p>
                  <p className="text-[11px] text-campus-text-secondary mt-0.5">
                    Round 1 Aptitude Test this Friday. Cutoff 7.0 CGPA.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Realistic Chat Feed */}
            <div className="md:col-span-6 p-5 bg-campus-surface flex flex-col justify-between min-h-[380px]">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-campus-border">
                  <div>
                    <h4 className="text-sm font-semibold text-campus-text-primary">
                      Placement Preparation 2026
                    </h4>
                    <p className="text-[11px] text-campus-text-secondary">
                      52 members • Placement coordinator & faculty moderated
                    </p>
                  </div>
                  <Badge variant="primary">Academic Group</Badge>
                </div>

                {/* Message 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E5ECE9] text-campus-primary flex items-center justify-center font-bold text-xs shrink-0">
                    RN
                  </div>
                  <div className="bg-campus-secondary/40 border border-campus-border/60 rounded-card p-3 max-w-[85%]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-campus-text-primary">
                        Riya Nair (Placement Rep)
                      </span>
                      <span className="text-[10px] text-campus-text-muted">10:14 AM</span>
                    </div>
                    <p className="text-xs text-campus-text-secondary leading-relaxed">
                      Important update: Deloitte has shared their campus drive schedule. Round 1 online aptitude and coding round will be conducted on Friday at 10:00 AM.
                    </p>
                  </div>
                </div>

                {/* Message 2 */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-campus-primary text-white rounded-card p-3 max-w-[85%]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-white/90">
                        Abdul Ahad
                      </span>
                      <span className="text-[10px] text-white/70">10:18 AM</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed">
                      Does anyone have the updated aptitude syllabus for tomorrow's placement test?
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#245C4A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    AA
                  </div>
                </div>

                {/* Message 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F2ECE7] text-campus-accent flex items-center justify-center font-bold text-xs shrink-0">
                    DK
                  </div>
                  <div className="bg-campus-secondary/40 border border-campus-border/60 rounded-card p-3 max-w-[85%]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-campus-text-primary">
                        Dr. Kavitha Sundaram (Faculty)
                      </span>
                      <span className="text-[10px] text-campus-text-muted">10:22 AM</span>
                    </div>
                    <p className="text-xs text-campus-text-secondary leading-relaxed">
                      The assessment consists of 30 quantitative aptitude questions, 20 logical reasoning questions, and 2 hands-on coding problems. Notes are in the resources repository.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-campus-surface border border-campus-border text-[11px] text-campus-text-primary font-medium">
                        👍 4
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-campus-surface border border-campus-border text-[11px] text-campus-text-primary font-medium">
                        🎯 2
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input */}
              <div className="mt-4 pt-3 border-t border-campus-border flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Message #placement-prep..."
                  className="w-full text-xs bg-campus-secondary/40 border border-campus-border rounded-input px-3 py-2 text-campus-text-secondary"
                />
                <Button size="sm" disabled>
                  Send
                </Button>
              </div>
            </div>

            {/* Column 3: Campus Assistant & Context Drawer */}
            <div className="md:col-span-3 p-4 bg-campus-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-campus-primary mb-2">
                  <span className="w-2 h-2 rounded-full bg-campus-primary" />
                  <span>Campus Knowledge Assistant</span>
                </div>
                <div className="bg-campus-surface border border-campus-border rounded-card p-3 text-xs flex flex-col gap-2">
                  <p className="font-semibold text-campus-text-primary">
                    Q: "What did the placement group discuss about Deloitte yesterday?"
                  </p>
                  <p className="text-campus-text-secondary leading-relaxed text-[11px]">
                    "Deloitte Round 1 test is scheduled for Friday 10:00 AM. 30 Quant, 20 Logical, and 2 coding tasks. Minimum cutoff is 65% aggregate."
                  </p>
                  <span className="text-[10px] text-campus-text-muted pt-1 border-t border-campus-border">
                    Verified from Placement Notice #24 & Dr. Kavitha message.
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-card bg-[#EAF1EE] border border-[#2E735D]/30 text-xs">
                <p className="font-semibold text-campus-primary mb-1">
                  Upcoming Registered Event
                </p>
                <p className="text-campus-text-primary text-[11px]">
                  Deloitte Placement Readiness Workshop
                </p>
                <p className="text-campus-text-muted text-[10px] mt-0.5">
                  Seminar Hall 1 • Oct 26, 2:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant 1-Click Role Evaluation Launcher */}
      <section className="bg-campus-secondary/50 border-y border-campus-border py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Badge variant="primary" className="mb-2">
              Ready to Evaluate
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold">
              Explore with Pre-Configured Demo Accounts
            </h2>
            <p className="text-xs sm:text-sm text-campus-text-secondary mt-1">
              Select any persona to sign in immediately with realistic permissions and pre-populated data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_ACCOUNTS.map((account, idx) => (
              <div
                key={idx}
                className="bg-campus-surface border border-campus-border rounded-card p-4 hover:border-campus-primary/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-campus-text-primary">
                      {account.roleName}
                    </span>
                    <Badge variant="neutral">{account.badge}</Badge>
                  </div>
                  <p className="text-xs font-mono text-campus-text-secondary mb-2">
                    {account.email}
                  </p>
                  <p className="text-xs text-campus-text-secondary leading-relaxed mb-4">
                    {account.description}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs font-semibold"
                  onClick={() => handleDemoLogin(account)}
                >
                  Sign In as {account.roleName}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Pillars / Features */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="max-w-2xl mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-campus-text-primary font-bold mb-3">
            Designed for institutional clarity and academic rigor.
          </h2>
          <p className="text-sm text-campus-text-secondary leading-relaxed">
            Every feature in connectCampus solves an authentic operational problem in modern university environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="flex flex-col border border-campus-border rounded-container p-6 bg-campus-surface">
            <div className="w-10 h-10 rounded-card bg-campus-secondary flex items-center justify-center text-campus-primary mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-campus-text-primary mb-2">
              Real-Time Academic Messaging
            </h3>
            <p className="text-xs text-campus-text-secondary leading-relaxed">
              Organized department channels, batch groups, project teams, and direct messages with Socket.IO real-time synchronization, typing indicators, pinned notes, and file attachments.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col border border-campus-border rounded-container p-6 bg-campus-surface">
            <div className="w-10 h-10 rounded-card bg-campus-secondary flex items-center justify-center text-campus-accent mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-campus-text-primary mb-2">
              Curated Resource Library
            </h3>
            <p className="text-xs text-campus-text-secondary leading-relaxed">
              Centralized repository for placement question banks, lab manuals, lecture slides, and project templates. Filter by category, department, or download metrics.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col border border-campus-border rounded-container p-6 bg-campus-surface">
            <div className="w-10 h-10 rounded-card bg-campus-secondary flex items-center justify-center text-campus-primary mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-campus-text-primary mb-2">
              Grounded Campus AI
            </h3>
            <p className="text-xs text-campus-text-secondary leading-relaxed">
              Institutional intelligence powered by retrieval-augmented generation (RAG). Answers inquiries on attendance rules, exam schedules, and placement requirements using verified campus archives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
