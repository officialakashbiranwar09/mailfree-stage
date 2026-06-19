/**
 * 自动Refresh模块
 * @module modules/app/auto-refresh
 */

// 自动RefreshStatus
let autoRefreshInterval = null;
let isAutoRefreshEnabled = true;
const AUTO_REFRESH_INTERVAL = 1000; // 1秒 tick，实际Refresh由回调内部的倒计时控制
const REAL_REFRESH_INTERVAL = 15000; // 实际Refresh周期，用于可见性恢复判断

// 页面可见性追踪
let isPageVisible = true;
let lastRefreshTime = 0;

/**
 * 初始化页面可见性追踪
 */
export function initVisibilityTracking() {
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible && isAutoRefreshEnabled) {
      // 页面变为可见时，如果距离上次Refresh超过间隔时间，立即Refresh
      const now = Date.now();
      if (now - lastRefreshTime > REAL_REFRESH_INTERVAL) {
        triggerRefresh();
      }
    }
  });
}

/**
 * 触发Refresh回调
 */
let refreshCallback = null;

/**
 * SettingsRefresh回调
 * @param {Function} callback - Refresh回调函数
 */
export function setRefreshCallback(callback) {
  refreshCallback = callback;
}

/**
 * 触发Refresh
 */
async function triggerRefresh() {
  if (refreshCallback && isPageVisible) {
    lastRefreshTime = Date.now();
    try {
      await refreshCallback();
    } catch (e) {
      console.error('Auto refresh error:', e);
    }
  }
}

/**
 * 启动自动Refresh
 * @param {Function} callback - Refresh回调函数
 */
export function startAutoRefresh(callback) {
  if (callback) {
    refreshCallback = callback;
  }
  
  stopAutoRefresh();
  isAutoRefreshEnabled = true;
  
  autoRefreshInterval = setInterval(() => {
    if (isPageVisible && isAutoRefreshEnabled) {
      triggerRefresh();
    }
  }, AUTO_REFRESH_INTERVAL);
}

/**
 * 停止自动Refresh
 */
export function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

/**
 * 暂停自动Refresh
 */
export function pauseAutoRefresh() {
  isAutoRefreshEnabled = false;
}

/**
 * 恢复自动Refresh
 */
export function resumeAutoRefresh() {
  isAutoRefreshEnabled = true;
}

/**
 * Check是否正在自动Refresh
 * @returns {boolean}
 */
export function isAutoRefreshing() {
  return autoRefreshInterval !== null && isAutoRefreshEnabled;
}

/**
 * 获取距离下次Refresh的时间
 * @returns {number} 毫秒
 */
export function getTimeUntilNextRefresh() {
  const elapsed = Date.now() - lastRefreshTime;
  return Math.max(0, AUTO_REFRESH_INTERVAL - elapsed);
}

// 导出default对象
export default {
  initVisibilityTracking,
  setRefreshCallback,
  startAutoRefresh,
  stopAutoRefresh,
  pauseAutoRefresh,
  resumeAutoRefresh,
  isAutoRefreshing,
  getTimeUntilNextRefresh
};
