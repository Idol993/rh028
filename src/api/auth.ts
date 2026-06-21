import type { ApiResponse } from '@/@types/api';
import type { User, LoginRequest, LoginResponse } from '@/@types/system';
import { mockRequest } from './client';
import { mockUsers, generateUUID } from '@/mock/data';
import { storage } from '@/utils/storage';

export const login = async (params: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const user = mockUsers.find(u => u.username === params.username);
  
  if (!user || params.password !== '123456') {
    return mockRequest(null as any, 500, true);
  }
  
  const token = `token_${generateUUID()}`;
  
  storage.setToken(token);
  storage.setUser(user);
  
  return mockRequest({
    token,
    user,
  });
};

export const logout = async (): Promise<ApiResponse<null>> => {
  storage.removeToken();
  storage.removeUser();
  return mockRequest(null);
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const user = storage.getUser();
  if (!user) {
    return mockRequest(null as any, 300, true);
  }
  return mockRequest(user);
};

export const changePassword = async (params: { oldPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
  if (params.oldPassword !== '123456') {
    return mockRequest(null as any, 300, true);
  }
  return mockRequest(null);
};
