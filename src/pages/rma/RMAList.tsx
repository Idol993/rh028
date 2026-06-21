import React from 'react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components';

const RMAList: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="退货RMA管理"
        subtitle="退货申请、质检、退款全流程管理"
        breadcrumbs={[{ label: '退货RMA' }]}
      />

      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-12 text-center">
        <Construction className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">页面开发中</h2>
        <p className="text-dark-400">退货RMA管理功能正在开发中，敬请期待</p>
      </div>
    </div>
  );
};

export default RMAList;
