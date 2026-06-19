/**
 * Admin API 模块
 * @module modules/admin/api
 */

import { mockApi } from '../app/mock-api.js';

/**
 * API 请求封装
 * @param {string} path - API 路径
 * @param {object} options - fetch 选项
 * @returns {Promise<Response>}
 */
export async function api(path, options = {}) {
  // Guest 模式使用 mock API
  if (window.__GUEST_MODE__) {
    return mockApi(path, options);
  }
  
  const r = await fetch(path, {
    ...options,
    headers: { 'Cache-Control': 'no-cache', ...options.headers }
  });
  if (r.status === 401) {
    location.replace('/login');
    throw new Error('unauthorized');
  }
  return r;
}

/**
 * 获取User List
 * @param {object} params - 查询参数
 * @returns {Promise<object>}
 */
export async function getUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.size) query.set('size', params.size);
  const r = await api(`/api/users?${query.toString()}`);
  return r.json();
}

/**
 * Create User
 * @param {object} data - User数据
 * @returns {Promise<Response>}
 */
export async function createUser(data) {
  return api('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * 更新User
 * @param {number} id - User ID
 * @param {object} data - 更新数据
 * @returns {Promise<Response>}
 */
export async function updateUser(id, data) {
  return api(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * DeleteUser
 * @param {number} id - User ID
 * @returns {Promise<Response>}
 */
export async function deleteUser(id) {
  return api(`/api/users/${id}`, { method: 'DELETE' });
}

/**
 * 获取UserMailbox列表
 * @param {number} userId - User ID
 * @param {object} params - 查询参数
 * @returns {Promise<object>}
 */
export async function getUserMailboxes(userId, params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.size) query.set('size', params.size);
  const r = await api(`/api/users/${userId}/mailboxes?${query.toString()}`);
  return r.json();
}

/**
 * Assign Mailbox给User
 * @param {string} username - Username
 * @param {string} address - Mailbox Address
 * @returns {Promise<Response>}
 */
export async function assignMailbox(username, address) {
  return api('/api/users/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, address })
  });
}

/**
 * CancelAssign Mailbox
 * @param {string} username - Username
 * @param {string} address - Mailbox Address
 * @returns {Promise<Response>}
 */
export async function unassignMailbox(username, address) {
  return api('/api/users/unassign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, address })
  });
}

export default {
  api,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserMailboxes,
  assignMailbox,
  unassignMailbox
};
