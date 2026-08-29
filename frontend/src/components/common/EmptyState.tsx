import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-stone-50/60 rounded-3xl border border-dashed border-stone-200 my-4">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600 mb-4 border border-stone-100">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-stone-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
