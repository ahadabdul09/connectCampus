import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, Calendar, IdCard, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { communityService } from '../services/communityService.js';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function RegisterPage() {
  usePageTitle('Register');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    departmentId: '',
    batch: '2023-2027',
    studentId: '',
    role: 'STUDENT',
  });
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadDepartments() {
      try {
        setIsLoadingDepartments(true);
        const data = await communityService.getDepartments();
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setDepartments(list);
          if (list.length > 0) {
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
  }, []);

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

    if (!formData.email.includes('@')) {
      setError('Please provide a valid academic email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
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
          Create Campus Account
        </h1>
        <p className="text-xs text-campus-text-secondary mt-2">
          Join your college batch channels, academic communities, and events.
        </p>
      </div>

      <div className="bg-campus-surface border border-campus-border rounded-container p-6 sm:p-8 shadow-subtle">
        {error && (
          <div className="mb-5 p-3 rounded-card bg-[#F9ECEB] border border-campus-state-error/30 text-campus-state-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="e.g. Abdul Ahad"
            icon={User}
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <Input
            label="College Email"
            name="email"
            type="email"
            placeholder="e.g. abdul.ahad@campus.edu"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Department
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
                  <option value="">No departments available</option>
                ) : (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Campus Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-campus-surface border border-campus-border text-campus-text-primary text-sm rounded-input py-2 px-3 focus:border-campus-primary focus:outline-none"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty Member</option>
                <option value="CLUB_COORDINATOR">Club Coordinator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch / Year"
              name="batch"
              placeholder="e.g. 2023-2027"
              icon={Calendar}
              value={formData.batch}
              onChange={handleChange}
            />

            <Input
              label="College Roll / Student ID"
              name="studentId"
              placeholder="e.g. 1MS23IS002"
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
            Complete Registration
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

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
