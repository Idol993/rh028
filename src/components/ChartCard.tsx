import React from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Download, RefreshCw } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number | string;
  showActions?: boolean;
  onRefresh?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  height = 300,
  showActions = true,
  onRefresh,
  onDownload,
  className,
}) => {
  return (
    <div className={cn(
      'rounded-xl border border-dark-700 bg-dark-800/50 overflow-hidden card-hover',
      className
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
        <div>
          <h3 className="text-base font-medium text-white">{title}</h3>
          {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}
        </div>
        {showActions && (
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                title="刷新数据"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                title="导出数据"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="p-5" style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
