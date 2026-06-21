import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore, useUIStore } from '@/store';
import { Loading } from '@/components';
import { storage } from '@/utils/storage';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { isAuthenticated, user, fetchCurrentUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();
      
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        await fetchCurrentUser();
      } catch (err) {
        // Error is handled in store
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, initializing, navigate, location]);

  if (initializing) {
    return <Loading fullScreen text="系统加载中..." />;
  }

  if (!isAuthenticated) {
    return null;
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
