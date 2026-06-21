export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string, country: string = 'CN'): boolean => {
  const patterns: Record<string, RegExp> = {
    CN: /^1[3-9]\d{9}$/,
    US: /^\+?1?\d{10}$/,
    UK: /^\+?44?\d{10}$/,
    DE: /^\+?49?\d{11}$/,
    FR: /^\+?33?\d{9}$/,
  };
  const pattern = patterns[country] || /^\+?\d{7,15}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

export const validateSKU = (sku: string): boolean => {
  if (!sku) return false;
  const re = /^[A-Za-z0-9_-]{3,50}$/;
  return re.test(sku);
};

export const validateOrderNo = (orderNo: string): boolean => {
  if (!orderNo) return false;
  const re = /^[A-Za-z0-9_-]{5,100}$/;
  return re.test(orderNo);
};

export const validateTrackingNo = (trackingNo: string): boolean => {
  if (!trackingNo) return false;
  const re = /^[A-Za-z0-9]{6,50}$/;
  return re.test(trackingNo);
};

export const validateZipCode = (zipCode: string, country: string = 'US'): boolean => {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CN: /^\d{6}$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    AU: /^\d{4}$/,
  };
  const pattern = patterns[country] || /^[A-Za-z0-9\s-]{3,15}$/;
  return pattern.test(zipCode.toUpperCase());
};

export const validateAmount = (amount: number, min: number = 0, max?: number): boolean => {
  if (isNaN(amount)) return false;
  if (amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
};

export const validateQuantity = (quantity: number, min: number = 1, max?: number): boolean => {
  if (!Number.isInteger(quantity)) return false;
  if (quantity < min) return false;
  if (max !== undefined && quantity > max) return false;
  return true;
};

export const validateWeight = (weight: number): boolean => {
  return !isNaN(weight) && weight > 0 && weight <= 1000;
};

export const validateDimensions = (dimensions: {
  length: number;
  width: number;
  height: number;
}): boolean => {
  if (!dimensions) return false;
  const { length, width, height } = dimensions;
  return (
    !isNaN(length) && length > 0 && length <= 500 &&
    !isNaN(width) && width > 0 && width <= 500 &&
    !isNaN(height) && height > 0 && height <= 500
  );
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少6位' };
  }
  if (password.length > 32) {
    return { valid: false, message: '密码长度不能超过32位' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个字母' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个数字' };
  }
  return { valid: true };
};

export const validateRequired = (value: any, fieldName: string): { valid: boolean; message?: string } => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName}不能为空` };
  }
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, message: `${fieldName}不能为空` };
  }
  return { valid: true };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateIp = (ip: string): boolean => {
  const ipv4Pattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  const ipv6Pattern = /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
};

export const getValidationClass = (error?: string, touched?: boolean): string => {
  if (!touched) return '';
  return error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : 'border-success-500';
};
