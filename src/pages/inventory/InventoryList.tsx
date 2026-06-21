import React from 'react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components';

const InventoryList: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="库存查询"
        subtitle="多仓库库存实时查询，库存状态一目了然"
        breadcrumbs={[{ label: '库存管理' }, { label: '库存查询' }]}
      />

      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-12 text-center">
        <Construction className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">页面开发中</h2>
        <p className="text-dark-400">库存查询功能正在开发中，敬请期待</p>
      </div>
    </div>
  );
};

export default InventoryList;
