import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  color = 'primary',
  className,
}) => {
  const colorClasses = {
    primary: 'from-primary-600/20 to-primary-600/5 border-primary-500/30',
    success: 'from-success-600/20 to-success-600/5 border-success-500/30',
    warning: 'from-warning-600/20 to-warning-600/5 border-warning-500/30',
    danger: 'from-danger-600/20 to-danger-600/5 border-danger-500/30',
    secondary: 'from-secondary-600/20 to-secondary-600/5 border-secondary-500/30',
  };

  const iconColorClasses = {
    primary: 'text-primary-400 bg-primary-500/20',
    success: 'text-success-400 bg-success-500/20',
    warning: 'text-warning-400 bg-warning-500/20',
    danger: 'text-danger-400 bg-danger-500/20',
    secondary: 'text-secondary-400 bg-secondary-500/20',
  };

  return (
    <div className={cn(
      'rounded-xl p-5 border bg-gradient-to-br card-hover',
      colorClasses[color],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-dark-400 mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-numeric text-white">{value}</span>
            {unit && <span className="text-sm text-dark-400">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-success-400" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-danger-400" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-dark-400" />
              )}
              <span className={cn('text-xs font-medium', {
                'text-success-400': trend > 0,
                'text-danger-400': trend < 0,
                'text-dark-400': trend === 0,
              })}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-xs text-dark-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg', iconColorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
