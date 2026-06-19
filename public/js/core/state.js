/**
 * 全局Status管理模块
 * @module core/state
 */

// 全局Status
const state = {
  // User信息
  user: {
    role: null,
    username: null,
    isGuest: false,
    isAdmin: false,
    isStrictAdmin: false
  },
  
  // 域名列表
  domains: [],
  
  // 当前选中的Mailbox
  currentMailbox: null,
  
  // Mailbox列表
  mailboxes: [],
  
  // 当前Email List
  emails: [],
  
  // 当前查看的Email
  currentEmail: null,
  
  // User配额
  quota: {
    limit: 0,
    used: 0,
    remaining: 0
  },
  
  // UI Status
  ui: {
    loading: false,
    error: null,
    sidebarCollapsed: false
  }
};

// Status变化监听器
const listeners = new Map();

/**
 * 获取Status
 * @param {string} path - Status路径（如 'user.role'）
 * @returns {any}
 */
export function getState(path) {
  if (!path) return state;
  
  const keys = path.split('.');
  let current = state;
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  
  return current;
}

/**
 * SettingsStatus
 * @param {string} path - Status路径
 * @param {any} value - 新值
 */
export function setState(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = state;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  
  const oldValue = current[lastKey];
  current[lastKey] = value;
  
  // Notification监听器
  notifyListeners(path, value, oldValue);
}

/**
 * 更新Status（合并对象）
 * @param {string} path - Status路径
 * @param {object} updates - 更新Message
 */
export function updateState(path, updates) {
  const current = getState(path);
  if (typeof current === 'object' && current !== null) {
    setState(path, { ...current, ...updates });
  } else {
    setState(path, updates);
  }
}

/**
 * 订阅Status变化
 * @param {string} path - Status路径
 * @param {Function} callback - 回调函数
 * @returns {Function} Cancel订阅函数
 */
export function subscribe(path, callback) {
  if (!listeners.has(path)) {
    listeners.set(path, new Set());
  }
  listeners.get(path).add(callback);
  
  // BackCancel订阅函数
  return () => {
    const pathListeners = listeners.get(path);
    if (pathListeners) {
      pathListeners.delete(callback);
    }
  };
}

/**
 * Notification监听器
 * @param {string} path - Status路径
 * @param {any} newValue - 新值
 * @param {any} oldValue - 旧值
 */
function notifyListeners(path, newValue, oldValue) {
  // Notification精确匹配的监听器
  const pathListeners = listeners.get(path);
  if (pathListeners) {
    for (const callback of pathListeners) {
      try {
        callback(newValue, oldValue, path);
      } catch (e) {
        console.error('State listener error:', e);
      }
    }
  }
  
  // Notification父级路径的监听器
  const parts = path.split('.');
  for (let i = parts.length - 1; i > 0; i--) {
    const parentPath = parts.slice(0, i).join('.');
    const parentListeners = listeners.get(parentPath);
    if (parentListeners) {
      const parentValue = getState(parentPath);
      for (const callback of parentListeners) {
        try {
          callback(parentValue, undefined, parentPath);
        } catch (e) {
          console.error('State listener error:', e);
        }
      }
    }
  }
}

/**
 * 重置Status
 */
export function resetState() {
  state.user = { role: null, username: null, isGuest: false, isAdmin: false, isStrictAdmin: false };
  state.domains = [];
  state.currentMailbox = null;
  state.mailboxes = [];
  state.emails = [];
  state.currentEmail = null;
  state.quota = { limit: 0, used: 0, remaining: 0 };
  state.ui = { loading: false, error: null, sidebarCollapsed: false };
}

/**
 * 初始化UserStatus
 * @param {object} sessionData - Session数据
 */
export function initUserState(sessionData) {
  if (!sessionData) return;
  
  setState('user', {
    role: sessionData.role || null,
    username: sessionData.username || null,
    isGuest: sessionData.role === 'guest',
    isAdmin: sessionData.role === 'admin',
    isStrictAdmin: sessionData.strictAdmin === true
  });
}

/**
 * Settings加载Status
 * @param {boolean} loading - 是否Loading
 */
export function setLoading(loading) {
  setState('ui.loading', loading);
}

/**
 * Settings错误信息
 * @param {string|null} error - 错误信息
 */
export function setError(error) {
  setState('ui.error', error);
}

// 导出Status对象（只读访问）
export { state };

// 导出default对象
export default {
  getState,
  setState,
  updateState,
  subscribe,
  resetState,
  initUserState,
  setLoading,
  setError,
  state
};
