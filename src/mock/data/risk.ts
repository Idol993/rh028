import type { RiskOrder, RiskRule, Blacklist, RiskStats } from '@/@types/risk';
import {
  generateUUID,
  generatePastDate,
  randomFromArray,
  randomInt,
  randomFloat,
  randomBoolean,
  generateOrderNo,
  platforms,
  generateBuyer,
  generateAddress,
} from './base';

export const generateRiskRule = (index: number): RiskRule => {
  const ruleTypes = [
    { type: 'address', name: '地址异常检测', description: '检测收货地址是否完整、格式是否正确' },
    { type: 'blacklist', name: '黑名单拦截', description: '拦截黑名单买家的订单' },
    { type: 'duplicate', name: '重复下单检测', description: '检测同一买家短时间内是否多次下单' },
    { type: 'payment', name: '支付异常检测', description: '检测支付方式是否存在风险' },
    { type: 'quantity', name: '异常数量检测', description: '检测单商品购买数量是否异常' },
    { type: 'value', name: '高值订单检测', description: '检测订单金额是否超过阈值' },
    { type: 'sensitive', name: '敏感商品检测', description: '检测是否包含敏感或禁运商品' },
    { type: 'fraud', name: '欺诈风险检测', description: '多维度检测是否存在欺诈可能性' },
    { type: 'ip', name: 'IP异常检测', description: '检测下单IP是否存在异常' },
    { type: 'velocity', name: '下单速率检测', description: '检测账号下单频率是否异常' },
  ];
  
  const rule = ruleTypes[index % ruleTypes.length];
  
  return {
    id: generateUUID(),
    ruleCode: `RULE-${String(index + 1).padStart(4, '0')}`,
    ruleName: rule.name,
    ruleType: rule.type,
    description: rule.description,
    riskLevel: randomFromArray(['low', 'medium', 'high']),
    isEnabled: randomBoolean(0.9),
    conditions: {
      threshold: randomInt(100, 10000),
      timeWindow: randomInt(1, 24),
      unit: randomFromArray(['hours', 'minutes', 'days']),
    },
    action: randomFromArray(['block', 'review', 'flag']),
    score: randomInt(10, 50),
    createdAt: generatePastDate(randomInt(30, 180)),
    updatedAt: generatePastDate(randomInt(0, 30)),
  };
};

export const generateBlacklist = (): Blacklist => {
  const buyer = generateBuyer();
  const types: Array<'buyer' | 'email' | 'phone' | 'ip' | 'address'> = ['buyer', 'email', 'phone', 'ip', 'address'];
  const type = randomFromArray(types);
  
  return {
    id: generateUUID(),
    type,
    value: type === 'buyer' ? buyer.buyerName : 
           type === 'email' ? buyer.buyerEmail :
           type === 'phone' ? buyer.buyerPhone :
           type === 'ip' ? `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}` :
           generateAddress().address1,
    reason: randomFromArray(['历史欺诈记录', '多次拒付', '恶意退货', '虚假地址', '其他风险']),
    source: randomFromArray(['系统自动识别', '人工添加', '平台同步']),
    addedBy: randomFromArray(['系统管理员', '运营主管', '风控专员']),
    addedAt: generatePastDate(randomInt(0, 180)),
    expiresAt: randomBoolean(0.3) ? generatePastDate(randomInt(-30, 90)) : undefined,
    isActive: randomBoolean(0.85),
    remarks: randomBoolean(0.3) ? '需要重点关注' : undefined,
  };
};

export const generateRiskOrder = (): RiskOrder => {
  const buyer = generateBuyer();
  const address = generateAddress();
  const platform = randomFromArray(platforms);
  
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const riskLevel = randomFromArray(riskLevels);
  
  const reviewStatuses: Array<'pending' | 'approved' | 'rejected' | 'held'> = ['pending', 'approved', 'rejected', 'held'];
  const reviewStatus = riskLevel === 'low' ? randomFromArray(['approved', 'pending']) :
                       riskLevel === 'medium' ? randomFromArray(['pending', 'held']) : 'pending';
  
  const ruleCount = riskLevel === 'high' ? randomInt(3, 6) : 
                    riskLevel === 'medium' ? randomInt(1, 3) : 
                    randomInt(0, 1);
  
  const triggeredRules = Array.from({ length: ruleCount }, () => ({
    ruleId: generateUUID(),
    ruleName: randomFromArray([
      '地址异常检测', '黑名单拦截', '重复下单检测', '支付异常检测', 
      '异常数量检测', '高值订单检测', '敏感商品检测', '欺诈风险检测'
    ]),
    ruleType: randomFromArray(['address', 'blacklist', 'duplicate', 'payment', 'quantity', 'value', 'sensitive', 'fraud']),
    riskScore: randomInt(10, 50),
  }));
  
  const totalScore = triggeredRules.reduce((sum, rule) => sum + rule.riskScore, 0);
  
  return {
    id: generateUUID(),
    orderId: generateUUID(),
    orderNo: generateOrderNo(),
    platform,
    platformOrderNo: `${platform.toUpperCase()}-${generateUUID().substring(0, 12).toUpperCase()}`,
    buyerName: buyer.buyerName,
    buyerEmail: buyer.buyerEmail,
    buyerPhone: buyer.buyerPhone,
    shippingAddress: address,
    riskLevel,
    riskScore: Math.min(100, totalScore + randomInt(0, 10)),
    triggeredRules,
    reviewStatus,
    reviewerId: reviewStatus !== 'pending' ? `user-${randomInt(1, 5)}` : undefined,
    reviewerName: reviewStatus !== 'pending' ? randomFromArray(['系统管理员', '运营主管', '风控专员']) : undefined,
    reviewRemark: reviewStatus !== 'pending' ? 
      (reviewStatus === 'rejected' ? '风控审核不通过，订单取消' : '审核通过，可正常发货') : undefined,
    reviewedAt: reviewStatus !== 'pending' ? generatePastDate(randomInt(0, 3)) : undefined,
    createdAt: generatePastDate(randomInt(0, 7)),
  };
};

export const generateRiskStats = (): RiskStats => {
  const todayOrders = randomInt(500, 2000);
  const flaggedOrders = randomInt(20, 100);
  const blockedOrders = randomInt(1, 20);
  const reviewedOrders = randomInt(30, 80);
  const passRate = parseFloat(((todayOrders - blockedOrders) / todayOrders * 100).toFixed(2));
  const avgReviewTime = randomFloat(5, 30, 1);
  
  return {
    todayOrders,
    flaggedOrders,
    blockedOrders,
    reviewedOrders,
    pendingReview: flaggedOrders - reviewedOrders,
    passRate,
    avgReviewTime,
    highRiskCount: randomInt(5, 20),
    mediumRiskCount: randomInt(15, 50),
    lowRiskCount: randomInt(50, 150),
    blacklistCount: randomInt(100, 500),
    activeRules: randomInt(8, 10),
  };
};

export const mockRiskRules = Array.from({ length: 15 }, (_, i) => generateRiskRule(i + 1));
export const mockBlacklist = Array.from({ length: 100 }, () => generateBlacklist());
export const mockRiskOrders = Array.from({ length: 80 }, () => generateRiskOrder());
export const mockRiskStats = generateRiskStats();
