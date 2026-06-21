import React from 'react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components';

const ProfitReport: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="利润报表"
        subtitle="多维度利润分析，精准掌握经营状况"
        breadcrumbs={[{ label: '财务核算' }, { label: '利润报表' }]}
      />

      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-12 text-center">
        <Construction className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">页面开发中</h2>
        <p className="text-dark-400">利润报表功能正在开发中，敬请期待</p>
      </div>
    </div>
  );
};

export default ProfitReport;
