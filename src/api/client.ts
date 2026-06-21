import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/@types/api';
import { storage } from '@/utils/storage';

const baseClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface TypedAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

const client = baseClient as TypedAxiosInstance;

client.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      storage.removeToken();
      storage.removeUser();
      storage.removePermissions();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    
    const errorResponse = error.response?.data || {
      code: error.response?.status || 500,
      message: error.message || '网络请求失败，请稍后重试',
      data: null,
    };
    
    return Promise.reject(errorResponse);
  }
);

export const mockRequest = async <T>(
  mockData: T,
  delay: number = 300,
  shouldFail: boolean = false
): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject({
          code: 500,
          message: '请求失败，请稍后重试',
          data: null,
        });
      } else {
        resolve({
          code: 200,
          message: 'success',
          data: mockData,
        });
      }
    }, delay);
  });
};

export const mockPageRequest = async <T>(
  data: T[],
  page: number = 1,
  pageSize: number = 20,
  delay: number = 300
): Promise<ApiResponse<{ list: T[]; total: number; page: number; pageSize: number }>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const list = data.slice(start, end);
      
      resolve({
        code: 200,
        message: 'success',
        data: {
          list,
          total: data.length,
          page,
          pageSize,
        },
      });
    }, delay);
  });
};

export default client;
