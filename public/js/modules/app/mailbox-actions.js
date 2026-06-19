/**
 * Mailbox操作模块
 * @module modules/app/mailbox-actions
 */

import { setCurrentMailbox, getCurrentMailbox, clearCurrentMailbox, setCurrentMailboxInfo } from './mailbox-state.js';
import { setButtonLoading, restoreButton } from './ui-helpers.js';
import { generateRandomId } from './random-name.js';
import { getStoredLength, saveLength, getSelectedDomainIndex } from './domains.js';
import { startAutoRefresh, stopAutoRefresh } from './auto-refresh.js';
import { resetPager } from './email-list.js';
import { resetMbPage } from './mailbox-list.js';

/**
 * 生成随机Mailbox
 * @param {object} elements - DOM 元素
 * @param {HTMLInputElement} lenRange - 长度滑块
 * @param {HTMLSelectElement} domainSelect - 域名选择器
 * @param {Function} api - API 函数
 * @param {Function} showToast - 提示函数
 * @param {Function} refresh - Refresh函数
 * @param {Function} loadMailboxes - 加载Mailbox函数
 * @param {Function} autoRefreshCallback - 自动Refresh回调
 */
export async function generateMailbox(elements, lenRange, domainSelect, api, showToast, refresh, loadMailboxes, autoRefreshCallback, updateMailboxInfoUI) {
  const { gen, email, emailActions, listCard } = elements;
  
  try {
    setButtonLoading(gen, '生成中…');
    const len = Number(lenRange?.value || getStoredLength());
    const domainIndex = getSelectedDomainIndex(domainSelect);
    
    const r = await api(`/api/generate?length=${len}&domainIndex=${domainIndex}`);
    if (!r.ok) throw new Error(await r.text());
    
    const data = await r.json();
    saveLength(len);
    
    setCurrentMailbox(data.email);
    updateEmailDisplay(elements, data.email);
    
    // 获取完整的Mailbox信息（包括 id、is_favorite 等）
    try {
      const infoRes = await api(`/api/mailbox/info?address=${encodeURIComponent(data.email)}`);
      if (infoRes.ok) {
        const info = await infoRes.json();
        setCurrentMailboxInfo(info);
        if (updateMailboxInfoUI) updateMailboxInfoUI(info);
      }
    } catch(_) {}
    
    showToast('Mailbox生成成功！', 'success');
    startAutoRefresh(autoRefreshCallback);
    await refresh();
    
    resetMbPage();
    await loadMailboxes({ forceFresh: true });
  } catch(e) {
    showToast(e.message || '生成失败', 'error');
  } finally {
    restoreButton(gen);
  }
}

/**
 * 生成Random NameMailbox
 * @param {object} elements - DOM 元素
 * @param {HTMLInputElement} lenRange - 长度滑块
 * @param {HTMLSelectElement} domainSelect - 域名选择器
 * @param {Function} api - API 函数
 * @param {Function} showToast - 提示函数
 * @param {Function} refresh - Refresh函数
 * @param {Function} loadMailboxes - 加载Mailbox函数
 * @param {Function} autoRefreshCallback - 自动Refresh回调
 */
export async function generateNameMailbox(elements, lenRange, domainSelect, api, showToast, refresh, loadMailboxes, autoRefreshCallback, updateMailboxInfoUI) {
  const { genName } = elements;
  
  try {
    setButtonLoading(genName, '生成中…');
    const len = Number(lenRange?.value || getStoredLength());
    const domainIndex = getSelectedDomainIndex(domainSelect);
    const localName = generateRandomId(len);
    
    const r = await api('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local: localName, domainIndex })
    });
    
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    saveLength(len);
    
    setCurrentMailbox(data.email);
    updateEmailDisplay(elements, data.email);
    
    // 获取完整的Mailbox信息（包括 id、is_favorite 等）
    try {
      const infoRes = await api(`/api/mailbox/info?address=${encodeURIComponent(data.email)}`);
      if (infoRes.ok) {
        const info = await infoRes.json();
        setCurrentMailboxInfo(info);
        if (updateMailboxInfoUI) updateMailboxInfoUI(info);
      }
    } catch(_) {}
    
    showToast('Random NameMailbox生成成功！', 'success');
    startAutoRefresh(autoRefreshCallback);
    await refresh();
    
    resetMbPage();
    await loadMailboxes({ forceFresh: true });
  } catch(e) {
    showToast(e.message || '生成失败', 'error');
  } finally {
    restoreButton(genName);
  }
}

/**
 * Create自定义Mailbox
 * @param {object} elements - DOM 元素
 * @param {HTMLSelectElement} domainSelect - 域名选择器
 * @param {Function} api - API 函数
 * @param {Function} showToast - 提示函数
 * @param {Function} loadMailboxes - 加载Mailbox函数
 */
export async function createCustomMailbox(elements, domainSelect, api, showToast, loadMailboxes) {
  const { customLocalOverlay, customOverlay } = elements;
  
  try {
    const local = (customLocalOverlay?.value || '').trim();
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(local)) {
      showToast('Username不合法，Letters/numbers/._- only', 'warn');
      return;
    }
    const domainIndex = getSelectedDomainIndex(domainSelect);
    
    const r = await api('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local, domainIndex })
    });
    
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    
    setCurrentMailbox(data.email);
    updateEmailDisplay(elements, data.email);
    if (customOverlay) customOverlay.style.display = 'none';
    
    showToast('已CreateMailbox：' + data.email, 'success');
    await loadMailboxes({ forceFresh: true });
  } catch(e) {
    showToast(e.message || 'Create failed', 'error');
  }
}

/**
 * 更新Mailbox显示
 * @param {object} elements - DOM 元素
 * @param {string} address - Mailbox Address
 */
export function updateEmailDisplay(elements, address) {
  const { email, emailActions, listCard } = elements;
  const emailText = document.getElementById('email-text');
  if (emailText) emailText.textContent = address;
  else if (email) email.textContent = address;
  
  email?.classList.add('has-email');
  if (emailActions) emailActions.style.display = 'grid';
  if (listCard) listCard.style.display = 'block';
}

/**
 * 选择Mailbox
 * @param {string} address - Mailbox Address
 * @param {object} elements - DOM 元素
 * @param {Function} api - API 函数
 * @param {Function} refresh - Refresh函数
 * @param {Function} autoRefreshCallback - 自动Refresh回调
 * @param {Function} updateMailboxInfoUI - 更新Mailbox信息UI函数
 */
export async function selectMailboxAddress(address, elements, api, refresh, autoRefreshCallback, updateMailboxInfoUI) {
  setCurrentMailbox(address);
  updateEmailDisplay(elements, address);
  
  // 更新侧边栏选中Status
  document.querySelectorAll('.mailbox-item').forEach(el => {
    el.classList.toggle('selected', el.querySelector('.address')?.textContent === address);
  });
  
  // 加载Mailbox信息
  try {
    const r = await api(`/api/mailbox/info?address=${encodeURIComponent(address)}`);
    if (r.ok) {
      const info = await r.json();
      setCurrentMailboxInfo(info);
      updateMailboxInfoUI(info);
    }
  } catch(_) {}
  
  // 重置分页并Refresh
  resetPager(elements);
  startAutoRefresh(autoRefreshCallback);
  await refresh();
}

/**
 * 置顶/Cancel置顶Mailbox
 * @param {Event} event - 事件
 * @param {string} address - Mailbox Address
 * @param {Function} api - API 函数
 * @param {Function} showToast - 提示函数
 * @param {Function} loadMailboxes - 加载Mailbox函数
 */
export async function toggleMailboxPin(event, address, api, showToast, loadMailboxes) {
  event.stopPropagation();
  try {
    const r = await api(`/api/mailboxes/pin?address=${encodeURIComponent(address)}`, { method: 'POST' });
    if (r.ok) {
      showToast('Operation successful', 'success');
      await loadMailboxes({ forceFresh: true });
    }
  } catch(e) {
    showToast(e.message || 'Operation failed', 'error');
  }
}

/**
 * DeleteMailbox
 * @param {Event} event - 事件
 * @param {string} address - Mailbox Address
 * @param {object} elements - DOM 元素
 * @param {Function} api - API 函数
 * @param {Function} showToast - 提示函数
 * @param {Function} showConfirm - 确认函数
 * @param {Function} loadMailboxes - 加载Mailbox函数
 */
export async function deleteMailboxAddress(event, address, elements, api, showToast, showConfirm, loadMailboxes) {
  event.stopPropagation();
  const confirmed = await showConfirm(`OKDeleteMailbox ${address}？所有Email将被Clear。`);
  if (!confirmed) return;
  
  try {
    const r = await api(`/api/mailboxes?address=${encodeURIComponent(address)}`, { method: 'DELETE' });
    if (r.ok) {
      showToast('Mailbox deleted', 'success');
      if (getCurrentMailbox() === address) {
        clearCurrentMailbox();
        if (elements.email) elements.email.textContent = '点击生成Mailbox';
        elements.email?.classList.remove('has-email');
        if (elements.emailActions) elements.emailActions.style.display = 'none';
        if (elements.list) elements.list.innerHTML = '';
        stopAutoRefresh();
      }
      await loadMailboxes({ forceFresh: true });
    }
  } catch(e) {
    showToast(e.message || 'Delete failed', 'error');
  }
}

/**
 * Copy Mailbox地址
 * @param {Function} showToast - 提示函数
 */
export async function copyMailboxAddress(showToast) {
  const mailbox = getCurrentMailbox();
  if (!mailbox) {
    showToast('Please generate or select a mailbox first', 'warn');
    return;
  }
  try {
    await navigator.clipboard.writeText(mailbox);
    showToast(`Copied：${mailbox}`, 'success');
  } catch(_) {
    showToast('Copy failed', 'error');
  }
}

/**
 * Clear Mail
 * @param {Function} api - API 函数
 * @param {Function} showToast - 提示函数
 * @param {Function} showConfirm - 确认函数
 * @param {Function} refresh - Refresh函数
 */
export async function clearAllEmails(api, showToast, showConfirm, refresh) {
  const mailbox = getCurrentMailbox();
  if (!mailbox) {
    showToast('Please select a mailbox first', 'warn');
    return;
  }
  const confirmed = await showConfirm(`OKClear ${mailbox} 的所有Email？`);
  if (!confirmed) return;
  
  try {
    const r = await api(`/api/emails?mailbox=${encodeURIComponent(mailbox)}`, { method: 'DELETE' });
    if (r.ok) {
      showToast('Email已Clear', 'success');
      await refresh();
    }
  } catch(e) {
    showToast(e.message || 'Clear failed', 'error');
  }
}

/**
 * 登出
 * @param {Function} api - API 函数
 */
export async function logout(api) {
  try {
    await api('/api/logout', { method: 'POST' });
  } catch(_) {}
  
  try {
    clearCurrentMailbox();
  } catch(_) {}
  
  try {
    stopAutoRefresh();
  } catch(_) {}
  
  // 确保跳转一定执行
  window.location.replace('/login');
}

export default {
  generateMailbox,
  generateNameMailbox,
  createCustomMailbox,
  updateEmailDisplay,
  selectMailboxAddress,
  toggleMailboxPin,
  deleteMailboxAddress,
  copyMailboxAddress,
  clearAllEmails,
  logout
};
