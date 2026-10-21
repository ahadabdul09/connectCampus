import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function NotFoundPage() {
  usePageTitle('Page Not Found');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-full bg-campus-secondary flex items-center justify-center text-campus-text-secondary mb-4">
        <Compass className="w-6 h-6 stroke-[1.5]" />
      </div>

      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-campus-accent mb-2">
        Error 404 • Resource Unavailable
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-campus-text-primary tracking-tight mb-3">
        Campus Page Not Found
      </h1>

      <p className="text-xs sm:text-sm text-campus-text-secondary max-w-md mb-8 leading-relaxed">
        The requested channel, document path, or page link could not be located on the connectCampus server. It may have been moved or archived.
      </p>

      <Link to="/dashboard">
        <Button size="sm">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
