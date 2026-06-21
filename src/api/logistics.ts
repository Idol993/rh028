import type { ApiResponse } from '@/@types/api';
import type { LogisticsChannel, Shipment, TrackingRecord, LogisticsStats } from '@/@types/logistics';
import { mockRequest, mockPageRequest } from './client';
import { mockLogisticsChannels, mockShipments, mockLogisticsStats, randomFromArray, generateUUID } from '@/mock/data';

const dynamicShipments: Shipment[] = [];
const dynamicTrackingRecords = new Map<string, TrackingRecord[]>();

const getAllShipments = () => {
  return [...dynamicShipments, ...mockShipments];
};

export const registerShipment = (shipment: Shipment, trackingRecords: TrackingRecord[]) => {
  dynamicShipments.unshift(shipment);
  dynamicTrackingRecords.set(shipment.trackingNo, trackingRecords);
};

export const getLogisticsChannels = async (params: { 
  page?: number; 
  pageSize?: number; 
  carrier?: string; 
  serviceType?: string; 
  country?: string;
  isActive?: boolean;
}): Promise<ApiResponse<{ list: LogisticsChannel[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockLogisticsChannels];
  
  if (params.carrier) {
    filtered = filtered.filter(c => c.carrier === params.carrier);
  }
  if (params.serviceType) {
    filtered = filtered.filter(c => c.serviceType === params.serviceType);
  }
  if (params.country) {
    filtered = filtered.filter(c => c.supportedCountries.includes(params.country!));
  }
  if (params.isActive !== undefined) {
    filtered = filtered.filter(c => c.isActive === params.isActive);
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getLogisticsChannelDetail = async (id: string): Promise<ApiResponse<LogisticsChannel>> => {
  const channel = mockLogisticsChannels.find(c => c.id === id) || mockLogisticsChannels[0];
  return mockRequest(channel);
};

export const createLogisticsChannel = async (data: Partial<LogisticsChannel>): Promise<ApiResponse<LogisticsChannel>> => {
  const newChannel: LogisticsChannel = {
    ...mockLogisticsChannels[0],
    ...data,
    id: `log-${mockLogisticsChannels.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newChannel, 500);
};

export const updateLogisticsChannel = async (id: string, data: Partial<LogisticsChannel>): Promise<ApiResponse<LogisticsChannel>> => {
  const channel = mockLogisticsChannels.find(c => c.id === id) || mockLogisticsChannels[0];
  return mockRequest({ ...channel, ...data });
};

export const toggleLogisticsChannel = async (id: string, isActive: boolean): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const deleteLogisticsChannel = async (id: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const getShipments = async (params: { 
  page?: number; 
  pageSize?: number; 
  status?: string; 
  carrier?: string; 
  warehouseId?: string;
  trackingNo?: string;
  orderNo?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: Shipment[]; total: number; page: number; pageSize: number }>> => {
  let filtered = getAllShipments();
  
  if (params.status) {
    filtered = filtered.filter(s => s.status === params.status);
  }
  if (params.carrier) {
    filtered = filtered.filter(s => s.carrier === params.carrier);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(s => s.warehouseId === params.warehouseId);
  }
  if (params.trackingNo) {
    filtered = filtered.filter(s => s.trackingNo === params.trackingNo);
  }
  if (params.orderNo) {
    filtered = filtered.filter(s => s.orderNo === params.orderNo);
  }
  if (params.startDate) {
    filtered = filtered.filter(s => s.createdAt >= params.startDate!);
  }
  if (params.endDate) {
    filtered = filtered.filter(s => s.createdAt <= params.endDate!);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(s =>
      (s.trackingNo && s.trackingNo.toLowerCase().includes(kw)) ||
      (s.orderNo && s.orderNo.toLowerCase().includes(kw)) ||
      (s.platformOrderNo && s.platformOrderNo.toLowerCase().includes(kw)) ||
      (s.shipmentNo && s.shipmentNo.toLowerCase().includes(kw)) ||
      (s.recipientName && s.recipientName.toLowerCase().includes(kw))
    );
  }
  
  filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getShipmentDetail = async (id: string): Promise<ApiResponse<Shipment>> => {
  const all = getAllShipments();
  const shipment = all.find(s => s.id === id) || all.find(s => s.trackingNo === id) || all.find(s => s.orderNo === id) || all[0];
  if (shipment && dynamicTrackingRecords.has(shipment.trackingNo)) {
    shipment.trackingHistory = dynamicTrackingRecords.get(shipment.trackingNo);
  }
  return mockRequest(shipment);
};

export const getTrackingInfo = async (trackingNo: string): Promise<ApiResponse<Array<TrackingRecord>>> => {
  if (dynamicTrackingRecords.has(trackingNo)) {
    return mockRequest(dynamicTrackingRecords.get(trackingNo)!, 300);
  }
  const shipment = getAllShipments().find(s => s.trackingNo === trackingNo) || getAllShipments()[0];
  return mockRequest(shipment.trackingHistory || [], 300);
};

export const createShipment = async (data: {
  orderId: string;
  orderNo: string;
  warehouseId: string;
  logisticsId: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  declaredValue?: number;
  signatureRequired?: boolean;
}): Promise<ApiResponse<Shipment>> => {
  const newShipment: Shipment = {
    ...mockShipments[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    shipmentNo: `SHP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    status: 'created',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return mockRequest(newShipment, 500);
};

export const printShippingLabel = async (shipmentId: string): Promise<ApiResponse<{ labelUrl: string; trackingNo: string }>> => {
  return mockRequest({
    labelUrl: `https://api.example.com/labels/${shipmentId}.pdf`,
    trackingNo: `9400${Math.floor(Math.random() * 1000000000000)}`,
  }, 500);
};

export const voidShipment = async (shipmentId: string, reason: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const trackShipment = async (trackingNo: string): Promise<ApiResponse<Shipment>> => {
  const shipment = mockShipments.find(s => s.trackingNo === trackingNo) || mockShipments[0];
  return mockRequest(shipment);
};

export const batchTrackShipments = async (trackingNos: string[]): Promise<ApiResponse<Array<{ trackingNo: string; status: string; statusName: string; lastUpdate: string; currentLocation?: string }>>> => {
  const statuses = ['created', 'label_printed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception'];
  const statusNames: Record<string, string> = {
    created: '已创建',
    label_printed: '面单已打印',
    picked_up: '已揽收',
    in_transit: '运输中',
    out_for_delivery: '派送中',
    delivered: '已签收',
    exception: '异常',
    returned: '已退回',
  };
  
  return mockRequest(trackingNos.map(no => {
    const status = randomFromArray(statuses);
    return {
      trackingNo: no,
      status,
      statusName: statusNames[status],
      lastUpdate: new Date().toISOString(),
      currentLocation: `${randomFromArray(['Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Miami, FL'])}, US`,
    };
  }));
};

export const getLogisticsStats = async (): Promise<ApiResponse<LogisticsStats>> => {
  const allShipments = getAllShipments();
  const total = allShipments.length;
  
  const today = new Date().toISOString().slice(0, 10);
  const shippedToday = allShipments.filter(s => (s.shippedAt || s.createdAt || '').slice(0, 10) === today).length;
  const delivered = allShipments.filter(s => s.status === 'delivered').length;
  const inTransit = allShipments.filter(s => s.status === 'in_transit' || s.status === 'shipped').length;
  const pending = allShipments.filter(s => s.status === 'created' || s.status === 'label_printed' || s.status === 'picked_up').length;
  const exception = allShipments.filter(s => s.status === 'exception').length;
  const returned = allShipments.filter(s => s.status === 'returned').length;
  const totalShippingCost = allShipments.reduce((sum, s) => sum + (s.shippingCost || 0), 0);
  
  const carrierMap = new Map<string, { count: number; cost: number }>();
  allShipments.forEach(s => {
    const c = s.carrier || 'Unknown';
    if (!carrierMap.has(c)) carrierMap.set(c, { count: 0, cost: 0 });
    const entry = carrierMap.get(c)!;
    entry.count++;
    entry.cost += s.shippingCost || 0;
  });
  
  const topCarriers = Array.from(carrierMap.entries())
    .map(([carrier, data]) => ({ carrier, count: data.count, cost: parseFloat(data.cost.toFixed(2)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return mockRequest({
    totalShipments: total,
    delivered,
    inTransit,
    pending,
    exception,
    exceptions: exception,
    exceptionCount: exception,
    returned,
    onTimeRate: parseFloat(((delivered + inTransit) / Math.max(total, 1) * 95).toFixed(2)),
    avgDeliveryTime: 7.2,
    averageDeliveryDays: 7.2,
    totalShippingCost: parseFloat(totalShippingCost.toFixed(2)),
    avgShippingCost: parseFloat((totalShippingCost / Math.max(total, 1)).toFixed(2)),
    exceptionRate: parseFloat((exception / Math.max(total, 1) * 100).toFixed(2)),
    shippedToday,
    deliveredToday: Math.floor(delivered * 0.08),
    costThisMonth: parseFloat((totalShippingCost * 0.35).toFixed(2)),
    topCarriers,
    exceptionTypes: [
      { type: 'customs_hold', count: Math.floor(exception * 0.4), percentage: 40 },
      { type: 'address_issue', count: Math.floor(exception * 0.3), percentage: 30 },
      { type: 'weather_delay', count: Math.floor(exception * 0.15), percentage: 15 },
      { type: 'damaged', count: Math.floor(exception * 0.1), percentage: 10 },
      { type: 'lost', count: Math.max(1, Math.floor(exception * 0.05)), percentage: 5 },
    ],
  } as LogisticsStats, 400);
};

export const calculateShippingCost = async (data: {
  warehouseId: string;
  destinationCountry: string;
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  serviceType?: string;
  declaredValue?: number;
}): Promise<ApiResponse<Array<{
  logisticsId: string;
  logisticsName: string;
  carrier: string;
  serviceType?: string;
  estimatedDeliveryDays: number | { min: number; max: number };
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  isRecommended: boolean;
}>>> => {
  const results = mockLogisticsChannels
    .filter(c => c.isActive && c.supportedCountries.includes(data.destinationCountry))
    .map(channel => {
      const weightCost = (channel.costPerKg ?? channel.pricePerKg ?? 0) * data.weight;
      const shippingCost = (channel.baseCost ?? channel.basePrice ?? 0) + weightCost;
      const insuranceCost = data.declaredValue && channel.insuranceCostPercent ? data.declaredValue * channel.insuranceCostPercent / 100 : 0;
      
      return {
        logisticsId: channel.id,
        logisticsName: channel.channelName ?? channel.name,
        carrier: channel.carrier,
        serviceType: channel.serviceType,
        estimatedDeliveryDays: channel.estimatedDeliveryDays ?? Math.floor((channel.estimatedDaysMin + channel.estimatedDaysMax) / 2),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        insuranceCost: parseFloat(insuranceCost.toFixed(2)),
        totalCost: parseFloat((shippingCost + insuranceCost).toFixed(2)),
        isRecommended: channel.serviceType === 'standard',
      };
    })
    .sort((a, b) => a.totalCost - b.totalCost);
  
  return mockRequest(results);
};
