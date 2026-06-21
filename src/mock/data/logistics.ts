import type { LogisticsChannel, TrackingRecord, Shipment, LogisticsStats } from '@/@types/logistics';
import {
  generateUUID,
  generatePastDate,
  generateTrackingNo,
  generateOrderNo,
  randomFromArray,
  randomInt,
  randomFloat,
  randomBoolean,
  warehouses,
  countryNames,
} from './base';

const carriers = ['USPS', 'UPS', 'FedEx', 'DHL', 'Amazon Logistics', 'USPS Priority', 'UPS Ground', 'FedEx Express'];
const carrierNames: Record<string, string> = {
  'USPS': '美国邮政',
  'UPS': '联合包裹',
  'FedEx': '联邦快递',
  'DHL': '敦豪物流',
  'Amazon Logistics': '亚马逊物流',
  'USPS Priority': 'USPS优先邮件',
  'UPS Ground': 'UPS陆运',
  'FedEx Express': 'FedEx快递',
};

export const generateLogisticsChannel = (index: number): LogisticsChannel => {
  const carrier = carriers[index % carriers.length];
  const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'IT', 'ES', 'NL'];
  const supportedCountries = countries.slice(0, randomInt(3, 10));
  
  return {
    id: `log-${index + 1}`,
    channelName: `${carrierNames[carrier]} - ${randomFromArray(['标准快递', '优先快递', '经济快递', '特快专递'])}`,
    carrier,
    carrierName: carrierNames[carrier],
    serviceType: randomFromArray(['standard', 'express', 'priority', 'economy']),
    supportedCountries,
    weightLimit: randomFloat(10, 50, 1),
    dimensionLimit: {
      length: randomInt(100, 300),
      width: randomInt(50, 200),
      height: randomInt(50, 200),
    },
    baseCost: randomFloat(3.99, 19.99, 2),
    costPerKg: randomFloat(1.5, 8.0, 2),
    estimatedDeliveryDays: {
      min: randomInt(1, 3),
      max: randomInt(5, 15),
    },
    isActive: randomBoolean(0.9),
    isTracked: randomBoolean(0.95),
    requiresSignature: randomBoolean(0.3),
    insuranceAvailable: randomBoolean(0.7),
    insuranceCostPercent: randomFloat(0.5, 2.0, 1),
    apiConfig: {
      endpoint: `https://api.${carrier.toLowerCase().replace(/\s+/g, '')}.com/v2`,
      apiKey: '***',
    },
    createdAt: generatePastDate(randomInt(30, 365)),
  };
};

export const generateTrackingRecord = (trackingNo: string, status: string): TrackingRecord => {
  const statuses = [
    { code: 'info_received', name: '物流信息已收到', description: '快递公司已收到发货通知' },
    { code: 'picked_up', name: '已揽收', description: '快递员已从仓库取件' },
    { code: 'in_transit', name: '运输中', description: '包裹正在运输途中' },
    { code: 'arrived_at_destination', name: '已到达目的地', description: '包裹已到达目的地城市' },
    { code: 'out_for_delivery', name: '派送中', description: '快递员正在派送' },
    { code: 'delivered', name: '已签收', description: '包裹已成功签收' },
    { code: 'exception', name: '异常', description: '包裹出现异常情况' },
    { code: 'failed_attempt', name: '派送失败', description: '首次派送尝试失败' },
  ];
  
  const currentStatus = statuses.find(s => s.code === status) || statuses[0];
  const location = `${randomFromArray(['Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Miami, FL'])}, US`;
  
  return {
    id: generateUUID(),
    trackingNo,
    statusCode: currentStatus.code,
    statusName: currentStatus.name,
    description: currentStatus.description,
    location,
    timestamp: generatePastDate(randomInt(0, 10)),
    courier: randomFromArray(carriers),
    rawData: JSON.stringify({ event: currentStatus.code, location }),
  };
};

export const generateShipment = (): Shipment => {
  const warehouse = randomFromArray(warehouses);
  const carrier = randomFromArray(carriers);
  const trackingNo = generateTrackingNo(carrier);
  
  const statuses: Array<'created' | 'label_printed' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned'> = 
    ['created', 'label_printed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned'];
  const status = randomFromArray(statuses);
  
  const hasException = status === 'exception';
  const exceptionTypes = ['customs_hold', 'address_issue', 'weather_delay', 'damaged', 'lost', 'refused'];
  
  const trackCount = status === 'delivered' ? randomInt(4, 8) : 
                      status === 'created' || status === 'label_printed' ? 1 :
                      randomInt(2, 5);
  
  const trackingHistory = Array.from({ length: trackCount }, (_, i) => {
    const timelineStatuses = ['info_received', 'picked_up', 'in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'];
    const code = i === trackCount - 1 ? 
      (status === 'delivered' ? 'delivered' : 
       status === 'exception' ? 'exception' :
       status === 'returned' ? 'exception' :
       timelineStatuses[Math.min(i, timelineStatuses.length - 1)]) :
      timelineStatuses[Math.min(i, timelineStatuses.length - 2)];
    
    return generateTrackingRecord(trackingNo, code);
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const destinationCountry = randomFromArray(Object.keys(countryNames));
  
  return {
    id: generateUUID(),
    shipmentNo: `SHP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(randomInt(1, 99999)).padStart(5, '0')}`,
    orderId: generateUUID(),
    orderNo: generateOrderNo(),
    fulfillmentId: generateUUID(),
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    logisticsId: `log-${randomInt(1, 15)}`,
    logisticsName: `${carrierNames[carrier]} - 标准快递`,
    carrier,
    carrierName: carrierNames[carrier],
    trackingNo,
    status,
    statusName: {
      created: '已创建',
      label_printed: '面单已打印',
      picked_up: '已揽收',
      in_transit: '运输中',
      out_for_delivery: '派送中',
      delivered: '已签收',
      exception: '异常',
      returned: '已退回',
    }[status],
    weight: randomFloat(0.5, 15.0, 2),
    dimensions: {
      length: randomInt(10, 100),
      width: randomInt(5, 50),
      height: randomInt(2, 30),
    },
    shippingCost: randomFloat(5.0, 50.0, 2),
    insuranceCost: randomBoolean(0.3) ? randomFloat(1.0, 10.0, 2) : 0,
    declaredValue: randomFloat(10.0, 500.0, 2),
    currency: 'USD',
    origin: {
      country: warehouse.country,
      city: warehouse.city,
      zipCode: warehouse.zipCode,
    },
    destination: {
      country: destinationCountry,
      countryName: countryNames[destinationCountry],
      city: randomFromArray(['Los Angeles', 'New York', 'London', 'Berlin', 'Tokyo', 'Paris']),
      zipCode: String(randomInt(10000, 99999)),
    },
    senderName: warehouse.name,
    senderContact: '+1-555-0100',
    recipientName: randomFromArray(['John Smith', 'Jane Doe', 'Mike Johnson', 'Emily Brown']),
    recipientContact: `+1-${randomInt(555, 555)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    signatureRequired: randomBoolean(0.3),
    trackingHistory,
    currentLocation: trackingHistory[trackingHistory.length - 1]?.location,
    estimatedDelivery: status !== 'delivered' && status !== 'returned' ? 
      generatePastDate(randomInt(-5, 10)) : undefined,
    actualDelivery: status === 'delivered' ? generatePastDate(randomInt(0, 5)) : undefined,
    exceptionType: hasException ? randomFromArray(exceptionTypes) : undefined,
    exceptionDescription: hasException ? randomFromArray(['海关扣留', '地址问题', '天气延误', '包裹损坏', '包裹丢失']) : undefined,
    exceptionReportedAt: hasException ? generatePastDate(randomInt(0, 3)) : undefined,
    exceptionResolved: hasException ? randomBoolean(0.5) : undefined,
    labelUrl: `https://api.example.com/labels/${trackingNo}.pdf`,
    commercialInvoiceUrl: randomBoolean(0.5) ? `https://api.example.com/invoices/${generateUUID()}.pdf` : undefined,
    createdAt: generatePastDate(randomInt(0, 30)),
    updatedAt: trackingHistory[trackingHistory.length - 1]?.timestamp || generatePastDate(0),
  };
};

export const generateLogisticsStats = () => {
  const totalShipments = randomInt(5000, 20000);
  const delivered = randomInt(4000, 18000);
  const inTransit = randomInt(500, 2000);
  const exception = randomInt(10, 100);
  
  return {
    totalShipments,
    delivered,
    inTransit,
    pending: randomInt(100, 500),
    exception,
    returned: randomInt(50, 200),
    onTimeRate: parseFloat(((delivered / (delivered + exception)) * 100).toFixed(2)),
    avgDeliveryTime: randomFloat(5.0, 12.0, 1),
    totalShippingCost: randomFloat(50000, 200000, 2),
    avgShippingCost: randomFloat(8.0, 15.0, 2),
    exceptionRate: parseFloat(((exception / totalShipments) * 100).toFixed(2)),
    topCarriers: [
      { carrier: 'USPS', count: randomInt(1000, 5000), cost: randomFloat(10000, 50000) },
      { carrier: 'UPS', count: randomInt(1000, 4000), cost: randomFloat(10000, 40000) },
      { carrier: 'FedEx', count: randomInt(800, 3000), cost: randomFloat(8000, 30000) },
      { carrier: 'DHL', count: randomInt(500, 2000), cost: randomFloat(5000, 20000) },
    ],
    exceptionTypes: [
      { type: 'customs_hold', count: randomInt(5, 30), percentage: randomFloat(20, 40) },
      { type: 'address_issue', count: randomInt(3, 20), percentage: randomFloat(15, 30) },
      { type: 'weather_delay', count: randomInt(2, 15), percentage: randomFloat(10, 25) },
      { type: 'damaged', count: randomInt(1, 10), percentage: randomFloat(5, 15) },
      { type: 'lost', count: randomInt(0, 5), percentage: randomFloat(0, 10) },
    ],
  };
};

export const mockLogisticsChannels = Array.from({ length: 15 }, (_, i) => generateLogisticsChannel(i));
export const mockShipments = Array.from({ length: 100 }, () => generateShipment());
export const mockLogisticsStats = generateLogisticsStats();
