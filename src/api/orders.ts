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
