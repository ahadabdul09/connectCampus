import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-campus-surface border-t border-campus-border py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded bg-campus-primary flex items-center justify-center text-white text-[10px] font-bold">
              cC
            </div>
            <span className="font-serif font-bold text-base text-campus-text-primary tracking-tight">
              connectCampus
            </span>
          </div>
          <p className="text-xs text-campus-text-secondary max-w-sm">
            The communication and academic collaboration platform designed for college students, faculty, clubs, and departments.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-campus-text-secondary">
          <Link to="/" className="hover:text-campus-text-primary transition-colors">
            Overview
          </Link>
          <Link to="/login" className="hover:text-campus-text-primary transition-colors">
            Student Login
          </Link>
          <Link to="/register" className="hover:text-campus-text-primary transition-colors">
            Register
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-campus-text-primary transition-colors"
          >
            GitHub Project
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-campus-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-campus-text-muted gap-2">
        <p>© 2026 connectCampus. Built for university academic communities.</p>
        <p>Your campus, in one place.</p>
      </div>
    </footer>
  );
}
