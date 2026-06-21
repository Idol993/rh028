import type { PickingTask, PickingTaskItem, PackingTask, ReceivingTask, InventoryCountTask, PickPathPoint } from '@/@types/wms';
import type { OrderItem } from '@/@types/order';
import {
  generateUUID,
  generatePastDate,
  randomFromArray,
  randomInt,
  randomFloat,
  randomBoolean,
  warehouses,
  productNames,
  productCategories,
  generateSKU,
  generateOrderNo,
  generateTrackingNo,
} from './base';

export const generatePickingTaskItem = (index: number): PickingTaskItem => {
  const category = randomFromArray(productCategories);
  const sku = generateSKU(category, index);
  const quantity = randomInt(1, 5);
  const isPicked = randomBoolean(0.7);
  
  return {
    id: generateUUID(),
    sku,
    productName: randomFromArray(productNames),
    quantity,
    pickedQuantity: isPicked ? quantity : randomInt(0, quantity - 1),
    warehouseLocation: `${randomFromArray(['A', 'B', 'C', 'D'])}-${randomInt(1, 20)}-${randomInt(1, 5)}`,
    weight: randomFloat(0.1, 5.0, 2),
    isPicked,
  };
};

export const generatePickPath = (items: PickingTaskItem[]): PickPathPoint[] => {
  return items.map((item, index) => ({
    location: item.warehouseLocation,
    sku: item.sku,
    sequence: index + 1,
    distance: randomInt(10, 100),
  })).sort((a, b) => a.sequence - b.sequence);
};

export const generatePickingTask = (): PickingTask => {
  const warehouse = randomFromArray(warehouses);
  const itemCount = randomInt(1, 8);
  const items = Array.from({ length: itemCount }, (_, i) => generatePickingTaskItem(i + 1));
  
  const statuses: Array<'pending' | 'in_progress' | 'completed' | 'cancelled'> = ['pending', 'in_progress', 'completed', 'cancelled'];
  const status = randomFromArray(statuses);
  const isStarted = ['in_progress', 'completed'].includes(status);
  const isCompleted = status === 'completed';
  
  const allPicked = items.every(item => item.isPicked);
  
  return {
    id: generateUUID(),
    fulfillmentId: `ful-${randomInt(1, 1000)}`,
    orderId: `order-${randomInt(1, 1000)}`,
    orderNo: generateOrderNo(),
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    status: allPicked ? 'completed' : status,
    assigneeId: isStarted ? `user-${randomInt(3, 3)}` : undefined,
    assigneeName: isStarted ? '仓管员小张' : undefined,
    items,
    pickPath: isStarted ? generatePickPath(items) : undefined,
    startedAt: isStarted ? generatePastDate(randomInt(0, 1)) : undefined,
    completedAt: isCompleted ? generatePastDate(randomInt(0, 1)) : undefined,
    createdAt: generatePastDate(randomInt(0, 3)),
  };
};

export const generatePackingTask = (): PackingTask => {
  const warehouse = randomFromArray(warehouses);
  const itemCount = randomInt(1, 4);
  const category = randomFromArray(productCategories);
  
  const items: OrderItem[] = Array.from({ length: itemCount }, (_, i) => {
    const sku = generateSKU(category, i + 1);
    const quantity = randomInt(1, 5);
    return {
      id: generateUUID(),
      sku,
      productName: randomFromArray(productNames),
      quantity,
      unitPrice: randomFloat(9.99, 199.99),
      weight: randomFloat(0.1, 5.0, 2),
      dimensions: {
        length: randomFloat(5, 50, 1),
        width: randomFloat(5, 30, 1),
        height: randomFloat(2, 20, 1),
      },
      warehouseLocation: `${randomFromArray(['A', 'B', 'C', 'D'])}-${randomInt(1, 20)}-${randomInt(1, 5)}`,
      pickedQuantity: quantity,
      packedQuantity: quantity,
    };
  });
  
  const estimatedWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const statuses: Array<'pending' | 'verified' | 'weighed' | 'label_printed' | 'shipped' | 'cancelled'> = ['pending', 'verified', 'weighed', 'label_printed', 'shipped', 'cancelled'];
  const status = randomFromArray(statuses);
  
  const isWeighed = ['weighed', 'label_printed', 'shipped'].includes(status);
  const actualWeight = isWeighed ? estimatedWeight * randomFloat(0.9, 1.1) : undefined;
  const weightDeviation = actualWeight ? Math.abs(actualWeight - estimatedWeight) / estimatedWeight : undefined;
  const weightNeedsReview = weightDeviation !== undefined && weightDeviation > 0.1;
  
  const hasLabel = ['label_printed', 'shipped'].includes(status);
  const carrier = randomFromArray(['USPS', 'UPS', 'FedEx', 'DHL']);
  
  return {
    id: generateUUID(),
    fulfillmentId: `ful-${randomInt(1, 1000)}`,
    orderId: `order-${randomInt(1, 1000)}`,
    orderNo: generateOrderNo(),
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    status,
    items,
    estimatedWeight: parseFloat(estimatedWeight.toFixed(2)),
    actualWeight: actualWeight ? parseFloat(actualWeight.toFixed(2)) : undefined,
    weightDeviation: weightDeviation ? parseFloat((weightDeviation * 100).toFixed(2)) : undefined,
    weightNeedsReview,
    weightReviewedBy: weightNeedsReview ? `user-${randomInt(1, 5)}` : undefined,
    weightReviewedByName: weightNeedsReview ? randomFromArray(['系统管理员', '运营主管', '风控专员']) : undefined,
    trackingNo: hasLabel ? generateTrackingNo(carrier) : undefined,
    logisticsId: hasLabel ? `log-${randomInt(1, 10)}` : undefined,
    logisticsName: hasLabel ? carrier : undefined,
    labelUrl: hasLabel ? `https://api.example.com/labels/${generateUUID()}.pdf` : undefined,
    assigneeId: status !== 'pending' ? `user-${randomInt(3, 3)}` : undefined,
    assigneeName: status !== 'pending' ? '仓管员小张' : undefined,
    packedAt: ['weighed', 'label_printed', 'shipped'].includes(status) ? generatePastDate(randomInt(0, 1)) : undefined,
    shippedAt: status === 'shipped' ? generatePastDate(randomInt(0, 1)) : undefined,
    createdAt: generatePastDate(randomInt(0, 3)),
  };
};

export const generateReceivingTask = (): ReceivingTask => {
  const warehouse = randomFromArray(warehouses);
  const itemCount = randomInt(1, 10);
  const types: Array<'purchase' | 'return' | 'transfer'> = ['purchase', 'return', 'transfer'];
  const type = randomFromArray(types);
  const statuses: Array<'pending' | 'in_progress' | 'completed'> = ['pending', 'in_progress', 'completed'];
  const status = randomFromArray(statuses);
  
  const items = Array.from({ length: itemCount }, (_, i) => {
    const category = randomFromArray(productCategories);
    const sku = generateSKU(category, i + 1);
    const expectedQuantity = randomInt(10, 500);
    const receivedQuantity = status === 'completed' ? expectedQuantity : randomInt(0, expectedQuantity);
    const conditions: Array<'good' | 'damaged' | 'missing'> = ['good', 'damaged', 'missing'];
    
    return {
      id: generateUUID(),
      sku,
      productName: randomFromArray(productNames),
      expectedQuantity,
      receivedQuantity,
      condition: status === 'completed' ? randomFromArray(conditions) : undefined,
    };
  });
  
  const typePrefixes: Record<string, string> = {
    purchase: 'PO',
    return: 'RMA',
    transfer: 'TRF',
  };
  
  return {
    id: generateUUID(),
    type,
    referenceNo: `${typePrefixes[type]}-${String(randomInt(1, 99999)).padStart(6, '0')}`,
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    status,
    items,
    createdAt: generatePastDate(randomInt(0, 7)),
  };
};

export const generateInventoryCountTask = (): InventoryCountTask => {
  const warehouse = randomFromArray(warehouses);
  const itemCount = randomInt(10, 50);
  const statuses: Array<'pending' | 'in_progress' | 'completed'> = ['pending', 'in_progress', 'completed'];
  const status = randomFromArray(statuses);
  const isCounted = status === 'completed';
  
  const items = Array.from({ length: itemCount }, (_, i) => {
    const category = randomFromArray(productCategories);
    const sku = generateSKU(category, i + 1);
    const expectedQuantity = randomInt(50, 500);
    const countedQuantity = isCounted ? expectedQuantity + randomInt(-10, 10) : 0;
    
    return {
      id: generateUUID(),
      sku,
      productName: randomFromArray(productNames),
      location: `${randomFromArray(['A', 'B', 'C', 'D'])}-${randomInt(1, 20)}-${randomInt(1, 5)}`,
      expectedQuantity,
      countedQuantity,
      difference: countedQuantity - expectedQuantity,
      isCounted: isCounted || randomBoolean(0.5),
    };
  });
  
  return {
    id: generateUUID(),
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    status,
    items,
    createdAt: generatePastDate(randomInt(0, 30)),
  };
};

export const mockPickingTasks = Array.from({ length: 50 }, () => generatePickingTask());
export const mockPackingTasks = Array.from({ length: 40 }, () => generatePackingTask());
export const mockReceivingTasks = Array.from({ length: 30 }, () => generateReceivingTask());
export const mockInventoryCountTasks = Array.from({ length: 15 }, () => generateInventoryCountTask());
