export interface Inventory {
  id: string;
  warehouseId: string;
  warehouseName: string;
  sku: string;
  productName: string;
  category?: string;
  availableQuantity: number;
  lockedQuantity: number;
  inTransitQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  unitCost: number;
  currency: string;
  totalValue: number;
  alertLevel: number;
  isLowStock: boolean;
  lastUpdated: string;
  locations: InventoryLocation[];
}

export interface InventoryLocation {
  location: string;
  quantity: number;
  lastUpdated: string;
}

export interface InventoryDetail extends Inventory {
  transactions: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  warehouseId: string;
  sku: string;
  type: 'in' | 'out' | 'lock' | 'unlock' | 'adjust' | 'transfer_in' | 'transfer_out';
  typeName: string;
  changeQuantity: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId?: string;
  referenceNo?: string;
  remark?: string;
  operatorId?: string;
  operatorName?: string;
  createdAt: string;
}

export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  sku?: string;
  productName?: string;
  warehouseId?: string;
  category?: string;
  isLowStock?: boolean;
  keyword?: string;
}

export interface InventoryLockRequest {
  quantity: number;
  warehouseId: string;
  orderId: string;
  orderNo: string;
}

export interface InventoryDeductRequest {
  quantity: number;
  warehouseId: string;
  orderId: string;
  orderNo: string;
}

export interface InventoryAddRequest {
  quantity: number;
  warehouseId: string;
  referenceNo: string;
  type: 'purchase' | 'return' | 'transfer';
  unitCost?: number;
  remark?: string;
}

export interface TransferOrder {
  id: string;
  transferNo: string;
  sku: string;
  productName: string;
  quantity: number;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
  operatorId: string;
  operatorName: string;
}

export interface TransferOrderCreateRequest {
  sku: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
  estimatedArrival?: string;
  remark?: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  items: PurchaseOrderItem[];
  status: 'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled';
  totalAmount: number;
  currency: string;
  expectedDate?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'slow_moving' | 'expiring';
  level: 'info' | 'warning' | 'danger';
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: number;
  threshold: number;
  message: string;
  createdAt: string;
}

export interface InventoryStats {
  totalSKUs: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inTransitQuantity: number;
  turnoverDays: number;
}
