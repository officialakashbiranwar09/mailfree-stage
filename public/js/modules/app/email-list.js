/**
 * Email List模块
 * @module modules/app/email-list
 */

import { formatTs, formatTsMobile, extractCode, escapeHtml } from './ui-helpers.js';
import { getCurrentMailbox } from './mailbox-state.js';

// 分页Status
const PAGE_SIZE = 8;
let currentPage = 1;
let lastLoadedEmails = [];
let isSentView = false;

// Email缓存
const emailCache = new Map();

// 视图加载Status
const viewLoaded = new Set();

/**
 * 获取视图 key
 * @returns {string}
 */
function getViewKey() {
  return `${getCurrentMailbox()}:${isSentView ? 'sent' : 'inbox'}`;
}

/**
 * 渲染分页器
 * @param {object} elements - DOM 元素
 */
export function renderPager(elements) {
  try {
    const total = Array.isArray(lastLoadedEmails) ? lastLoadedEmails.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (!elements.pager) return;
    elements.pager.style.display = total > PAGE_SIZE ? 'flex' : 'none';
    if (elements.pageInfo) elements.pageInfo.textContent = `${currentPage} / ${totalPages}`;
    if (elements.prevPage) elements.prevPage.disabled = currentPage <= 1;
    if (elements.nextPage) elements.nextPage.disabled = currentPage >= totalPages;
  } catch(_) {}
}

/**
 * 分页切片
 * @param {Array} items - Email List
 * @param {object} elements - DOM 元素
 * @returns {Array}
 */
export function sliceByPage(items, elements) {
  lastLoadedEmails = Array.isArray(items) ? items : [];
  const total = lastLoadedEmails.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  renderPager(elements);
  return lastLoadedEmails.slice(start, end);
}

/**
 * 上一页
 * @param {Function} refresh - Refresh函数
 */
export function prevPage(refresh) {
  if (currentPage > 1) {
    currentPage -= 1;
    refresh();
  }
}

/**
 * 下一页
 * @param {Function} refresh - Refresh函数
 */
export function nextPage(refresh) {
  const total = lastLoadedEmails.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage < totalPages) {
    currentPage += 1;
    refresh();
  }
}

/**
 * 重置分页
 * @param {object} elements - DOM 元素
 */
export function resetPager(elements) {
  currentPage = 1;
  lastLoadedEmails = [];
  renderPager(elements);
}

/**
 * 切换视图
 * @param {boolean} sent - 是否为Sent Mail视图
 */
export function setView(sent) {
  isSentView = sent;
}

/**
 * 获取当前视图
 * @returns {boolean}
 */
export function isSentViewActive() {
  return isSentView;
}

/**
 * 渲染EmailStatus class
 * @param {string} status - Status
 * @returns {string}
 */
export function statusClass(status) {
  const map = {
    'queued': 'status-queued',
    'delivered': 'status-delivered',
    'failed': 'status-failed',
    'processing': 'status-processing'
  };
  return map[status] || '';
}

/**
 * 渲染Email List项
 * @param {object} email - Email数据
 * @param {boolean} isMobile - 是否移动端
 * @returns {string}
 */
export function renderEmailItem(email, isMobile = false) {
  const e = email;
  
  // 智能Message预览处理
  let rawContent = isSentView ? (e.text_content || e.html_content || '') : (e.preview || e.content || e.html_content || '');
  let preview = '';
  
  if (rawContent) {
    preview = rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const codeMatch = (e.verification_code || '').toString().trim() || extractCode(rawContent);
    if (codeMatch) {
      preview = `Verify码: ${codeMatch} | ${preview}`;
    }
    preview = preview.slice(0, 40);
  }
  
  const hasContent = preview.length > 0;
  const listCode = (e.verification_code || '').toString().trim() || extractCode(rawContent || '');
  const senderText = escapeHtml(e.sender || '');
  
  // 解析Recipients地址（用于Sent Mail和Inbox）
  let recipientsDisplay = '';
  const rawToAddrs = (e.recipients || e.to_addrs || '').toString();
  const toAddrsArr = rawToAddrs.split(',').map(s => s.trim()).filter(Boolean);
  if (toAddrsArr.length) {
    recipientsDisplay = toAddrsArr.slice(0, 2).join(', ');
    if (toAddrsArr.length > 2) recipientsDisplay += ` 等${toAddrsArr.length}人`;
  } else {
    recipientsDisplay = rawToAddrs;
  }
  
  const subjectText = escapeHtml(e.subject || '(无Subject)');
  const previewText = escapeHtml(preview);
  const metaLabel = isSentView ? 'Recipients' : '发件人';
  const metaText = isSentView ? escapeHtml(recipientsDisplay) : senderText;
  const timeDisplay = isMobile ? formatTsMobile(e.received_at || e.created_at) : formatTs(e.received_at || e.created_at);
  // Inbox视图时显示Recipients地址（别名地址）
  const toAddrDisplay = !isSentView && recipientsDisplay ? escapeHtml(recipientsDisplay) : '';
  
  return `
    <div class="email-item clickable" onclick="${isSentView ? `showSentEmail(${e.id})` : `showEmail(${e.id})`}">
      <div class="email-meta">
        <span class="meta-from"><span class="meta-label">${metaLabel}</span><span class="meta-from-text">${metaText}</span></span>
        ${!isSentView && toAddrDisplay ? `<span class="meta-to"><span class="meta-label">Recipients</span><span class="meta-to-text">${toAddrDisplay}</span></span>` : ''}
        <span class="email-time"><span class="time-icon">🕐</span>${timeDisplay}</span>
      </div>
      <div class="email-content">
        <div class="email-main">
          <div class="email-line"><span class="label-chip">Subject</span><span class="value-text subject">${subjectText}</span></div>
          <div class="email-line"><span class="label-chip">Message</span>${hasContent ? `<span class="email-preview value-text">${previewText}</span>` : '<span class="email-preview value-text" style="color:#94a3b8">(暂无预览)</span>'}</div>
        </div>
        <div class="email-actions">
          ${isSentView ? `
            <span class="status-badge ${statusClass(e.status)}">${e.status || 'unknown'}</span>
            <button class="btn btn-danger btn-sm" onclick="deleteSent(${e.id});event.stopPropagation()" title="Delete记录"><span class="btn-icon">🗑️</span></button>
          ` : `
            <button class="btn btn-secondary btn-sm" data-code="${listCode || ''}" onclick="copyFromList(event, ${e.id});event.stopPropagation()" title="复制Message或Verify码"><span class="btn-icon">📋</span></button>
            <button class="btn btn-danger btn-sm" onclick="deleteEmail(${e.id});event.stopPropagation()" title="DeleteEmail"><span class="btn-icon">🗑️</span></button>
          `}
        </div>
      </div>
    </div>`;
}

/**
 * 获取Email缓存
 * @param {number} id - EmailID
 * @returns {object|undefined}
 */
export function getEmailFromCache(id) {
  return emailCache.get(id);
}

/**
 * SettingsEmail缓存
 * @param {number} id - EmailID
 * @param {object} email - Email数据
 */
export function setEmailCache(id, email) {
  emailCache.set(id, email);
}

/**
 * 清除Email缓存
 */
export function clearEmailCache() {
  emailCache.clear();
}

/**
 * 标记视图已加载
 */
export function markViewLoaded() {
  viewLoaded.add(getViewKey());
}

/**
 * Check视图是否首次加载
 * @returns {boolean}
 */
export function isFirstLoad() {
  return !viewLoaded.has(getViewKey());
}

/**
 * 清除视图加载Status
 */
export function clearViewLoaded() {
  viewLoaded.clear();
}

export default {
  renderPager,
  sliceByPage,
  prevPage,
  nextPage,
  resetPager,
  setView,
  isSentViewActive,
  statusClass,
  renderEmailItem,
  getEmailFromCache,
  setEmailCache,
  clearEmailCache,
  markViewLoaded,
  isFirstLoad,
  clearViewLoaded
};
