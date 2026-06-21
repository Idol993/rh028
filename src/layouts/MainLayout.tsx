import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore, useUIStore } from '@/store';
import { Loading } from '@/components';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { isAuthenticated, loading, fetchCurrentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      await fetchCurrentUser();
    };

    initAuth();
  }, [isAuthenticated, navigate, fetchCurrentUser]);

  if (loading) {
    return <Loading fullScreen text="系统加载中..." />;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
