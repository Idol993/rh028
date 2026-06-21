export type ProfitDimension = 'order' | 'sku' | 'store' | 'platform' | 'warehouse' | 'country' | 'category' | 'monthly';
export type ExpenseType = 'product_cost' | 'first_mile_shipping' | 'warehouse_storage' | 'last_mile_shipping' | 'platform_commission' | 'transaction_fee' | 'promotion' | 'tax' | 'packaging' | 'return' | 'other';
export type ExpenseCategory = 'direct_cost' | 'operating_cost' | 'marketing_cost' | 'logistics_cost' | 'tax_cost';

export const EXPENSE_TYPE_NAMES: Record<ExpenseType, string> = {
  product_cost: '商品成本',
  first_mile_shipping: '头程运费',
  warehouse_storage: '海外仓仓储费',
  last_mile_shipping: '尾程物流费',
  platform_commission: '平台佣金',
  transaction_fee: '交易手续费',
  promotion: '推广费',
  tax: '税费',
  packaging: '包装材料费',
  return: '退货损失',
  other: '其他费用',
};

export const EXPENSE_CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  direct_cost: '直接成本',
  operating_cost: '运营成本',
  marketing_cost: '营销成本',
  logistics_cost: '物流成本',
  tax_cost: '税费成本',
};

export interface OrderCostDetail {
  orderId: string;
  orderNo: string;
  platform: string;
  revenue: number;
  currency: string;
  costs: {
    productCost: number;
    firstMileShipping: number;
    warehouseStorageFee: number;
    lastMileShipping: number;
    platformCommission: number;
    transactionFee: number;
    promotionFee: number;
    tax: number;
    packagingCost: number;
    otherCost: number;
  };
  totalCost: number;
  profit: number;
  profitMargin: number;
}

export interface ProfitReport {
  dimension: ProfitDimension;
  startDate: string;
  endDate: string;
  summary: ProfitSummary;
  details: ProfitDetailItem[];
  trendData: ProfitTrendPoint[];
}

export interface ProfitSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalSKUs: number;
  avgProfitMargin: number;
  avgOrderValue: number;
}

export interface ProfitDetailItem {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  orderCount: number;
  percentage: number;
}

export interface ProfitTrendPoint {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
}

export interface Expense {
  id: string;
  type: ExpenseType;
  typeName: string;
  category: ExpenseCategory;
  categoryName: string;
  amount: number;
  currency: string;
  orderId?: string;
  orderNo?: string;
  sku?: string;
  productName?: string;
  warehouseId?: string;
  warehouseName?: string;
  platform?: string;
  description: string;
  incurredAt: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface ExpenseCreateRequest {
  type: ExpenseType;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  orderId?: string;
  sku?: string;
  warehouseId?: string;
  description: string;
  incurredAt: string;
}

export interface ExpenseQueryParams {
  page?: number;
  pageSize?: number;
  type?: ExpenseType;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  orderId?: string;
  sku?: string;
  warehouseId?: string;
}

export interface ReconciliationResult {
  platform: string;
  month: string;
  platformRevenue: number;
  systemRevenue: number;
  revenueDifference: number;
  platformFees: number;
  systemFees: number;
  feesDifference: number;
  totalDifference: number;
  status: 'matched' | 'mismatch' | 'pending';
  details: ReconciliationDetail[];
}

export interface ReconciliationDetail {
  orderNo: string;
  platformOrderNo: string;
  platformAmount: number;
  systemAmount: number;
  difference: number;
  status: 'matched' | 'mismatch';
}

export interface CostAllocation {
  id: string;
  expenseId: string;
  targetType: 'order' | 'sku' | 'warehouse';
  targetId: string;
  amount: number;
  allocationMethod: string;
  allocatedAt: string;
}

export interface FinancialDashboardData {
  todayRevenue: number;
  todayProfit: number;
  todayOrders: number;
  monthRevenue: number;
  monthProfit: number;
  monthOrders: number;
  avgProfitMargin: number;
  totalExpense: number;
  expenseByCategory: Record<ExpenseCategory, number>;
  revenueTrend: ProfitTrendPoint[];
  profitByPlatform: Record<string, number>;
  profitByWarehouse: Record<string, number>;
}

export interface SkuProfit {
  sku: string;
  productName: string;
  category: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  unitsSold: number;
  avgSellingPrice: number;
  returnRate: number;
}
