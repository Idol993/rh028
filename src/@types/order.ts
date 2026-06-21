import type { Platform, Warehouse } from './system';

export type OrderStatus = 'pending' | 'risk_review' | 'allocated' | 'picking' | 'packing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial_refunded';
export type RiskLevel = 'low' | 'medium' | 'high';

export const ORDER_STATUS_NAMES: Record<OrderStatus, string> = {
  pending: '待处理',
  risk_review: '风控审核',
  allocated: '已分仓',
  picking: '拣货中',
  packing: '打包中',
  shipped: '已发货',
  delivered: '已签收',
  cancelled: '已取消',
  returned: '已退货',
};

export const RISK_LEVEL_NAMES: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export interface Address {
  country: string;
  state: string;
  city: string;
  address1: string;
  address2?: string;
  zipCode: string;
}

export interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  warehouseLocation?: string;
  pickedQuantity?: number;
  packedQuantity?: number;
}

export interface Order {
  id: string;
  orderNo: string;
  platformOrderNo: string;
  platform: Platform;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  riskLevel: RiskLevel;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  shippingMethod: string;
  warehouseId?: string;
  warehouseName?: string;
  trackingNo?: string;
  logisticsId?: string;
  logisticsName?: string;
  fulfillmentNo?: string;
  estimatedWeight?: number;
  actualWeight?: number;
  riskReviewedAt?: string;
  riskReviewerId?: string;
  riskReviewerName?: string;
  riskReviewRemark?: string;
  allocatedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  riskAssessment?: RiskAssessment;
  fulfillmentOrder?: FulfillmentOrder;
  operationLogs: OperationLog[];
}

export interface RiskAssessment {
  id: string;
  orderId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'held';
  reviewerId?: string;
  reviewerName?: string;
  reviewRemark?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface RiskFactor {
  type: string;
  name: string;
  description: string;
  score: number;
}

export interface FulfillmentOrder {
  id: string;
  orderId: string;
  fulfillmentNo: string;
  warehouseId: string;
  warehouseName: string;
  status: OrderStatus;
  priority: number;
  waveNo?: string;
  assigneeId?: string;
  assigneeName?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  platform?: Platform;
  status?: OrderStatus;
  riskLevel?: RiskLevel;
  storeId?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  trackingNo?: string;
  orderNo?: string;
}

export interface AllocationResult {
  success: boolean;
  warehouseId: string;
  warehouseName: string;
  allocatedItems: Array<{
    sku: string;
    quantity: number;
    availableAfter: number;
  }>;
  message?: string;
}

export interface OrderAuditRequest {
  decision: 'approve' | 'reject' | 'hold';
  remark: string;
}

export interface OrderShipRequest {
  trackingNo: string;
  logisticsId: string;
  weight: number;
}

export interface OrderCreateRequest {
  platform: Platform;
  storeId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  shippingAddress: Address;
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingFee: number;
  tax: number;
  shippingMethod: string;
}
