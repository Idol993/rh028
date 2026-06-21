import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  AlertTriangle,
  Package,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '@/utils/format';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  time: Date;
  read: boolean;
}

export const Header: React.FC = () => {
  const { toggleSidebar, sidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: '重量异常预警',
      description: '订单ORD20240115001实际称重与预估偏差15%',
      time: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      type: 'error',
      title: '高风险订单拦截',
      description: '订单ORD20240115002风控评估高风险，已自动拦截',
      time: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: '库存预警',
      description: 'SKU00123库存不足安全库存，请及时补货',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: '物流轨迹异常',
      description: '物流单号SF123456789超过24小时未更新',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: '退货入库通知',
      description: 'RMA20240115001已完成退货入库',
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationIcons = {
    warning: <AlertTriangle className="w-4 h-4 text-warning-400" />,
    error: <ShieldAlert className="w-4 h-4 text-danger-400" />,
    info: <Package className="w-4 h-4 text-secondary-400" />,
    success: <RotateCcw className="w-4 h-4 text-success-400" />,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleNames: Record<string, string> = {
    admin: '系统管理员',
    operation: '运营人员',
    warehouse: '仓管员',
    customer_service: '客服',
    finance: '财务总监',
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative hide-tablet">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              placeholder="搜索订单号、SKU、物流单号..."
              className="w-80 pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
                  <h3 className="text-white font-medium">通知中心</h3>
                  <button className="text-xs text-secondary-400 hover:text-secondary-300">
                    全部已读
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto scroll-container">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 border-b border-dark-700/50 hover:bg-dark-700/30 cursor-pointer transition-colors',
                        !notification.read && 'bg-dark-700/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {notificationIcons[notification.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                            {notification.description}
                          </p>
                          <p className="text-xs text-dark-500 mt-1">
                            {formatDateTime(notification.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-dark-700">
                  <button className="w-full text-sm text-secondary-400 hover:text-secondary-300 text-center">
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-dark-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hide-mobile">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-dark-400">{roleNames[user?.role || '']}</p>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-dark-400 transition-transform hide-mobile', showUserMenu && 'rotate-180')} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-dark-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    个人中心
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/system/config');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    系统设置
                  </button>
                </div>
                <div className="border-t border-dark-700 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-danger-400 hover:bg-dark-700 hover:text-danger-300 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
