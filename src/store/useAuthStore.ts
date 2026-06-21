import { create } from 'zustand';
import type { User, LoginRequest } from '@/@types/system';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/api/auth';
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
  user: storage.getUser<User>(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  loading: false,
  error: null,

  login: async (params: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await apiLogin(params);
      if (response.code === 200 && response.data) {
        const { token, user, permissions } = response.data;
        storage.setToken(token);
        storage.setUser(user);
        if (permissions) {
          storage.setPermissions(permissions);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        const errorMsg = response.message || '登录失败，请检查用户名和密码';
        set({ error: errorMsg, loading: false });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || err.code || '登录失败，请检查用户名和密码';
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await apiLogout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      storage.removeToken();
      storage.removeUser();
      storage.removePermissions();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  fetchCurrentUser: async () => {
    const token = storage.getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    set({ loading: true });
    try {
      const response = await getCurrentUser();
      if (response.code === 200 && response.data) {
        storage.setUser(response.data);
        set({
          user: response.data,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        storage.removeToken();
        storage.removeUser();
        storage.removePermissions();
        set({ 
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (err: any) {
      if (err.code === 401 || err.status === 401) {
        storage.removeToken();
        storage.removeUser();
        storage.removePermissions();
      }
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
