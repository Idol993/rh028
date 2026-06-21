import type { ApiResponse } from '@/@types/api';
import type { Order, OrderDetail, OrderQueryParams, OrderCreateRequest, AllocationResult, OrderAuditRequest } from '@/@types/order';
import type { Shipment, TrackingRecord, LogisticsChannel } from '@/@types/logistics';
import { mockRequest, mockPageRequest } from './client';
import { mockOrders, generateOrder, generateRiskAssessment, generateFulfillmentOrder, generateUUID, mockLogisticsChannels } from '@/mock/data';
import { registerShipment } from './logistics';

const orderUpdates = new Map<string, Partial<Order>>();
const pickingTasks = new Map<string, any>();
const packingRecords = new Map<string, any>();
const shippingLabels = new Map<string, any>();

export const getUpdatedOrder = (order: Order): Order => {
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
  
  const pickingTask = Array.from(pickingTasks.values()).find(t => t.orderId === id);
  const packingRecord = packingRecords.get(id);
  const shippingLabel = shippingLabels.get(id);
  
  if (packingRecord) {
    operationLogs.push({
      id: generateUUID(),
      userId: 'user-003',
      userName: '仓管员小张',
      action: '打包称重',
      detail: `包裹重量 ${packingRecord.weight}kg，尺寸 ${packingRecord.length}x${packingRecord.width}x${packingRecord.height}cm，箱号 ${packingRecord.boxNo || '-'}`,
      createdAt: packingRecord.packedAt,
    });
  }
  
  if (shippingLabel) {
    operationLogs.push({
      id: generateUUID(),
      userId: 'user-003',
      userName: '仓管员小张',
      action: '生成面单',
      detail: `${shippingLabel.logisticsProvider} ${shippingLabel.logisticsService}，追踪号 ${shippingLabel.trackingNo}，运费 $${shippingLabel.shippingCost}`,
      createdAt: shippingLabel.createdAt,
    });
  }
  
  return mockRequest({
    ...order,
    riskAssessment,
    fulfillmentOrder,
    operationLogs,
    pickingTask,
    packingRecord,
    shippingLabel,
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
  const updatedOrders = mockOrders.map(getUpdatedOrder);
  const today = new Date().toISOString().slice(0, 10);
  return mockRequest({
    total: updatedOrders.length,
    pending: updatedOrders.filter(o => o.status === 'pending').length,
    riskReview: updatedOrders.filter(o => o.status === 'risk_review').length,
    allocated: updatedOrders.filter(o => o.status === 'allocated').length,
    picking: updatedOrders.filter(o => o.status === 'picking').length,
    packing: updatedOrders.filter(o => o.status === 'packing').length,
    shipped: updatedOrders.filter(o => o.status === 'shipped').length,
    delivered: updatedOrders.filter(o => o.status === 'delivered').length,
    cancelled: updatedOrders.filter(o => o.status === 'cancelled').length,
    returned: updatedOrders.filter(o => o.status === 'returned').length,
    todayOrders: updatedOrders.filter(o => (o.createdAt || '').slice(0, 10) === today).length + 37,
    todayShipped: updatedOrders.filter(o => o.status === 'shipped' && (o.shippedAt || '').slice(0, 10) >= today).length + 12,
  }, 400);
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
  estimatedDeliveryDays: number | { min: number; max: number };
  shippingCost: number;
  labelUrl: string;
  labelPdfUrl: string;
  trackingUrl: string;
  createdAt: string;
}>> => {
  const order = getUpdatedOrder(mockOrders.find(o => o.id === orderId) || mockOrders[0]);
  const channel = mockLogisticsChannels.find(c => c.id === logisticsChannelId) || mockLogisticsChannels[0];
  
  const packingRecord = packingRecords.get(orderId);
  const packageWeight = packingRecord?.chargeWeight || packingRecord?.weight || order.actualWeight || order.estimatedWeight || 1.5;
  
  const baseCost = (channel as any).baseCost || 5.99;
  const costPerKg = (channel as any).costPerKg || 2.5;
  const shippingCost = parseFloat((baseCost + costPerKg * packageWeight).toFixed(2));
  
  const edd = channel.estimatedDeliveryDays as any;
  const estimatedDeliveryDays: number | { min: number; max: number } =
    typeof edd === 'number' ? edd : (edd || { min: 5, max: 10 });
  
  const carrierName = channel.carrierName || channel.carrier || 'Unknown';
  const serviceTypeMap: Record<string, string> = {
    standard: '标准快递',
    express: '优先快递',
    priority: '特快专递',
    economy: '经济快递',
  };
  const serviceType = channel.serviceType as string || 'standard';
  const serviceDisplayName = (channel as any).channelName || (channel as any).serviceName || `${carrierName} ${serviceTypeMap[serviceType] || serviceType}`;
  
  const carrierCode = (channel.carrier || 'generic').toString().toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4).toUpperCase() || 'TRK';
  const trackingNo = `${carrierCode}${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const now = new Date();
  
  const label = {
    trackingNo,
    logisticsProvider: carrierName,
    logisticsService: serviceDisplayName,
    logisticsId: logisticsChannelId,
    estimatedDeliveryDays,
    shippingCost,
    labelUrl: '/mock/label/' + Math.random().toString(36).substr(2, 9),
    labelPdfUrl: '/mock/label/' + Math.random().toString(36).substr(2, 9) + '.pdf',
    trackingUrl: `https://track.example.com/${channel.carrier || 'carrier'}/track?no=${trackingNo}`,
    createdAt: now.toISOString(),
  };
  
  shippingLabels.set(orderId, label);
  
  const existing = orderUpdates.get(orderId) || {};
  orderUpdates.set(orderId, {
    ...existing,
    status: 'shipped',
    trackingNo,
    logisticsId: logisticsChannelId,
    logisticsName: carrierName,
    shippingCost,
    shippedAt: now.toISOString(),
  });
  
  const eddNum = typeof estimatedDeliveryDays === 'number' ? estimatedDeliveryDays : ((estimatedDeliveryDays as any).min + (estimatedDeliveryDays as any).max) / 2;
  
  const shipment: Shipment = {
    id: 'shp_' + Math.random().toString(36).substr(2, 9),
    shipmentNo: `SHP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    orderId,
    orderNo: order.orderNo,
    platformOrderNo: order.platformOrderNo,
    warehouseId: order.warehouseId || 'wh-001',
    warehouseName: order.warehouseName || '洛杉矶海外仓',
    logisticsId: logisticsChannelId,
    logisticsName: carrierName,
    carrier: channel.carrier || carrierName,
    carrierName,
    serviceName: serviceDisplayName,
    trackingNo,
    status: 'shipped',
    statusName: '已发货',
    weight: packageWeight,
    shippingCost,
    estimatedDeliveryDays: Math.round(eddNum),
    destinationCountry: order.country || 'US',
    trackingHistory: [],
    createdAt: now.toISOString(),
    shippedAt: now.toISOString(),
  };
  
  const trackingRecords: TrackingRecord[] = [
    {
      id: generateUUID(),
      trackingNo,
      statusCode: 'created',
      status: 'created',
      statusName: '已创建',
      location: order.warehouseName || '洛杉矶海外仓',
      description: '物流订单已创建',
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      operator: '系统',
      courier: carrierName,
    },
    {
      id: generateUUID(),
      trackingNo,
      statusCode: 'label_created',
      status: 'label_created',
      statusName: '面单已生成',
      location: order.warehouseName || '洛杉矶海外仓',
      description: `通过 ${serviceDisplayName} 生成面单，运费 $${shippingCost}`,
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
      operator: '系统',
      courier: carrierName,
    },
    {
      id: generateUUID(),
      trackingNo,
      statusCode: 'picked_up',
      status: 'picked_up',
      statusName: '已揽收',
      location: order.warehouseName || '洛杉矶海外仓',
      description: `${carrierName} 快递员已揽收包裹`,
      timestamp: now.toISOString(),
      operator: carrierName,
      courier: carrierName,
    },
    {
      id: generateUUID(),
      trackingNo,
      statusCode: 'in_transit',
      status: 'in_transit',
      statusName: '运输中',
      location: '转运中心',
      description: '包裹已到达转运中心，正在分拣，预计 ' + (typeof estimatedDeliveryDays === 'number' ? `${estimatedDeliveryDays}天` : `${estimatedDeliveryDays.min}-${estimatedDeliveryDays.max}天`) + ' 送达',
      timestamp: new Date(now.getTime() + 3600000).toISOString(),
      operator: carrierName,
      courier: carrierName,
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
