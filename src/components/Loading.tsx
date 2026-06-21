import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 'md',
  className,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className={cn('animate-spin text-secondary-400 mx-auto mb-3', sizeClasses[size])} />
          {text && <p className="text-dark-300 text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Loader2 className={cn('animate-spin text-secondary-400 mr-2', sizeClasses[size])} />
      {text && <span className="text-dark-400 text-sm">{text}</span>}
    </div>
  );
};

export default Loading;
