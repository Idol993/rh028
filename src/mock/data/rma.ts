import type { ReturnOrder, ReturnItem, QualityCheck, Disposition } from '@/@types/rma';
import {
  generateUUID,
  generatePastDate,
  generateRMANo,
  generateOrderNo,
  randomFromArray,
  randomInt,
  randomFloat,
  randomBoolean,
  productNames,
  productCategories,
  generateSKU,
  warehouses,
  stores,
} from './base';

export const generateQualityCheck = (itemId: string, sku: string): QualityCheck => {
  const conditions: Array<'new' | 'like_new' | 'used' | 'damaged' | 'defective'> = ['new', 'like_new', 'used', 'damaged', 'defective'];
  const condition = randomFromArray(conditions);
  
  return {
    id: generateUUID(),
    returnItemId: itemId,
    sku,
    condition,
    isWorking: condition !== 'damaged' && condition !== 'defective',
    hasOriginalPackaging: randomBoolean(0.6),
    hasAccessories: randomBoolean(0.7),
    hasManual: randomBoolean(0.8),
    physicalDamage: condition === 'damaged' ? randomFromArray(['外壳划痕', '屏幕碎裂', '按键损坏', '接口损坏']) : undefined,
    functionalIssue: condition === 'defective' ? randomFromArray(['无法开机', '功能异常', '续航不足', '连接问题']) : undefined,
    notes: randomBoolean(0.3) ? '质检过程中发现轻微瑕疵' : undefined,
    checkedBy: randomFromArray(['仓管员小张', '质检专员小李', '运营主管']),
    checkedAt: generatePastDate(randomInt(0, 3)),
    aiConfidence: randomFloat(0.7, 0.99, 2),
    images: randomBoolean(0.4) ? Array.from({ length: randomInt(1, 3) }, () => `https://images.example.com/rma/${generateUUID()}.jpg`) : undefined,
  };
};

export const generateDisposition = (itemId: string, sku: string, condition: string): Disposition => {
  const action = condition === 'new' || condition === 'like_new' ? randomFromArray(['restock', 'repair', 'liquidate']) :
                 condition === 'used' ? randomFromArray(['restock', 'repair', 'liquidate', 'destroy']) :
                 randomFromArray(['repair', 'liquidate', 'destroy', 'return_to_supplier']);
  
  const actionNames: Record<string, string> = {
    restock: '重新上架',
    repair: '维修',
    liquidate: '清仓处理',
    destroy: '销毁',
    return_to_supplier: '退回供应商',
  };
  
  return {
    id: generateUUID(),
    returnItemId: itemId,
    sku,
    action,
    actionName: actionNames[action],
    reason: randomFromArray(['产品完好可继续销售', '可修复后再销售', '无法修复', '价值过低不值得修复', '供应商要求退回']),
    estimatedValue: randomFloat(5, 150, 2),
    processedAt: generatePastDate(randomInt(0, 2)),
    processedBy: randomFromArray(['运营主管', '财务总监王总', '系统管理员']),
    notes: randomBoolean(0.3) ? '已按流程处理完毕' : undefined,
  };
};

export const generateReturnItem = (index: number): ReturnItem => {
  const category = randomFromArray(productCategories);
  const sku = generateSKU(category, index);
  const productName = randomFromArray(productNames);
  const expectedQuantity = randomInt(1, 3);
  const receivedQuantity = randomBoolean(0.9) ? expectedQuantity : randomInt(0, expectedQuantity - 1);
  const unitPrice = randomFloat(9.99, 199.99);
  
  const conditions: Array<'new' | 'like_new' | 'used' | 'damaged' | 'defective'> = ['new', 'like_new', 'used', 'damaged', 'defective'];
  const condition = randomFromArray(conditions);
  
  return {
    id: generateUUID(),
    returnOrderId: '',
    sku,
    productName,
    expectedQuantity,
    receivedQuantity,
    unitPrice,
    subtotal: parseFloat((receivedQuantity * unitPrice).toFixed(2)),
    returnReason: randomFromArray(['商品质量问题', '商品与描述不符', '买家误购', '尺寸/规格不合适', '物流损坏', '其他原因']),
    condition,
    qualityCheck: randomBoolean(0.7) ? generateQualityCheck(generateUUID(), sku) : undefined,
    disposition: randomBoolean(0.5) ? generateDisposition(generateUUID(), sku, condition) : undefined,
  };
};

export const generateReturnOrder = (): ReturnOrder => {
  const warehouse = randomFromArray(warehouses);
  const store = randomFromArray(stores);
  const itemCount = randomInt(1, 3);
  const items = Array.from({ length: itemCount }, (_, i) => generateReturnItem(i + 1));
  
  const statuses: Array<'pending' | 'approved' | 'in_transit' | 'received' | 'inspecting' | 'completed' | 'rejected' | 'cancelled'> = 
    ['pending', 'approved', 'in_transit', 'received', 'inspecting', 'completed', 'rejected', 'cancelled'];
  const status = randomFromArray(statuses);
  
  const isReceived = ['received', 'inspecting', 'completed'].includes(status);
  const isCompleted = status === 'completed';
  
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const refundAmount = isCompleted ? totalAmount * randomFloat(0.5, 1.0) : 0;
  
  const returnReasons = items.map(item => item.returnReason);
  const primaryReason = returnReasons[0];
  
  return {
    id: generateUUID(),
    rmaNo: generateRMANo(),
    orderId: generateUUID(),
    orderNo: generateOrderNo(),
    platformOrderNo: `${store.platform.toUpperCase()}-${generateUUID().substring(0, 12).toUpperCase()}`,
    platform: store.platform,
    storeId: store.id,
    storeName: store.storeName,
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    status,
    primaryReason,
    buyerName: randomFromArray(['John Smith', 'Jane Doe', 'Mike Johnson', 'Emily Brown', 'David Wilson']),
    buyerEmail: randomFromArray(['john@example.com', 'jane@example.com', 'mike@example.com', 'emily@example.com', 'david@example.com']),
    buyerPhone: randomBoolean(0.8) ? `+1-${randomInt(100, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}` : undefined,
    items,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    refundAmount: parseFloat(refundAmount.toFixed(2)),
    currency: 'USD',
    returnShippingCost: randomFloat(0, 29.99, 2),
    refundShippingToBuyer: randomBoolean(0.5),
    trackingNo: isReceived ? `RTN${randomInt(1000000000000, 9999999999999)}` : undefined,
    logisticsProvider: isReceived ? randomFromArray(['USPS', 'UPS', 'FedEx', 'DHL']) : undefined,
    returnLabelUrl: isReceived ? `https://api.example.com/rma-labels/${generateUUID()}.pdf` : undefined,
    approvedBy: status !== 'pending' ? randomFromArray(['客服小李', '运营主管', '系统管理员']) : undefined,
    approvedAt: status !== 'pending' ? generatePastDate(randomInt(1, 7)) : undefined,
    receivedBy: isReceived ? '仓管员小张' : undefined,
    receivedAt: isReceived ? generatePastDate(randomInt(0, 5)) : undefined,
    completedAt: isCompleted ? generatePastDate(randomInt(0, 2)) : undefined,
    notes: randomBoolean(0.3) ? '买家要求尽快处理退款' : undefined,
    createdAt: generatePastDate(randomInt(1, 30)),
    updatedAt: generatePastDate(randomInt(0, 1)),
  };
};

export const generateRMAStats = () => {
  return {
    totalReturns: randomInt(100, 500),
    pendingApproval: randomInt(10, 50),
    inTransit: randomInt(20, 80),
    received: randomInt(10, 40),
    inspecting: randomInt(5, 20),
    completed: randomInt(50, 300),
    rejected: randomInt(5, 30),
    returnRate: randomFloat(2.0, 8.0, 2),
    avgProcessingTime: randomFloat(3.0, 10.0, 1),
    totalRefundAmount: randomFloat(5000, 50000, 2),
    restockRate: randomFloat(40.0, 70.0, 2),
    topReasons: [
      { reason: '商品质量问题', count: randomInt(20, 100), percentage: randomFloat(20, 40) },
      { reason: '商品与描述不符', count: randomInt(15, 80), percentage: randomFloat(15, 30) },
      { reason: '买家误购', count: randomInt(10, 60), percentage: randomFloat(10, 25) },
      { reason: '尺寸/规格不合适', count: randomInt(10, 50), percentage: randomFloat(10, 20) },
      { reason: '物流损坏', count: randomInt(5, 30), percentage: randomFloat(5, 15) },
    ],
  };
};

export const mockReturnOrders = Array.from({ length: 60 }, () => generateReturnOrder());
export const mockRMAStats = generateRMAStats();
