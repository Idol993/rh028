import { create } from 'zustand';
import type { User, LoginRequest } from '@/@types/system';
import { login, logout, getCurrentUser } from '@/api/auth';
import { storage } from '@/utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (params: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  loading: false,
  error: null,

  login: async (params: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await login(params);
      if (response.code === 200 && response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (err: any) {
      set({ 
        error: err.message || '登录失败，请检查用户名和密码', 
        loading: false 
      });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  fetchCurrentUser: async () => {
    const token = storage.getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    
    set({ loading: true });
    try {
      const response = await getCurrentUser();
      if (response.code === 200 && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (err: any) {
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
      storage.removeToken();
      storage.removeUser();
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
