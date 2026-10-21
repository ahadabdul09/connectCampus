import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { DEMO_ACCOUNTS } from '../constants/index.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function LoginPage() {
  usePageTitle('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your college email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-campus-text-primary tracking-tight">
          Sign In to connectCampus
        </h1>
        <p className="text-xs text-campus-text-secondary mt-2">
          Access your department channels, messages, and academic documents.
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
            label="College Email"
            type="email"
            placeholder="e.g. abdul.ahad@campus.edu"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-campus-text-secondary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-campus-border text-campus-primary focus:ring-campus-primary"
              />
              <span>Remember session</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Please contact your department systems administrator to reset institutional credentials.')}
              className="text-campus-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 font-semibold"
          >
            Sign In
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-campus-border text-center text-xs text-campus-text-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-campus-primary hover:underline"
          >
            Register with College ID
          </Link>
        </div>
      </div>

      {/* Quick 1-Click Demo Selector Helper */}
      <div className="mt-8 p-4 rounded-card border border-campus-border bg-campus-secondary/40 text-xs">
        <span className="font-semibold text-campus-text-primary block mb-2">
          Demo Accounts (1-Click Fill):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((acc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectDemo(acc)}
              className="px-2.5 py-1 rounded bg-campus-surface border border-campus-border text-[11px] font-medium text-campus-text-primary hover:bg-campus-secondary transition-colors"
            >
              {acc.roleName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
