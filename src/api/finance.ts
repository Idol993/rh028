import type { ApiResponse } from '@/@types/api';
import type { CostDetail, ProfitReport, Expense, FinanceStats, Transaction } from '@/@types/finance';
import { mockRequest, mockPageRequest } from './client';
import { mockCostDetails, mockProfitReports, mockExpenses, mockTransactions, mockFinanceStats } from '@/mock/data';

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
  let filtered = [...mockProfitReports];
  
  if (params.period) {
    filtered = filtered.filter(r => r.period === params.period);
  }
  if (params.platform) {
    filtered = filtered.filter(r => r.platform === params.platform);
  }
  if (params.storeId) {
    filtered = filtered.filter(r => r.storeId === params.storeId);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(r => r.warehouseId === params.warehouseId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
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
  costBreakdown: CostDetailItem[];
}>> => {
  const orderRevenue = parseFloat((Math.random() * 200 + 50).toFixed(2));
  const productCost = parseFloat((orderRevenue * (0.3 + Math.random() * 0.2)).toFixed(2));
  const firstMileShippingCost = parseFloat((orderRevenue * (0.05 + Math.random() * 0.05)).toFixed(2));
  const lastMileShippingCost = parseFloat((orderRevenue * (0.1 + Math.random() * 0.1)).toFixed(2));
  const warehouseFee = parseFloat((orderRevenue * (0.03 + Math.random() * 0.02)).toFixed(2));
  const platformCommission = parseFloat((orderRevenue * (0.08 + Math.random() * 0.05)).toFixed(2));
  const transactionFee = parseFloat((orderRevenue * (0.02 + Math.random() * 0.02)).toFixed(2));
  const promotionCost = parseFloat((orderRevenue * (0.03 + Math.random() * 0.03)).toFixed(2));
  const refundLoss = parseFloat((Math.random() > 0.8 ? orderRevenue * 0.1 : 0).toFixed(2));
  const taxCost = parseFloat((orderRevenue * (0.05 + Math.random() * 0.03)).toFixed(2));
  const otherCost = parseFloat((Math.random() * 5).toFixed(2));
  
  const totalCost = productCost + firstMileShippingCost + lastMileShippingCost + warehouseFee + platformCommission + transactionFee + promotionCost + refundLoss + taxCost + otherCost;
  const shippingFee = parseFloat((Math.random() * 10 + 5).toFixed(2));
  const discount = parseFloat((Math.random() * 10).toFixed(2));
  const totalRevenue = orderRevenue + shippingFee - discount;
  const profit = totalRevenue - totalCost;
  
  return mockRequest({
    orderId,
    orderNo: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
    platform: randomFromArray(['amazon', 'shopify', 'temu', 'tiktok', 'ebay']),
    revenue: {
      orderAmount: orderRevenue,
      shippingFee,
      discount,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
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
      totalCost: parseFloat(totalCost.toFixed(2)),
    },
    profit: parseFloat(profit.toFixed(2)),
    profitMargin: parseFloat(((profit / totalRevenue) * 100).toFixed(2)),
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
  }, 800);
};

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
