import type { ApiResponse } from '@/@types/api';
import type { Inventory, InventoryDetail, InventoryQueryParams, InventoryStats, TransferOrder, PurchaseOrder, InventoryAlert, InventoryTransaction } from '@/@types/inventory';
import { mockRequest, mockPageRequest } from './client';
import { mockInventories, mockInventoryStats, mockTransferOrders, mockPurchaseOrders, mockInventoryAlerts, generateInventoryTransaction } from '@/mock/data';

export const getInventories = async (params: InventoryQueryParams): Promise<ApiResponse<{ list: Inventory[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockInventories];
  
  if (params.warehouseId) {
    filtered = filtered.filter(i => i.warehouseId === params.warehouseId);
  }
  if (params.sku) {
    filtered = filtered.filter(i => i.sku.toLowerCase().includes(params.sku!.toLowerCase()));
  }
  if (params.productName) {
    filtered = filtered.filter(i => i.productName.includes(params.productName!));
  }
  if (params.category) {
    filtered = filtered.filter(i => i.category === params.category);
  }
  if (params.isLowStock) {
    filtered = filtered.filter(i => i.isLowStock);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(i => 
      i.sku.toLowerCase().includes(kw) ||
      i.productName.toLowerCase().includes(kw)
    );
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getInventoryDetail = async (id: string): Promise<ApiResponse<InventoryDetail>> => {
  const inventory = mockInventories.find(i => i.id === id) || mockInventories[0];
  
  const transactions = Array.from({ length: 20 }, () => 
    generateInventoryTransaction(inventory.id, inventory.warehouseId, inventory.sku)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockRequest({
    ...inventory,
    transactions,
  });
};

export const getInventoryStats = async (): Promise<ApiResponse<InventoryStats>> => {
  return mockRequest(mockInventoryStats);
};

export const getTransferOrders = async (params: { page?: number; pageSize?: number; status?: string; warehouseId?: string }): Promise<ApiResponse<{ list: TransferOrder[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockTransferOrders];
  
  if (params.status) {
    filtered = filtered.filter(t => t.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(t => t.fromWarehouseId === params.warehouseId || t.toWarehouseId === params.warehouseId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getPurchaseOrders = async (params: { page?: number; pageSize?: number; status?: string; warehouseId?: string }): Promise<ApiResponse<{ list: PurchaseOrder[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockPurchaseOrders];
  
  if (params.status) {
    filtered = filtered.filter(p => p.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(p => p.warehouseId === params.warehouseId);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getInventoryAlerts = async (params: { page?: number; pageSize?: number; type?: string; level?: string }): Promise<ApiResponse<{ list: InventoryAlert[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockInventoryAlerts];
  
  if (params.type) {
    filtered = filtered.filter(a => a.type === params.type);
  }
  if (params.level) {
    filtered = filtered.filter(a => a.level === params.level);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const createTransferOrder = async (data: any): Promise<ApiResponse<TransferOrder>> => {
  const newTransfer = {
    ...mockTransferOrders[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    transferNo: `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newTransfer, 500);
};

export const createPurchaseOrder = async (data: any): Promise<ApiResponse<PurchaseOrder>> => {
  const newPurchase = {
    ...mockPurchaseOrders[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    purchaseNo: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newPurchase, 500);
};

export const adjustInventory = async (id: string, data: { quantity: number; reason: string }): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const stockTake = async (warehouseId: string): Promise<ApiResponse<{ count: number; differences: number }>> => {
  return mockRequest({
    count: Math.floor(Math.random() * 500) + 100,
    differences: Math.floor(Math.random() * 20),
  }, 1000);
};
