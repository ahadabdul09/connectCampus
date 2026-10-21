import React from 'react';
import { cn } from '../utils/cn.js';
import { getInitials } from '../utils/formatFileSize.js';

export function Avatar({
  src,
  name = 'Campus Member',
  size = 'md',
  isOnline = false,
  showStatus = false,
  className,
}) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const statusSizes = {
    sm: 'w-2 h-2 bottom-0 right-0 ring-1',
    md: 'w-2.5 h-2.5 bottom-0 right-0 ring-1.5',
    lg: 'w-3 h-3 bottom-0.5 right-0.5 ring-2',
    xl: 'w-3.5 h-3.5 bottom-1 right-1 ring-2',
  };

  // Generate deterministic subtle academic background color based on name
  const bgColors = [
    'bg-[#E5ECE9] text-[#245C4A]',
    'bg-[#F2ECE7] text-[#8C4A32]',
    'bg-[#EAECE6] text-[#42503A]',
    'bg-[#E7ECF0] text-[#2C485E]',
    'bg-[#EFEAE5] text-[#714D32]',
  ];

  const charCode = name ? name.charCodeAt(0) : 0;
  const colorClass = bgColors[charCode % bgColors.length];

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold tracking-wide border border-campus-border/50',
          sizes[size],
          colorClass
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={cn(
            'absolute rounded-full ring-white',
            statusSizes[size],
            isOnline ? 'bg-campus-state-success' : 'bg-campus-text-muted/60'
          )}
          title={isOnline ? 'Online now' : 'Offline'}
        />
      )}
    </div>
  );
}
