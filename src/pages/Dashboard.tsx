import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  AlertCircle,
  PackageCheck,
  PackageX,
  Boxes,
  AlertOctagon,
} from 'lucide-react';
import * as echarts from 'echarts';
import { PageHeader, StatCard, ChartCard, StatusBadge, PlatformBadge, Loading, Empty } from '@/components';
import { formatCurrency, formatDateTime, formatPercent, formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import { getOrderStats } from '@/api/orders';
import { getFinanceStats } from '@/api/finance';
import { getLogisticsStats } from '@/api/logistics';
import { getInventoryStats } from '@/api/inventory';
import { getOrders } from '@/api/orders';
import { getInventoryAlerts } from '@/api/inventory';
import type { Order } from '@/@types/order';
import type { InventoryAlert } from '@/@types/inventory';

interface DashboardData {
  orderStats: Awaited<ReturnType<typeof getOrderStats>>['data'];
  financeStats: Awaited<ReturnType<typeof getFinanceStats>>['data'];
  logisticsStats: Awaited<ReturnType<typeof getLogisticsStats>>['data'];
  inventoryStats: Awaited<ReturnType<typeof getInventoryStats>>['data'];
  recentOrders: Order[];
  alerts: InventoryAlert[];
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const orderTrendChartRef = useRef<HTMLDivElement>(null);
  const platformChartRef = useRef<HTMLDivElement>(null);
  const warehouseChartRef = useRef<HTMLDivElement>(null);
  const logisticsChartRef = useRef<HTMLDivElement>(null);
  const profitTrendChartRef = useRef<HTMLDivElement>(null);
  const orderTrendChartInstance = useRef<echarts.ECharts | null>(null);
  const platformChartInstance = useRef<echarts.ECharts | null>(null);
  const warehouseChartInstance = useRef<echarts.ECharts | null>(null);
  const logisticsChartInstance = useRef<echarts.ECharts | null>(null);
  const profitTrendChartInstance = useRef<echarts.ECharts | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, financeRes, logisticsRes, inventoryRes, ordersRes, alertsRes] = await Promise.all([
        getOrderStats(),
        getFinanceStats(),
        getLogisticsStats(),
        getInventoryStats(),
        getOrders({ page: 1, pageSize: 5 }),
        getInventoryAlerts({ page: 1, pageSize: 5 }),
      ]);

      setData({
        orderStats: orderRes.data!,
        financeStats: financeRes.data!,
        logisticsStats: logisticsRes.data!,
        inventoryStats: inventoryRes.data!,
        recentOrders: ordersRes.data!.list,
        alerts: alertsRes.data!.list,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!data || loading) return;

    // Order Trend Chart
    if (orderTrendChartRef.current) {
      if (orderTrendChartInstance.current) {
        orderTrendChartInstance.current.dispose();
      }
      orderTrendChartInstance.current = echarts.init(orderTrendChartRef.current);
      
      const days = Array.from({ length: 15 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (14 - i));
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });

      const orderData = days.map(() => Math.floor(Math.random() * 300) + 100);
      const shippedData = days.map(() => Math.floor(Math.random() * 250) + 80);

      orderTrendChartInstance.current.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          textStyle: { color: '#F8FAFC' },
        },
        legend: {
          data: ['订单量', '发货量'],
          textStyle: { color: '#94A3B8' },
          right: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: days,
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#64748B', fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#64748B', fontSize: 11 },
          splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
        },
        series: [
          {
            name: '订单量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: '#0EA5E9' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(14, 165, 233, 0.3)' },
                { offset: 1, color: 'rgba(14, 165, 233, 0)' },
              ]),
            },
            data: orderData,
          },
          {
            name: '发货量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: '#10B981' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' },
              ]),
            },
            data: shippedData,
          },
        ],
      });
    }

    // Platform Distribution Chart
    if (platformChartRef.current) {
      if (platformChartInstance.current) {
        platformChartInstance.current.dispose();
      }
      platformChartInstance.current = echarts.init(platformChartRef.current);

      const platformData = [
        { value: 35, name: 'Amazon' },
        { value: 25, name: 'Shopify' },
        { value: 18, name: 'Temu' },
        { value: 12, name: 'TikTok Shop' },
        { value: 6, name: 'eBay' },
        { value: 4, name: '其他' },
      ];

      platformChartInstance.current.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          textStyle: { color: '#F8FAFC' },
          formatter: '{b}: {c}%',
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { color: '#94A3B8', fontSize: 11 },
          itemWidth: 10,
          itemHeight: 10,
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#1E293B',
              borderWidth: 2,
            },
            label: { show: false },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
                color: '#F8FAFC',
              },
            },
            data: platformData,
            color: ['#FF9900', '#96BF48', '#FF5C00', '#000000', '#E53238', '#64748B'],
          },
        ],
      });
    }

    // Warehouse Distribution Chart
    if (warehouseChartRef.current) {
      if (warehouseChartInstance.current) {
        warehouseChartInstance.current.dispose();
      }
      warehouseChartInstance.current = echarts.init(warehouseChartRef.current);

      warehouseChartInstance.current.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          textStyle: { color: '#F8FAFC' },
          axisPointer: { type: 'shadow' },
        },
        legend: {
          data: ['可用库存', '在途库存', '预留库存'],
          textStyle: { color: '#94A3B8', fontSize: 11 },
          right: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['洛杉矶仓', '新泽西仓', '柏林仓', '伦敦仓', '东京仓'],
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#64748B', fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#64748B', fontSize: 11 },
          splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
        },
        series: [
          {
            name: '可用库存',
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#0EA5E9', borderRadius: [0, 0, 0, 0] },
            data: [25000, 18000, 12000, 15000, 8000],
          },
          {
            name: '在途库存',
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#F97316' },
            data: [5000, 3000, 2000, 2500, 1500],
          },
          {
            name: '预留库存',
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
            data: [3000, 2500, 1500, 1800, 1000],
          },
        ],
      });
    }

    // Logistics Chart
    if (logisticsChartRef.current) {
      if (logisticsChartInstance.current) {
        logisticsChartInstance.current.dispose();
      }
      logisticsChartInstance.current = echarts.init(logisticsChartRef.current);

      logisticsChartInstance.current.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          textStyle: { color: '#F8FAFC' },
        },
        legend: {
          data: ['平均时效', '准时率'],
          textStyle: { color: '#94A3B8', fontSize: 11 },
          right: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['USPS', 'UPS', 'FedEx', 'DHL', 'Royal Mail'],
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#64748B', fontSize: 11 },
        },
        yAxis: [
          {
            type: 'value',
            name: '天数',
            position: 'left',
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#64748B', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
          },
          {
            type: 'value',
            name: '准时率',
            position: 'right',
            max: 100,
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#64748B', fontSize: 11, formatter: '{value}%' },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: '平均时效',
            type: 'bar',
            yAxisIndex: 0,
            itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] },
            data: [5, 3, 4, 7, 6],
          },
          {
            name: '准时率',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#F472B6' },
            lineStyle: { width: 2 },
            data: [92, 96, 94, 88, 90],
          },
        ],
      });
    }

    const handleResize = () => {
      orderTrendChartInstance.current?.resize();
      platformChartInstance.current?.resize();
      warehouseChartInstance.current?.resize();
      logisticsChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      orderTrendChartInstance.current?.dispose();
      platformChartInstance.current?.dispose();
      warehouseChartInstance.current?.dispose();
      logisticsChartInstance.current?.dispose();
    };
  }, [data, loading]);

  if (loading) {
    return <Loading text="正在加载运营数据..." />;
  }

  if (!data) {
    return <Empty type="error" title="数据加载失败" description="请刷新页面重试" />;
  }

  const { orderStats, financeStats, logisticsStats, inventoryStats, recentOrders, alerts } = data;

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

  const alertLevelColors: Record<string, 'pending' | 'processing' | 'success' | 'danger'> = {
    low: 'processing',
    medium: 'pending',
    high: 'danger',
  };

  const alertTypeNames: Record<string, string> = {
    low_stock: '库存不足',
    over_stock: '库存积压',
    expiry: '即将过期',
    quality: '质量问题',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="运营大屏"
        subtitle="实时监控全平台订单、库存、物流、财务核心指标"
        breadcrumbs={[{ label: '运营大屏' }]}
        actions={
          <>
            <button
              onClick={fetchData}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新数据
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选条件
            </button>
          </>
        }
      />

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="今日订单"
          value={formatNumber(orderStats.todayOrders)}
          unit="单"
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={12.5}
          trendLabel="较昨日"
          color="primary"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="待审风险单"
          value={formatNumber(orderStats.riskReview)}
          unit="单"
          icon={<ShieldAlert className="w-6 h-6" />}
          trend={-5.2}
          trendLabel="较昨日"
          color="danger"
          onClick={() => navigate('/risk?reviewStatus=pending_review')}
        />
        <StatCard
          title="待拣货"
          value={formatNumber(orderStats.picking + orderStats.allocated)}
          unit="单"
          icon={<Boxes className="w-6 h-6" />}
          trend={3.8}
          trendLabel="较昨日"
          color="warning"
          onClick={() => navigate('/orders?fulfillmentStatus=picking')}
        />
        <StatCard
          title="待打包"
          value={formatNumber(orderStats.packing)}
          unit="单"
          icon={<PackageCheck className="w-6 h-6" />}
          trend={1.5}
          trendLabel="较昨日"
          color="warning"
          onClick={() => navigate('/orders?fulfillmentStatus=packing')}
        />
        <StatCard
          title="在途包裹"
          value={formatNumber(logisticsStats.inTransit || 2368)}
          unit="件"
          icon={<Truck className="w-6 h-6" />}
          trend={6.7}
          trendLabel="较昨日"
          color="secondary"
          onClick={() => navigate('/logistics?status=in_transit')}
        />
        <StatCard
          title="异常包裹"
          value={formatNumber(logisticsStats.exceptions || 42)}
          unit="件"
          icon={<AlertOctagon className="w-6 h-6" />}
          trend={-12.3}
          trendLabel="较昨日"
          color="danger"
          onClick={() => navigate('/logistics?status=exception')}
        />
        <StatCard
          title="库存预警"
          value={formatNumber(inventoryStats.lowStockCount + (inventoryStats.outOfStockCount || 0))}
          unit="SKU"
          icon={<AlertCircle className="w-6 h-6" />}
          trend={4.1}
          trendLabel="较昨日"
          color="warning"
          onClick={() => navigate('/inventory?alert=low')}
        />
        <StatCard
          title="今日利润"
          value={formatCurrency(financeStats.todayProfit || 4268)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={9.4}
          trendLabel="较昨日"
          color="success"
          onClick={() => navigate('/finance/profit')}
        />
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: '待审核', value: orderStats.pending, color: 'warning' as const, icon: <Clock className="w-4 h-4" />, path: '/orders?status=pending' },
          { label: '风控审核', value: orderStats.riskReview, color: 'danger' as const, icon: <ShieldAlert className="w-4 h-4" />, path: '/risk?reviewStatus=pending_review' },
          { label: '已分仓', value: orderStats.allocated, color: 'secondary' as const, icon: <Package className="w-4 h-4" />, path: '/orders?fulfillmentStatus=allocated' },
          { label: '拣货中', value: orderStats.picking, color: 'secondary' as const, icon: <Package className="w-4 h-4" />, path: '/orders?fulfillmentStatus=picking' },
          { label: '打包中', value: orderStats.packing, color: 'secondary' as const, icon: <Package className="w-4 h-4" />, path: '/orders?fulfillmentStatus=packing' },
          { label: '已发货', value: orderStats.shipped, color: 'success' as const, icon: <Truck className="w-4 h-4" />, path: '/orders?fulfillmentStatus=shipped' },
          { label: '已退货', value: orderStats.returned, color: 'default' as const, icon: <RotateCcw className="w-4 h-4" />, path: '/rma' },
          { label: '已取消', value: orderStats.cancelled, color: 'danger' as const, icon: <AlertTriangle className="w-4 h-4" />, path: '/orders?status=cancelled' },
        ].map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 card-hover cursor-pointer hover:shadow-lg hover:shadow-primary-500/10 hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-dark-400">{item.label}</span>
              <span className={cn('p-1.5 rounded-lg', {
                'bg-warning-500/20 text-warning-400': item.color === 'warning',
                'bg-danger-500/20 text-danger-400': item.color === 'danger',
                'bg-secondary-500/20 text-secondary-400': item.color === 'secondary',
                'bg-success-500/20 text-success-400': item.color === 'success',
                'bg-dark-700 text-dark-400': item.color === 'default',
              })}>
                {item.icon}
              </span>
            </div>
            <p className="text-2xl font-bold font-numeric text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="订单趋势"
          subtitle="近15天订单量与发货量趋势"
          className="lg:col-span-2"
          height={320}
          onRefresh={fetchData}
        >
          <div ref={orderTrendChartRef} className="w-full h-full" />
        </ChartCard>
        <ChartCard
          title="平台分布"
          subtitle="各平台销售占比"
          height={320}
          onRefresh={fetchData}
        >
          <div ref={platformChartRef} className="w-full h-full" />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="仓库库存分布"
          subtitle="各海外仓库存情况"
          height={320}
          onRefresh={fetchData}
        >
          <div ref={warehouseChartRef} className="w-full h-full" />
        </ChartCard>
        <ChartCard
          title="物流时效分析"
          subtitle="各物流商时效与准时率"
          height={320}
          onRefresh={fetchData}
        >
          <div ref={logisticsChartRef} className="w-full h-full" />
        </ChartCard>
      </div>

      {/* Bottom Row - Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">最新订单</h3>
              <p className="text-xs text-dark-400 mt-0.5">最近同步的平台订单</p>
            </div>
            <button className="text-sm text-secondary-400 hover:text-secondary-300 flex items-center gap-1">
              查看全部
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>平台</th>
                  <th>商品</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs text-primary-400">{order.orderNo}</td>
                    <td>
                      <PlatformBadge platform={order.platform} showIcon={false} />
                    </td>
                    <td className="max-w-[200px] truncate">
                      {order.items[0]?.productName || '-'}
                    </td>
                    <td className="font-numeric text-success-400">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>
                      <StatusBadge
                        status={orderStatusColors[order.status]}
                        text={orderStatusNames[order.status]}
                      />
                    </td>
                    <td className="text-dark-400 text-xs">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">库存预警</h3>
              <p className="text-xs text-dark-400 mt-0.5">需要关注的库存异常</p>
            </div>
            <span className="px-2 py-1 bg-danger-500/20 text-danger-400 text-xs rounded-full border border-danger-500/30">
              {alerts.length} 条预警
            </span>
          </div>
          <div className="divide-y divide-dark-700/50">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-5 py-4 hover:bg-dark-700/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge
                        status={alertLevelColors[alert.level]}
                        text={alertTypeNames[alert.type]}
                        size="sm"
                      />
                      <span className="text-xs text-dark-500 font-mono">{alert.sku}</span>
                    </div>
                    <p className="text-sm text-white truncate">{alert.productName}</p>
                    <p className="text-xs text-dark-400 mt-1">
                      {alert.warehouseName} · 当前库存: {alert.currentQty ?? alert.currentQuantity} · 安全库存: {alert.safetyStock ?? alert.threshold}
                    </p>
                  </div>
                  <AlertTriangle className={cn('w-4 h-4 flex-shrink-0 mt-1', {
                    'text-danger-400': (alert.level as string) === 'danger' || (alert.level as string) === 'high',
                    'text-warning-400': (alert.level as string) === 'warning' || (alert.level as string) === 'medium',
                    'text-secondary-400': (alert.level as string) === 'info' || (alert.level as string) === 'low',
                  })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-600/10 via-secondary-600/10 to-primary-600/10 border border-primary-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-medium text-white">快捷操作</h3>
            <p className="text-sm text-dark-400 mt-1">快速处理日常运营任务</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary">
              <ShoppingCart className="w-4 h-4" />
              同步平台订单
            </button>
            <button className="btn btn-secondary">
              <ShieldAlert className="w-4 h-4" />
              处理风控订单
            </button>
            <button className="btn btn-secondary">
              <Package className="w-4 h-4" />
              生成拣货波次
            </button>
            <button className="btn btn-secondary">
              <BarChart3 className="w-4 h-4" />
              导出利润报表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
