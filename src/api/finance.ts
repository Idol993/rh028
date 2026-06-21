import type { ApiResponse } from '@/@types/api';
import type { CostDetail, CostDetailItem, ProfitReport, Expense, FinanceStats, Transaction } from '@/@types/finance';
import { mockRequest, mockPageRequest } from './client';
import { mockCostDetails, mockProfitReports, mockExpenses, mockTransactions, mockFinanceStats, mockOrders } from '@/mock/data';

const orderProfitCache = new Map<string, any>();

const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

const getDeterministicValue = (seed: string, min: number, max: number): number => {
  return min + seededRandom(seed) * (max - min);
};

export const getCostDetails = async (params: { 
  page?: number; 
  pageSize?: number; 
  orderId?: string; 
  storeId?: string; 
  warehouseId?: string;
  isSettled?: boolean;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: CostDetail[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockCostDetails];
  
  if (params.orderId) {
    filtered = filtered.filter(c => c.orderId === params.orderId);
  }
  if (params.storeId) {
    filtered = filtered.filter(c => c.storeId === params.storeId);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(c => c.warehouseId === params.warehouseId);
  }
  if (params.isSettled !== undefined) {
    filtered = filtered.filter(c => c.isSettled === params.isSettled);
  }
  if (params.startDate) {
    filtered = filtered.filter(c => c.createdAt >= params.startDate!);
  }
  if (params.endDate) {
    filtered = filtered.filter(c => c.createdAt <= params.endDate!);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(c => 
      c.orderNo.toLowerCase().includes(kw) ||
      c.storeName.toLowerCase().includes(kw)
    );
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getCostDetail = async (id: string): Promise<ApiResponse<CostDetail>> => {
  const detail = mockCostDetails.find(c => c.id === id) || mockCostDetails[0];
  return mockRequest(detail);
};

export const getProfitReports = async (params: { 
  page?: number; 
  pageSize?: number; 
  period?: string; 
  platform?: string; 
  storeId?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{ list: ProfitReport[]; total: number; page: number; pageSize: number }>> => {
  const allOrders = mockOrders.filter(o => {
    if (params.platform && o.platform !== params.platform) return false;
    if (params.storeId && o.storeId !== params.storeId) return false;
    if (params.startDate && o.createdAt < params.startDate) return false;
    if (params.endDate && o.createdAt > params.endDate) return false;
    return true;
  });
  
  const groups: Array<{ key: string; platform: string; platformName: string; storeId: string; storeName: string; warehouseId?: string; warehouseName?: string; orders: typeof allOrders }> = [];
  
  const platformNames: Record<string, string> = {
    amazon: 'Amazon',
    shopify: 'Shopify',
    temu: 'Temu',
    tiktok: 'TikTok Shop',
    ebay: 'eBay',
  };
  
  const byPlatform = new Map<string, typeof allOrders>();
  allOrders.forEach(order => {
    const key = order.platform;
    if (!byPlatform.has(key)) byPlatform.set(key, []);
    byPlatform.get(key)!.push(order);
  });
  
  byPlatform.forEach((orders, platform) => {
    const byStore = new Map<string, typeof allOrders>();
    orders.forEach(order => {
      const key = order.storeId;
      if (!byStore.has(key)) byStore.set(key, []);
      byStore.get(key)!.push(order);
    });
    
    byStore.forEach((storeOrders, storeId) => {
      const storeName = storeOrders[0]?.storeName || storeId;
      groups.push({
        key: `${platform}_${storeId}`,
        platform,
        platformName: platformNames[platform] || platform,
        storeId,
        storeName,
        warehouseId: undefined,
        warehouseName: undefined,
        orders: storeOrders,
      });
    });
  });
  
  const reports = groups.map((group, index) => {
    const orders = group.orders;
    const orderCount = orders.length;
    
    let totalRevenue = 0;
    let totalProductCost = 0;
    let totalShippingCost = 0;
    let totalPlatformFee = 0;
    let totalMarketingCost = 0;
    let totalWarehouseFee = 0;
    let totalOtherCost = 0;
    
    orders.forEach(order => {
      const orderAmount = order.totalAmount || 0;
      const shippingFee = order.shippingFee || 0;
      totalRevenue += orderAmount + shippingFee;
      
      const productCostRate = 0.35 + seededRandom(`${order.id}_prod_cost`) * 0.15;
      totalProductCost += orderAmount * productCostRate;
      
      totalShippingCost += orderAmount * 0.12;
      totalPlatformFee += orderAmount * 0.1;
      totalMarketingCost += orderAmount * 0.05;
      totalWarehouseFee += orderAmount * 0.03;
      totalOtherCost += orderAmount * 0.02;
    });
    
    totalRevenue = parseFloat(totalRevenue.toFixed(2));
    totalProductCost = parseFloat(totalProductCost.toFixed(2));
    totalShippingCost = parseFloat(totalShippingCost.toFixed(2));
    totalPlatformFee = parseFloat(totalPlatformFee.toFixed(2));
    totalMarketingCost = parseFloat(totalMarketingCost.toFixed(2));
    totalWarehouseFee = parseFloat(totalWarehouseFee.toFixed(2));
    totalOtherCost = parseFloat(totalOtherCost.toFixed(2));
    
    const totalCost = parseFloat((totalProductCost + totalShippingCost + totalPlatformFee + totalMarketingCost + totalWarehouseFee + totalOtherCost).toFixed(2));
    const totalProfit = parseFloat((totalRevenue - totalCost).toFixed(2));
    const profitMargin = parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2));
    
    const period = params.period || 'month';
    const periodNames: Record<string, string> = { day: '日报', week: '周报', month: '月报', quarter: '季报', year: '年报' };
    
    return {
      id: `report_${group.key}`,
      reportNo: `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(index + 1).padStart(3, '0')}`,
      period,
      periodName: periodNames[period] || '月报',
      startDate: params.startDate || orders[0]?.createdAt || new Date().toISOString(),
      endDate: params.endDate || new Date().toISOString(),
      platform: group.platform,
      platformName: group.platformName,
      storeId: group.storeId,
      storeName: group.storeName,
      warehouseId: group.warehouseId,
      warehouseName: group.warehouseName,
      orderCount,
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      averageOrderValue: orderCount > 0 ? parseFloat((totalRevenue / orderCount).toFixed(2)) : 0,
      productCost: totalProductCost,
      shippingCost: totalShippingCost,
      platformFee: totalPlatformFee,
      marketingCost: totalMarketingCost,
      warehouseFee: totalWarehouseFee,
      otherCost: totalOtherCost,
      refundAmount: 0,
      refundRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
    } as ProfitReport;
  });
  
  if (params.warehouseId) {
    reports.forEach(r => {
      r.warehouseId = params.warehouseId;
      r.warehouseName = `仓库${params.warehouseId}`;
    });
  }
  
  const sortedReports = reports.sort((a, b) => b.totalRevenue - a.totalRevenue);
  
  return mockPageRequest(sortedReports, params.page, params.pageSize);
};

export const getProfitReportDetail = async (id: string): Promise<ApiResponse<ProfitReport>> => {
  const report = mockProfitReports.find(r => r.id === id) || mockProfitReports[0];
  return mockRequest(report);
};

export const generateProfitReport = async (data: {
  period: string;
  startDate: string;
  endDate: string;
  platform?: string;
  storeId?: string;
  warehouseId?: string;
}): Promise<ApiResponse<ProfitReport>> => {
  const newReport: ProfitReport = {
    ...mockProfitReports[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    reportNo: `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newReport, 1500);
};

export const getExpenses = async (params: { 
  page?: number; 
  pageSize?: number; 
  category?: string; 
  status?: string; 
  warehouseId?: string;
  storeId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: Expense[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockExpenses];
  
  if (params.category) {
    filtered = filtered.filter(e => e.category === params.category);
  }
  if (params.status) {
    filtered = filtered.filter(e => e.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(e => e.warehouseId === params.warehouseId);
  }
  if (params.storeId) {
    filtered = filtered.filter(e => e.storeId === params.storeId);
  }
  if (params.startDate) {
    filtered = filtered.filter(e => e.createdAt >= params.startDate!);
  }
  if (params.endDate) {
    filtered = filtered.filter(e => e.createdAt <= params.endDate!);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(e => 
      e.expenseNo.toLowerCase().includes(kw) ||
      e.description.toLowerCase().includes(kw) ||
      e.category.toLowerCase().includes(kw)
    );
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getExpenseDetail = async (id: string): Promise<ApiResponse<Expense>> => {
  const expense = mockExpenses.find(e => e.id === id) || mockExpenses[0];
  return mockRequest(expense);
};

export const createExpense = async (data: Partial<Expense>): Promise<ApiResponse<Expense>> => {
  const newExpense: Expense = {
    ...mockExpenses[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    expenseNo: `EXP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newExpense, 500);
};

export const approveExpense = async (id: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const rejectExpense = async (id: string, reason: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const getTransactions = async (params: { 
  page?: number; 
  pageSize?: number; 
  type?: string; 
  status?: string; 
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: Transaction[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockTransactions];
  
  if (params.type) {
    filtered = filtered.filter(t => t.type === params.type);
  }
  if (params.status) {
    filtered = filtered.filter(t => t.status === params.status);
  }
  if (params.startDate) {
    filtered = filtered.filter(t => t.createdAt >= params.startDate!);
  }
  if (params.endDate) {
    filtered = filtered.filter(t => t.createdAt <= params.endDate!);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(t => 
      t.transactionNo.toLowerCase().includes(kw) ||
      t.description.toLowerCase().includes(kw)
    );
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getFinanceStats = async (): Promise<ApiResponse<FinanceStats>> => {
  return mockRequest(mockFinanceStats);
};

export const reconcile = async (params: {
  startDate: string;
  endDate: string;
  platform?: string;
  storeId?: string;
}): Promise<ApiResponse<{
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  platformFees: number;
  shippingCosts: number;
  productCosts: number;
  discrepancies: Array<{
    type: string;
    description: string;
    amount: number;
    orderNo?: string;
  }>;
  isBalanced: boolean;
}>> => {
  return mockRequest({
    totalOrders: Math.floor(Math.random() * 500) + 100,
    totalRevenue: Math.floor(Math.random() * 100000) + 10000,
    totalCost: Math.floor(Math.random() * 70000) + 5000,
    totalProfit: Math.floor(Math.random() * 30000) + 5000,
    platformFees: Math.floor(Math.random() * 5000) + 1000,
    shippingCosts: Math.floor(Math.random() * 10000) + 2000,
    productCosts: Math.floor(Math.random() * 50000) + 5000,
    discrepancies: Math.random() > 0.7 ? [
      {
        type: 'order_mismatch',
        description: '订单金额与平台结算金额不一致',
        amount: Math.floor(Math.random() * 100) + 10,
        orderNo: `ORD-20240620-${Math.floor(Math.random() * 999999)}`,
      },
    ] : [],
    isBalanced: Math.random() > 0.3,
  }, 2000);
};

export const exportReport = async (reportId: string, format: 'excel' | 'pdf' | 'csv'): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> => {
  return mockRequest({
    downloadUrl: `https://api.example.com/reports/${reportId}.${format}`,
    fileName: `profit_report_${reportId}.${format}`,
  }, 1000);
};

export const generateVoucher = async (costDetailId: string): Promise<ApiResponse<{ voucherNo: string; voucherUrl: string }>> => {
  return mockRequest({
    voucherNo: `VOUCHER-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    voucherUrl: `https://api.example.com/vouchers/${costDetailId}.pdf`,
  }, 500);
};

export const calculateOrderProfit = async (orderId: string): Promise<ApiResponse<{
  orderId: string;
  orderNo: string;
  platform: string;
  revenue: {
    orderAmount: number;
    shippingFee: number;
    discount: number;
    totalRevenue: number;
  };
  cost: {
    productCost: number;
    firstMileShippingCost: number;
    lastMileShippingCost: number;
    warehouseFee: number;
    platformCommission: number;
    transactionFee: number;
    promotionCost: number;
    refundLoss: number;
    taxCost: number;
    otherCost: number;
    totalCost: number;
  };
  profit: number;
  profitMargin: number;
  costBreakdown: Array<{ category: string; amount: number; percentage: number }>;
}>> => {
  if (orderProfitCache.has(orderId)) {
    return mockRequest(orderProfitCache.get(orderId), 300);
  }
  
  const order = mockOrders.find(o => o.id === orderId) || mockOrders[0];
  
  const orderAmount = order.totalAmount || getDeterministicValue(`${orderId}_revenue`, 50, 250);
  const shippingFee = order.shippingFee || getDeterministicValue(`${orderId}_shipping`, 3, 15);
  
  const discountRate = getDeterministicValue(`${orderId}_discount`, 0, 0.1);
  const discount = parseFloat((orderAmount * discountRate).toFixed(2));
  const totalRevenue = parseFloat((orderAmount + shippingFee - discount).toFixed(2));
  
  const productCostRate = 0.3 + getDeterministicValue(`${orderId}_prod_cost`, 0, 0.2);
  const productCost = parseFloat((orderAmount * productCostRate).toFixed(2));
  
  const firstMileShippingCost = parseFloat((orderAmount * (0.05 + getDeterministicValue(`${orderId}_first_mile`, 0, 0.05))).toFixed(2));
  const lastMileShippingCost = parseFloat((orderAmount * (0.1 + getDeterministicValue(`${orderId}_last_mile`, 0, 0.1))).toFixed(2));
  const warehouseFee = parseFloat((orderAmount * (0.03 + getDeterministicValue(`${orderId}_warehouse`, 0, 0.02))).toFixed(2));
  const platformCommission = parseFloat((orderAmount * (0.08 + getDeterministicValue(`${orderId}_commission`, 0, 0.05))).toFixed(2));
  const transactionFee = parseFloat((orderAmount * (0.02 + getDeterministicValue(`${orderId}_trans_fee`, 0, 0.02))).toFixed(2));
  const promotionCost = parseFloat((orderAmount * (0.03 + getDeterministicValue(`${orderId}_promo`, 0, 0.03))).toFixed(2));
  
  const hasRefund = seededRandom(`${orderId}_refund`) > 0.8;
  const refundLoss = hasRefund ? parseFloat((orderAmount * 0.1).toFixed(2)) : 0;
  
  const taxCost = parseFloat((orderAmount * (0.05 + getDeterministicValue(`${orderId}_tax`, 0, 0.03))).toFixed(2));
  const otherCost = parseFloat((getDeterministicValue(`${orderId}_other`, 0, 5)).toFixed(2));
  
  const totalCost = parseFloat((
    productCost + firstMileShippingCost + lastMileShippingCost + 
    warehouseFee + platformCommission + transactionFee + 
    promotionCost + refundLoss + taxCost + otherCost
  ).toFixed(2));
  
  const profit = parseFloat((totalRevenue - totalCost).toFixed(2));
  const profitMargin = parseFloat(((profit / totalRevenue) * 100).toFixed(2));
  
  const result = {
    orderId,
    orderNo: order.orderNo,
    platform: order.platform,
    revenue: {
      orderAmount,
      shippingFee,
      discount,
      totalRevenue,
    },
    cost: {
      productCost,
      firstMileShippingCost,
      lastMileShippingCost,
      warehouseFee,
      platformCommission,
      transactionFee,
      promotionCost,
      refundLoss,
      taxCost,
      otherCost,
      totalCost,
    },
    profit,
    profitMargin,
    costBreakdown: [
      { category: '商品成本', amount: productCost, percentage: parseFloat(((productCost / totalCost) * 100).toFixed(2)) },
      { category: '头程运费', amount: firstMileShippingCost, percentage: parseFloat(((firstMileShippingCost / totalCost) * 100).toFixed(2)) },
      { category: '尾程运费', amount: lastMileShippingCost, percentage: parseFloat(((lastMileShippingCost / totalCost) * 100).toFixed(2)) },
      { category: '仓储费', amount: warehouseFee, percentage: parseFloat(((warehouseFee / totalCost) * 100).toFixed(2)) },
      { category: '平台佣金', amount: platformCommission, percentage: parseFloat(((platformCommission / totalCost) * 100).toFixed(2)) },
      { category: '交易手续费', amount: transactionFee, percentage: parseFloat(((transactionFee / totalCost) * 100).toFixed(2)) },
      { category: '推广费', amount: promotionCost, percentage: parseFloat(((promotionCost / totalCost) * 100).toFixed(2)) },
      { category: '退款损失', amount: refundLoss, percentage: parseFloat(((refundLoss / totalCost) * 100).toFixed(2)) },
      { category: '税费', amount: taxCost, percentage: parseFloat(((taxCost / totalCost) * 100).toFixed(2)) },
    ],
  };
  
  orderProfitCache.set(orderId, result);
  
  return mockRequest(result, 800);
};

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
