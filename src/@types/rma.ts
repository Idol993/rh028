export type RMAType = 'refund' | 'exchange' | 'repair';
export type RMAStatus = 'pending' | 'approved' | 'shipped' | 'received' | 'inspected' | 'processed' | 'closed';
export type ItemCondition = 'good' | 'damaged' | 'missing' | 'wrong_item';
export type DisposalResult = 'restock' | 'repair' | 'destroy' | 'return_to_supplier' | 'liquidate';

export const RMA_TYPE_NAMES: Record<RMAType, string> = {
  refund: '退款',
  exchange: '换货',
  repair: '维修',
};

export const RMA_STATUS_NAMES: Record<RMAStatus, string> = {
  pending: '待审核',
  approved: '已批准',
  shipped: '买家已寄回',
  received: '已入库',
  inspected: '已质检',
  processed: '已处置',
  closed: '已关闭',
};

export const ITEM_CONDITION_NAMES: Record<ItemCondition, string> = {
  good: '完好',
  damaged: '损坏',
  missing: '缺失',
  wrong_item: '错发商品',
};

export const DISPOSAL_RESULT_NAMES: Record<DisposalResult, string> = {
  restock: '重新上架',
  repair: '维修后上架',
  destroy: '报废销毁',
  return_to_supplier: '退回供应商',
  liquidate: '折价处理',
};

export interface RMA {
  id: string;
  rmaNo: string;
  orderId: string;
  orderNo: string;
  platformOrderNo: string;
  platform: string;
  type: RMAType;
  typeName: string;
  status: RMAStatus;
  statusName: string;
  reason: string;
  detailedReason?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  returnTrackingNo?: string;
  returnLogistics?: string;
  refundAmount?: number;
  currency: string;
  items: RMAItem[];
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  receivedAt?: string;
  receivedBy?: string;
  receivedByName?: string;
  inspectedAt?: string;
  inspectedBy?: string;
  inspectedByName?: string;
  processedAt?: string;
  processedBy?: string;
  processedByName?: string;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
}

export interface RMAItem {
  id: string;
  rmaId: string;
  orderItemId: string;
  sku: string;
  productName: string;
  requestedQuantity: number;
  receivedQuantity: number;
  receivedCondition?: ItemCondition;
  inspectionResult?: DisposalResult;
  inspectionRemark?: string;
  processedQuantity: number;
  disposalResult?: DisposalResult;
  disposalRemark?: string;
  refundAmount?: number;
  images?: string[];
}

export interface RMADetail extends RMA {
  orderSnapshot: {
    orderNo: string;
    totalAmount: number;
    currency: string;
    items: Array<{
      sku: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
  operationLogs: RMAOperationLog[];
}

export interface RMAOperationLog {
  id: string;
  rmaId: string;
  action: string;
  operatorId: string;
  operatorName: string;
  detail: string;
  createdAt: string;
}

export interface RMACreateRequest {
  orderId: string;
  type: RMAType;
  reason: string;
  detailedReason?: string;
  items: Array<{
    orderItemId: string;
    sku: string;
    quantity: number;
  }>;
  refundAmount?: number;
}

export interface RMAReceiveRequest {
  returnTrackingNo?: string;
  returnLogistics?: string;
  items: Array<{
    rmaItemId: string;
    receivedQuantity: number;
    condition: ItemCondition;
    images?: string[];
  }>;
}

export interface RMAInspectRequest {
  items: Array<{
    rmaItemId: string;
    inspectionResult: DisposalResult;
    inspectionRemark?: string;
  }>;
}

export interface RMAProcessRequest {
  items: Array<{
    rmaItemId: string;
    processedQuantity: number;
    disposalResult: DisposalResult;
    disposalRemark?: string;
  }>;
  refundAmount?: number;
}

export interface RMAQueryParams {
  page?: number;
  pageSize?: number;
  status?: RMAStatus;
  type?: RMAType;
  platform?: string;
  orderNo?: string;
  rmaNo?: string;
  buyerName?: string;
  startDate?: string;
  endDate?: string;
}

export interface RMADashboardData {
  totalRMA: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  totalRefundAmount: number;
  currency: string;
  returnRate: number;
  rmaByReason: Record<string, number>;
  rmaByType: Record<RMAType, number>;
  disposalStats: Record<DisposalResult, number>;
  trendData: Array<{ date: string; count: number; refundAmount: number }>;
}

export interface AIDetectionResult {
  condition: ItemCondition;
  confidence: number;
  damageType?: string;
  damageSeverity?: 'minor' | 'moderate' | 'severe';
  suggestedDisposal: DisposalResult;
  analysis: string;
}
