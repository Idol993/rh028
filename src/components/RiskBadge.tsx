import React from 'react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/@types/risk';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, className }) => {
  const levelConfig: Record<RiskLevel, { class: string; text: string }> = {
    low: { class: 'risk-low', text: '低风险' },
    medium: { class: 'risk-medium', text: '中风险' },
    high: { class: 'risk-high', text: '高风险' },
  };

  return (
    <span className={cn('status-badge', levelConfig[level].class, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-success-400': level === 'low',
        'bg-warning-400': level === 'medium',
        'bg-danger-400': level === 'high',
      })} />
      {levelConfig[level].text}
      {score !== undefined && <span className="ml-1 opacity-75">({score})</span>}
    </span>
  );
};

export default RiskBadge;
