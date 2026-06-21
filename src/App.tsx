import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MainLayout } from '@/layouts';
import { Login } from '@/pages/Login';
import { Loading } from '@/components';
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const OrderList = lazy(() => import('@/pages/orders/OrderList'));
const RiskReview = lazy(() => import('@/pages/orders/RiskReview'));
const PickingTask = lazy(() => import('@/pages/wms/PickingTask'));
const PackingTask = lazy(() => import('@/pages/wms/PackingTask'));
const ReceivingTask = lazy(() => import('@/pages/wms/ReceivingTask'));
const InventoryList = lazy(() => import('@/pages/inventory/InventoryList'));
const InventoryTransfer = lazy(() => import('@/pages/inventory/InventoryTransfer'));
const RMAList = lazy(() => import('@/pages/rma/RMAList'));
const LogisticsTracking = lazy(() => import('@/pages/logistics/LogisticsTracking'));
const ProfitReport = lazy(() => import('@/pages/finance/ProfitReport'));
const ExpenseManagement = lazy(() => import('@/pages/finance/ExpenseManagement'));
const UserManagement = lazy(() => import('@/pages/system/UserManagement'));
const WarehouseManagement = lazy(() => import('@/pages/system/WarehouseManagement'));
const ShopManagement = lazy(() => import('@/pages/system/ShopManagement'));
const OperationLogs = lazy(() => import('@/pages/system/OperationLogs'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading text="页面加载中..." />}>
    <Component />
  </Suspense>
);

export default function App() {
  return (
    <Router>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1E3A8A',
            colorInfo: '#0EA5E9',
            colorSuccess: '#10B981',
            colorWarning: '#F97316',
            colorError: '#EF4444',
            borderRadius: 8,
            fontFamily: "'Noto Sans SC', system-ui, sans-serif",
          },
          components: {
            Button: {
              controlHeight: 36,
            },
            Input: {
              controlHeight: 36,
            },
            Select: {
              controlHeight: 36,
            },
          },
        }}
      >
        <AntApp>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<MainLayout />}>
              <Route index element={withSuspense(Dashboard)} />
              
              <Route path="orders" element={withSuspense(OrderList)} />
              <Route path="orders/risk" element={withSuspense(RiskReview)} />
              
              <Route path="wms/picking" element={withSuspense(PickingTask)} />
              <Route path="wms/packing" element={withSuspense(PackingTask)} />
              <Route path="wms/receiving" element={withSuspense(ReceivingTask)} />
              
              <Route path="inventory" element={withSuspense(InventoryList)} />
              <Route path="inventory/transfer" element={withSuspense(InventoryTransfer)} />
              
              <Route path="rma" element={withSuspense(RMAList)} />
              
              <Route path="logistics" element={withSuspense(LogisticsTracking)} />
              
              <Route path="finance/profit" element={withSuspense(ProfitReport)} />
              <Route path="finance/expense" element={withSuspense(ExpenseManagement)} />
              
              <Route path="system/users" element={withSuspense(UserManagement)} />
              <Route path="system/warehouses" element={withSuspense(WarehouseManagement)} />
              <Route path="system/shops" element={withSuspense(ShopManagement)} />
              <Route path="system/logs" element={withSuspense(OperationLogs)} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AntApp>
      </ConfigProvider>
    </Router>
  );
}
