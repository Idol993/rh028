export type UserRole = 'admin' | 'operation' | 'warehouse' | 'customer_service' | 'finance';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  roleName: string;
  warehouseId?: string;
  warehouseName?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName?: string;
  code?: string;
  description: string;
  permissions: Array<Permission | string>;
  createdAt: string;
  [key: string]: any;
}

export interface Permission {
  id: string;
  name: string;
  code?: string;
  module: string;
  description: string;
  displayName?: string;
  [key: string]: any;
}

export type PermissionCode = string;

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detail: Record<string, any> | string;
  ip?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  permissions: string[];
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  isActive: boolean;
  capacity?: number;
  createdAt: string;
}

export interface Store {
  id: string;
  platform: Platform;
  storeName: string;
  storeUrl?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
}

export type Platform = 'amazon' | 'shopify' | 'temu' | 'tiktok' | 'ebay' | 'walmart' | 'shein';

export const PLATFORM_NAMES: Record<Platform, string> = {
  amazon: 'Amazon',
  shopify: 'Shopify',
  temu: 'Temu',
  tiktok: 'TikTok Shop',
  ebay: 'eBay',
  walmart: 'Walmart',
  shein: 'SHEIN',
};
