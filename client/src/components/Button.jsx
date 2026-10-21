import React from 'react';
import { cn } from '../utils/cn.js';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-btn';

  const variants = {
    primary:
      'bg-campus-primary text-white hover:bg-campus-primary-hover active:bg-campus-primary-hover shadow-subtle',
    secondary:
      'bg-campus-secondary text-campus-text-primary hover:bg-[#E4E2DC] active:bg-[#DCDAD4] border border-campus-border/60',
    outline:
      'border border-campus-border text-campus-text-primary hover:bg-campus-secondary/60 active:bg-campus-secondary',
    accent:
      'bg-campus-accent text-white hover:bg-campus-accent-hover active:bg-campus-accent-hover shadow-subtle',
    danger:
      'bg-campus-state-error text-white hover:bg-[#A34343] active:bg-[#8F3A3A]',
    ghost:
      'text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary/60',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
