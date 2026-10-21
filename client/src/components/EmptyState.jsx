import React from 'react';
import { cn } from '../utils/cn.js';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-campus-border rounded-card bg-campus-surface/50',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-campus-secondary flex items-center justify-center text-campus-text-secondary mb-3.5">
          <Icon className="w-6 h-6 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-campus-text-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-campus-text-secondary max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
