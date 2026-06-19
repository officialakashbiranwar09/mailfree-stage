/**
 * API 请求封装模块
 * @module core/api
 */

/**
 * 基础 API 请求函数
 * @param {string} path - API 路径
 * @param {object} options - fetch 选项
 * @returns {Promise<Response>}
 */
export async function fetchApi(path, options = {}) {
  const defaultHeaders = {
    'Cache-Control': 'no-cache'
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  const response = await fetch(path, config);
  
  // 401 未授权时跳转到Access页
  if (response.status === 401) {
    const currentPath = window.location.pathname;
    // 避免在Access页循环重定向
    if (!currentPath.includes('login')) {
      window.location.replace('/login');
    }
    throw new Error('unauthorized');
  }
  
  return response;
}

/**
 * GET 请求
 * @param {string} path - API 路径
 * @returns {Promise<any>}
 */
export async function get(path) {
  const response = await fetchApi(path);
  return response.json();
}

/**
 * POST 请求
 * @param {string} path - API 路径
 * @param {object} data - 请求数据
 * @returns {Promise<any>}
 */
export async function post(path, data = {}) {
  const response = await fetchApi(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * PUT 请求
 * @param {string} path - API 路径
 * @param {object} data - 请求数据
 * @returns {Promise<any>}
 */
export async function put(path, data = {}) {
  const response = await fetchApi(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * PATCH 请求
 * @param {string} path - API 路径
 * @param {object} data - 请求数据
 * @returns {Promise<any>}
 */
export async function patch(path, data = {}) {
  const response = await fetchApi(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * DELETE 请求
 * @param {string} path - API 路径
 * @returns {Promise<any>}
 */
export async function del(path) {
  const response = await fetchApi(path, { method: 'DELETE' });
  return response.json();
}

/**
 * 获取域名列表
 */
export async function getDomains() {
  return get('/api/domains');
}

/**
 * 生成随机Mailbox
 * @param {number} length - 长度
 * @param {number} domainIndex - 域名索引
 */
export async function generateMailbox(length = 8, domainIndex = 0) {
  return get(`/api/generate?length=${length}&domainIndex=${domainIndex}`);
}

/**
 * Create自定义Mailbox
 * @param {string} local - 本地部分
 * @param {number} domainIndex - 域名索引
 */
export async function createMailbox(local, domainIndex = 0) {
  return post('/api/create', { local, domainIndex });
}

/**
 * 获取Mailbox列表
 * @param {object} params - 查询参数
 */
export async function getMailboxes(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/api/mailboxes${query ? '?' + query : ''}`);
}

/**
 * DeleteMailbox
 * @param {string} address - Mailbox Address
 */
export async function deleteMailbox(address) {
  return del(`/api/mailboxes?address=${encodeURIComponent(address)}`);
}

/**
 * 切换Mailbox置顶
 * @param {string} address - Mailbox Address
 */
export async function toggleMailboxPin(address) {
  const response = await fetchApi(`/api/mailboxes/pin?address=${encodeURIComponent(address)}`, {
    method: 'POST'
  });
  return response.json();
}

/**
 * 获取Email List
 * @param {string} mailbox - Mailbox Address
 * @param {number} limit - 限制数量
 */
export async function getEmails(mailbox, limit = 20) {
  return get(`/api/emails?mailbox=${encodeURIComponent(mailbox)}&limit=${limit}`);
}

/**
 * 获取Email Details
 * @param {number|string} id - Email ID
 */
export async function getEmailDetail(id) {
  return get(`/api/email/${id}`);
}

/**
 * DeleteEmail
 * @param {number|string} id - Email ID
 */
export async function deleteEmail(id) {
  return del(`/api/email/${id}`);
}

/**
 * ClearMailbox所有Email
 * @param {string} mailbox - Mailbox Address
 */
export async function clearEmails(mailbox) {
  return del(`/api/emails?mailbox=${encodeURIComponent(mailbox)}`);
}

/**
 * 获取User配额
 */
export async function getUserQuota() {
  return get('/api/user/quota');
}

/**
 * 获取Session信息
 */
export async function getSession() {
  return get('/api/session');
}

/**
 * 登出
 */
export async function logout() {
  return post('/api/logout');
}

/**
 * SettingsMailbox转发
 * @param {number} mailboxId - Mailbox ID
 * @param {string} forwardTo - 转发Target address
 */
export async function setForward(mailboxId, forwardTo) {
  return post('/api/mailbox/forward', { mailbox_id: mailboxId, forward_to: forwardTo });
}

/**
 * 切换Mailbox收藏
 * @param {number} mailboxId - Mailbox ID
 * @param {boolean} isFavorite - 是否收藏
 */
export async function setFavorite(mailboxId, isFavorite) {
  return post('/api/mailbox/favorite', { mailbox_id: mailboxId, is_favorite: isFavorite });
}

// 导出default对象
export default {
  fetchApi,
  get,
  post,
  put,
  patch,
  del,
  getDomains,
  generateMailbox,
  createMailbox,
  getMailboxes,
  deleteMailbox,
  toggleMailboxPin,
  getEmails,
  getEmailDetail,
  deleteEmail,
  clearEmails,
  getUserQuota,
  getSession,
  logout,
  setForward,
  setFavorite
};
