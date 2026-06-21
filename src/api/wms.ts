import type { ApiResponse } from '@/@types/api';
import type { PickingTask, PackingTask, ReceivingTask, InventoryCountTask, ScanResult, PackingVerifyResponse, WeighingResponse, PrintLabelResponse } from '@/@types/wms';
import { mockRequest, mockPageRequest } from './client';
import { mockPickingTasks, mockPackingTasks, mockReceivingTasks, mockInventoryCountTasks } from '@/mock/data';

export const getPickingTasks = async (params: { page?: number; pageSize?: number; status?: string; warehouseId?: string; assigneeId?: string }): Promise<ApiResponse<{ list: PickingTask[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockPickingTasks];
  
  if (params.status) {
    filtered = filtered.filter(t => t.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(t => t.warehouseId === params.warehouseId);
  }
  if (params.assigneeId) {
    filtered = filtered.filter(t => t.assigneeId === params.assigneeId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getPickingTaskDetail = async (id: string): Promise<ApiResponse<PickingTask>> => {
  const task = mockPickingTasks.find(t => t.id === id) || mockPickingTasks[0];
  return mockRequest(task);
};

export const scanPickingItem = async (taskId: string, data: { sku: string; quantity: number; location: string }): Promise<ApiResponse<ScanResult>> => {
  const task = mockPickingTasks.find(t => t.id === taskId) || mockPickingTasks[0];
  const item = task.items.find(i => i.sku === data.sku);
  
  if (!item) {
    return mockRequest({
      success: false,
      message: '商品不在此拣货任务中',
      currentProgress: task.items.filter(i => i.isPicked).length,
      totalItems: task.items.length,
    });
  }
  
  if (item.warehouseLocation !== data.location) {
    return mockRequest({
      success: false,
      message: '库位不匹配，请检查库位',
      currentProgress: task.items.filter(i => i.isPicked).length,
      totalItems: task.items.length,
    });
  }
  
  const newPicked = Math.min(item.pickedQuantity + data.quantity, item.quantity);
  const isPicked = newPicked >= item.quantity;
  
  return mockRequest({
    success: true,
    message: isPicked ? '商品拣货完成' : `已拣货 ${newPicked}/${item.quantity}`,
    currentProgress: task.items.filter(i => i.isPicked).length + (isPicked ? 1 : 0),
    totalItems: task.items.length,
    item: { ...item, pickedQuantity: newPicked, isPicked },
  });
};

export const startPicking = async (taskId: string): Promise<ApiResponse<PickingTask>> => {
  const task = mockPickingTasks.find(t => t.id === taskId) || mockPickingTasks[0];
  return mockRequest({
    ...task,
    status: 'in_progress',
    startedAt: new Date().toISOString(),
  });
};

export const completePicking = async (taskId: string): Promise<ApiResponse<PickingTask>> => {
  const task = mockPickingTasks.find(t => t.id === taskId) || mockPickingTasks[0];
  return mockRequest({
    ...task,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
};

export const getPackingTasks = async (params: { page?: number; pageSize?: number; status?: string; warehouseId?: string }): Promise<ApiResponse<{ list: PackingTask[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockPackingTasks];
  
  if (params.status) {
    filtered = filtered.filter(t => t.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(t => t.warehouseId === params.warehouseId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getPackingTaskDetail = async (id: string): Promise<ApiResponse<PackingTask>> => {
  const task = mockPackingTasks.find(t => t.id === id) || mockPackingTasks[0];
  return mockRequest(task);
};

export const verifyPacking = async (taskId: string, data: { items: Array<{ sku: string; quantity: number }> }): Promise<ApiResponse<PackingVerifyResponse>> => {
  const task = mockPackingTasks.find(t => t.id === taskId) || mockPackingTasks[0];
  const discrepancies = [];
  
  for (const item of task.items) {
    const scanned = data.items.find(i => i.sku === item.sku);
    if (!scanned) {
      discrepancies.push({
        sku: item.sku,
        expectedQuantity: item.quantity,
        actualQuantity: 0,
        difference: -item.quantity,
        type: 'missing' as const,
      });
    } else if (scanned.quantity !== item.quantity) {
      discrepancies.push({
        sku: item.sku,
        expectedQuantity: item.quantity,
        actualQuantity: scanned.quantity,
        difference: scanned.quantity - item.quantity,
        type: scanned.quantity > item.quantity ? 'extra' as const : 'missing' as const,
      });
    }
  }
  
  for (const scanned of data.items) {
    const expected = task.items.find(i => i.sku === scanned.sku);
    if (!expected) {
      discrepancies.push({
        sku: scanned.sku,
        expectedQuantity: 0,
        actualQuantity: scanned.quantity,
        difference: scanned.quantity,
        type: 'wrong_sku' as const,
      });
    }
  }
  
  return mockRequest({
    success: discrepancies.length === 0,
    discrepancies,
  });
};

export const weighPackage = async (taskId: string, data: { actualWeight: number }): Promise<ApiResponse<WeighingResponse>> => {
  const task = mockPackingTasks.find(t => t.id === taskId) || mockPackingTasks[0];
  const deviation = Math.abs(data.actualWeight - task.estimatedWeight);
  const deviationPercent = (deviation / task.estimatedWeight) * 100;
  const threshold = 10;
  const needsReview = deviationPercent > threshold || deviation > 0.05;
  
  return mockRequest({
    success: !needsReview,
    deviation: parseFloat(deviation.toFixed(4)),
    deviationPercent: parseFloat(deviationPercent.toFixed(2)),
    needsReview,
    threshold,
  });
};

export const reviewWeight = async (taskId: string, data: { approved: boolean; remark: string }): Promise<ApiResponse<PackingTask>> => {
  const task = mockPackingTasks.find(t => t.id === taskId) || mockPackingTasks[0];
  return mockRequest({
    ...task,
    status: 'weighed',
    weightNeedsReview: false,
    weightReviewedBy: 'user-001',
    weightReviewedByName: '系统管理员',
  });
};

export const printLabel = async (taskId: string, data: { logisticsId: string }): Promise<ApiResponse<PrintLabelResponse>> => {
  return mockRequest({
    labelUrl: `https://api.example.com/labels/${taskId}.pdf`,
    trackingNo: `9400${Math.floor(Math.random() * 1000000000000)}`,
    logisticsId: data.logisticsId,
    logisticsName: 'USPS',
  });
};

export const shipOrder = async (taskId: string): Promise<ApiResponse<PackingTask>> => {
  const task = mockPackingTasks.find(t => t.id === taskId) || mockPackingTasks[0];
  return mockRequest({
    ...task,
    status: 'shipped',
    shippedAt: new Date().toISOString(),
  });
};

export const getReceivingTasks = async (params: { page?: number; pageSize?: number; status?: string; type?: string; warehouseId?: string }): Promise<ApiResponse<{ list: ReceivingTask[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockReceivingTasks];
  
  if (params.status) {
    filtered = filtered.filter(t => t.status === params.status);
  }
  if (params.type) {
    filtered = filtered.filter(t => t.type === params.type);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(t => t.warehouseId === params.warehouseId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getInventoryCountTasks = async (params: { page?: number; pageSize?: number; status?: string; warehouseId?: string }): Promise<ApiResponse<{ list: InventoryCountTask[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockInventoryCountTasks];
  
  if (params.status) {
    filtered = filtered.filter(t => t.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(t => t.warehouseId === params.warehouseId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getWMSStats = async (warehouseId?: string): Promise<ApiResponse<{
  pendingPicking: number;
  inProgressPicking: number;
  completedPicking: number;
  pendingPacking: number;
  weighedPacking: number;
  shippedToday: number;
  pendingReceiving: number;
  inProgressReceiving: number;
  pendingCount: number;
  avgPickingTime: number;
  avgPackingTime: number;
  pickingAccuracy: number;
  packingAccuracy: number;
}>> => {
  return mockRequest({
    pendingPicking: mockPickingTasks.filter(t => t.status === 'pending').length,
    inProgressPicking: mockPickingTasks.filter(t => t.status === 'in_progress').length,
    completedPicking: mockPickingTasks.filter(t => t.status === 'completed').length,
    pendingPacking: mockPackingTasks.filter(t => t.status === 'pending' || t.status === 'verified').length,
    weighedPacking: mockPackingTasks.filter(t => t.status === 'weighed' || t.status === 'label_printed').length,
    shippedToday: mockPackingTasks.filter(t => t.status === 'shipped').length,
    pendingReceiving: mockReceivingTasks.filter(t => t.status === 'pending').length,
    inProgressReceiving: mockReceivingTasks.filter(t => t.status === 'in_progress').length,
    pendingCount: mockInventoryCountTasks.filter(t => t.status !== 'completed').length,
    avgPickingTime: parseFloat((Math.random() * 10 + 5).toFixed(1)),
    avgPackingTime: parseFloat((Math.random() * 8 + 3).toFixed(1)),
    pickingAccuracy: parseFloat((Math.random() * 5 + 95).toFixed(2)),
    packingAccuracy: parseFloat((Math.random() * 4 + 96).toFixed(2)),
  });
};
