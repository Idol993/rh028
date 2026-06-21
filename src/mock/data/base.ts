import { faker } from '@faker-js/faker/locale/zh_CN';
import type { Platform, Warehouse, Store, User } from '@/@types/system';

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const platforms: Platform[] = ['amazon', 'shopify', 'temu', 'tiktok', 'ebay', 'walmart', 'shein'];

export const platformNames: Record<Platform, string> = {
  amazon: 'Amazon',
  shopify: 'Shopify',
  temu: 'Temu',
  tiktok: 'TikTok Shop',
  ebay: 'eBay',
  walmart: 'Walmart',
  shein: 'SHEIN',
};

export const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'IT', 'ES', 'NL'];

export const countryNames: Record<string, string> = {
  US: '美国',
  UK: '英国',
  DE: '德国',
  FR: '法国',
  CA: '加拿大',
  AU: '澳大利亚',
  JP: '日本',
  IT: '意大利',
  ES: '西班牙',
  NL: '荷兰',
};

export const warehouses: Warehouse[] = [
  {
    id: 'wh-001',
    name: '洛杉矶海外仓',
    code: 'LA-01',
    country: 'US',
    state: 'CA',
    city: 'Los Angeles',
    address: '123 Industrial Blvd, Los Angeles, CA 90001',
    zipCode: '90001',
    isActive: true,
    capacity: 100000,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wh-002',
    name: '新泽西海外仓',
    code: 'NJ-01',
    country: 'US',
    state: 'NJ',
    city: 'Newark',
    address: '456 Logistics Way, Newark, NJ 07102',
    zipCode: '07102',
    isActive: true,
    capacity: 80000,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'wh-003',
    name: '柏林海外仓',
    code: 'DE-01',
    country: 'DE',
    state: 'Berlin',
    city: 'Berlin',
    address: '789 Europark, Berlin 10115',
    zipCode: '10115',
    isActive: true,
    capacity: 50000,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'wh-004',
    name: '伦敦海外仓',
    code: 'UK-01',
    country: 'UK',
    state: 'England',
    city: 'London',
    address: '321 Thames Road, London E16 2AB',
    zipCode: 'E16 2AB',
    isActive: true,
    capacity: 60000,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'wh-005',
    name: '东京海外仓',
    code: 'JP-01',
    country: 'JP',
    state: 'Tokyo',
    city: '东京',
    address: '東京都大田区羽田空港1-1-1',
    zipCode: '144-0041',
    isActive: true,
    capacity: 40000,
    createdAt: '2024-03-01T00:00:00Z',
  },
];

export const stores: Store[] = [
  {
    id: 'store-001',
    platform: 'amazon',
    storeName: 'Amazon US Store',
    storeUrl: 'https://www.amazon.com/shops/yourstore',
    isActive: true,
    lastSyncAt: '2024-06-20T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-002',
    platform: 'shopify',
    storeName: 'MyShopify Store',
    storeUrl: 'https://mystore.myshopify.com',
    isActive: true,
    lastSyncAt: '2024-06-20T10:25:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'store-003',
    platform: 'temu',
    storeName: 'Temu Official Store',
    isActive: true,
    lastSyncAt: '2024-06-20T10:20:00Z',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'store-004',
    platform: 'tiktok',
    storeName: 'TikTok Shop US',
    isActive: true,
    lastSyncAt: '2024-06-20T10:15:00Z',
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'store-005',
    platform: 'ebay',
    storeName: 'eBay Top Seller',
    storeUrl: 'https://www.ebay.com/str/yourstore',
    isActive: true,
    lastSyncAt: '2024-06-20T10:10:00Z',
    createdAt: '2024-01-20T00:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@crossborder.com',
    phone: '13800138000',
    role: 'admin',
    roleName: '系统管理员',
    permissions: ['*'],
    status: 'active',
    lastLoginAt: '2024-06-20T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'operation',
    name: '运营主管',
    email: 'operation@crossborder.com',
    phone: '13800138001',
    role: 'operation',
    roleName: '运营',
    permissions: [],
    status: 'active',
    lastLoginAt: '2024-06-20T08:30:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'warehouse',
    name: '仓管员小张',
    email: 'warehouse@crossborder.com',
    phone: '13800138002',
    role: 'warehouse',
    roleName: '仓管员',
    warehouseId: 'wh-001',
    warehouseName: '洛杉矶海外仓',
    permissions: [],
    status: 'active',
    lastLoginAt: '2024-06-20T07:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'user-004',
    username: 'customer_service',
    name: '客服小李',
    email: 'cs@crossborder.com',
    phone: '13800138003',
    role: 'customer_service',
    roleName: '客服',
    permissions: [],
    status: 'active',
    lastLoginAt: '2024-06-20T09:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-005',
    username: 'finance',
    name: '财务总监王总',
    email: 'finance@crossborder.com',
    phone: '13800138004',
    role: 'finance',
    roleName: '财务总监',
    permissions: [],
    status: 'active',
    lastLoginAt: '2024-06-20T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const productCategories = [
  '电子产品',
  '服装配饰',
  '家居用品',
  '美妆个护',
  '运动户外',
  '玩具礼品',
  '汽车用品',
  '办公用品',
];

export const productNames = [
  '无线蓝牙耳机',
  '智能手表',
  '手机壳',
  '数据线',
  '充电宝',
  'LED台灯',
  '瑜伽垫',
  '保温杯',
  '收纳盒',
  '香薰蜡烛',
  '洗脸巾',
  '护手霜',
  '运动手环',
  '按摩仪',
  '加湿器',
  '小风扇',
  '键盘',
  '鼠标',
  '耳机支架',
  '屏幕清洁剂',
];

export const generateSKU = (category: string, index: number): string => {
  const prefix = category.substring(0, 2).toUpperCase();
  return `${prefix}-${String(index).padStart(4, '0')}`;
};

export const randomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

export const randomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};

export const generateOrderNo = (): string => {
  const prefix = 'ORD';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

export const generateFulfillmentNo = (): string => {
  const prefix = 'FUL';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

export const generateRMANo = (): string => {
  const prefix = 'RMA';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

export const generateTrackingNo = (carrier: string = 'USPS'): string => {
  const prefixes: Record<string, string> = {
    USPS: '9400',
    UPS: '1Z',
    FedEx: '77',
    DHL: 'JD',
  };
  const prefix = prefixes[carrier] || '9400';
  const numbers = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${numbers}`;
};

export const generatePastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date.toISOString();
};

export const generateFutureDate = (daysAfter: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAfter);
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date.toISOString();
};

export const generateAddress = (country?: string): {
  country: string;
  state: string;
  city: string;
  address1: string;
  address2?: string;
  zipCode: string;
} => {
  const targetCountry = country || randomFromArray(countries);
  
  if (targetCountry === 'US') {
    const usStates = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'GA', 'NC', 'OH', 'PA'];
    const usCities = ['Los Angeles', 'New York', 'Houston', 'Miami', 'Chicago', 'Seattle', 'Atlanta', 'Charlotte', 'Columbus', 'Philadelphia'];
    return {
      country: targetCountry,
      state: randomFromArray(usStates),
      city: randomFromArray(usCities),
      address1: `${randomInt(100, 9999)} ${faker.location.street()}`,
      address2: randomBoolean(0.3) ? `Apt ${randomInt(1, 999)}` : undefined,
      zipCode: `${randomInt(10000, 99999)}`,
    };
  }
  
  return {
    country: targetCountry,
    state: faker.location.state(),
    city: faker.location.city(),
    address1: faker.location.streetAddress(),
    zipCode: faker.location.zipCode(),
  };
};

export const generateBuyer = (): {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
} => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    buyerName: `${firstName} ${lastName}`,
    buyerEmail: faker.internet.email({ firstName, lastName }).toLowerCase(),
    buyerPhone: faker.phone.number(),
  };
};
