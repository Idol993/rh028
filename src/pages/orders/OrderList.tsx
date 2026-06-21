import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, StatusBadge, PlatformBadge, Loading, Empty } from '@/components';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format';
import { getOrders, syncOrders } from '@/api/orders';
import { stores, warehouses, platforms, platformNames } from '@/mock/data';
import type { Order } from '@/@types/order';

const orderStatusColors: Record<string, 'pending' | 'processing' | 'success' | 'danger' | 'default'> = {
  pending: 'pending',
  risk_review: 'danger',
  allocated: 'processing',
  picking: 'processing',
  packing: 'processing',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'default',
};

const orderStatusNames: Record<string, string> = {
  pending: '待审核',
  risk_review: '风控审核',
  allocated: '已分仓',
  picking: '拣货中',
  packing: '打包中',
  shipped: '已发货',
  delivered: '已签收',
  cancelled: '已取消',
  returned: '已退货',
};

export const OrderList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOrders({ page, pageSize });
      if (res.code === 200 && res.data) {
        setOrders(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncOrders();
      if (res.code === 200 && res.data) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to sync orders:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="订单管理"
        subtitle="多平台订单统一管理，支持智能分仓、自动审单、物流追踪"
        breadcrumbs={[{ label: '订单管理' }, { label: '订单列表' }]}
        actions={
          <>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
              {syncing ? '同步中...' : '同步订单'}
            </button>
            <button className="btn btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建订单
            </button>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索订单号、平台订单号、买家信息..."
              className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500"
            />
          </div>
          <select className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-secondary-500">
            <option value="">全部平台</option>
            {platforms.map(p => (
              <option key={p} value={p}>{platformNames[p]}</option>
            ))}
          </select>
          <select className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-secondary-500">
            <option value="">全部店铺</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.storeName}</option>
            ))}
          </select>
          <select className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-secondary-500">
            <option value="">全部状态</option>
            {Object.entries(orderStatusNames).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select className="px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-secondary-500">
            <option value="">全部仓库</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            更多筛选
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
        {loading ? (
          <Loading text="加载订单数据..." />
        ) : orders.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-[140px]">订单号</th>
                    <th className="w-[100px]">平台</th>
                    <th className="w-[140px]">平台订单号</th>
                    <th>商品信息</th>
                    <th className="w-[100px]">数量</th>
                    <th className="w-[100px]">金额</th>
                    <th className="w-[100px]">国家</th>
                    <th className="w-[120px]">仓库</th>
                    <th className="w-[100px]">状态</th>
                    <th className="w-[160px]">创建时间</th>
                    <th className="w-[100px]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono text-xs text-primary-400">{order.orderNo}</td>
                      <td>
                        <PlatformBadge platform={order.platform} showIcon={false} />
                      </td>
                      <td className="font-mono text-xs text-dark-400">{order.platformOrderNo}</td>
                      <td className="max-w-[250px]">
                        <div className="truncate" title={order.items[0]?.productName}>
                          {order.items[0]?.productName || '-'}
                        </div>
                        {order.items.length > 1 && (
                          <div className="text-xs text-dark-500">等 {order.items.length} 件商品</div>
                        )}
                      </td>
                      <td className="font-numeric">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className="font-numeric text-success-400">{formatCurrency(order.totalAmount)}</td>
                      <td>{order.country}</td>
                      <td className="text-xs text-dark-400">{order.warehouseName || '-'}</td>
                      <td>
                        <StatusBadge
                          status={orderStatusColors[order.status]}
                          text={orderStatusNames[order.status]}
                        />
                      </td>
                      <td className="text-xs text-dark-400">{formatDateTime(order.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded text-dark-400 hover:text-white hover:bg-dark-700 transition-colors" title="查看详情">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded text-dark-400 hover:text-white hover:bg-dark-700 transition-colors" title="编辑">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-dark-700 flex items-center justify-between">
              <div className="text-sm text-dark-400">
                共 <span className="font-medium text-white">{formatNumber(total)}</span> 条记录
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-3 py-1.5 text-sm text-white">
                  {page} / {Math.ceil(total / pageSize)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;
