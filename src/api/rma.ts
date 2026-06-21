import type { ApiResponse } from '@/@types/api';
import type { ReturnOrder, QualityCheck, Disposition } from '@/@types/rma';
import { mockRequest, mockPageRequest } from './client';
import { mockReturnOrders, mockRMAStats } from '@/mock/data';

export const getReturnOrders = async (params: { 
  page?: number; 
  pageSize?: number; 
  status?: string; 
  platform?: string; 
  warehouseId?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: ReturnOrder[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockReturnOrders];
  
  if (params.status) {
    filtered = filtered.filter(r => r.status === params.status);
  }
  if (params.platform) {
    filtered = filtered.filter(r => r.platform === params.platform);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(r => r.warehouseId === params.warehouseId);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(r => 
      r.rmaNo.toLowerCase().includes(kw) ||
      r.orderNo.toLowerCase().includes(kw) ||
      r.buyerName.toLowerCase().includes(kw)
    );
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getReturnOrderDetail = async (id: string): Promise<ApiResponse<ReturnOrder>> => {
  const order = mockReturnOrders.find(r => r.id === id) || mockReturnOrders[0];
  return mockRequest(order);
};

export const createReturnOrder = async (data: {
  orderId: string;
  orderNo: string;
  items: Array<{ sku: string; quantity: number; returnReason: string }>;
  returnShippingCost?: number;
  refundShippingToBuyer?: boolean;
  notes?: string;
}): Promise<ApiResponse<ReturnOrder>> => {
  const newReturn: ReturnOrder = {
    ...mockReturnOrders[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    rmaNo: `RMA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return mockRequest(newReturn, 500);
};

export const approveReturnOrder = async (id: string, data: {
  approvedBy: string;
  returnShippingCost: number;
  refundShippingToBuyer: boolean;
  notes?: string;
}): Promise<ApiResponse<ReturnOrder>> => {
  const order = mockReturnOrders.find(r => r.id === id) || mockReturnOrders[0];
  return mockRequest({
    ...order,
    status: 'approved',
    ...data,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const rejectReturnOrder = async (id: string, data: { reason: string; notes?: string }): Promise<ApiResponse<ReturnOrder>> => {
  const order = mockReturnOrders.find(r => r.id === id) || mockReturnOrders[0];
  return mockRequest({
    ...order,
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  });
};

export const receiveReturn = async (id: string, data: {
  trackingNo: string;
  logisticsProvider: string;
  receivedBy: string;
  items: Array<{ sku: string; receivedQuantity: number; condition: string }>;
  notes?: string;
}): Promise<ApiResponse<ReturnOrder>> => {
  const order = mockReturnOrders.find(r => r.id === id) || mockReturnOrders[0];
  return mockRequest({
    ...order,
    status: 'received',
    ...data,
    receivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const performQualityCheck = async (returnId: string, itemId: string, data: QualityCheck): Promise<ApiResponse<QualityCheck>> => {
  return mockRequest(data, 300);
};

export const processDisposition = async (returnId: string, itemId: string, data: Disposition): Promise<ApiResponse<Disposition>> => {
  return mockRequest(data, 300);
};

export const completeReturnOrder = async (id: string, data: {
  refundAmount: number;
  processedBy: string;
  notes?: string;
}): Promise<ApiResponse<ReturnOrder>> => {
  const order = mockReturnOrders.find(r => r.id === id) || mockReturnOrders[0];
  return mockRequest({
    ...order,
    status: 'completed',
    ...data,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const cancelReturnOrder = async (id: string, reason: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const getRMAStats = async (): Promise<ApiResponse<any>> => {
  return mockRequest(mockRMAStats);
};

export const getReturnReasons = async (): Promise<ApiResponse<Array<{ reason: string; count: number; percentage: number }>>> => {
  return mockRequest([
    { reason: '商品质量问题', count: 45, percentage: 30 },
    { reason: '商品与描述不符', count: 30, percentage: 20 },
    { reason: '买家误购', count: 25, percentage: 16.7 },
    { reason: '尺寸/规格不合适', count: 20, percentage: 13.3 },
    { reason: '物流损坏', count: 15, percentage: 10 },
    { reason: '其他原因', count: 15, percentage: 10 },
  ]);
};

export const getDispositionSummary = async (): Promise<ApiResponse<Array<{ action: string; actionName: string; count: number; percentage: number }>>> => {
  return mockRequest([
    { action: 'restock', actionName: '重新上架', count: 80, percentage: 53.3 },
    { action: 'repair', actionName: '维修', count: 25, percentage: 16.7 },
    { action: 'liquidate', actionName: '清仓处理', count: 20, percentage: 13.3 },
    { action: 'destroy', actionName: '销毁', count: 15, percentage: 10 },
    { action: 'return_to_supplier', actionName: '退回供应商', count: 10, percentage: 6.7 },
  ]);
};
