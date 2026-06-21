import type { ApiResponse } from '@/@types/api';
import type { Order, OrderDetail, OrderQueryParams, OrderCreateRequest, AllocationResult, OrderAuditRequest } from '@/@types/order';
import type { Shipment, TrackingRecord } from '@/@types/logistics';
import { mockRequest, mockPageRequest } from './client';
import { mockOrders, generateOrder, generateRiskAssessment, generateFulfillmentOrder, generateUUID } from '@/mock/data';
import { registerShipment } from './logistics';

const orderUpdates = new Map<string, Partial<Order>>();
const pickingTasks = new Map<string, any>();
const packingRecords = new Map<string, any>();
const shippingLabels = new Map<string, any>();

const getUpdatedOrder = (order: Order): Order => {
  const updates = orderUpdates.get(order.id);
  if (updates) {
    return { ...order, ...updates };
  }
  return order;
};

export const getOrders = async (params: OrderQueryParams): Promise<ApiResponse<{ list: Order[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockOrders].map(getUpdatedOrder);
  
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
  const order = getUpdatedOrder(mockOrders.find(o => o.id === id) || mockOrders[0]);
  
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

export const allocateWarehouse = async (orderId: string, warehouseId?: string): Promise<ApiResponse<AllocationResult>> => {
  const order = mockOrders.find(o => o.id === orderId) || mockOrders[0];
  
  const warehouses = [
    { id: 'wh-001', name: '洛杉矶海外仓', country: 'US' },
    { id: 'wh-002', name: '法兰克福海外仓', country: 'DE' },
    { id: 'wh-003', name: '东京海外仓', country: 'JP' },
    { id: 'wh-004', name: '悉尼海外仓', country: 'AU' },
  ];
  
  const targetWarehouse = warehouseId 
    ? warehouses.find(w => w.id === warehouseId) || warehouses[0]
    : warehouses[Math.floor(Math.random() * warehouses.length)];
  
  orderUpdates.set(orderId, {
    warehouseId: targetWarehouse.id,
    warehouseName: targetWarehouse.name,
    status: 'allocated',
    allocatedAt: new Date().toISOString(),
  });
  
  return mockRequest({
    success: true,
    orderId,
    warehouseId: targetWarehouse.id,
    warehouseName: targetWarehouse.name,
    allocatedAt: new Date().toISOString(),
    strategy: 'nearest_warehouse',
    estimatedShippingDays: 3 + Math.floor(Math.random() * 4),
    allocatedItems: order.items.map(item => ({
      sku: item.sku,
      quantity: item.quantity,
      availableAfter: 0,
    })),
    message: '分仓成功',
  } as AllocationResult, 600);
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
  const order = getUpdatedOrder(mockOrders.find(o => o.id === orderId) || mockOrders[0]);
  
  const taskId = 'task_' + Math.random().toString(36).substr(2, 9);
  const taskNo = `PT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  
  const task = {
    taskId,
    taskNo,
    orderId,
    warehouseId: order.warehouseId || 'wh-001',
    warehouseName: order.warehouseName || '洛杉矶海外仓',
    assigneeId: 'user-003',
    assigneeName: '仓管员小张',
    items: order.items.map(item => ({
      sku: item.sku,
      productName: item.productName,
      quantity: item.quantity,
      location: item.warehouseLocation || `A-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')}`,
    })),
    priority: 2,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  pickingTasks.set(taskId, task);
  
  orderUpdates.set(orderId, {
    ...orderUpdates.get(orderId),
    status: 'picking',
    fulfillmentStatus: 'picking',
  });
  
  return mockRequest(task, 500);
};

export const completePicking = async (orderId: string, taskId: string): Promise<ApiResponse<null>> => {
  const task = pickingTasks.get(taskId);
  if (task) {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    pickingTasks.set(taskId, task);
  }
  
  const existing = orderUpdates.get(orderId) || {};
  orderUpdates.set(orderId, {
    ...existing,
    status: 'packing',
    fulfillmentStatus: 'packing',
    pickedAt: new Date().toISOString(),
  });
  
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
  dimensions: { length: number; width: number; height: number };
  packedAt: string;
}>> => {
  const volumeWeight = (data.length * data.width * data.height) / 5000;
  const chargeWeight = Math.max(data.weight, volumeWeight);
  
  const packageRecord = {
    packageId: 'pkg_' + Math.random().toString(36).substr(2, 9),
    orderId,
    weight: data.weight,
    length: data.length,
    width: data.width,
    height: data.height,
    volumeWeight: parseFloat(volumeWeight.toFixed(2)),
    chargeWeight: parseFloat(chargeWeight.toFixed(2)),
    boxNo: data.boxNo || `BOX-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    packedAt: new Date().toISOString(),
  };
  
  packingRecords.set(orderId, packageRecord);
  
  const existing = orderUpdates.get(orderId) || {};
  orderUpdates.set(orderId, {
    ...existing,
    actualWeight: parseFloat(chargeWeight.toFixed(2)),
    estimatedWeight: parseFloat(chargeWeight.toFixed(2)),
    fulfillmentStatus: 'packed',
    packedAt: new Date().toISOString(),
  });
  
  return mockRequest({
    packageId: packageRecord.packageId,
    weight: packageRecord.weight,
    volumeWeight: packageRecord.volumeWeight,
    chargeWeight: packageRecord.chargeWeight,
    boxNo: packageRecord.boxNo,
    dimensions: { length: data.length, width: data.width, height: data.height },
    packedAt: packageRecord.packedAt,
  }, 500);
};

export const generateShippingLabel = async (orderId: string, logisticsChannelId: string): Promise<ApiResponse<{
  trackingNo: string;
  logisticsProvider: string;
  logisticsService: string;
  logisticsId: string;
  estimatedDeliveryDays: number;
  shippingCost: number;
  labelUrl: string;
  labelPdfUrl: string;
  trackingUrl: string;
  createdAt: string;
}>> => {
  const order = getUpdatedOrder(mockOrders.find(o => o.id === orderId) || mockOrders[0]);
  
  const providers = [
    { id: 'ups', name: 'UPS', service: 'UPS Standard' },
    { id: 'fedex', name: 'FedEx', service: 'FedEx Ground' },
    { id: 'dhl', name: 'DHL', service: 'DHL eCommerce' },
    { id: 'usps', name: 'USPS', service: 'USPS Priority' },
  ];
  
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const trackingNo = `${provider.id.toUpperCase()}${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const now = new Date();
  
  const label = {
    trackingNo,
    logisticsProvider: provider.name,
    logisticsService: provider.service,
    logisticsId: logisticsChannelId,
    estimatedDeliveryDays: 3 + Math.floor(Math.random() * 7),
    shippingCost: parseFloat((Math.random() * 20 + 5).toFixed(2)),
    labelUrl: '/mock/label/' + Math.random().toString(36).substr(2, 9),
    labelPdfUrl: '/mock/label/' + Math.random().toString(36).substr(2, 9) + '.pdf',
    trackingUrl: `https://track.example.com/${provider.id}/track?no=${trackingNo}`,
    createdAt: now.toISOString(),
  };
  
  shippingLabels.set(orderId, label);
  
  const existing = orderUpdates.get(orderId) || {};
  orderUpdates.set(orderId, {
    ...existing,
    status: 'shipped',
    trackingNo,
    logisticsId: logisticsChannelId,
    logisticsName: provider.name,
    shippingCost: label.shippingCost,
    shippedAt: now.toISOString(),
  });
  
  const shipment: Shipment = {
    id: 'shp_' + Math.random().toString(36).substr(2, 9),
    shipmentNo: `SHP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    orderId,
    orderNo: order.orderNo,
    platformOrderNo: order.platformOrderNo,
    warehouseId: order.warehouseId || 'wh-001',
    warehouseName: order.warehouseName || '洛杉矶海外仓',
    carrier: provider.name,
    serviceName: provider.service,
    trackingNo,
    status: 'shipped',
    weight: order.actualWeight || order.estimatedWeight || 1.5,
    shippingCost: label.shippingCost,
    estimatedDeliveryDays: label.estimatedDeliveryDays,
    destinationCountry: order.country || 'US',
    trackingHistory: [],
    createdAt: now.toISOString(),
    shippedAt: now.toISOString(),
  };
  
  const trackingRecords: TrackingRecord[] = [
    {
      id: generateUUID(),
      trackingNo,
      status: 'created',
      statusName: '已创建',
      location: order.warehouseName || '洛杉矶海外仓',
      description: '物流订单已创建',
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      operator: '系统',
    },
    {
      id: generateUUID(),
      trackingNo,
      status: 'label_created',
      statusName: '面单已生成',
      location: order.warehouseName || '洛杉矶海外仓',
      description: '面单已生成，等待揽收',
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
      operator: '系统',
    },
    {
      id: generateUUID(),
      trackingNo,
      status: 'picked_up',
      statusName: '已揽收',
      location: order.warehouseName || '洛杉矶海外仓',
      description: '快递员已揽收包裹',
      timestamp: now.toISOString(),
      operator: provider.name,
    },
    {
      id: generateUUID(),
      trackingNo,
      status: 'in_transit',
      statusName: '运输中',
      location: '转运中心',
      description: '包裹已到达转运中心，正在分拣',
      timestamp: new Date(now.getTime() + 3600000).toISOString(),
      operator: provider.name,
    },
  ];
  
  registerShipment(shipment, trackingRecords);
  
  return mockRequest(label, 800);
};

export const getFulfillmentState = (orderId: string) => {
  return {
    orderUpdates: orderUpdates.get(orderId),
    pickingTask: Array.from(pickingTasks.values()).find(t => t.orderId === orderId),
    packingRecord: packingRecords.get(orderId),
    shippingLabel: shippingLabels.get(orderId),
  };
};

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
