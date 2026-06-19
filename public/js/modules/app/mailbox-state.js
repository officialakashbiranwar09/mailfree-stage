/**
 * MailboxStatus管理模块
 * @module modules/app/mailbox-state
 */

import { getCurrentUserKey } from '../../storage.js';

// Current Mailbox
let currentMailbox = '';

// Current Mailbox信息
let currentMailboxInfo = null;

/**
 * 获取Current Mailbox
 * @returns {string}
 */
export function getCurrentMailbox() {
  return currentMailbox;
}

/**
 * SettingsCurrent Mailbox
 * @param {string} mailbox - Mailbox Address
 */
export function setCurrentMailbox(mailbox) {
  currentMailbox = mailbox || '';
  window.currentMailbox = currentMailbox;
  saveCurrentMailbox(currentMailbox);
}

/**
 * 获取Current Mailbox信息
 * @returns {object|null}
 */
export function getCurrentMailboxInfo() {
  return currentMailboxInfo;
}

/**
 * SettingsCurrent Mailbox信息
 * @param {object} info - Mailbox信息
 */
export function setCurrentMailboxInfo(info) {
  currentMailboxInfo = info;
}

/**
 * SaveCurrent Mailbox到本地存储（User隔离）
 * @param {string} mailbox - Mailbox Address
 */
export function saveCurrentMailbox(mailbox) {
  try {
    const userKey = getCurrentUserKey();
    if (userKey && userKey !== 'unknown') {
      sessionStorage.setItem(`mf:currentMailbox:${userKey}`, mailbox);
    }
  } catch(_) {}
}

/**
 * 从本地存储加载Current Mailbox
 * @returns {string|null}
 */
export function loadCurrentMailbox() {
  try {
    const userKey = getCurrentUserKey();
    if (userKey && userKey !== 'unknown') {
      return sessionStorage.getItem(`mf:currentMailbox:${userKey}`);
    }
  } catch(_) {}
  return null;
}

/**
 * 清除Current MailboxStatus
 */
export function clearCurrentMailbox() {
  currentMailbox = '';
  currentMailboxInfo = null;
  window.currentMailbox = '';
  try {
    const userKey = getCurrentUserKey();
    if (userKey && userKey !== 'unknown') {
      sessionStorage.removeItem(`mf:currentMailbox:${userKey}`);
    }
    sessionStorage.removeItem('mf:currentMailbox');
  } catch(_) {}
}

// 初始化全局变量
window.currentMailbox = currentMailbox;

export default {
  getCurrentMailbox,
  setCurrentMailbox,
  getCurrentMailboxInfo,
  setCurrentMailboxInfo,
  saveCurrentMailbox,
  loadCurrentMailbox,
  clearCurrentMailbox
};
