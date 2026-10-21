import React from 'react';
import { cn } from '../utils/cn.js';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-campus-secondary/80', className)}
      {...props}
    />
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 max-w-[65%]">
          <Skeleton className="w-24 h-3.5" />
          <Skeleton className="w-56 h-10 rounded-card" />
        </div>
      </div>
      <div className="flex items-start gap-3 justify-end">
        <div className="flex flex-col items-end gap-1.5 max-w-[65%]">
          <Skeleton className="w-20 h-3.5" />
          <Skeleton className="w-48 h-8 rounded-card" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      </div>
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 max-w-[65%]">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-72 h-14 rounded-card" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-campus-surface border border-campus-border rounded-card p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-3.5" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-12" />
      <div className="flex justify-between items-center pt-2 border-t border-campus-border/40">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-14 h-6 rounded" />
      </div>
    </div>
  );
}
