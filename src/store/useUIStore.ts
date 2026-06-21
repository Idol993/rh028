import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  currentPage: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
  globalLoading: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  addNotification: (notification: Omit<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  currentPage: 'dashboard',
  breadcrumbs: [{ label: '首页' }],
  notifications: [],
  globalLoading: false,

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications.slice(0, 99),
      ],
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },
}));
