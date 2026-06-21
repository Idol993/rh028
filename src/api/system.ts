import type { ApiResponse } from '@/@types/api';
import type { User, Warehouse, Store, Role, Permission, OperationLog } from '@/@types/system';
import { mockRequest, mockPageRequest } from './client';
import { mockUsers, warehouses, stores, randomFromArray, generateUUID, generatePastDate } from '@/mock/data';

export const getUsers = async (params: { 
  page?: number; 
  pageSize?: number; 
  role?: string; 
  status?: string; 
  warehouseId?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: User[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockUsers];
  
  if (params.role) {
    filtered = filtered.filter(u => u.role === params.role);
  }
  if (params.status) {
    filtered = filtered.filter(u => u.status === params.status);
  }
  if (params.warehouseId) {
    filtered = filtered.filter(u => u.warehouseId === params.warehouseId);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(u => 
      u.username.toLowerCase().includes(kw) ||
      u.name.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw)
    );
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getUserDetail = async (id: string): Promise<ApiResponse<User>> => {
  const user = mockUsers.find(u => u.id === id) || mockUsers[0];
  return mockRequest(user);
};

export const createUser = async (data: Partial<User> & { password: string }): Promise<ApiResponse<User>> => {
  const newUser: User = {
    ...mockUsers[0],
    ...data,
    id: `user-${mockUsers.length + 1}`,
    permissions: [],
    lastLoginAt: undefined,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newUser, 500);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
  const user = mockUsers.find(u => u.id === id) || mockUsers[0];
  return mockRequest({ ...user, ...data });
};

export const toggleUserStatus = async (id: string, status: 'active' | 'inactive'): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const resetUserPassword = async (id: string, newPassword: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const getWarehouses = async (params: { 
  page?: number; 
  pageSize?: number; 
  country?: string; 
  isActive?: boolean;
  keyword?: string;
}): Promise<ApiResponse<{ list: Warehouse[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...warehouses];
  
  if (params.country) {
    filtered = filtered.filter(w => w.country === params.country);
  }
  if (params.isActive !== undefined) {
    filtered = filtered.filter(w => w.isActive === params.isActive);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(w => 
      w.name.toLowerCase().includes(kw) ||
      w.code.toLowerCase().includes(kw)
    );
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getWarehouseDetail = async (id: string): Promise<ApiResponse<Warehouse>> => {
  const warehouse = warehouses.find(w => w.id === id) || warehouses[0];
  return mockRequest(warehouse);
};

export const createWarehouse = async (data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
  const newWarehouse: Warehouse = {
    ...warehouses[0],
    ...data,
    id: `wh-${warehouses.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newWarehouse, 500);
};

export const updateWarehouse = async (id: string, data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
  const warehouse = warehouses.find(w => w.id === id) || warehouses[0];
  return mockRequest({ ...warehouse, ...data });
};

export const toggleWarehouseStatus = async (id: string, isActive: boolean): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const getStores = async (params: { 
  page?: number; 
  pageSize?: number; 
  platform?: string; 
  isActive?: boolean;
  keyword?: string;
}): Promise<ApiResponse<{ list: Store[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...stores];
  
  if (params.platform) {
    filtered = filtered.filter(s => s.platform === params.platform);
  }
  if (params.isActive !== undefined) {
    filtered = filtered.filter(s => s.isActive === params.isActive);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(s => 
      s.storeName.toLowerCase().includes(kw)
    );
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getStoreDetail = async (id: string): Promise<ApiResponse<Store>> => {
  const store = stores.find(s => s.id === id) || stores[0];
  return mockRequest(store);
};

export const createStore = async (data: Partial<Store>): Promise<ApiResponse<Store>> => {
  const newStore: Store = {
    ...stores[0],
    ...data,
    id: `store-${stores.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  return mockRequest(newStore, 500);
};

export const updateStore = async (id: string, data: Partial<Store>): Promise<ApiResponse<Store>> => {
  const store = stores.find(s => s.id === id) || stores[0];
  return mockRequest({ ...store, ...data });
};

export const toggleStoreStatus = async (id: string, isActive: boolean): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const syncStore = async (id: string): Promise<ApiResponse<{ orders: number; products: number }>> => {
  return mockRequest({
    orders: Math.floor(Math.random() * 100) + 10,
    products: Math.floor(Math.random() * 500) + 50,
  }, 1500);
};

export const getRoles = async (): Promise<ApiResponse<Role[]>> => {
  const roles: Role[] = [
    {
      id: 'role-001',
      name: 'admin',
      displayName: '系统管理员',
      description: '拥有系统所有权限',
      permissions: ['*'],
      createdAt: generatePastDate(180),
    },
    {
      id: 'role-002',
      name: 'operation',
      displayName: '运营',
      description: '商品管理、库存管理、订单处理、数据查看',
      permissions: ['order:*', 'inventory:*', 'wms:*', 'rma:*', 'dashboard:view'],
      createdAt: generatePastDate(180),
    },
    {
      id: 'role-003',
      name: 'warehouse',
      displayName: '仓管员',
      description: 'WMS作业、入库、出库、盘点',
      permissions: ['wms:*', 'inventory:view'],
      createdAt: generatePastDate(180),
    },
    {
      id: 'role-004',
      name: 'customer_service',
      displayName: '客服',
      description: '订单查询、买家沟通、异常跟进、RMA创建',
      permissions: ['order:view', 'rma:*', 'logistics:view'],
      createdAt: generatePastDate(180),
    },
    {
      id: 'role-005',
      name: 'finance',
      displayName: '财务总监',
      description: '利润报表、费用核算、对账、成本分析',
      permissions: ['finance:*', 'order:view', 'dashboard:view'],
      createdAt: generatePastDate(180),
    },
  ];
  return mockRequest(roles);
};

export const getPermissions = async (): Promise<ApiResponse<Permission[]>> => {
  const permissions: Permission[] = [
    { id: 'p-001', module: 'dashboard', name: 'dashboard:view', displayName: '查看运营大屏', description: '查看运营数据大屏' },
    { id: 'p-002', module: 'order', name: 'order:view', displayName: '查看订单', description: '查看订单列表和详情' },
    { id: 'p-003', module: 'order', name: 'order:create', displayName: '创建订单', description: '手动创建订单' },
    { id: 'p-004', module: 'order', name: 'order:edit', displayName: '编辑订单', description: '编辑订单信息' },
    { id: 'p-005', module: 'order', name: 'order:audit', displayName: '审核订单', description: '审核风险订单' },
    { id: 'p-006', module: 'order', name: 'order:cancel', displayName: '取消订单', description: '取消订单' },
    { id: 'p-007', module: 'order', name: 'order:*', displayName: '订单全部权限', description: '订单模块所有操作' },
    { id: 'p-008', module: 'inventory', name: 'inventory:view', displayName: '查看库存', description: '查看库存信息' },
    { id: 'p-009', module: 'inventory', name: 'inventory:edit', displayName: '编辑库存', description: '调整库存数量' },
    { id: 'p-010', module: 'inventory', name: 'inventory:*', displayName: '库存全部权限', description: '库存模块所有操作' },
    { id: 'p-011', module: 'wms', name: 'wms:view', displayName: '查看WMS任务', description: '查看WMS作业任务' },
    { id: 'p-012', module: 'wms', name: 'wms:operate', displayName: 'WMS操作', description: '执行拣货、打包、出库操作' },
    { id: 'p-013', module: 'wms', name: 'wms:*', displayName: 'WMS全部权限', description: 'WMS模块所有操作' },
    { id: 'p-014', module: 'risk', name: 'risk:view', displayName: '查看风控', description: '查看风控订单和规则' },
    { id: 'p-015', module: 'risk', name: 'risk:audit', displayName: '风控审核', description: '审核风险订单' },
    { id: 'p-016', module: 'risk', name: 'risk:manage', displayName: '风控管理', description: '管理风控规则和黑名单' },
    { id: 'p-017', module: 'rma', name: 'rma:view', displayName: '查看退货', description: '查看退货申请' },
    { id: 'p-018', module: 'rma', name: 'rma:create', displayName: '创建退货', description: '创建退货申请' },
    { id: 'p-019', module: 'rma', name: 'rma:process', displayName: '处理退货', description: '审核、质检、处理退货' },
    { id: 'p-020', module: 'rma', name: 'rma:*', displayName: '退货全部权限', description: 'RMA模块所有操作' },
    { id: 'p-021', module: 'logistics', name: 'logistics:view', displayName: '查看物流', description: '查看物流信息' },
    { id: 'p-022', module: 'logistics', name: 'logistics:manage', displayName: '物流管理', description: '管理物流渠道' },
    { id: 'p-023', module: 'finance', name: 'finance:view', displayName: '查看财务', description: '查看财务数据' },
    { id: 'p-024', module: 'finance', name: 'finance:manage', displayName: '财务管理', description: '管理费用、对账、生成报表' },
    { id: 'p-025', module: 'finance', name: 'finance:*', displayName: '财务全部权限', description: '财务模块所有操作' },
    { id: 'p-026', module: 'system', name: 'system:view', displayName: '查看系统', description: '查看系统设置' },
    { id: 'p-027', module: 'system', name: 'system:manage', displayName: '系统管理', description: '管理用户、仓库、店铺' },
    { id: 'p-028', module: 'system', name: 'system:*', displayName: '系统全部权限', description: '系统模块所有操作' },
  ];
  return mockRequest(permissions);
};

export const getOperationLogs = async (params: { 
  page?: number; 
  pageSize?: number; 
  userId?: string; 
  module?: string; 
  action?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): Promise<ApiResponse<{ list: OperationLog[]; total: number; page: number; pageSize: number }>> => {
  const actions = ['登录', '退出', '创建', '编辑', '删除', '审核', '导出', '打印', '同步'];
  const modules = ['订单', '库存', 'WMS', '风控', 'RMA', '物流', '财务', '系统'];
  
  const logs: OperationLog[] = Array.from({ length: 200 }, () => ({
    id: generateUUID(),
    userId: `user-${Math.floor(Math.random() * 5) + 1}`,
    userName: randomFromArray(['系统管理员', '运营主管', '仓管员小张', '客服小李', '财务总监王总']),
    role: randomFromArray(['admin', 'operation', 'warehouse', 'customer_service', 'finance']),
    module: randomFromArray(modules),
    action: randomFromArray(actions),
    targetId: generateUUID(),
    targetType: randomFromArray(['订单', '商品', '用户', '仓库', '店铺']),
    detail: `执行了${randomFromArray(['创建', '编辑', '删除', '审核'])}操作`,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: generatePastDate(Math.floor(Math.random() * 30)),
  }));
  
  let filtered = [...logs];
  
  if (params.userId) {
    filtered = filtered.filter(l => l.userId === params.userId);
  }
  if (params.module) {
    filtered = filtered.filter(l => l.module === params.module);
  }
  if (params.action) {
    filtered = filtered.filter(l => l.action === params.action);
  }
  if (params.startDate) {
    filtered = filtered.filter(l => l.createdAt >= params.startDate!);
  }
  if (params.endDate) {
    filtered = filtered.filter(l => l.createdAt <= params.endDate!);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(l => 
      l.userName.toLowerCase().includes(kw) ||
      l.detail.toLowerCase().includes(kw)
    );
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};
