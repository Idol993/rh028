const STORAGE_PREFIX = 'cross_border_';

export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue ?? null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },

  getToken(): string | null {
    return this.get<string>('token');
  },

  setToken(token: string): void {
    this.set('token', token);
  },

  removeToken(): void {
    this.remove('token');
  },

  getUser<T>(): T | null {
    return this.get<T>('user');
  },

  setUser<T>(user: T): void {
    this.set('user', user);
  },

  removeUser(): void {
    this.remove('user');
  },

  getPermissions(): string[] {
    return this.get<string[]>('permissions') || [];
  },

  setPermissions(permissions: string[]): void {
    this.set('permissions', permissions);
  },

  removePermissions(): void {
    this.remove('permissions');
  },
};

export const sessionStorage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue ?? null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('SessionStorage set error:', error);
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error('SessionStorage remove error:', error);
    }
  },

  clear(): void {
    try {
      Object.keys(window.sessionStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          window.sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('SessionStorage clear error:', error);
    }
  },
};
