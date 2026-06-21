import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'processing' | 'success' | 'danger' | 'default';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
  className?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className, showDot = true, size = 'md' }) => {
  const statusClasses: Record<StatusType, string> = {
    pending: 'status-pending',
    processing: 'status-processing',
    success: 'status-success',
    danger: 'status-danger',
    default: 'status-default',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn('status-badge', statusClasses[status], sizeClasses[size], className)}>
      {showDot && (
        <span className={cn('rounded-full mr-1.5', {
          'w-1 h-1': size === 'sm',
          'w-1.5 h-1.5': size === 'md',
          'bg-warning-400': status === 'pending',
          'bg-secondary-400': status === 'processing',
          'bg-success-400': status === 'success',
          'bg-danger-400': status === 'danger',
          'bg-dark-400': status === 'default',
        })} />
      )}
      {text}
    </span>
  );
};

export default StatusBadge;
