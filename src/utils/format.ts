import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
};

export const formatDateOnly = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD');
};

export const formatTimeOnly = (date: string | Date): string => {
  return formatDate(date, 'HH:mm:ss');
};

export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (amount: number, currency: string = 'USD', decimals: number = 2): string => {
  if (amount === null || amount === undefined) return '-';
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CNY: '¥',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${formatNumber(amount, decimals)}`;
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatWeight = (weight: number, unit: string = 'kg'): string => {
  if (weight === null || weight === undefined) return '-';
  return `${formatNumber(weight, 2)} ${unit}`;
};

export const formatSKU = (sku: string): string => {
  return sku?.toUpperCase() || '-';
};

export const formatOrderNo = (orderNo: string): string => {
  return orderNo || '-';
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $3');
};

export const formatEmail = (email: string): string => {
  if (!email) return '-';
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  return `${username.slice(0, 3)}***@${domain}`;
};

export const formatAddress = (address: {
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  zipCode?: string;
}): string => {
  if (!address) return '-';
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds === null || seconds === undefined) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${secs}秒`;
  }
  if (minutes > 0) {
    return `${minutes}分钟${secs}秒`;
  }
  return `${secs}秒`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === null || bytes === undefined) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getColorByProfitMargin = (margin: number): string => {
  if (margin >= 0.3) return 'text-success-400';
  if (margin >= 0.15) return 'text-secondary-400';
  if (margin >= 0) return 'text-warning-400';
  return 'text-danger-400';
};

export const getBgColorByProfitMargin = (margin: number): string => {
  if (margin >= 0.3) return 'bg-success-500/20 text-success-400';
  if (margin >= 0.15) return 'bg-secondary-500/20 text-secondary-400';
  if (margin >= 0) return 'bg-warning-500/20 text-warning-400';
  return 'bg-danger-500/20 text-danger-400';
};
