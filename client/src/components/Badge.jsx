import React from 'react';
import { cn } from '../utils/cn.js';

export function Badge({ children, variant = 'neutral', className }) {
  const variants = {
    neutral: 'bg-campus-secondary text-campus-text-secondary border-campus-border/60',
    primary: 'bg-campus-primary-light text-campus-primary border-campus-primary/20',
    accent: 'bg-campus-accent-light text-campus-accent border-campus-accent/30',
    urgent: 'bg-[#F9ECEB] text-campus-state-error border-campus-state-error/30 font-medium',
    success: 'bg-[#EBF5EE] text-campus-state-success border-campus-state-success/30',
    warning: 'bg-[#FAF2E6] text-campus-state-warning border-campus-state-warning/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2 py-0.5 rounded border leading-tight font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
