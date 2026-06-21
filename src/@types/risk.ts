export type RiskLevel = 'low' | 'medium' | 'high';
export type ReviewDecision = 'approve' | 'reject' | 'hold';
export type BlacklistType = 'buyer' | 'ip' | 'address' | 'email' | 'phone';

export const RISK_LEVEL_NAMES: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export const REVIEW_DECISION_NAMES: Record<ReviewDecision, string> = {
  approve: '审核通过',
  reject: '拒绝订单',
  hold: '暂缓处理',
};

export const BLACKLIST_TYPE_NAMES: Record<BlacklistType, string> = {
  buyer: '买家账号',
  ip: 'IP地址',
  address: '收货地址',
  email: '邮箱',
  phone: '电话号码',
};

export interface RiskOrder {
  id: string;
  orderId: string;
  orderNo: string;
  platformOrderNo: string;
  platform: string;
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  currency: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'held';
  reviewerId?: string;
  reviewerName?: string;
  reviewRemark?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface RiskFactor {
  type: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  score: number;
}

export interface RiskRule {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'fraud' | 'address' | 'payment' | 'product' | 'behavior';
  condition: RiskRuleCondition;
  action: 'flag' | 'hold' | 'reject';
  riskScore: number;
  isEnabled: boolean;
  createdAt: string;
}

export interface RiskRuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'regex';
  value: any;
}

export interface BlacklistItem {
  id: string;
  type: BlacklistType;
  typeName: string;
  value: string;
  reason: string;
  addedBy: string;
  addedByName: string;
  isActive: boolean;
  hitCount: number;
  lastHitAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface BlacklistQueryParams {
  page?: number;
  pageSize?: number;
  type?: BlacklistType;
  value?: string;
  isActive?: boolean;
}

export interface RiskReviewRequest {
  decision: ReviewDecision;
  remark: string;
}

export interface RiskDashboardData {
  totalOrders: number;
  highRiskOrders: number;
  mediumRiskOrders: number;
  lowRiskOrders: number;
  autoApproved: number;
  manualReview: number;
  rejectedOrders: number;
  fraudDetectionRate: number;
  riskByType: Record<string, number>;
  riskTrend: Array<{ date: string; high: number; medium: number; low: number }>;
  blacklistCount: number;
}

export interface RiskScanResult {
  orderId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  needsReview: boolean;
}

export interface BlacklistAddRequest {
  type: BlacklistType;
  value: string;
  reason: string;
  expiresAt?: string;
}

export interface RiskRuleUpdateRequest {
  name: string;
  description: string;
  condition: RiskRuleCondition;
  action: 'flag' | 'hold' | 'reject';
  riskScore: number;
  isEnabled: boolean;
}
