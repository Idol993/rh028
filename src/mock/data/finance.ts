import type { CostDetail, ProfitReport, Expense, FinanceStats, Transaction } from '@/@types/finance';
import {
  generateUUID,
  generatePastDate,
  generateOrderNo,
  randomFromArray,
  randomInt,
  randomFloat,
  randomBoolean,
  warehouses,
  stores,
  productNames,
  productCategories,
  generateSKU,
} from './base';

export const generateCostDetail = (orderId: string, orderNo: string): CostDetail => {
  const itemCount = randomInt(1, 4);
  const items = Array.from({ length: itemCount }, () => {
    const category = randomFromArray(productCategories);
    const sku = generateSKU(category, randomInt(1, 100));
    const quantity = randomInt(1, 5);
    const unitCost = randomFloat(5.0, 100.0, 2);
    return {
      sku,
      productName: randomFromArray(productNames),
      quantity,
      unitCost,
      totalCost: parseFloat((quantity * unitCost).toFixed(2)),
    };
  });
  
  const productCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  const shippingCostHead = randomFloat(1.0, 10.0, 2);
  const shippingCostTail = randomFloat(3.0, 30.0, 2);
  const warehouseFee = randomFloat(0.5, 5.0, 2);
  const platformCommission = randomFloat(2.0, 20.0, 2);
  const transactionFee = randomFloat(0.5, 5.0, 2);
  const promotionCost = randomBoolean(0.4) ? randomFloat(1.0, 15.0, 2) : 0;
  const tax = randomFloat(1.0, 15.0, 2);
  const otherCost = randomBoolean(0.2) ? randomFloat(0.5, 5.0, 2) : 0;
  
  const totalCost = productCost + shippingCostHead + shippingCostTail + warehouseFee + 
                    platformCommission + transactionFee + promotionCost + tax + otherCost;
  
  const revenue = totalCost * randomFloat(1.3, 2.5);
  const profit = revenue - totalCost;
  const profitMargin = parseFloat(((profit / revenue) * 100).toFixed(2));
  
  return {
    id: generateUUID(),
    orderId,
    orderNo,
    storeId: randomFromArray(stores).id,
    storeName: randomFromArray(stores).storeName,
    warehouseId: randomFromArray(warehouses).id,
    warehouseName: randomFromArray(warehouses).name,
    items,
    revenue: parseFloat(revenue.toFixed(2)),
    costBreakdown: {
      productCost: parseFloat(productCost.toFixed(2)),
      shippingCostHead: parseFloat(shippingCostHead.toFixed(2)),
      shippingCostTail: parseFloat(shippingCostTail.toFixed(2)),
      warehouseFee: parseFloat(warehouseFee.toFixed(2)),
      platformCommission: parseFloat(platformCommission.toFixed(2)),
      transactionFee: parseFloat(transactionFee.toFixed(2)),
      promotionCost: parseFloat(promotionCost.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      otherCost: parseFloat(otherCost.toFixed(2)),
    },
    totalCost: parseFloat(totalCost.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    profitMargin,
    currency: 'USD',
    exchangeRate: randomFloat(6.8, 7.5, 4),
    cnyProfit: parseFloat((profit * 7.2).toFixed(2)),
    isSettled: randomBoolean(0.7),
    settledAt: randomBoolean(0.7) ? generatePastDate(randomInt(1, 30)) : undefined,
    createdAt: generatePastDate(randomInt(1, 60)),
  };
};

export const generateProfitReport = (): ProfitReport => {
  const periods = ['day', 'week', 'month', 'quarter', 'year'];
  const period = randomFromArray(periods);
  
  const orderCount = randomInt(100, 5000);
  const totalRevenue = randomFloat(10000, 500000, 2);
  const totalCost = totalRevenue * randomFloat(0.5, 0.8);
  const totalProfit = totalRevenue - totalCost;
  
  const platform = randomFromArray(['amazon', 'shopify', 'temu', 'tiktok', 'ebay']);
  const platformNames: Record<string, string> = {
    amazon: 'Amazon',
    shopify: 'Shopify',
    temu: 'Temu',
    tiktok: 'TikTok Shop',
    ebay: 'eBay',
  };
  
  return {
    id: generateUUID(),
    reportNo: `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(randomInt(1, 999)).padStart(3, '0')}`,
    period,
    periodName: { day: '日报', week: '周报', month: '月报', quarter: '季报', year: '年报' }[period],
    startDate: generatePastDate(randomInt(1, 365)),
    endDate: generatePastDate(randomInt(0, 30)),
    platform,
    platformName: platformNames[platform],
    storeId: randomFromArray(stores).id,
    storeName: randomFromArray(stores).storeName,
    warehouseId: randomFromArray(warehouses).id,
    warehouseName: randomFromArray(warehouses).name,
    orderCount,
    shippedCount: Math.floor(orderCount * randomFloat(0.85, 0.98)),
    returnedCount: Math.floor(orderCount * randomFloat(0.02, 0.08)),
    cancelledCount: Math.floor(orderCount * randomFloat(0.01, 0.05)),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalProfit: parseFloat(totalProfit.toFixed(2)),
    profitMargin: parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)),
    avgOrderValue: parseFloat((totalRevenue / orderCount).toFixed(2)),
    avgProfitPerOrder: parseFloat((totalProfit / orderCount).toFixed(2)),
    costBreakdown: {
      productCost: parseFloat((totalCost * randomFloat(0.4, 0.6)).toFixed(2)),
      shippingCostHead: parseFloat((totalCost * randomFloat(0.05, 0.15)).toFixed(2)),
      shippingCostTail: parseFloat((totalCost * randomFloat(0.1, 0.2)).toFixed(2)),
      warehouseFee: parseFloat((totalCost * randomFloat(0.03, 0.08)).toFixed(2)),
      platformCommission: parseFloat((totalCost * randomFloat(0.08, 0.15)).toFixed(2)),
      transactionFee: parseFloat((totalCost * randomFloat(0.02, 0.05)).toFixed(2)),
      promotionCost: parseFloat((totalCost * randomFloat(0.03, 0.1)).toFixed(2)),
      tax: parseFloat((totalCost * randomFloat(0.02, 0.08)).toFixed(2)),
      otherCost: parseFloat((totalCost * randomFloat(0.01, 0.05)).toFixed(2)),
    },
    currency: 'USD',
    createdAt: generatePastDate(randomInt(0, 7)),
    generatedBy: randomFromArray(['财务总监王总', '系统管理员', '运营主管']),
  };
};

export const generateExpense = (): Expense => {
  const categories = ['采购成本', '头程运费', '尾程运费', '仓储费', '平台佣金', '交易手续费', '推广费', '税费', '人工费', '办公费', '其他'];
  
  return {
    id: generateUUID(),
    expenseNo: `EXP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(randomInt(1, 9999)).padStart(4, '0')}`,
    category: randomFromArray(categories),
    subcategory: randomFromArray(['商品采购', '海运', '空运', '快递', '仓储租金', '操作费', 'Amazon佣金', 'PayPal手续费', 'Google Ads', 'Facebook Ads', '进口关税', '增值税']),
    description: randomFromArray(['商品采购订单', '国际海运费用', 'UPS快递运费', '仓库月租金', 'Amazon销售佣金', 'PayPal交易手续费', 'Google广告投放', '进口关税缴纳']),
    amount: randomFloat(10.0, 10000.0, 2),
    currency: randomFromArray(['USD', 'CNY', 'EUR', 'GBP']),
    exchangeRate: randomFloat(6.8, 7.5, 4),
    cnyAmount: randomFloat(70.0, 70000.0, 2),
    orderId: randomBoolean(0.6) ? generateUUID() : undefined,
    orderNo: randomBoolean(0.6) ? generateOrderNo() : undefined,
    warehouseId: randomBoolean(0.5) ? randomFromArray(warehouses).id : undefined,
    warehouseName: randomBoolean(0.5) ? randomFromArray(warehouses).name : undefined,
    storeId: randomBoolean(0.5) ? randomFromArray(stores).id : undefined,
    storeName: randomBoolean(0.5) ? randomFromArray(stores).storeName : undefined,
    supplier: randomBoolean(0.4) ? randomFromArray(['深圳华强电子', '义乌小商品城', '广州白云皮具', '东莞制造有限公司']) : undefined,
    invoiceNo: randomBoolean(0.7) ? `INV-${randomInt(100000, 999999)}` : undefined,
    isReimbursable: randomBoolean(0.3),
    status: randomFromArray(['pending', 'approved', 'paid', 'rejected']),
    approvedBy: randomBoolean(0.7) ? '财务总监王总' : undefined,
    approvedAt: randomBoolean(0.7) ? generatePastDate(randomInt(0, 30)) : undefined,
    paidAt: randomBoolean(0.5) ? generatePastDate(randomInt(0, 15)) : undefined,
    remarks: randomBoolean(0.3) ? '已核对无误' : undefined,
    createdAt: generatePastDate(randomInt(1, 90)),
    createdBy: randomFromArray(['系统管理员', '运营主管', '财务总监王总']),
  };
};

export const generateTransaction = (): Transaction => {
  return {
    id: generateUUID(),
    transactionNo: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(randomInt(1, 99999)).padStart(5, '0')}`,
    type: randomFromArray(['income', 'expense', 'transfer', 'refund']),
    amount: randomFloat(10.0, 5000.0, 2),
    currency: 'USD',
    balanceAfter: randomFloat(1000.0, 100000.0, 2),
    orderId: randomBoolean(0.6) ? generateUUID() : undefined,
    orderNo: randomBoolean(0.6) ? generateOrderNo() : undefined,
    expenseId: randomBoolean(0.3) ? generateUUID() : undefined,
    expenseNo: randomBoolean(0.3) ? `EXP-${randomInt(1, 9999)}` : undefined,
    description: randomFromArray(['订单销售收入', '采购货款支付', '账户间转账', '客户退款', '运费结算', '佣金结算']),
    paymentMethod: randomFromArray(['bank_transfer', 'credit_card', 'paypal', 'alipay', 'wechat', 'stripe']),
    referenceNo: randomFromArray([`PAY${randomInt(100000, 999999)}`, `REF${randomInt(100000, 999999)}`]),
    status: randomFromArray(['pending', 'completed', 'failed', 'cancelled']),
    createdAt: generatePastDate(randomInt(0, 90)),
    settledAt: randomBoolean(0.8) ? generatePastDate(randomInt(0, 3)) : undefined,
    remarks: randomBoolean(0.2) ? '自动结算' : undefined,
  };
};

export const generateFinanceStats = () => {
  const totalRevenue = randomFloat(100000, 1000000, 2);
  const totalCost = totalRevenue * randomFloat(0.6, 0.8);
  const totalProfit = totalRevenue - totalCost;
  
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalProfit: parseFloat(totalProfit.toFixed(2)),
    profitMargin: parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)),
    monthlyRevenue: Array.from({ length: 12 }, () => randomFloat(50000, 200000, 2)),
    monthlyProfit: Array.from({ length: 12 }, () => randomFloat(10000, 60000, 2)),
    revenueByPlatform: [
      { platform: 'amazon', name: 'Amazon', revenue: randomFloat(30000, 150000, 2), profit: randomFloat(5000, 40000, 2) },
      { platform: 'shopify', name: 'Shopify', revenue: randomFloat(20000, 100000, 2), profit: randomFloat(4000, 30000, 2) },
      { platform: 'temu', name: 'Temu', revenue: randomFloat(15000, 80000, 2), profit: randomFloat(3000, 20000, 2) },
      { platform: 'tiktok', name: 'TikTok Shop', revenue: randomFloat(10000, 60000, 2), profit: randomFloat(2000, 15000, 2) },
      { platform: 'ebay', name: 'eBay', revenue: randomFloat(8000, 50000, 2), profit: randomFloat(1500, 12000, 2) },
    ],
    revenueByWarehouse: warehouses.map(wh => ({
      warehouseId: wh.id,
      warehouseName: wh.name,
      revenue: randomFloat(10000, 80000, 2),
      profit: randomFloat(2000, 25000, 2),
    })),
    costByCategory: [
      { category: '采购成本', amount: randomFloat(50000, 300000, 2), percentage: randomFloat(40, 60) },
      { category: '头程运费', amount: randomFloat(5000, 30000, 2), percentage: randomFloat(5, 15) },
      { category: '尾程运费', amount: randomFloat(10000, 60000, 2), percentage: randomFloat(10, 20) },
      { category: '仓储费', amount: randomFloat(3000, 20000, 2), percentage: randomFloat(3, 10) },
      { category: '平台佣金', amount: randomFloat(8000, 50000, 2), percentage: randomFloat(8, 15) },
      { category: '推广费', amount: randomFloat(5000, 30000, 2), percentage: randomFloat(5, 15) },
      { category: '税费', amount: randomFloat(2000, 15000, 2), percentage: randomFloat(2, 8) },
      { category: '其他', amount: randomFloat(1000, 10000, 2), percentage: randomFloat(1, 5) },
    ],
    topSellingProducts: Array.from({ length: 10 }, () => ({
      sku: generateSKU(randomFromArray(productCategories), randomInt(1, 100)),
      productName: randomFromArray(productNames),
      quantity: randomInt(100, 1000),
      revenue: randomFloat(5000, 50000, 2),
      profit: randomFloat(1000, 15000, 2),
    })),
    pendingSettlement: randomFloat(5000, 50000, 2),
    unsettledOrders: randomInt(50, 500),
    avgProfitMargin: randomFloat(15.0, 35.0, 2),
    yoyGrowth: randomFloat(-10.0, 50.0, 2),
    momGrowth: randomFloat(-5.0, 20.0, 2),
  };
};

export const mockCostDetails = Array.from({ length: 100 }, () => generateCostDetail(generateUUID(), generateOrderNo()));
export const mockProfitReports = Array.from({ length: 20 }, () => generateProfitReport());
export const mockExpenses = Array.from({ length: 80 }, () => generateExpense());
export const mockTransactions = Array.from({ length: 150 }, () => generateTransaction());
export const mockFinanceStats = generateFinanceStats();
