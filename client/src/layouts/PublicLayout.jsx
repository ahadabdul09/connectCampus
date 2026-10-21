import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Footer } from '../components/Footer.jsx';
import { Button } from '../components/Button.jsx';
import { useAuthStore } from '../stores/authStore.js';

export function PublicLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-campus-bg text-campus-text-primary">
      {/* Editorial Public Header */}
      <header className="h-16 border-b border-campus-border bg-campus-surface/90 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-btn bg-campus-primary flex items-center justify-center text-white font-bold text-sm shadow-subtle">
            cC
          </div>
          <span className="font-serif font-bold text-xl text-campus-text-primary tracking-tight">
            connectCampus
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
