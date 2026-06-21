import type { ApiResponse } from '@/@types/api';
import type { Order, OrderDetail, OrderQueryParams, OrderCreateRequest, AllocationResult, OrderAuditRequest } from '@/@types/order';
import { mockRequest, mockPageRequest } from './client';
import { mockOrders, generateOrder, generateRiskAssessment, generateFulfillmentOrder, generateUUID } from '@/mock/data';

export const getOrders = async (params: OrderQueryParams): Promise<ApiResponse<{ list: Order[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockOrders];
  
  if (params.platform) {
    filtered = filtered.filter(o => o.platform === params.platform);
  }
  if (params.status) {
    filtered = filtered.filter(o => o.status === params.status);
  }
  if (params.riskLevel) {
    filtered = filtered.filter(o => o.riskLevel === params.riskLevel);
  }
  if (params.storeId) {
    filtered = filtered.filter(o => o.storeId === params.storeId);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(o => o.warehouseId === params.warehouseId);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(o => 
      o.orderNo.toLowerCase().includes(kw) ||
      o.platformOrderNo.toLowerCase().includes(kw) ||
      o.buyerName.toLowerCase().includes(kw) ||
      o.buyerEmail.toLowerCase().includes(kw)
    );
  }
  if (params.orderNo) {
    filtered = filtered.filter(o => o.orderNo === params.orderNo);
  }
  if (params.trackingNo) {
    filtered = filtered.filter(o => o.trackingNo === params.trackingNo);
  }
  
  if (params.startDate) {
    filtered = filtered.filter(o => o.createdAt >= params.startDate!);
  }
  if (params.endDate) {
    filtered = filtered.filter(o => o.createdAt <= params.endDate!);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getOrderDetail = async (id: string): Promise<ApiResponse<OrderDetail>> => {
  const order = mockOrders.find(o => o.id === id) || mockOrders[0];
  
  const riskAssessment = order.status !== 'pending' ? generateRiskAssessment(order.id, order.riskLevel) : undefined;
  
  const fulfillmentOrder = order.warehouseId && order.warehouseName ? 
    generateFulfillmentOrder(order.id, order.warehouseId, order.warehouseName, order.status) : undefined;
  
  const operationLogs = [
    {
      id: generateUUID(),
      userId: 'user-001',
      userName: '系统管理员',
      action: '订单创建',
      detail: '订单从Amazon平台同步',
      createdAt: order.createdAt,
    },
    {
      id: generateUUID(),
      userId: 'user-002',
      userName: '运营主管',
      action: '风控审核',
      detail: '审核通过',
      createdAt: order.riskReviewedAt || new Date().toISOString(),
    },
  ];
  
  return mockRequest({
    ...order,
    riskAssessment,
    fulfillmentOrder,
    operationLogs,
  });
};

export const createOrder = async (data: OrderCreateRequest): Promise<ApiResponse<Order>> => {
  const newOrder = generateOrder();
  return mockRequest(newOrder, 500);
};

export const allocateOrder = async (id: string): Promise<ApiResponse<AllocationResult>> => {
  const order = mockOrders.find(o => o.id === id) || mockOrders[0];
  
  if (!order.warehouseId || !order.warehouseName) {
    return mockRequest({
      success: false,
      warehouseId: '',
      warehouseName: '',
      allocatedItems: [],
      message: '库存不足，无法分配',
    }, 300);
  }
  
  return mockRequest({
    success: true,
    warehouseId: order.warehouseId,
    warehouseName: order.warehouseName,
    allocatedItems: order.items.map(item => ({
      sku: item.sku,
      quantity: item.quantity,
      availableAfter: Math.floor(Math.random() * 100),
    })),
  });
};

export const auditOrder = async (id: string, data: OrderAuditRequest): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const cancelOrder = async (id: string, reason: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const syncOrders = async (): Promise<ApiResponse<{ count: number }>> => {
  return mockRequest({ count: Math.floor(Math.random() * 50) + 10 }, 1000);
};

export const getOrderStats = async (): Promise<ApiResponse<{
  total: number;
  pending: number;
  riskReview: number;
  allocated: number;
  picking: number;
  packing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  todayOrders: number;
  todayShipped: number;
}>> => {
  return mockRequest({
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    riskReview: mockOrders.filter(o => o.status === 'risk_review').length,
    allocated: mockOrders.filter(o => o.status === 'allocated').length,
    picking: mockOrders.filter(o => o.status === 'picking').length,
    packing: mockOrders.filter(o => o.status === 'packing').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
    returned: mockOrders.filter(o => o.status === 'returned').length,
    todayOrders: Math.floor(Math.random() * 200) + 50,
    todayShipped: Math.floor(Math.random() * 150) + 30,
  });
};

export const createPickingTask = async (orderId: string): Promise<ApiResponse<{
  taskId: string;
  taskNo: string;
  warehouseId: string;
  warehouseName: string;
  assigneeId: string;
  assigneeName: string;
  items: Array<{
    sku: string;
    productName: string;
    quantity: number;
    location: string;
  }>;
  priority: number;
  createdAt: string;
}>> => {
  const order = mockOrders.find(o => o.id === orderId) || mockOrders[0];
  return mockRequest({
    taskId: 'task_' + Math.random().toString(36).substr(2, 9),
    taskNo: `PT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    warehouseId: order.warehouseId,
    warehouseName: order.warehouseName,
    assigneeId: 'user-003',
    assigneeName: '仓管员小张',
    items: order.items.map(item => ({
      sku: item.sku,
      productName: item.productName,
      quantity: item.quantity,
      location: item.warehouseLocation || `A-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')}`,
    })),
    priority: 2,
    createdAt: new Date().toISOString(),
  }, 500);
};

export const completePicking = async (orderId: string, taskId: string): Promise<ApiResponse<null>> => {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.status = 'packing';
  }
  return mockRequest(null, 500);
};

export const completePacking = async (orderId: string, data: {
  weight: number;
  length: number;
  width: number;
  height: number;
  boxNo?: string;
}): Promise<ApiResponse<{
  packageId: string;
  weight: number;
  volumeWeight: number;
  chargeWeight: number;
  boxNo: string;
  packedAt: string;
}>> => {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.status = 'packing';
  }
  const volumeWeight = (data.length * data.width * data.height) / 5000;
  const chargeWeight = Math.max(data.weight, volumeWeight);
  return mockRequest({
    packageId: 'pkg_' + Math.random().toString(36).substr(2, 9),
    weight: data.weight,
    volumeWeight: parseFloat(volumeWeight.toFixed(2)),
    chargeWeight: parseFloat(chargeWeight.toFixed(2)),
    boxNo: data.boxNo || `BOX-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    packedAt: new Date().toISOString(),
  }, 500);
};

export const generateShippingLabel = async (orderId: string, logisticsChannelId: string): Promise<ApiResponse<{
  trackingNo: string;
  logisticsProvider: string;
  logisticsService: string;
  estimatedDeliveryDays: number;
  shippingCost: number;
  labelUrl: string;
  labelPdfUrl: string;
  trackingUrl: string;
  createdAt: string;
}>> => {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.status = 'shipped';
    order.trackingNo = `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    order.shippedAt = new Date().toISOString();
  }
  const providers = ['UPS', 'FedEx', 'DHL', 'USPS', 'Royal Mail'];
  const provider = randomFromArray(providers);
  return mockRequest({
    trackingNo: order?.trackingNo || `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`,
    logisticsProvider: provider,
    logisticsService: provider + ' Standard',
    estimatedDeliveryDays: Math.floor(Math.random() * 5) + 5,
    shippingCost: parseFloat((Math.random() * 20 + 5).toFixed(2)),
    labelUrl: '/mock/label/' + Math.random().toString(36).substr(2, 9),
    labelPdfUrl: '/mock/label/' + Math.random().toString(36).substr(2, 9) + '.pdf',
    trackingUrl: `https://track.example.com/${provider}/track?no=${order?.trackingNo}`,
    createdAt: new Date().toISOString(),
  }, 800);
};

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
