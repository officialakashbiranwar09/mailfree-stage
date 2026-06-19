/**
 * Mailbox User专用页面
 * @module mailbox
 */

import { formatTime, renderEmailItem, renderEmailList, generateSkeletonList, filterEmails, countUnread } from './modules/mailbox/email-list.js';
import { renderEmailDetail, sanitizeHtml, extractVerificationCode } from './modules/mailbox/email-detail.js';

// showToast 由 toast-utils.js 全局提供
const showToast = window.showToast || ((msg, type) => console.log(`[${type}] ${msg}`));

// Status
let currentUser = null, currentMailbox = null, emails = [], currentPage = 1;
const pageSize = 20;
let autoRefreshTimer = null, keyword = '';

// DOM 元素
const els = {
  roleBadge: document.getElementById('role-badge'),
  toast: document.getElementById('toast'),
  currentMailbox: document.getElementById('current-mailbox'),
  copyMailboxBtn: document.getElementById('copy-mailbox'),
  refreshEmailsBtn: document.getElementById('refresh-emails'),
  emailList: document.getElementById('email-list'),
  emptyState: document.getElementById('empty-state'),
  listLoading: document.getElementById('list-loading'),
  listPager: document.getElementById('list-pager'),
  prevPageBtn: document.getElementById('prev-page'),
  nextPageBtn: document.getElementById('next-page'),
  pageInfo: document.getElementById('page-info'),
  emailModal: document.getElementById('email-modal'),
  modalSubject: document.getElementById('modal-subject'),
  modalContent: document.getElementById('modal-content'),
  modalCloseBtn: document.getElementById('modal-close'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmOkBtn: document.getElementById('confirm-ok'),
  confirmCancelBtn: document.getElementById('confirm-cancel'),
  confirmCloseBtn: document.getElementById('confirm-close'),
  passwordModal: document.getElementById('password-modal'),
  passwordForm: document.getElementById('password-form'),
  currentPasswordInput: document.getElementById('current-password'),
  newPasswordInput: document.getElementById('new-password'),
  confirmPasswordInput: document.getElementById('confirm-password'),
  passwordClose: document.getElementById('password-close'),
  passwordCancel: document.getElementById('password-cancel'),
  passwordSubmit: document.getElementById('password-submit'),
  changePasswordBtn: document.getElementById('change-password'),
  logoutBtn: document.getElementById('logout'),
  autoRefresh: document.getElementById('auto-refresh'),
  refreshInterval: document.getElementById('refresh-interval'),
  searchBox: document.getElementById('search-box'),
  clearFilter: document.getElementById('clear-filter'),
  unreadCount: document.getElementById('unread-count'),
  totalCount: document.getElementById('total-count')
};

// 动态导入 mock API（用于 guest 模式）
let mockApiModule = null;
async function getMockApi() {
  if (!mockApiModule) {
    mockApiModule = await import('./modules/app/mock-api.js');
  }
  return mockApiModule.mockApi;
}

// API 请求
async function api(path, options = {}) {
  // Guest 模式使用 mock API
  if (window.__GUEST_MODE__) {
    const mockApi = await getMockApi();
    return mockApi(path, options);
  }
  const r = await fetch(path, { ...options, headers: { 'Cache-Control': 'no-cache', ...options.headers }});
  if (r.status === 401) { redirectToLogin('请先Access'); throw new Error('unauthorized'); }
  return r;
}

function redirectToLogin(msg) {
  if (msg) sessionStorage.setItem('mf:login-message', msg);
  location.replace('/login');
}

// 初始化认证
async function initAuth() {
  try {
    const r = await fetch('/api/session');
    const data = await r.json();
    if (!data.authenticated) { redirectToLogin('请先Access'); return; }
    if (data.role !== 'mailbox') { redirectToLogin('只有Mailbox User可以访问此页面'); return; }
    
    currentUser = data;
    currentMailbox = data.mailboxAddress;
    
    if (els.roleBadge) els.roleBadge.textContent = `Mailbox：${currentMailbox}`;
    if (els.currentMailbox) els.currentMailbox.textContent = currentMailbox;
    
    await loadEmails();
    startAutoRefresh();
  } catch(e) {
    console.error('认证失败:', e);
    redirectToLogin('认证失败');
  }
}

// 加载Email List
async function loadEmails() {
  if (els.listLoading) els.listLoading.style.display = 'flex';
  if (els.emailList) els.emailList.innerHTML = generateSkeletonList(5);
  
  try {
    const r = await api(`/api/emails?mailbox=${encodeURIComponent(currentMailbox)}`);
    emails = await r.json();
    if (!Array.isArray(emails)) emails = [];
    
    renderEmails();
    updateCounts();
  } catch(e) {
    console.error('加载Email失败:', e);
    showToast('Loading failed', 'error');
  } finally {
    if (els.listLoading) els.listLoading.style.display = 'none';
  }
}

// 渲染Email List
function renderEmails() {
  let filtered = filterEmails(emails, keyword);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  
  if (!pageItems.length) {
    els.emailList.innerHTML = '';
    if (els.emptyState) els.emptyState.style.display = 'block';
    if (els.listPager) els.listPager.style.display = 'none';
  } else {
    renderEmailList(pageItems, els.emailList);
    if (els.emptyState) els.emptyState.style.display = 'none';
    
    // 绑定点击事件
    els.emailList.querySelectorAll('.email-item').forEach(item => {
      item.onclick = () => showEmail(item.dataset.emailId);
    });
    
    // 分页
    if (els.listPager) els.listPager.style.display = total > pageSize ? 'flex' : 'none';
    if (els.pageInfo) els.pageInfo.textContent = `${currentPage} / ${totalPages}`;
    if (els.prevPageBtn) els.prevPageBtn.disabled = currentPage <= 1;
    if (els.nextPageBtn) els.nextPageBtn.disabled = currentPage >= totalPages;
  }
}

// 更新计数
function updateCounts() {
  if (els.totalCount) els.totalCount.textContent = emails.length;
  if (els.unreadCount) els.unreadCount.textContent = countUnread(emails);
}

// 显示Email Details
async function showEmail(id) {
  try {
    const r = await api(`/api/email/${id}`);
    const email = await r.json();
    
    if (els.modalSubject) els.modalSubject.textContent = email.subject || '(无Subject)';
    if (els.modalContent) els.modalContent.innerHTML = renderEmailDetail(email);
    
    // 绑定Verify码复制
    els.modalContent?.querySelectorAll('.code-value').forEach(el => {
      el.onclick = async () => {
        const code = el.dataset.code || el.textContent;
        try { await navigator.clipboard.writeText(code); showToast('Copied', 'success'); }
        catch(_) { showToast('Copy failed', 'error'); }
      };
    });
    
    els.emailModal?.classList.add('show');
    
    // 标记已读
    if (!email.is_read) {
      try { await api(`/api/email/${id}/read`, { method: 'POST' }); loadEmails(); } catch(_) {}
    }
  } catch(e) {
    showToast('加载Email失败', 'error');
  }
}

// 自动Refresh
function startAutoRefresh() {
  stopAutoRefresh();
  const interval = parseInt(els.refreshInterval?.value || '15', 10) * 1000;
  if (els.autoRefresh?.checked) {
    autoRefreshTimer = setInterval(loadEmails, interval);
  }
}

function stopAutoRefresh() {
  if (autoRefreshTimer) { clearInterval(autoRefreshTimer); autoRefreshTimer = null; }
}

// 对话框Status
let dialogResolver = null;
let dialogMode = null; // 'confirm' | 'alert'

// 初始化对话框事件（只绑定一次）
function initDialogEvents() {
  if (els._dialogInitialized) return;
  els._dialogInitialized = true;
  
  const closeDialog = (result) => {
    els.confirmModal?.classList.remove('show');
    if (els.confirmCancelBtn) els.confirmCancelBtn.style.display = '';
    if (dialogResolver) {
      dialogResolver(result);
      dialogResolver = null;
    }
  };
  
  els.confirmOkBtn?.addEventListener('click', () => closeDialog(true));
  els.confirmCancelBtn?.addEventListener('click', () => closeDialog(false));
  els.confirmCloseBtn?.addEventListener('click', () => closeDialog(false));
}

// 确认对话框
function showConfirm(message) {
  initDialogEvents();
  return new Promise(resolve => {
    dialogResolver = resolve;
    dialogMode = 'confirm';
    if (els.confirmMessage) els.confirmMessage.textContent = message;
    if (els.confirmCancelBtn) els.confirmCancelBtn.style.display = '';
    els.confirmModal?.classList.add('show');
  });
}

// 提示对话框（只有OK按钮，需要手动关闭）
function showAlert(message) {
  initDialogEvents();
  return new Promise(resolve => {
    dialogResolver = resolve;
    dialogMode = 'alert';
    if (els.confirmMessage) els.confirmMessage.textContent = message;
    if (els.confirmCancelBtn) els.confirmCancelBtn.style.display = 'none';
    els.confirmModal?.classList.add('show');
  });
}

// DeleteEmail
async function deleteEmail(id) {
  if (!await showConfirm('OKDelete这封Email？')) return;
  try {
    await api(`/api/email/${id}`, { method: 'DELETE' });
    showToast('已Delete', 'success');
    els.emailModal?.classList.remove('show');
    loadEmails();
  } catch(e) { showToast('Delete failed', 'error'); }
}

// 修改Password
async function changePassword() {
  const current = els.currentPasswordInput?.value;
  const newPass = els.newPasswordInput?.value;
  const confirmPass = els.confirmPasswordInput?.value;
  
  if (!current || !newPass) { await showAlert('请填写完整'); return; }
  if (newPass !== confirmPass) { await showAlert('两次Password不一致'); return; }
  if (newPass.length < 6) { await showAlert('Password至少6位'); return; }
  
  // 二级确认
  const confirmed = await showConfirm('修改Password后需要重新Access，OK要修改吗？');
  if (!confirmed) return;
  
  try {
    // 直接使用 fetch 而不是 api 函数，避免 401 时自动跳转
    const r = await fetch('/api/mailbox/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass })
    });
    
    if (r.ok) {
      els.passwordModal?.classList.remove('show');
      els.currentPasswordInput.value = '';
      els.newPasswordInput.value = '';
      els.confirmPasswordInput.value = '';
      
      // Password修改成功，强制退出Access
      showToast('Password修改成功，即将重新Access...', 'success');
      stopAutoRefresh();
      
      // 清除Session
      try { await fetch('/api/logout', { method: 'POST' }); } catch(_) {}
      
      // 延迟跳转让User看到提示
      setTimeout(() => {
        sessionStorage.setItem('mf:login-message', 'Password已修改，请使用新PasswordAccess');
        location.replace('/login');
      }, 1500);
    } else {
      // 显示具体的错误信息（使用模态框，需要手动关闭）
      const errorText = await r.text();
      const errorMsg = errorText || '修改失败';
      console.error('修改Password失败:', r.status, errorMsg);
      
      // 显示错误提示框，等待User确认
      await showAlert(errorMsg);
      
      // 如果是原Password错误，聚焦到原Password输入框
      if (errorMsg.includes('Password错误')) {
        els.currentPasswordInput?.focus();
        els.currentPasswordInput?.select();
      }
    }
  } catch(e) {
    console.error('修改Password请求失败:', e);
    await showAlert('Network error，Please try again');
  }
}

// 事件绑定
els.copyMailboxBtn?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(currentMailbox); showToast('Copied', 'success'); }
  catch(_) { showToast('Copy failed', 'error'); }
});

els.refreshEmailsBtn?.addEventListener('click', async () => {
  const icon = els.refreshEmailsBtn.querySelector('.btn-icon');
  if (icon) icon.classList.add('spinning');
  els.refreshEmailsBtn.disabled = true;
  try {
    await loadEmails();
    showToast('Refresh成功', 'success');
  } finally {
    if (icon) icon.classList.remove('spinning');
    els.refreshEmailsBtn.disabled = false;
  }
});
els.prevPageBtn?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderEmails(); }});
els.nextPageBtn?.addEventListener('click', () => { const totalPages = Math.ceil(filterEmails(emails, keyword).length / pageSize); if (currentPage < totalPages) { currentPage++; renderEmails(); }});

els.modalCloseBtn?.addEventListener('click', () => els.emailModal?.classList.remove('show'));
els.emailModal?.addEventListener('click', e => { if (e.target === els.emailModal) els.emailModal.classList.remove('show'); });

els.autoRefresh?.addEventListener('change', startAutoRefresh);
els.refreshInterval?.addEventListener('change', startAutoRefresh);

els.searchBox?.addEventListener('input', () => { keyword = els.searchBox.value; currentPage = 1; renderEmails(); });
els.clearFilter?.addEventListener('click', () => { keyword = ''; if (els.searchBox) els.searchBox.value = ''; currentPage = 1; renderEmails(); });

els.changePasswordBtn?.addEventListener('click', () => {
  els.passwordModal?.classList.add('show');
  els.currentPasswordInput?.focus();
});
els.passwordClose?.addEventListener('click', () => els.passwordModal?.classList.remove('show'));
els.passwordCancel?.addEventListener('click', () => els.passwordModal?.classList.remove('show'));

// 阻止表单default提交行为
els.passwordForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  changePassword();
});
els.passwordSubmit?.addEventListener('click', (e) => {
  e.preventDefault();
  changePassword();
});

// 点击背景关闭（但确认框显示时不关闭）
els.passwordModal?.addEventListener('click', e => { 
  if (e.target === els.passwordModal && !els.confirmModal?.classList.contains('show')) {
    els.passwordModal.classList.remove('show'); 
  }
});

els.logoutBtn?.addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch(_) {}
  stopAutoRefresh();
  location.replace('/login');
});

// 全局函数
window.deleteEmail = deleteEmail;

// 初始化
document.addEventListener('DOMContentLoaded', initAuth);
