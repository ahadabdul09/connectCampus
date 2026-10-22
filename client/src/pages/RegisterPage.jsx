import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Building, Calendar, IdCard, AlertCircle, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { authService } from '../services/authService.js';
import { communityService } from '../services/communityService.js';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function RegisterPage() {
  usePageTitle('Register');
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    departmentId: '',
    batch: '',
    studentId: '',
  });

  const [inviteData, setInviteData] = useState(null);
  const [isVerifyingInvite, setIsVerifyingInvite] = useState(!!inviteToken);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, acceptInvite } = useAuthStore();
  const navigate = useNavigate();

  // If invite token is present, verify it
  useEffect(() => {
    if (!inviteToken) return;

    async function checkInvite() {
      setIsVerifyingInvite(true);
      try {
        const verified = await authService.verifyInvite(inviteToken);
        setInviteData(verified);
        setFormData((prev) => ({
          ...prev,
          email: verified.email,
          departmentId: verified.department?.id || '',
        }));
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Invalid or expired invitation token.');
      } finally {
        setIsVerifyingInvite(false);
      }
    }

    checkInvite();
  }, [inviteToken]);

  // Load active departments from database
  useEffect(() => {
    let isMounted = true;
    async function loadDepartments() {
      try {
        setIsLoadingDepartments(true);
        const data = await communityService.getDepartments();
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setDepartments(list);
          if (list.length > 0 && !inviteToken) {
            setFormData((prev) => ({
              ...prev,
              departmentId: prev.departmentId || list[0].id,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDepartments(false);
        }
      }
    }
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, [inviteToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!inviteToken && !formData.email.includes('@')) {
      setError('Please provide a valid academic email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (inviteToken) {
        await acceptInvite({
          token: inviteToken,
          fullName: formData.fullName,
          password: formData.password,
          studentId: formData.studentId,
          batch: formData.batch,
        });
      } else {
        await register(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-lg mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-campus-text-primary tracking-tight">
          {inviteToken ? 'Accept Campus Invitation' : 'Create Campus Account'}
        </h1>
        <p className="text-xs text-campus-text-secondary mt-2">
          {inviteToken
            ? 'Complete your account setup to join your academic department on connectCampus.'
            : 'Join your college department channels, academic groups, and campus events.'}
        </p>
      </div>

      <div className="bg-campus-surface border border-campus-border rounded-container p-6 sm:p-8 shadow-subtle">
        {/* Invitation Context Banner */}
        {inviteData && (
          <div className="mb-5 p-3.5 rounded-card bg-[#EAF1EE] border border-campus-primary/30 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-campus-primary shrink-0 mt-0.5" />
            <div className="text-xs text-campus-text-primary">
              <span className="font-semibold block mb-0.5">Official Invitation Verified</span>
              <span>
                Invited by <strong>{inviteData.invitedBy}</strong> as{' '}
                <Badge variant="primary" className="mx-1 text-[10px]">
                  {inviteData.role}
                </Badge>
                {inviteData.department ? ` (${inviteData.department.name})` : ''}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-card bg-[#F9ECEB] border border-campus-state-error/30 text-campus-state-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isVerifyingInvite ? (
          <div className="py-8 text-center text-xs text-campus-text-secondary">
            Verifying invitation credentials...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <Input
              label="College Email"
              name="email"
              type="email"
              placeholder="e.g. yourname@college.edu"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              disabled={!!inviteData}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create password (minimum 6 characters)"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Department Selection (For public self-registration) */}
            {!inviteData && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                  Academic Department
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={isLoadingDepartments}
                  className="w-full bg-campus-surface border border-campus-border text-campus-text-primary text-sm rounded-input py-2 px-3 focus:border-campus-primary focus:outline-none disabled:opacity-60"
                >
                  {isLoadingDepartments ? (
                    <option value="">Loading departments...</option>
                  ) : departments.length === 0 ? (
                    <option value="">No departments available yet</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  )}
                </select>
                {departments.length === 0 && !isLoadingDepartments && (
                  <span className="text-[11px] text-campus-text-muted">
                    Departments will be assigned by campus administrators once created.
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Batch / Year (Optional)"
                name="batch"
                placeholder="e.g. 2024-2028"
                icon={Calendar}
                value={formData.batch}
                onChange={handleChange}
              />

              <Input
                label="Student / Staff ID (Optional)"
                name="studentId"
                placeholder="e.g. ROLL1042"
                icon={IdCard}
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-3 font-semibold"
            >
              {inviteToken ? 'Activate Account' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-campus-border text-center text-xs text-campus-text-secondary">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-campus-primary hover:underline"
          >
            Sign In with College ID
          </Link>
        </div>
      </div>
    </div>
  );
}
