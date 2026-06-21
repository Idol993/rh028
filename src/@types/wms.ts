import type { OrderItem } from './order';

export type PickingTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type PackingTaskStatus = 'pending' | 'verified' | 'weighed' | 'label_printed' | 'shipped' | 'cancelled';

export const PICKING_STATUS_NAMES: Record<PickingTaskStatus, string> = {
  pending: '待拣货',
  in_progress: '拣货中',
  completed: '已完成',
  cancelled: '已取消',
};

export const PACKING_STATUS_NAMES: Record<PackingTaskStatus, string> = {
  pending: '待打包',
  verified: '已校验',
  weighed: '已称重',
  label_printed: '已打印面单',
  shipped: '已出库',
  cancelled: '已取消',
};

export interface PickingTask {
  id: string;
  fulfillmentId: string;
  orderId: string;
  orderNo: string;
  warehouseId: string;
  warehouseName: string;
  status: PickingTaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  items: PickingTaskItem[];
  pickPath?: PickPathPoint[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface PickingTaskItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  pickedQuantity: number;
  warehouseLocation: string;
  weight: number;
  isPicked: boolean;
}

export interface PickPathPoint {
  location: string;
  sku: string;
  sequence: number;
  distance: number;
}

export interface PackingTask {
  id: string;
  fulfillmentId: string;
  orderId: string;
  orderNo: string;
  warehouseId: string;
  warehouseName: string;
  status: PackingTaskStatus;
  items: OrderItem[];
  estimatedWeight: number;
  actualWeight?: number;
  weightDeviation?: number;
  weightNeedsReview: boolean;
  weightReviewedBy?: string;
  weightReviewedByName?: string;
  trackingNo?: string;
  logisticsId?: string;
  logisticsName?: string;
  labelUrl?: string;
  assigneeId?: string;
  assigneeName?: string;
  packedAt?: string;
  shippedAt?: string;
  createdAt: string;
}

export interface PackingDiscrepancy {
  sku: string;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  type: 'missing' | 'extra' | 'wrong_sku';
}

export interface PackingVerifyRequest {
  items: Array<{
    sku: string;
    quantity: number;
  }>;
}

export interface PackingVerifyResponse {
  success: boolean;
  discrepancies: PackingDiscrepancy[];
}

export interface WeighingRequest {
  actualWeight: number;
}

export interface WeighingResponse {
  success: boolean;
  deviation: number;
  deviationPercent: number;
  needsReview: boolean;
  threshold: number;
}

export interface PrintLabelRequest {
  logisticsId: string;
}

export interface PrintLabelResponse {
  labelUrl: string;
  trackingNo: string;
  logisticsId: string;
  logisticsName: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  currentProgress: number;
  totalItems: number;
  item?: PickingTaskItem;
}

export interface PickingScanRequest {
  sku: string;
  quantity: number;
  location: string;
}

export interface ReceivingTask {
  id: string;
  type: 'purchase' | 'return' | 'transfer';
  referenceNo: string;
  warehouseId: string;
  warehouseName: string;
  status: 'pending' | 'in_progress' | 'completed';
  items: ReceivingItem[];
  createdAt: string;
}

export interface ReceivingItem {
  id: string;
  sku: string;
  productName: string;
  expectedQuantity: number;
  receivedQuantity: number;
  condition?: 'good' | 'damaged' | 'missing';
}

export interface InventoryCountTask {
  id: string;
  warehouseId: string;
  warehouseName: string;
  status: 'pending' | 'in_progress' | 'completed';
  items: InventoryCountItem[];
  createdAt: string;
}

export interface InventoryCountItem {
  id: string;
  sku: string;
  productName: string;
  location: string;
  expectedQuantity: number;
  countedQuantity: number;
  difference: number;
  isCounted: boolean;
}
