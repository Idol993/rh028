import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { menuItems, MenuItem } from '@/config/menu';
import { hasPermission } from '@/utils/permission';
import { useUIStore } from '@/store';

interface SidebarMenuItemProps {
  item: MenuItem;
  collapsed: boolean;
  level?: number;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item, collapsed, level = 0 }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.path || 
    (hasChildren && item.children?.some(child => location.pathname.startsWith(child.path)));

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center px-4 py-3 text-left transition-all duration-200',
            'hover:bg-dark-700/50 hover:text-white',
            isActive ? 'text-white bg-dark-700/30' : 'text-dark-400',
            level > 0 && 'pl-12'
          )}
        >
          <span className={cn('flex-shrink-0', level > 0 ? 'mr-2' : 'mr-3')}>
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </>
          )}
        </button>
        {expanded && !collapsed && (
          <div className="bg-dark-800/50">
            {item.children!.map((child) => (
              <SidebarMenuItem
                key={child.key}
                item={child}
                collapsed={collapsed}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive: navActive }) => cn(
        'flex items-center px-4 py-3 transition-all duration-200 group',
        'hover:bg-dark-700/50 hover:text-white',
        (navActive || isActive) ? 'text-white bg-gradient-to-r from-primary-600/30 to-transparent border-l-2 border-primary-500' : 'text-dark-400',
        level > 0 && 'pl-12'
      )}
    >
      <span className={cn('flex-shrink-0', level > 0 ? 'mr-2' : 'mr-3')}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium">{item.label}</span>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-dark-900 border-r border-dark-700 transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-dark-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3">
              <h1 className="text-white font-bold text-sm">跨境履约</h1>
              <p className="text-dark-500 text-xs">CrossBorder WMS</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="py-4 overflow-y-auto scroll-container h-[calc(100vh-4rem)]">
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.key}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700 bg-dark-900">
          <div className="text-xs text-dark-500 text-center">
            <p>版本 v1.0.0</p>
            <p className="mt-1">© 2024 跨境电商履约平台</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
