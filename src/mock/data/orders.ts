import { faker } from '@faker-js/faker/locale/zh_CN';
import type { Order, OrderItem, OrderStatus, RiskLevel, PaymentStatus, FulfillmentOrder, RiskAssessment, RiskFactor } from '@/@types/order';
import {
  generateUUID,
  generateOrderNo,
  generateFulfillmentNo,
  generatePastDate,
  generateAddress,
  generateBuyer,
  randomFromArray,
  randomInt,
  randomFloat,
  randomBoolean,
  warehouses,
  stores,
  productNames,
  productCategories,
  generateSKU,
  generateTrackingNo,
  platforms,
} from './base';

const orderStatuses: OrderStatus[] = ['pending', 'risk_review', 'allocated', 'picking', 'packing', 'shipped', 'delivered', 'cancelled', 'returned'];
const paymentStatuses: PaymentStatus[] = ['paid', 'paid', 'paid', 'paid', 'refunded', 'partial_refunded', 'unpaid'];
const riskLevels: RiskLevel[] = ['low', 'low', 'low', 'low', 'medium', 'high'];
const shippingMethods = ['Standard Shipping', 'Express Shipping', 'Priority Mail', 'International Economy', 'International Priority'];

export const generateOrderItem = (index: number, category: string): OrderItem => {
  const sku = generateSKU(category, index);
  const productName = randomFromArray(productNames);
  const quantity = randomInt(1, 5);
  const unitPrice = randomFloat(9.99, 199.99);
  const weight = randomFloat(0.1, 5.0, 2);
  
  return {
    id: generateUUID(),
    sku,
    productName,
    quantity,
    unitPrice,
    weight,
    dimensions: {
      length: randomFloat(5, 50, 1),
      width: randomFloat(5, 30, 1),
      height: randomFloat(2, 20, 1),
    },
    warehouseLocation: `${randomFromArray(['A', 'B', 'C', 'D'])}-${randomInt(1, 20)}-${randomInt(1, 5)}`,
    pickedQuantity: 0,
    packedQuantity: 0,
  };
};

export const generateRiskFactors = (riskLevel: RiskLevel): RiskFactor[] => {
  const allFactors: RiskFactor[] = [
    { type: 'address', name: '地址异常', description: '收货地址不完整或格式错误', score: 25 },
    { type: 'blacklist', name: '黑名单买家', description: '该买家存在历史欺诈记录', score: 50 },
    { type: 'duplicate', name: '重复下单', description: '同一买家短时间内多次下单', score: 15 },
    { type: 'payment', name: '支付异常', description: '支付方式存在风险', score: 30 },
    { type: 'quantity', name: '异常数量', description: '单商品购买数量异常', score: 20 },
    { type: 'value', name: '高值订单', description: '订单金额超过阈值', score: 10 },
    { type: 'sensitive', name: '敏感商品', description: '包含敏感或禁运商品', score: 35 },
    { type: 'fraud', name: '欺诈风险', description: '多维度检测存在欺诈可能性', score: 45 },
  ];
  
  const count = riskLevel === 'high' ? randomInt(3, 5) : riskLevel === 'medium' ? randomInt(1, 2) : randomInt(0, 1);
  const shuffled = [...allFactors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const generateRiskAssessment = (orderId: string, riskLevel: RiskLevel): RiskAssessment => {
  const factors = generateRiskFactors(riskLevel);
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  
  const reviewStatuses = ['pending', 'approved', 'rejected', 'held'] as const;
  const reviewStatus = riskLevel === 'low' ? randomFromArray(['approved', 'pending']) : riskLevel === 'medium' ? randomFromArray(['pending', 'held']) : 'pending';
  
  return {
    id: generateUUID(),
    orderId,
    riskLevel,
    riskScore: Math.min(100, totalScore + randomInt(0, 10)),
    riskFactors: factors,
    reviewStatus,
    reviewerId: reviewStatus !== 'pending' ? `user-${randomInt(1, 5)}` : undefined,
    reviewerName: reviewStatus !== 'pending' ? randomFromArray(['系统管理员', '运营主管', '风控专员']) : undefined,
    reviewRemark: reviewStatus !== 'pending' ? faker.lorem.sentence() : undefined,
    reviewedAt: reviewStatus !== 'pending' ? generatePastDate(randomInt(1, 3)) : undefined,
    createdAt: generatePastDate(randomInt(0, 1)),
  };
};

export const generateFulfillmentOrder = (orderId: string, warehouseId: string, warehouseName: string, status: OrderStatus): FulfillmentOrder => {
  const isCompleted = ['shipped', 'delivered', 'returned', 'cancelled'].includes(status);
  const isStarted = ['picking', 'packing', 'shipped', 'delivered', 'returned'].includes(status);
  
  return {
    id: generateUUID(),
    orderId,
    fulfillmentNo: generateFulfillmentNo(),
    warehouseId,
    warehouseName,
    status,
    priority: randomInt(1, 10),
    waveNo: isStarted ? `WAVE-${String(randomInt(1, 100)).padStart(4, '0')}` : undefined,
    assigneeId: isStarted ? `user-${randomInt(3, 3)}` : undefined,
    assigneeName: isStarted ? '仓管员小张' : undefined,
    startedAt: isStarted ? generatePastDate(randomInt(0, 2)) : undefined,
    completedAt: isCompleted ? generatePastDate(randomInt(0, 1)) : undefined,
    createdAt: generatePastDate(randomInt(0, 1)),
  };
};

export const generateOrder = (): Order => {
  const status = randomFromArray(orderStatuses);
  const riskLevel = status === 'cancelled' ? 'high' : randomFromArray(riskLevels);
  const store = randomFromArray(stores);
  const warehouse = randomFromArray(warehouses);
  const address = generateAddress();
  const buyer = generateBuyer();
  const itemCount = randomInt(1, 4);
  const category = randomFromArray(productCategories);
  
  const items = Array.from({ length: itemCount }, (_, i) => generateOrderItem(i + 1, category));
  
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = randomFloat(4.99, 29.99);
  const tax = randomBoolean(0.8) ? subtotal * randomFloat(0.05, 0.15) : 0;
  const totalAmount = subtotal + shippingFee + tax;
  
  const estimatedWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const actualWeight = ['shipped', 'delivered'].includes(status) ? estimatedWeight * randomFloat(0.95, 1.05) : undefined;
  
  const hasTracking = ['shipped', 'delivered'].includes(status);
  const carrier = randomFromArray(['USPS', 'UPS', 'FedEx', 'DHL']);
  
  const createdAt = generatePastDate(randomInt(0, 30));
  
  return {
    id: generateUUID(),
    orderNo: generateOrderNo(),
    platformOrderNo: `${store.platform.toUpperCase()}-${faker.string.alphanumeric(12).toUpperCase()}`,
    platform: store.platform,
    storeId: store.id,
    storeName: store.storeName,
    status,
    riskLevel,
    buyerName: buyer.buyerName,
    buyerEmail: buyer.buyerEmail,
    buyerPhone: buyer.buyerPhone,
    shippingAddress: address,
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingFee: parseFloat(shippingFee.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    currency: address.country === 'US' ? 'USD' : address.country === 'UK' ? 'GBP' : address.country === 'JP' ? 'JPY' : 'EUR',
    paymentStatus: randomFromArray(paymentStatuses),
    shippingMethod: randomFromArray(shippingMethods),
    warehouseId: ['allocated', 'picking', 'packing', 'shipped', 'delivered', 'returned'].includes(status) ? warehouse.id : undefined,
    warehouseName: ['allocated', 'picking', 'packing', 'shipped', 'delivered', 'returned'].includes(status) ? warehouse.name : undefined,
    trackingNo: hasTracking ? generateTrackingNo(carrier) : undefined,
    logisticsId: hasTracking ? `log-${randomInt(1, 10)}` : undefined,
    logisticsName: hasTracking ? carrier : undefined,
    fulfillmentNo: ['allocated', 'picking', 'packing', 'shipped', 'delivered', 'returned'].includes(status) ? generateFulfillmentNo() : undefined,
    estimatedWeight: parseFloat(estimatedWeight.toFixed(2)),
    actualWeight: actualWeight ? parseFloat(actualWeight.toFixed(2)) : undefined,
    riskReviewedAt: status !== 'pending' ? generatePastDate(randomInt(0, 1)) : undefined,
    riskReviewerId: status !== 'pending' ? `user-${randomInt(1, 5)}` : undefined,
    riskReviewerName: status !== 'pending' ? randomFromArray(['系统管理员', '运营主管', '风控专员']) : undefined,
    riskReviewRemark: status !== 'pending' ? (status === 'cancelled' ? '风控审核不通过，订单取消' : '审核通过') : undefined,
    allocatedAt: ['allocated', 'picking', 'packing', 'shipped', 'delivered', 'returned'].includes(status) ? generatePastDate(randomInt(0, 2)) : undefined,
    shippedAt: ['shipped', 'delivered'].includes(status) ? generatePastDate(randomInt(0, 5)) : undefined,
    deliveredAt: status === 'delivered' ? generatePastDate(randomInt(0, 3)) : undefined,
    createdAt,
    updatedAt: generatePastDate(randomInt(0, 1)),
  };
};

export const generateOrders = (count: number = 100): Order[] => {
  return Array.from({ length: count }, () => generateOrder());
};

export const mockOrders = generateOrders(200);
