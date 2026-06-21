import type { Inventory, InventoryTransaction, TransferOrder, PurchaseOrder, InventoryAlert, InventoryStats } from '@/@types/inventory';
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
} from './base';

const transactionTypes: Array<'in' | 'out' | 'lock' | 'unlock' | 'adjust' | 'transfer_in' | 'transfer_out'> = ['in', 'out', 'lock', 'unlock', 'adjust', 'transfer_in', 'transfer_out'];
const transactionTypeNames: Record<string, string> = {
  in: '入库',
  out: '出库',
  lock: '锁定',
  unlock: '解锁',
  adjust: '调整',
  transfer_in: '调拨入库',
  transfer_out: '调拨出库',
};

export const generateInventory = (warehouseId: string, warehouseName: string, skuIndex: number): Inventory => {
  const category = randomFromArray(productCategories);
  const sku = generateSKU(category, skuIndex);
  const productName = randomFromArray(productNames);
  const availableQuantity = randomInt(50, 1000);
  const lockedQuantity = randomInt(0, 50);
  const inTransitQuantity = randomInt(0, 200);
  const reservedQuantity = randomInt(0, 30);
  const totalQuantity = availableQuantity + lockedQuantity + inTransitQuantity + reservedQuantity;
  const unitCost = randomFloat(5.0, 150.0, 2);
  const totalValue = parseFloat((totalQuantity * unitCost).toFixed(2));
  const alertLevel = randomInt(20, 50);
  const isLowStock = availableQuantity < alertLevel;
  
  const locationCount = randomInt(1, 3);
  const locations = Array.from({ length: locationCount }, () => ({
    location: `${randomFromArray(['A', 'B', 'C', 'D'])}-${randomInt(1, 20)}-${randomInt(1, 5)}`,
    quantity: randomInt(10, availableQuantity),
    lastUpdated: generatePastDate(randomInt(0, 7)),
  }));
  
  return {
    id: generateUUID(),
    warehouseId,
    warehouseName,
    sku,
    productName,
    category,
    availableQuantity,
    lockedQuantity,
    inTransitQuantity,
    reservedQuantity,
    totalQuantity,
    unitCost,
    currency: 'USD',
    totalValue,
    alertLevel,
    isLowStock,
    lastUpdated: generatePastDate(randomInt(0, 2)),
    locations,
  };
};

export const generateInventoryTransaction = (inventoryId: string, warehouseId: string, sku: string): InventoryTransaction => {
  const type = randomFromArray(transactionTypes);
  const changeQuantity = type === 'in' || type === 'transfer_in' ? randomInt(10, 200) : 
                         type === 'out' || type === 'transfer_out' ? randomInt(1, 50) :
                         randomInt(1, 100);
  const balanceBefore = randomInt(100, 1000);
  const balanceAfter = type === 'in' || type === 'transfer_in' ? balanceBefore + changeQuantity :
                       type === 'out' || type === 'transfer_out' ? balanceBefore - changeQuantity :
                       balanceBefore + (randomBoolean() ? 1 : -1) * changeQuantity;
  
  const referenceTypes = ['采购单', '订单', '调拨单', '退货单', '盘点'];
  
  return {
    id: generateUUID(),
    inventoryId,
    warehouseId,
    sku,
    type,
    typeName: transactionTypeNames[type],
    changeQuantity,
    balanceBefore,
    balanceAfter,
    referenceType: randomFromArray(referenceTypes),
    referenceId: `ref-${randomInt(1, 1000)}`,
    referenceNo: `REF${String(randomInt(1, 99999)).padStart(6, '0')}`,
    remark: randomBoolean(0.3) ? '系统自动处理' : undefined,
    operatorId: randomBoolean(0.7) ? `user-${randomInt(1, 5)}` : undefined,
    operatorName: randomBoolean(0.7) ? randomFromArray(['系统管理员', '运营主管', '仓管员小张', '财务总监王总']) : undefined,
    createdAt: generatePastDate(randomInt(0, 30)),
  };
};

export const generateTransferOrder = (): TransferOrder => {
  const fromWarehouse = randomFromArray(warehouses);
  const toWarehouse = randomFromArray(warehouses.filter(w => w.id !== fromWarehouse.id));
  const category = randomFromArray(productCategories);
  const sku = generateSKU(category, randomInt(1, 100));
  const statuses: Array<'pending' | 'in_transit' | 'completed' | 'cancelled'> = ['pending', 'in_transit', 'completed', 'cancelled'];
  const status = randomFromArray(statuses);
  
  return {
    id: generateUUID(),
    transferNo: `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(randomInt(1, 9999)).padStart(4, '0')}`,
    sku,
    productName: randomFromArray(productNames),
    quantity: randomInt(10, 200),
    fromWarehouseId: fromWarehouse.id,
    fromWarehouseName: fromWarehouse.name,
    toWarehouseId: toWarehouse.id,
    toWarehouseName: toWarehouse.name,
    status,
    estimatedArrival: status !== 'cancelled' ? generatePastDate(randomInt(1, 10)) : undefined,
    actualArrival: status === 'completed' ? generatePastDate(randomInt(0, 3)) : undefined,
    createdAt: generatePastDate(randomInt(1, 30)),
    operatorId: `user-${randomInt(1, 5)}`,
    operatorName: randomFromArray(['系统管理员', '运营主管']),
  };
};

export const generatePurchaseOrder = (): PurchaseOrder => {
  const warehouse = randomFromArray(warehouses);
  const itemCount = randomInt(1, 5);
  const items = Array.from({ length: itemCount }, (_, i) => {
    const category = randomFromArray(productCategories);
    const sku = generateSKU(category, i + 1);
    const quantity = randomInt(50, 500);
    const unitCost = randomFloat(5.0, 100.0, 2);
    const statuses: Array<'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled'> = ['draft', 'approved', 'in_transit', 'received', 'cancelled'];
    const status = randomFromArray(statuses);
    return {
      id: generateUUID(),
      sku,
      productName: randomFromArray(productNames),
      quantity,
      unitCost,
      receivedQuantity: status === 'received' ? quantity : randomInt(0, quantity),
    };
  });
  
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const statuses: Array<'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled'> = ['draft', 'approved', 'in_transit', 'received', 'cancelled'];
  const status = randomFromArray(statuses);
  
  return {
    id: generateUUID(),
    purchaseNo: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(randomInt(1, 9999)).padStart(4, '0')}`,
    supplierId: `supplier-${randomInt(1, 20)}`,
    supplierName: randomFromArray(['深圳华强电子', '义乌小商品城', '广州白云皮具', '东莞制造有限公司', '上海进出口贸易']),
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    items,
    status,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    currency: 'USD',
    expectedDate: status !== 'cancelled' ? generatePastDate(randomInt(1, 30)) : undefined,
    createdAt: generatePastDate(randomInt(1, 60)),
  };
};

export const generateInventoryAlert = (): InventoryAlert => {
  const warehouse = randomFromArray(warehouses);
  const category = randomFromArray(productCategories);
  const sku = generateSKU(category, randomInt(1, 100));
  const types: Array<'low_stock' | 'overstock' | 'slow_moving' | 'expiring'> = ['low_stock', 'overstock', 'slow_moving', 'expiring'];
  const type = randomFromArray(types);
  const levels: Array<'info' | 'warning' | 'danger'> = ['info', 'warning', 'danger'];
  const level = type === 'low_stock' || type === 'expiring' ? randomFromArray(['warning', 'danger']) : randomFromArray(levels);
  
  const currentQuantity = randomInt(0, 50);
  const threshold = type === 'low_stock' ? randomInt(20, 50) : type === 'overstock' ? randomInt(500, 1000) : randomInt(30, 100);
  
  const messages: Record<string, string> = {
    low_stock: `库存不足，当前数量低于安全库存`,
    overstock: `库存积压，超出正常周转天数`,
    slow_moving: `滞销预警，商品超过90天未售出`,
    expiring: `临期预警，商品即将过期`,
  };
  
  return {
    id: generateUUID(),
    type,
    level,
    sku,
    productName: randomFromArray(productNames),
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    currentQuantity,
    threshold,
    message: messages[type],
    createdAt: generatePastDate(randomInt(0, 7)),
  };
};

export const generateInventoryStats = (): InventoryStats => {
  const totalSKUs = randomInt(500, 2000);
  const totalQuantity = randomInt(50000, 200000);
  const totalValue = randomFloat(500000, 5000000, 2);
  const lowStockCount = randomInt(10, 100);
  const outOfStockCount = randomInt(0, 20);
  const inTransitQuantity = randomInt(5000, 20000);
  const turnoverDays = randomInt(30, 90);
  
  return {
    totalSKUs,
    totalQuantity,
    totalValue,
    lowStockCount,
    outOfStockCount,
    inTransitQuantity,
    turnoverDays,
  };
};

export const generateInventories = (): Inventory[] => {
  const inventories: Inventory[] = [];
  warehouses.forEach(warehouse => {
    for (let i = 1; i <= 50; i++) {
      inventories.push(generateInventory(warehouse.id, warehouse.name, i));
    }
  });
  return inventories;
};

export const mockInventories = generateInventories();
export const mockTransferOrders = Array.from({ length: 50 }, () => generateTransferOrder());
export const mockPurchaseOrders = Array.from({ length: 30 }, () => generatePurchaseOrder());
export const mockInventoryAlerts = Array.from({ length: 20 }, () => generateInventoryAlert());
export const mockInventoryStats = generateInventoryStats();
