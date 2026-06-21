export type TrackingStatus = 'created' | 'picked_up' | 'in_transit' | 'customs' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';

export const TRACKING_STATUS_NAMES: Record<TrackingStatus, string> = {
  created: '已创建',
  picked_up: '已揽收',
  in_transit: '运输中',
  customs: '清关中',
  out_for_delivery: '派送中',
  delivered: '已签收',
  failed: '派送失败',
  returned: '已退回',
};

export interface LogisticsChannel {
  id: string;
  name: string;
  code: string;
  carrier: string;
  carrierName: string;
  apiConfig: Record<string, any>;
  supportedCountries: string[];
  basePrice: number;
  pricePerKg: number;
  pricePerVolKg?: number;
  fuelSurcharge: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  weightLimitMin?: number;
  weightLimitMax?: number;
  volumeLimit?: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  trackingNo: string;
  orderId?: string;
  orderNo?: string;
  eventCode: string;
  eventDescription: string;
  location?: string;
  eventTime: string;
  status: TrackingStatus;
  isException: boolean;
  exceptionType?: string;
  exceptionMessage?: string;
  createdAt: string;
}

export interface TrackingInfo {
  trackingNo: string;
  orderId?: string;
  orderNo?: string;
  logisticsId: string;
  logisticsName: string;
  carrier: string;
  status: TrackingStatus;
  statusName: string;
  estimatedDelivery?: string;
  signedBy?: string;
  events: TrackingEvent[];
  isException: boolean;
  exceptionCount: number;
  createdAt: string;
  lastUpdated: string;
}

export interface TrackingQueryParams {
  page?: number;
  pageSize?: number;
  trackingNo?: string;
  orderNo?: string;
  status?: TrackingStatus;
  logisticsId?: string;
  isException?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  logisticsId: string;
  size: string;
  format: 'zpl' | 'pdf' | 'png';
  templateContent: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PrintLabelRequest {
  orderId: string;
  logisticsId: string;
  templateId?: string;
}

export interface PrintLabelResponse {
  success: boolean;
  trackingNo: string;
  labelUrl: string;
  labelData?: string;
  format: string;
}

export interface ShippingQuote {
  logisticsId: string;
  logisticsName: string;
  carrier: string;
  estimatedDays: string;
  price: number;
  currency: string;
  weightLimit: string;
  isRecommended: boolean;
}

export interface ShippingQuoteRequest {
  country: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  declaredValue?: number;
}

export interface LogisticsDashboardData {
  totalShipments: number;
  shippedToday: number;
  inTransit: number;
  deliveredToday: number;
  exceptionCount: number;
  averageDeliveryDays: number;
  onTimeRate: number;
  costThisMonth: number;
  costByChannel: Record<string, number>;
  statusDistribution: Record<TrackingStatus, number>;
  exceptionByType: Record<string, number>;
  deliveryTimeTrend: Array<{ date: string; avgDays: number; onTimeRate: number }>;
}

export interface LogisticsExceptionAlert {
  id: string;
  type: 'not_shipped' | 'not_picked' | 'transit_timeout' | 'customs_hold' | 'delivery_failed' | 'tracking_stopped';
  level: 'warning' | 'danger';
  trackingNo: string;
  orderNo: string;
  buyerName: string;
  message: string;
  lastEventTime: string;
  daysSinceLastUpdate: number;
  createdAt: string;
}

export interface BatchShipRequest {
  orderIds: string[];
  logisticsId: string;
}

export interface BatchShipResult {
  success: number;
  failed: number;
  results: Array<{
    orderId: string;
    orderNo: string;
    success: boolean;
    trackingNo?: string;
    error?: string;
  }>;
}

export interface Manifest {
  id: string;
  manifestNo: string;
  logisticsId: string;
  logisticsName: string;
  shipmentCount: number;
  totalWeight: number;
  status: 'created' | 'submitted' | 'accepted' | 'rejected';
  shipments: Array<{
    orderId: string;
    orderNo: string;
    trackingNo: string;
    weight: number;
  }>;
  createdAt: string;
}
