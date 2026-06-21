import type { ApiResponse } from '@/@types/api';
import type { User, LoginRequest, LoginResponse } from '@/@types/system';
import client from './client';
import { storage } from '@/utils/storage';

export const login = async (params: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await client.post<ApiResponse<LoginResponse>>('/auth/login', params);
  
  if (response.code === 200 && response.data) {
    storage.setToken(response.data.token);
    storage.setUser(response.data.user);
    storage.setPermissions(response.data.permissions || []);
  }
  
  return response;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await client.post<ApiResponse<null>>('/auth/logout');
    return response;
  } finally {
    storage.removeToken();
    storage.removeUser();
    storage.removePermissions();
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await client.get<ApiResponse<User>>('/auth/me');
  return response;
};

export const register = async (params: {
  username: string;
  password: string;
  name: string;
  email?: string;
  role?: string;
}): Promise<ApiResponse<LoginResponse>> => {
  const response = await client.post<ApiResponse<LoginResponse>>('/auth/register', params);
  
  if (response.code === 200 && response.data) {
    storage.setToken(response.data.token);
    storage.setUser(response.data.user);
    storage.setPermissions(response.data.permissions || []);
  }
  
  return response;
};

export const changePassword = async (params: { 
  oldPassword: string; 
  newPassword: string 
}): Promise<ApiResponse<null>> => {
  const response = await client.post<ApiResponse<null>>('/auth/password', params);
  return response;
};

export const checkHealth = async (): Promise<ApiResponse<{
  status: string;
  timestamp: string;
  version: string;
}>> => {
  const response = await client.get<ApiResponse<{
    status: string;
    timestamp: string;
    version: string;
  }>>('/health');
  return response;
};
