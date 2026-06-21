import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  Package,
  ShieldAlert,
  RotateCcw,
  Truck,
  DollarSign,
  Settings,
  Users,
  FileText,
  BarChart3,
} from 'lucide-react';
import { PERMISSIONS } from '@/utils/permission';

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '运营大屏',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    key: 'orders',
    label: '订单管理',
    path: '/orders',
    icon: <ShoppingCart className="w-5 h-5" />,
    permission: PERMISSIONS.ORDER_VIEW,
    children: [
      {
        key: 'orders-list',
        label: '订单列表',
        path: '/orders',
        icon: <FileText className="w-4 h-4" />,
        permission: PERMISSIONS.ORDER_VIEW,
      },
      {
        key: 'orders-risk',
        label: '风控审单',
        path: '/orders/risk',
        icon: <ShieldAlert className="w-4 h-4" />,
        permission: PERMISSIONS.RISK_VIEW,
      },
    ],
  },
  {
    key: 'wms',
    label: 'WMS作业',
    path: '/wms',
    icon: <Warehouse className="w-5 h-5" />,
    permission: PERMISSIONS.WMS_PICKING,
    children: [
      {
        key: 'wms-picking',
        label: '拣货作业',
        path: '/wms/picking',
        icon: <Package className="w-4 h-4" />,
        permission: PERMISSIONS.WMS_PICKING,
      },
      {
        key: 'wms-packing',
        label: '打包出库',
        path: '/wms/packing',
        icon: <Package className="w-4 h-4" />,
        permission: PERMISSIONS.WMS_PACKING,
      },
      {
        key: 'wms-receiving',
        label: '入库作业',
        path: '/wms/receiving',
        icon: <Package className="w-4 h-4" />,
        permission: PERMISSIONS.WMS_RECEIVING,
      },
    ],
  },
  {
    key: 'inventory',
    label: '库存管理',
    path: '/inventory',
    icon: <Package className="w-5 h-5" />,
    permission: PERMISSIONS.INVENTORY_VIEW,
    children: [
      {
        key: 'inventory-list',
        label: '库存查询',
        path: '/inventory',
        icon: <BarChart3 className="w-4 h-4" />,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        key: 'inventory-transfer',
        label: '库存调拨',
        path: '/inventory/transfer',
        icon: <Package className="w-4 h-4" />,
        permission: PERMISSIONS.INVENTORY_TRANSFER,
      },
    ],
  },
  {
    key: 'rma',
    label: '退货RMA',
    path: '/rma',
    icon: <RotateCcw className="w-5 h-5" />,
    permission: PERMISSIONS.RMA_VIEW,
  },
  {
    key: 'logistics',
    label: '物流追踪',
    path: '/logistics',
    icon: <Truck className="w-5 h-5" />,
    permission: PERMISSIONS.LOGISTICS_VIEW,
  },
  {
    key: 'finance',
    label: '财务核算',
    path: '/finance',
    icon: <DollarSign className="w-5 h-5" />,
    permission: PERMISSIONS.FINANCE_VIEW,
    children: [
      {
        key: 'finance-profit',
        label: '利润报表',
        path: '/finance/profit',
        icon: <BarChart3 className="w-4 h-4" />,
        permission: PERMISSIONS.FINANCE_REPORT,
      },
      {
        key: 'finance-expense',
        label: '费用管理',
        path: '/finance/expense',
        icon: <DollarSign className="w-4 h-4" />,
        permission: PERMISSIONS.FINANCE_EXPENSE,
      },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    path: '/system',
    icon: <Settings className="w-5 h-5" />,
    permission: PERMISSIONS.SYSTEM_USER,
    children: [
      {
        key: 'system-users',
        label: '用户管理',
        path: '/system/users',
        icon: <Users className="w-4 h-4" />,
        permission: PERMISSIONS.SYSTEM_USER,
      },
      {
        key: 'system-warehouses',
        label: '仓库管理',
        path: '/system/warehouses',
        icon: <Warehouse className="w-4 h-4" />,
        permission: PERMISSIONS.SYSTEM_CONFIG,
      },
      {
        key: 'system-shops',
        label: '店铺管理',
        path: '/system/shops',
        icon: <ShoppingCart className="w-4 h-4" />,
        permission: PERMISSIONS.SYSTEM_CONFIG,
      },
      {
        key: 'system-logs',
        label: '操作日志',
        path: '/system/logs',
        icon: <FileText className="w-4 h-4" />,
        permission: PERMISSIONS.SYSTEM_LOG,
      },
    ],
  },
];
