import React from 'react';
import { cn } from '@/lib/utils';
import { PackageSearch, Inbox, FileQuestion, AlertCircle } from 'lucide-react';

type EmptyType = 'default' | 'data' | 'search' | 'error';

interface EmptyProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  type = 'default',
  title,
  description,
  icon,
  action,
  className,
}) => {
  const config: Record<EmptyType, { icon: React.ReactNode; title: string; description: string }> = {
    default: {
      icon: <Inbox className="w-12 h-12 text-dark-500" />,
      title: '暂无数据',
      description: '当前没有任何数据',
    },
    data: {
      icon: <PackageSearch className="w-12 h-12 text-dark-500" />,
      title: '没有找到记录',
      description: '请尝试调整筛选条件或稍后再试',
    },
    search: {
      icon: <FileQuestion className="w-12 h-12 text-dark-500" />,
      title: '没有匹配结果',
      description: '请尝试使用其他关键词搜索',
    },
    error: {
      icon: <AlertCircle className="w-12 h-12 text-danger-400" />,
      title: '加载失败',
      description: '数据加载出现问题，请刷新页面重试',
    },
  };

  const currentConfig = config[type];

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="mb-4">
        {icon || currentConfig.icon}
      </div>
      <h3 className="text-lg font-medium text-dark-300 mb-2">
        {title || currentConfig.title}
      </h3>
      <p className="text-sm text-dark-500 text-center max-w-md mb-4">
        {description || currentConfig.description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default Empty;
