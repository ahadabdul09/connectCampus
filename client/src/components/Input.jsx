import React, { forwardRef } from 'react';
import { cn } from '../utils/cn.js';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className,
      id,
      type = 'text',
      icon: Icon,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-campus-text-secondary pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'w-full bg-campus-surface border border-campus-border text-campus-text-primary text-sm rounded-input py-2 px-3 placeholder:text-campus-text-muted focus:border-campus-primary focus:ring-1 focus:ring-campus-primary focus:outline-none transition-colors disabled:bg-campus-secondary/50 disabled:cursor-not-allowed',
              Icon && 'pl-9',
              error && 'border-campus-state-error focus:border-campus-state-error focus:ring-campus-state-error',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-campus-state-error">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-campus-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
