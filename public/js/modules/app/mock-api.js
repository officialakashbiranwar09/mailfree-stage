/**
 * 模拟 API 模块（Demo Mode）
 * @module modules/app/mock-api
 */

// 模拟Status
export const MOCK_STATE = {
  domains: ['example.com'],
  mailboxes: [],
  emailsByMailbox: new Map(),
  nextMailboxId: 100
};

/**
 * 生成随机 ID
 * @param {number} length - 长度
 * @returns {string}
 */
export function mockGenerateId(length = 8) {
  const vowelSyllables = ["a", "e", "i", "o", "u", "ai", "ei", "ou", "ia", "io"];
  const commonSyllables = [
    "al", "an", "ar", "er", "in", "on", "en", "el", "or", "ir",
    "la", "le", "li", "lo", "lu", "ra", "re", "ri", "ro", "ru",
    "na", "ne", "ni", "no", "nu", "ma", "me", "mi", "mo", "mu",
    "ta", "te", "ti", "to", "tu", "sa", "se", "si", "so", "su"
  ];
  const nameFragments = [
    "alex", "max", "sam", "ben", "tom", "joe", "leo", "kai", "ray", "jay",
    "anna", "emma", "lily", "lucy", "ruby", "zoe", "eva", "mia", "ava", "ivy"
  ];

  const makeNaturalWord = (targetLen) => {
    let word = "";
    let attempts = 0;
    const maxAttempts = 50;

    while (word.length < targetLen && attempts < maxAttempts) {
      attempts++;
      let syllable;
      
      if (word.length === 0 && Math.random() < 0.3 && targetLen >= 4) {
        const fragment = nameFragments[Math.floor(Math.random() * nameFragments.length)];
        if (fragment.length <= targetLen) {
          syllable = fragment;
        } else {
          syllable = commonSyllables[Math.floor(Math.random() * commonSyllables.length)];
        }
      } else {
        syllable = commonSyllables[Math.floor(Math.random() * commonSyllables.length)];
      }

      if (word.length + syllable.length <= targetLen) {
        word += syllable;
      } else {
        const remaining = targetLen - word.length;
        if (remaining > 0 && remaining <= syllable.length) {
          word += syllable.substring(0, remaining);
        }
      }
    }

    return word;
  };

  return makeNaturalWord(length);
}

/**
 * 构建模拟Email List
 * @param {number} count - 数量
 * @returns {Array}
 */
export function buildMockEmails(count = 6) {
  const subjects = [
    '欢迎注册我们的服务',
    '您的Verify码是 123456',
    '账户安全提醒',
    '订单确认Notification',
    'Password重置请求',
    '新消息提醒'
  ];
  const senders = [
    'noreply@example.com',
    'support@demo.com',
    'admin@test.org',
    'notification@service.com'
  ];
  
  return Array(count).fill(null).map((_, i) => ({
    id: i + 1,
    sender: senders[i % senders.length],
    subject: subjects[i % subjects.length],
    received_at: new Date(Date.now() - i * 3600000).toISOString().replace('T', ' ').slice(0, 19),
    is_read: i > 2 ? 1 : 0,
    preview: '这是一封演示Email的预览Message...',
    verification_code: i === 1 ? '123456' : null
  }));
}

/**
 * 构建模拟Email Details
 * @param {number} id - Email ID
 * @returns {object}
 */
export function buildMockEmailDetail(id) {
  return {
    id,
    sender: 'demo@example.com',
    to_addrs: 'test@example.com',
    subject: '演示Email #' + id,
    content: '这是Demo Mode下的Email Content。\n\n您的Verify码是：123456\n\n请勿将此Verify码告诉他人。',
    html_content: '<p>这是Demo Mode下的Email Content。</p><p><strong>您的Verify码是：123456</strong></p><p>请勿将此Verify码告诉他人。</p>',
    received_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    is_read: 1,
    verification_code: '123456'
  };
}

/**
 * 构建模拟Mailbox列表
 * @param {number} count - 数量
 * @param {number} pinnedCount - 置顶数量
 * @param {Array} domains - 域名列表
 * @returns {Array}
 */
export function buildMockMailboxes(count = 6, pinnedCount = 2, domains = ['example.com']) {
  return Array(count).fill(null).map((_, i) => ({
    id: i + 1,
    address: `demo${i + 1}@${domains[i % domains.length]}`,
    created_at: new Date(Date.now() - i * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    is_pinned: i < pinnedCount ? 1 : 0,
    password_is_default: 1,
    can_login: 0,
    forward_to: i === 0 ? 'backup@gmail.com' : null,
    is_favorite: i < 2 ? 1 : 0
  }));
}

/**
 * 模拟 API 请求处理
 * @param {string} path - API 路径
 * @param {object} options - 请求选项
 * @returns {Promise<Response>}
 */
export async function mockApi(path, options = {}) {
  const url = new URL(path, location.origin);
  const jsonHeaders = { 'Content-Type': 'application/json' };

  // GET /api/domains
  if (url.pathname === '/api/domains') {
    return new Response(JSON.stringify(MOCK_STATE.domains), { headers: jsonHeaders });
  }

  // GET /api/generate
  if (url.pathname === '/api/generate') {
    const len = Number(url.searchParams.get('length') || '8');
    const id = mockGenerateId(len);
    const domain = MOCK_STATE.domains[Number(url.searchParams.get('domainIndex') || 0)] || 'example.com';
    const email = `${id}@${domain}`;
    const newMailbox = { 
      id: MOCK_STATE.nextMailboxId++,
      address: email, 
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19), 
      is_pinned: 0,
      password_is_default: 1,
      can_login: 0,
      forward_to: null,
      is_favorite: 0
    };
    MOCK_STATE.mailboxes.unshift(newMailbox);
    return new Response(JSON.stringify({ email, expires: Date.now() + 3600000 }), { headers: jsonHeaders });
  }

  // GET /api/emails
  if (url.pathname === '/api/emails' && (!options.method || options.method === 'GET')) {
    const mailbox = url.searchParams.get('mailbox') || '';
    let list = MOCK_STATE.emailsByMailbox.get(mailbox);
    if (!list) {
      list = buildMockEmails(6);
      MOCK_STATE.emailsByMailbox.set(mailbox, list);
    }
    return new Response(JSON.stringify(list), { headers: jsonHeaders });
  }

  // GET /api/email/:id
  if (url.pathname.startsWith('/api/email/') && (!options.method || options.method === 'GET')) {
    const id = Number(url.pathname.split('/')[3]);
    return new Response(JSON.stringify(buildMockEmailDetail(id)), { headers: jsonHeaders });
  }

  // GET /api/mailboxes
  if (url.pathname === '/api/mailboxes' && (!options.method || options.method === 'GET')) {
    // 初始化 mock Mailbox
    if (!MOCK_STATE.mailboxes.length) {
      MOCK_STATE.mailboxes = buildMockMailboxes(6, 2, MOCK_STATE.domains);
    }
    
    let result = [...MOCK_STATE.mailboxes];
    
    // Search过滤
    const q = url.searchParams.get('q');
    if (q) {
      result = result.filter(m => m.address.toLowerCase().includes(q.toLowerCase()));
    }
    
    // 域名过滤
    const domain = url.searchParams.get('domain');
    if (domain) {
      result = result.filter(m => m.address.endsWith('@' + domain));
    }
    
    // Login Status过滤
    const login = url.searchParams.get('login');
    if (login === 'allowed') {
      result = result.filter(m => m.can_login);
    } else if (login === 'denied') {
      result = result.filter(m => !m.can_login);
    }
    
    // Favorite Status过滤
    const favorite = url.searchParams.get('favorite');
    if (favorite === 'favorite') {
      result = result.filter(m => m.is_favorite);
    } else if (favorite === 'not-favorite') {
      result = result.filter(m => !m.is_favorite);
    }
    
    // Forward Status过滤
    const forward = url.searchParams.get('forward');
    if (forward === 'has-forward') {
      result = result.filter(m => m.forward_to);
    } else if (forward === 'no-forward') {
      result = result.filter(m => !m.forward_to);
    }
    
    // 排序：置顶优先，然后按时间
    result.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return (b.is_pinned || 0) - (a.is_pinned || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // 分页
    const page = Number(url.searchParams.get('page') || 1);
    const size = Number(url.searchParams.get('size') || 20);
    const total = result.length;
    const start = (page - 1) * size;
    const pageResult = result.slice(start, start + size);
    
    return new Response(JSON.stringify({ list: pageResult, total }), { headers: jsonHeaders });
  }

  // POST /api/mailboxes/pin
  if (url.pathname === '/api/mailboxes/pin' && options.method === 'POST') {
    const address = url.searchParams.get('address');
    if (!address) return new Response('缺少 address 参数', { status: 400 });
    
    const mailbox = MOCK_STATE.mailboxes.find(m => m.address === address);
    if (mailbox) {
      mailbox.is_pinned = mailbox.is_pinned ? 0 : 1;
      return new Response(JSON.stringify({ success: true, is_pinned: mailbox.is_pinned }), { headers: jsonHeaders });
    }
    return new Response('Mailbox does not exist', { status: 404 });
  }

  // POST /api/create
  if (url.pathname === '/api/create' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const local = String((body.local || '').trim());
      if (!/^[A-Za-z0-9._-]{1,64}$/.test(local)) {
        return new Response('非法Username', { status: 400 });
      }
      const domainIndex = Number(body.domainIndex || 0);
      const domain = MOCK_STATE.domains[Math.max(0, Math.min(MOCK_STATE.domains.length - 1, domainIndex))] || 'example.com';
      const email = `${local}@${domain}`;
      
      if (MOCK_STATE.mailboxes.find(m => m.address === email)) {
        return new Response('Mailbox Address已存在', { status: 409 });
      }
      
      const newMailbox = { 
        id: MOCK_STATE.nextMailboxId++,
        address: email, 
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19), 
        is_pinned: 0,
        password_is_default: 1,
        can_login: 0,
        forward_to: null,
        is_favorite: 0
      };
      MOCK_STATE.mailboxes.unshift(newMailbox);
      return new Response(JSON.stringify({ email, expires: Date.now() + 3600000 }), { headers: jsonHeaders });
    } catch (_) {
      return new Response('Bad Request', { status: 400 });
    }
  }

  // Demo Mode禁止Delete操作
  if ((url.pathname === '/api/emails' && options.method === 'DELETE') ||
      (url.pathname.startsWith('/api/email/') && options.method === 'DELETE') ||
      (url.pathname === '/api/mailboxes' && options.method === 'DELETE')) {
    return new Response('Demo Mode不可操作', { status: 403 });
  }

  // GET /api/user/quota
  if (url.pathname === '/api/user/quota') {
    return new Response(JSON.stringify({ limit: 999, used: MOCK_STATE.mailboxes.length, remaining: 997 }), { headers: jsonHeaders });
  }

  // GET /api/session
  if (url.pathname === '/api/session') {
    return new Response(JSON.stringify({ authenticated: true, role: 'guest', username: 'guest' }), { headers: jsonHeaders });
  }

  // POST /api/logout - 登出
  if (url.pathname === '/api/logout' && options.method === 'POST') {
    // 清除 guest 模式Status
    window.__GUEST_MODE__ = false;
    return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
  }

  // POST /api/mailbox/forward - Settings转发
  if (url.pathname === '/api/mailbox/forward' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const mailboxId = body.mailbox_id;
      const forwardTo = body.forward_to || null;
      
      const mailbox = MOCK_STATE.mailboxes.find(m => m.id === mailboxId);
      if (mailbox) {
        mailbox.forward_to = forwardTo;
        return new Response(JSON.stringify({ success: true, forward_to: forwardTo }), { headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ error: 'Mailbox does not exist' }), { status: 404, headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  // POST /api/mailbox/favorite - 切换收藏
  if (url.pathname === '/api/mailbox/favorite' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const mailboxId = body.mailbox_id;
      
      const mailbox = MOCK_STATE.mailboxes.find(m => m.id === mailboxId);
      if (mailbox) {
        mailbox.is_favorite = mailbox.is_favorite ? 0 : 1;
        return new Response(JSON.stringify({ success: true, is_favorite: mailbox.is_favorite }), { headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ error: 'Mailbox does not exist' }), { status: 404, headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  // POST /api/mailboxes/batch-favorite - Favorite Selected
  if (url.pathname === '/api/mailboxes/batch-favorite' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const mailboxIds = body.mailbox_ids || [];
      const isFavorite = body.is_favorite ? 1 : 0;
      
      let count = 0;
      for (const id of mailboxIds) {
        const mailbox = MOCK_STATE.mailboxes.find(m => m.id === id);
        if (mailbox) {
          mailbox.is_favorite = isFavorite;
          count++;
        }
      }
      return new Response(JSON.stringify({ success: true, updated_count: count }), { headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  // POST /api/mailboxes/batch-favorite-by-address - Favorite Selected（按地址）
  if (url.pathname === '/api/mailboxes/batch-favorite-by-address' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const addresses = body.addresses || [];
      const isFavorite = body.is_favorite ? 1 : 0;
      
      let count = 0;
      for (const addr of addresses) {
        const mailbox = MOCK_STATE.mailboxes.find(m => m.address === addr);
        if (mailbox) {
          mailbox.is_favorite = isFavorite;
          count++;
        }
      }
      return new Response(JSON.stringify({ success: true, updated_count: count }), { headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  // POST /api/mailboxes/batch-forward-by-address - Set Forwarding（按地址）
  if (url.pathname === '/api/mailboxes/batch-forward-by-address' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const addresses = body.addresses || [];
      const forwardTo = body.forward_to || null;
      
      let count = 0;
      for (const addr of addresses) {
        const mailbox = MOCK_STATE.mailboxes.find(m => m.address === addr);
        if (mailbox) {
          mailbox.forward_to = forwardTo;
          count++;
        }
      }
      return new Response(JSON.stringify({ success: true, updated_count: count }), { headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  // POST /api/mailboxes/toggle-login - 切换Login Status
  if (url.pathname === '/api/mailboxes/toggle-login' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const address = body.address;
      const canLogin = body.can_login ? 1 : 0;
      
      const mailbox = MOCK_STATE.mailboxes.find(m => m.address === address);
      if (mailbox) {
        mailbox.can_login = canLogin;
        return new Response(JSON.stringify({ success: true, can_login: canLogin }), { headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ error: 'Mailbox does not exist' }), { status: 404, headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  // POST /api/mailboxes/batch-toggle-login - 批量切换Login Status
  if (url.pathname === '/api/mailboxes/batch-toggle-login' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
      const addresses = body.addresses || [];
      const canLogin = body.can_login ? 1 : 0;
      
      let count = 0;
      for (const addr of addresses) {
        const mailbox = MOCK_STATE.mailboxes.find(m => m.address === addr);
        if (mailbox) {
          mailbox.can_login = canLogin;
          count++;
        }
      }
      return new Response(JSON.stringify({ success: true, updated_count: count }), { headers: jsonHeaders });
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: jsonHeaders });
    }
  }

  return new Response('Not Found', { status: 404 });
}

// 导出default对象
export default {
  MOCK_STATE,
  mockGenerateId,
  buildMockEmails,
  buildMockEmailDetail,
  buildMockMailboxes,
  mockApi
};
