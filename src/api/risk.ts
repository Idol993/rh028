import type { ApiResponse } from '@/@types/api';
import type { RiskOrder, RiskRule, Blacklist, RiskStats } from '@/@types/risk';
import { mockRequest, mockPageRequest } from './client';
import { mockRiskOrders, mockRiskRules, mockBlacklist, mockRiskStats } from '@/mock/data';

export const getRiskOrders = async (params: { page?: number; pageSize?: number; riskLevel?: string; reviewStatus?: string; platform?: string }): Promise<ApiResponse<{ list: RiskOrder[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockRiskOrders];
  
  if (params.riskLevel) {
    filtered = filtered.filter(o => o.riskLevel === params.riskLevel);
  }
  if (params.reviewStatus) {
    filtered = filtered.filter(o => o.reviewStatus === params.reviewStatus);
  }
  if (params.platform) {
    filtered = filtered.filter(o => o.platform === params.platform);
  }
  
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const getRiskOrderDetail = async (id: string): Promise<ApiResponse<RiskOrder>> => {
  const order = mockRiskOrders.find(o => o.id === id) || mockRiskOrders[0];
  return mockRequest(order);
};

export const reviewRiskOrder = async (id: string, data: { decision: 'approve' | 'reject' | 'hold'; remark: string }): Promise<ApiResponse<null>> => {
  return mockRequest(null, 300);
};

export const batchReviewRiskOrders = async (ids: string[], data: { decision: 'approve' | 'reject' | 'hold'; remark: string }): Promise<ApiResponse<{ success: number; failed: number }>> => {
  return mockRequest({
    success: ids.length,
    failed: 0,
  }, 500);
};

export const getRiskRules = async (params: { page?: number; pageSize?: number; ruleType?: string; isEnabled?: boolean }): Promise<ApiResponse<{ list: RiskRule[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockRiskRules];
  
  if (params.ruleType) {
    filtered = filtered.filter(r => r.ruleType === params.ruleType);
  }
  if (params.isEnabled !== undefined) {
    filtered = filtered.filter(r => r.isEnabled === params.isEnabled);
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const createRiskRule = async (data: Partial<RiskRule>): Promise<ApiResponse<RiskRule>> => {
  const newRule: RiskRule = {
    ...mockRiskRules[0],
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    ruleCode: `RULE-${String(mockRiskRules.length + 1).padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return mockRequest(newRule, 500);
};

export const updateRiskRule = async (id: string, data: Partial<RiskRule>): Promise<ApiResponse<RiskRule>> => {
  const rule = mockRiskRules.find(r => r.id === id) || mockRiskRules[0];
  return mockRequest({ ...rule, ...data, updatedAt: new Date().toISOString() });
};

export const toggleRiskRule = async (id: string, isEnabled: boolean): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const deleteRiskRule = async (id: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const getBlacklist = async (params: { page?: number; pageSize?: number; type?: string; isActive?: boolean; keyword?: string }): Promise<ApiResponse<{ list: Blacklist[]; total: number; page: number; pageSize: number }>> => {
  let filtered = [...mockBlacklist];
  
  if (params.type) {
    filtered = filtered.filter(b => b.type === params.type);
  }
  if (params.isActive !== undefined) {
    filtered = filtered.filter(b => b.isActive === params.isActive);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(b => b.value.toLowerCase().includes(kw));
  }
  
  return mockPageRequest(filtered, params.page, params.pageSize);
};

export const addToBlacklist = async (data: Omit<Blacklist, 'id' | 'addedAt'>): Promise<ApiResponse<Blacklist>> => {
  const newItem: Blacklist = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    addedAt: new Date().toISOString(),
  };
  return mockRequest(newItem, 500);
};

export const removeFromBlacklist = async (id: string): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const toggleBlacklist = async (id: string, isActive: boolean): Promise<ApiResponse<null>> => {
  return mockRequest(null, 200);
};

export const getRiskStats = async (): Promise<ApiResponse<RiskStats>> => {
  return mockRequest(mockRiskStats);
};
