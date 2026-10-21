import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Subtle backdrop overlay */}
      <div
        className="fixed inset-0 bg-[#242622]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative w-full bg-campus-surface border border-campus-border rounded-container shadow-modal overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150',
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-campus-border">
          <div>
            <h3 id="modal-title" className="font-semibold text-campus-text-primary text-base">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-campus-text-secondary mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-campus-text-secondary hover:text-campus-text-primary p-1 rounded-btn hover:bg-campus-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
