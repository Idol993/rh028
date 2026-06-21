import { storage } from './storage';

export const hasPermission = (permissionCode: string): boolean => {
  const permissions = storage.getPermissions();
  return permissions.includes(permissionCode) || permissions.includes('*');
};

export const hasAnyPermission = (permissionCodes: string[]): boolean => {
  return permissionCodes.some((code) => hasPermission(code));
};

export const hasAllPermissions = (permissionCodes: string[]): boolean => {
  return permissionCodes.every((code) => hasPermission(code));
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_EDIT: 'order:edit',
  ORDER_AUDIT: 'order:audit',
  ORDER_ALLOCATE: 'order:allocate',
  ORDER_SHIP: 'order:ship',
  ORDER_EXPORT: 'order:export',
  
  WMS_PICKING: 'wms:picking',
  WMS_PACKING: 'wms:packing',
  WMS_SHIPPING: 'wms:shipping',
  WMS_RECEIVING: 'wms:receiving',
  WMS_COUNTING: 'wms:counting',
  
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_EXPORT: 'inventory:export',
  
  LOGISTICS_VIEW: 'logistics:view',
  LOGISTICS_CONFIG: 'logistics:config',
  LOGISTICS_PRINT: 'logistics:print',
  LOGISTICS_TRACK: 'logistics:track',
  
  RMA_VIEW: 'rma:view',
  RMA_CREATE: 'rma:create',
  RMA_RECEIVE: 'rma:receive',
  RMA_INSPECT: 'rma:inspect',
  RMA_PROCESS: 'rma:process',
  
  RISK_VIEW: 'risk:view',
  RISK_REVIEW: 'risk:review',
  RISK_RULE_CONFIG: 'risk:rule:config',
  RISK_BLACKLIST: 'risk:blacklist',
  
  FINANCE_VIEW: 'finance:view',
  FINANCE_EXPENSE: 'finance:expense',
  FINANCE_REPORT: 'finance:report',
  FINANCE_EXPORT: 'finance:export',
  
  SYSTEM_USER: 'system:user',
  SYSTEM_ROLE: 'system:role',
  SYSTEM_LOG: 'system:log',
  SYSTEM_CONFIG: 'system:config',
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(PERMISSIONS),
  
  operation: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.ORDER_AUDIT,
    PERMISSIONS.ORDER_ALLOCATE,
    PERMISSIONS.ORDER_SHIP,
    PERMISSIONS.ORDER_EXPORT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.INVENTORY_EXPORT,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.LOGISTICS_CONFIG,
    PERMISSIONS.LOGISTICS_PRINT,
    PERMISSIONS.LOGISTICS_TRACK,
    PERMISSIONS.RMA_VIEW,
    PERMISSIONS.RMA_CREATE,
    PERMISSIONS.RMA_INSPECT,
    PERMISSIONS.RISK_VIEW,
    PERMISSIONS.RISK_REVIEW,
    PERMISSIONS.RISK_RULE_CONFIG,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_REPORT,
  ],
  
  warehouse: [
    PERMISSIONS.WMS_PICKING,
    PERMISSIONS.WMS_PACKING,
    PERMISSIONS.WMS_SHIPPING,
    PERMISSIONS.WMS_RECEIVING,
    PERMISSIONS.WMS_COUNTING,
    PERMISSIONS.RMA_RECEIVE,
    PERMISSIONS.RMA_INSPECT,
    PERMISSIONS.RMA_PROCESS,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOGISTICS_PRINT,
  ],
  
  customer_service: [
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.RMA_VIEW,
    PERMISSIONS.RMA_CREATE,
    PERMISSIONS.LOGISTICS_TRACK,
  ],
  
  finance: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_EXPORT,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_EXPENSE,
    PERMISSIONS.FINANCE_REPORT,
    PERMISSIONS.FINANCE_EXPORT,
    PERMISSIONS.RMA_VIEW,
  ],
};
