import React from 'react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components';

const PackingTask: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="打包出库"
        subtitle="快速打包发货，自动生成物流面单"
        breadcrumbs={[{ label: 'WMS作业' }, { label: '打包出库' }]}
      />

      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-12 text-center">
        <Construction className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">页面开发中</h2>
        <p className="text-dark-400">打包出库功能正在开发中，敬请期待</p>
      </div>
    </div>
  );
};

export default PackingTask;
