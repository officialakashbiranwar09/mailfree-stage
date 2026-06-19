/**
 * Session管理模块
 * @module modules/app/session
 */

import { cacheGet, cacheSet, setCurrentUserKey } from '../../storage.js';

// SessionStatus
let sessionData = null;
let isGuestMode = false;

/**
 * 获取Session数据
 * @returns {object|null}
 */
export function getSession() {
  return sessionData;
}

/**
 * SettingsSession数据
 * @param {object} data - Session数据
 */
export function setSession(data) {
  sessionData = data;
  if (data) {
    isGuestMode = data.role === 'guest';
    window.__GUEST_MODE__ = isGuestMode;
  }
}

/**
 * Check是否为Guest模式
 * @returns {boolean}
 */
export function isGuest() {
  return isGuestMode;
}

/**
 * Check是否为Admin
 * @returns {boolean}
 */
export function isAdmin() {
  return sessionData?.strictAdmin || sessionData?.role === 'admin';
}

/**
 * Check是否为严格Admin
 * @returns {boolean}
 */
export function isStrictAdmin() {
  return sessionData?.strictAdmin === true;
}

/**
 * 应用Session UI
 * @param {object} session - Session数据
 */
export function applySessionUI(session) {
  try {
    const badge = document.getElementById('role-badge');
    if (badge) {
      badge.className = 'role-badge';
      if (session.strictAdmin) {
        badge.classList.add('role-super');
        badge.textContent = 'Super Admin';
      } else if (session.role === 'admin') {
        badge.classList.add('role-admin');
        badge.textContent = `Power User：${session.username || ''}`;
      } else if (session.role === 'user') {
        badge.classList.add('role-user');
        badge.textContent = `User：${session.username || ''}`;
      } else if (session.role === 'guest') {
        badge.classList.add('role-user');
        badge.textContent = 'Demo Mode';
      }
    }
    
    const adminLink = document.getElementById('admin');
    const allMailboxesLink = document.getElementById('all-mailboxes');
    
    if (session && (session.strictAdmin || session.role === 'guest')) {
      if (adminLink) adminLink.style.display = 'inline-flex';
      if (allMailboxesLink) allMailboxesLink.style.display = 'inline-flex';
    } else {
      if (adminLink) adminLink.style.display = 'none';
      if (allMailboxesLink) allMailboxesLink.style.display = 'none';
    }
  } catch(_) {}
}

/**
 * 初始化Session（从缓存）
 */
export function initSessionFromCache() {
  try {
    const cachedS = cacheGet('session', 24 * 60 * 60 * 1000);
    if (cachedS) {
      setCurrentUserKey(`${cachedS.role || ''}:${cachedS.username || ''}`);
      applySessionUI(cachedS);
      setSession(cachedS);
    }
  } catch(_) {}
}

/**
 * VerifySession
 * @returns {Promise<object|null>}
 */
export async function validateSession() {
  try {
    const r = await fetch('/api/session');
    if (!r.ok) throw new Error('unauthorized');
    const s = await r.json();
    cacheSet('session', s);
    setCurrentUserKey(`${s.role || ''}:${s.username || ''}`);
    setSession(s);
    applySessionUI(s);
    return s;
  } catch(_) {
    return null;
  }
}

/**
 * 显示Guest模式横幅
 */
export function showGuestBanner() {
  const bar = document.createElement('div');
  bar.className = 'demo-banner';
  bar.innerHTML = '👀 当前为 <strong>View Mode</strong>（模拟数据，demo only）。要接收真实Email，请自建Deployment或ContactDeployment。';
  document.body.prepend(bar);
}

/**
 * 初始化Guest模式
 */
export function initGuestMode() {
  window.__GUEST_MODE__ = true;
  window.__MOCK_STATE__ = { domains: ['example.com'], mailboxes: [], emailsByMailbox: new Map() };
  showGuestBanner();
}

export default {
  getSession,
  setSession,
  isGuest,
  isAdmin,
  isStrictAdmin,
  applySessionUI,
  initSessionFromCache,
  validateSession,
  showGuestBanner,
  initGuestMode
};
