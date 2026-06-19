var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-v7IQcV/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-v7IQcV/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// ../../../.npm-global/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../../.npm-global/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/utils/cache.js
function clearExpiredCache() {
  const now = Date.now();
  for (const cache of Object.values(caches)) {
    for (const [key, entry] of cache.entries()) {
      if (entry.expiry <= now) {
        cache.delete(key);
      }
    }
  }
}
async function getCachedMailboxId(db, address) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) return null;
  const now = Date.now();
  const cached = caches.mailboxId.get(normalized);
  if (cached && cached.expiry > now) {
    return cached.id;
  }
  const res = await db.prepare("SELECT id FROM mailboxes WHERE address = ? LIMIT 1").bind(normalized).all();
  if (res.results && res.results.length > 0) {
    const id = res.results[0].id;
    caches.mailboxId.set(normalized, {
      id,
      expiry: now + CACHE_EXPIRY.MAILBOX_ID
    });
    return id;
  }
  return null;
}
function updateMailboxIdCache(address, id) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized || !id) return;
  caches.mailboxId.set(normalized, {
    id,
    expiry: Date.now() + CACHE_EXPIRY.MAILBOX_ID
  });
}
function invalidateMailboxCache(address) {
  const normalized = String(address || "").trim().toLowerCase();
  if (normalized) {
    caches.mailboxId.delete(normalized);
  }
}
async function getCachedUserQuota(db, userId) {
  if (!userId) return { used: 0, limit: 0 };
  const now = Date.now();
  const cached = caches.userQuota.get(userId);
  if (cached && cached.expiry > now) {
    return { used: cached.used, limit: cached.limit };
  }
  try {
    const userRes = await db.prepare("SELECT mailbox_limit FROM users WHERE id = ?").bind(userId).all();
    const limit = userRes?.results?.[0]?.mailbox_limit || 10;
    const countRes = await db.prepare("SELECT COUNT(1) AS c FROM user_mailboxes WHERE user_id = ?").bind(userId).all();
    const used = countRes?.results?.[0]?.c || 0;
    caches.userQuota.set(userId, {
      used,
      limit,
      expiry: now + CACHE_EXPIRY.USER_QUOTA
    });
    return { used, limit };
  } catch (error) {
    console.error("\u83B7\u53D6User\u914D\u989D\u5931\u8D25:", error);
    return { used: 0, limit: 0 };
  }
}
function invalidateUserQuotaCache(userId) {
  if (userId) {
    caches.userQuota.delete(userId);
  }
}
async function getCachedSystemStat(db, key, queryFn) {
  const now = Date.now();
  const cached = caches.systemStat.get(key);
  if (cached && cached.expiry > now) {
    return cached.value;
  }
  try {
    const value = await queryFn(db);
    caches.systemStat.set(key, {
      value,
      expiry: now + CACHE_EXPIRY.SYSTEM_STAT
    });
    return value;
  } catch (error) {
    console.error("\u83B7\u53D6\u7CFB\u7EDF\u7EDF\u8BA1\u5931\u8D25:", error);
    return cached?.value ?? null;
  }
}
function invalidateSystemStatCache(key) {
  if (key) {
    caches.systemStat.delete(key);
  }
}
var CACHE_EXPIRY, caches;
var init_cache = __esm({
  "src/utils/cache.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    CACHE_EXPIRY = {
      MAILBOX_ID: 5 * 60 * 1e3,
      // MailboxID缓存5分钟
      USER_QUOTA: 60 * 1e3,
      // User配额缓存1分钟
      SYSTEM_STAT: 5 * 60 * 1e3
      // 系统统计缓存5分钟
    };
    caches = {
      mailboxId: /* @__PURE__ */ new Map(),
      // Mailbox Address -> { id, expiry }
      userQuota: /* @__PURE__ */ new Map(),
      // UserID -> { used, limit, expiry }
      systemStat: /* @__PURE__ */ new Map()
      // 统计键 -> { value, expiry }
    };
    __name(clearExpiredCache, "clearExpiredCache");
    __name(getCachedMailboxId, "getCachedMailboxId");
    __name(updateMailboxIdCache, "updateMailboxIdCache");
    __name(invalidateMailboxCache, "invalidateMailboxCache");
    __name(getCachedUserQuota, "getCachedUserQuota");
    __name(invalidateUserQuotaCache, "invalidateUserQuotaCache");
    __name(getCachedSystemStat, "getCachedSystemStat");
    __name(invalidateSystemStatCache, "invalidateSystemStatCache");
  }
});

// src/db/init.js
async function initDatabase(db) {
  try {
    clearExpiredCache();
    if (_isFirstInit) {
      await performFirstTimeSetup(db);
      _isFirstInit = false;
    }
    await db.exec(`PRAGMA foreign_keys = ON;`);
  } catch (error) {
    console.error("\u6570\u636E\u5E93\u521D\u59CB\u5316\u5931\u8D25:", error);
    throw error;
  }
}
async function performFirstTimeSetup(db) {
  try {
    await db.prepare("SELECT 1 FROM mailboxes LIMIT 1").all();
    await db.prepare("SELECT 1 FROM messages LIMIT 1").all();
    await db.prepare("SELECT 1 FROM users LIMIT 1").all();
    await db.prepare("SELECT 1 FROM user_mailboxes LIMIT 1").all();
    await db.prepare("SELECT 1 FROM sent_emails LIMIT 1").all();
    await migrateMailboxesFields(db);
    return;
  } catch (e) {
    console.log("\u68C0\u6D4B\u5230\u6570\u636E\u5E93\u8868\u4E0D\u5B8C\u6574\uFF0C\u5F00\u59CB\u521D\u59CB\u5316...");
  }
  await db.exec("CREATE TABLE IF NOT EXISTS mailboxes (id INTEGER PRIMARY KEY AUTOINCREMENT, address TEXT NOT NULL UNIQUE, local_part TEXT NOT NULL, domain TEXT NOT NULL, password_hash TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, last_accessed_at TEXT, expires_at TEXT, is_pinned INTEGER DEFAULT 0, can_login INTEGER DEFAULT 0, forward_to TEXT DEFAULT NULL, is_favorite INTEGER DEFAULT 0);");
  await db.exec("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, mailbox_id INTEGER NOT NULL, sender TEXT NOT NULL, to_addrs TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL, verification_code TEXT, preview TEXT, r2_bucket TEXT NOT NULL DEFAULT 'mail-eml', r2_object_key TEXT NOT NULL DEFAULT '', received_at TEXT DEFAULT CURRENT_TIMESTAMP, is_read INTEGER DEFAULT 0, FOREIGN KEY(mailbox_id) REFERENCES mailboxes(id));");
  await db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT, role TEXT NOT NULL DEFAULT 'user', can_send INTEGER NOT NULL DEFAULT 0, mailbox_limit INTEGER NOT NULL DEFAULT 10, created_at TEXT DEFAULT CURRENT_TIMESTAMP);");
  await db.exec("CREATE TABLE IF NOT EXISTS user_mailboxes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, mailbox_id INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_pinned INTEGER NOT NULL DEFAULT 0, UNIQUE(user_id, mailbox_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE);");
  await db.exec("CREATE TABLE IF NOT EXISTS sent_emails (id INTEGER PRIMARY KEY AUTOINCREMENT, resend_id TEXT, from_name TEXT, from_addr TEXT NOT NULL, to_addrs TEXT NOT NULL, subject TEXT NOT NULL, html_content TEXT, text_content TEXT, status TEXT DEFAULT 'queued', scheduled_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);");
  await createIndexes(db);
}
async function createIndexes(db) {
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_address ON mailboxes(address);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_is_pinned ON mailboxes(is_pinned DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_address_created ON mailboxes(address, created_at DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_is_favorite ON mailboxes(is_favorite DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_mailbox_id ON messages(mailbox_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_received_at ON messages(received_at DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_r2_object_key ON messages(r2_object_key);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_mailbox_received ON messages(mailbox_id, received_at DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_mailbox_received_read ON messages(mailbox_id, received_at DESC, is_read);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_user_mailboxes_user ON user_mailboxes(user_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_user_mailboxes_mailbox ON user_mailboxes(mailbox_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_user_mailboxes_user_pinned ON user_mailboxes(user_id, is_pinned DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_user_mailboxes_composite ON user_mailboxes(user_id, mailbox_id, is_pinned);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_sent_emails_resend_id ON sent_emails(resend_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_sent_emails_status_created ON sent_emails(status, created_at DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_sent_emails_from_addr ON sent_emails(from_addr);`);
}
async function migrateMailboxesFields(db) {
  try {
    const columns = await db.prepare("PRAGMA table_info(mailboxes)").all();
    const columnNames = (columns.results || []).map((c) => c.name);
    if (!columnNames.includes("forward_to")) {
      await db.exec("ALTER TABLE mailboxes ADD COLUMN forward_to TEXT DEFAULT NULL;");
      console.log("\u5DF2\u6DFB\u52A0 mailboxes.forward_to \u5B57\u6BB5");
    }
    if (!columnNames.includes("is_favorite")) {
      await db.exec("ALTER TABLE mailboxes ADD COLUMN is_favorite INTEGER DEFAULT 0;");
      await db.exec("CREATE INDEX IF NOT EXISTS idx_mailboxes_is_favorite ON mailboxes(is_favorite DESC);");
      console.log("\u5DF2\u6DFB\u52A0 mailboxes.is_favorite \u5B57\u6BB5");
    }
  } catch (error) {
    console.error("mailboxes \u5B57\u6BB5\u8FC1\u79FB\u5931\u8D25:", error);
  }
}
var _isFirstInit;
var init_init = __esm({
  "src/db/init.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_cache();
    _isFirstInit = true;
    __name(initDatabase, "initDatabase");
    __name(performFirstTimeSetup, "performFirstTimeSetup");
    __name(createIndexes, "createIndexes");
    __name(migrateMailboxesFields, "migrateMailboxesFields");
  }
});

// src/db/connection.js
async function getDatabaseWithValidation(env) {
  const db = env.TEMP_MAIL_DB;
  if (!db) {
    throw new Error("\u6570\u636E\u5E93\u672AConfiguration\uFF0CPlease check wrangler.toml \u4E2D\u7684 [[d1_databases]] \u7ED1\u5B9A");
  }
  try {
    await db.prepare("SELECT 1").all();
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
  return db;
}
async function getInitializedDatabase(env) {
  const db = await getDatabaseWithValidation(env);
  if (!globalThis.__DB_INITED__) {
    globalThis.__DB_INITED__ = /* @__PURE__ */ new Set();
  }
  const dbId = db.name || "default";
  if (!globalThis.__DB_INITED__.has(dbId)) {
    await initDatabase(db);
    globalThis.__DB_INITED__.add(dbId);
  }
  return db;
}
var init_connection = __esm({
  "src/db/connection.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_init();
    __name(getDatabaseWithValidation, "getDatabaseWithValidation");
    __name(getInitializedDatabase, "getInitializedDatabase");
  }
});

// src/db/mailboxes.js
async function getOrCreateMailboxId(db, address) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) throw new Error("\u65E0\u6548\u7684Mailbox Address");
  const cachedId = await getCachedMailboxId(db, normalized);
  if (cachedId) {
    db.prepare("UPDATE mailboxes SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(cachedId).run().catch(() => {
    });
    return cachedId;
  }
  let local_part = "";
  let domain = "";
  const at = normalized.indexOf("@");
  if (at > 0 && at < normalized.length - 1) {
    local_part = normalized.slice(0, at);
    domain = normalized.slice(at + 1);
  }
  if (!local_part || !domain) throw new Error("\u65E0\u6548\u7684Mailbox Address");
  const existing = await db.prepare("SELECT id FROM mailboxes WHERE address = ? LIMIT 1").bind(normalized).all();
  if (existing.results && existing.results.length > 0) {
    const id = existing.results[0].id;
    updateMailboxIdCache(normalized, id);
    await db.prepare("UPDATE mailboxes SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
    return id;
  }
  await db.prepare(
    "INSERT INTO mailboxes (address, local_part, domain, password_hash, last_accessed_at) VALUES (?, ?, ?, NULL, CURRENT_TIMESTAMP)"
  ).bind(normalized, local_part, domain).run();
  const created = await db.prepare("SELECT id FROM mailboxes WHERE address = ? LIMIT 1").bind(normalized).all();
  const newId = created.results[0].id;
  updateMailboxIdCache(normalized, newId);
  invalidateSystemStatCache("total_mailboxes");
  return newId;
}
async function getMailboxIdByAddress(db, address) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) return null;
  return await getCachedMailboxId(db, normalized);
}
async function toggleMailboxPin(db, address, userId) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) throw new Error("\u65E0\u6548\u7684Mailbox Address");
  const uid = Number(userId || 0);
  if (!uid) throw new Error("\u672ASign In");
  const mbRes = await db.prepare("SELECT id FROM mailboxes WHERE address = ? LIMIT 1").bind(normalized).all();
  if (!mbRes.results || mbRes.results.length === 0) {
    throw new Error("Mailbox does not exist");
  }
  const mailboxId = mbRes.results[0].id;
  const umRes = await db.prepare("SELECT id, is_pinned FROM user_mailboxes WHERE user_id = ? AND mailbox_id = ? LIMIT 1").bind(uid, mailboxId).all();
  if (!umRes.results || umRes.results.length === 0) {
    await db.prepare("INSERT INTO user_mailboxes (user_id, mailbox_id, is_pinned) VALUES (?, ?, 1)").bind(uid, mailboxId).run();
    return { is_pinned: 1 };
  }
  const currentPin = umRes.results[0].is_pinned ? 1 : 0;
  const newPin = currentPin ? 0 : 1;
  await db.prepare("UPDATE user_mailboxes SET is_pinned = ? WHERE user_id = ? AND mailbox_id = ?").bind(newPin, uid, mailboxId).run();
  return { is_pinned: newPin };
}
async function getTotalMailboxCount(db) {
  try {
    return await getCachedSystemStat(db, "total_mailboxes", async (db2) => {
      const result = await db2.prepare("SELECT COUNT(1) AS count FROM mailboxes").all();
      return result?.results?.[0]?.count || 0;
    });
  } catch (error) {
    console.error("\u83B7\u53D6\u7CFB\u7EDFMailbox\u603B\u6570\u5931\u8D25:", error);
    return 0;
  }
}
async function getForwardTarget(db, address) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) return null;
  const result = await db.prepare(
    "SELECT forward_to FROM mailboxes WHERE address = ? LIMIT 1"
  ).bind(normalized).first();
  return result?.forward_to || null;
}
var init_mailboxes = __esm({
  "src/db/mailboxes.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_cache();
    __name(getOrCreateMailboxId, "getOrCreateMailboxId");
    __name(getMailboxIdByAddress, "getMailboxIdByAddress");
    __name(toggleMailboxPin, "toggleMailboxPin");
    __name(getTotalMailboxCount, "getTotalMailboxCount");
    __name(getForwardTarget, "getForwardTarget");
  }
});

// src/db/users.js
async function createUser(db, { username, passwordHash = null, role = "user", mailboxLimit = 10 }) {
  const uname = String(username || "").trim().toLowerCase();
  if (!uname) throw new Error("Username\u4E0D\u80FD\u4E3A\u7A7A");
  const r = await db.prepare("INSERT INTO users (username, password_hash, role, mailbox_limit) VALUES (?, ?, ?, ?)").bind(uname, passwordHash, role, Math.max(0, Number(mailboxLimit || 10))).run();
  const res = await db.prepare("SELECT id, username, role, mailbox_limit, created_at FROM users WHERE username = ? LIMIT 1").bind(uname).all();
  return res?.results?.[0];
}
async function updateUser(db, userId, fields) {
  const allowed = ["role", "mailbox_limit", "password_hash", "can_send"];
  const setClauses = [];
  const values = [];
  for (const key of allowed) {
    if (key in (fields || {})) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (!setClauses.length) return;
  const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`;
  values.push(userId);
  await db.prepare(sql).bind(...values).run();
  if ("mailbox_limit" in fields) {
    invalidateUserQuotaCache(userId);
  }
  if ("can_send" in fields) {
    invalidateSystemStatCache(`user_can_send_${userId}`);
  }
}
async function deleteUser(db, userId) {
  await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
}
async function listUsersWithCounts(db, { limit = 50, offset = 0, sort = "desc" } = {}) {
  const orderDirection = sort === "asc" ? "ASC" : "DESC";
  const actualLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const actualOffset = Math.max(0, Number(offset) || 0);
  const usersSql = `
    SELECT u.id, u.username, u.role, u.mailbox_limit, u.can_send, u.created_at
    FROM users u
    ORDER BY datetime(u.created_at) ${orderDirection}
    LIMIT ? OFFSET ?
  `;
  const { results: users } = await db.prepare(usersSql).bind(actualLimit, actualOffset).all();
  if (!users || users.length === 0) {
    return [];
  }
  const userIds = users.map((u) => u.id);
  const placeholders = userIds.map(() => "?").join(",");
  const countSql = `
    SELECT user_id, COUNT(1) AS c 
    FROM user_mailboxes 
    WHERE user_id IN (${placeholders})
    GROUP BY user_id
  `;
  const { results: counts } = await db.prepare(countSql).bind(...userIds).all();
  const countMap = /* @__PURE__ */ new Map();
  for (const row of counts || []) {
    countMap.set(row.user_id, row.c);
  }
  return users.map((u) => ({
    ...u,
    mailbox_count: countMap.get(u.id) || 0
  }));
}
async function assignMailboxToUser(db, { userId = null, username = null, address }) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) throw new Error("Mailbox Address\u65E0\u6548");
  const mailboxId = await getOrCreateMailboxId(db, normalized);
  let uid = userId;
  if (!uid) {
    const uname = String(username || "").trim().toLowerCase();
    if (!uname) throw new Error("\u7F3A\u5C11User\u6807\u8BC6");
    const r = await db.prepare("SELECT id FROM users WHERE username = ? LIMIT 1").bind(uname).all();
    if (!r.results || !r.results.length) throw new Error("User\u4E0D\u5B58\u5728");
    uid = r.results[0].id;
  }
  const quota = await getCachedUserQuota(db, uid);
  if (quota.used >= quota.limit) throw new Error("\u5DF2\u8FBE\u5230Mailbox\u4E0A\u9650");
  await db.prepare("INSERT OR IGNORE INTO user_mailboxes (user_id, mailbox_id) VALUES (?, ?)").bind(uid, mailboxId).run();
  invalidateUserQuotaCache(uid);
  return { success: true };
}
async function getUserMailboxes(db, userId, limit = 100) {
  const sql = `
    SELECT m.address, m.created_at, um.is_pinned,
           COALESCE(m.can_login, 0) AS can_login
    FROM user_mailboxes um
    JOIN mailboxes m ON m.id = um.mailbox_id
    WHERE um.user_id = ?
    ORDER BY um.is_pinned DESC, datetime(m.created_at) DESC
    LIMIT ?
  `;
  const { results } = await db.prepare(sql).bind(userId, Math.min(limit, 200)).all();
  return results || [];
}
async function unassignMailboxFromUser(db, { userId = null, username = null, address }) {
  const normalized = String(address || "").trim().toLowerCase();
  if (!normalized) throw new Error("Mailbox Address\u65E0\u6548");
  const mailboxId = await getMailboxIdByAddress(db, normalized);
  if (!mailboxId) throw new Error("Mailbox does not exist");
  let uid = userId;
  if (!uid) {
    const uname = String(username || "").trim().toLowerCase();
    if (!uname) throw new Error("\u7F3A\u5C11User\u6807\u8BC6");
    const r = await db.prepare("SELECT id FROM users WHERE username = ? LIMIT 1").bind(uname).all();
    if (!r.results || !r.results.length) throw new Error("User\u4E0D\u5B58\u5728");
    uid = r.results[0].id;
  }
  const checkRes = await db.prepare("SELECT id FROM user_mailboxes WHERE user_id = ? AND mailbox_id = ? LIMIT 1").bind(uid, mailboxId).all();
  if (!checkRes.results || checkRes.results.length === 0) {
    throw new Error("\u8BE5Mailbox\u672AAssign\u7ED9\u8BE5User");
  }
  await db.prepare("DELETE FROM user_mailboxes WHERE user_id = ? AND mailbox_id = ?").bind(uid, mailboxId).run();
  invalidateUserQuotaCache(uid);
  return { success: true };
}
var init_users = __esm({
  "src/db/users.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_cache();
    init_mailboxes();
    __name(createUser, "createUser");
    __name(updateUser, "updateUser");
    __name(deleteUser, "deleteUser");
    __name(listUsersWithCounts, "listUsersWithCounts");
    __name(assignMailboxToUser, "assignMailboxToUser");
    __name(getUserMailboxes, "getUserMailboxes");
    __name(unassignMailboxFromUser, "unassignMailboxFromUser");
  }
});

// src/db/sentEmails.js
async function recordSentEmail(db, { resendId, fromName, from, to, subject, html, text, status = "queued", scheduledAt = null }) {
  const toAddrs = Array.isArray(to) ? to.join(",") : String(to || "");
  await db.prepare(`
    INSERT INTO sent_emails (resend_id, from_name, from_addr, to_addrs, subject, html_content, text_content, status, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(resendId || null, fromName || null, from, toAddrs, subject, html || null, text || null, status, scheduledAt || null).run();
}
async function updateSentEmail(db, resendId, fields) {
  if (!resendId) return;
  const allowed = ["status", "scheduled_at"];
  const setClauses = [];
  const values = [];
  for (const key of allowed) {
    if (key in (fields || {})) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (!setClauses.length) return;
  setClauses.push("updated_at = CURRENT_TIMESTAMP");
  const sql = `UPDATE sent_emails SET ${setClauses.join(", ")} WHERE resend_id = ?`;
  values.push(resendId);
  await db.prepare(sql).bind(...values).run();
}
var init_sentEmails = __esm({
  "src/db/sentEmails.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    __name(recordSentEmail, "recordSentEmail");
    __name(updateSentEmail, "updateSentEmail");
  }
});

// src/db/index.js
var init_db = __esm({
  "src/db/index.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_init();
    init_connection();
    init_mailboxes();
    init_users();
    init_sentEmails();
  }
});

// src/utils/common.js
var common_exports = {};
__export(common_exports, {
  extractEmail: () => extractEmail,
  generateRandomId: () => generateRandomId,
  isValidEmail: () => isValidEmail,
  normalizeEmailAlias: () => normalizeEmailAlias,
  sha256Hex: () => sha256Hex2,
  verifyPassword: () => verifyPassword2
});
function extractEmail(addr) {
  const s = String(addr || "").trim();
  const m = s.match(/<([^>]+)>/);
  if (m) return m[1].trim();
  return s.split(/\s/)[0] || s;
}
function normalizeEmailAlias(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return "";
  const atIndex = normalized.indexOf("@");
  if (atIndex <= 0) return normalized;
  const localPart = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);
  const lastDotIndex = localPart.lastIndexOf(".");
  const lastPlusIndex = localPart.lastIndexOf("+");
  const lastDashIndex = localPart.lastIndexOf("-");
  const lastSeparatorIndex = Math.max(lastDotIndex, lastPlusIndex, lastDashIndex);
  if (lastSeparatorIndex <= 0) {
    return normalized;
  }
  const realLocalPart = localPart.slice(lastSeparatorIndex + 1);
  if (!realLocalPart) {
    return normalized;
  }
  return `${realLocalPart}@${domain}`;
}
function generateRandomId(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
async function sha256Hex2(text) {
  const enc = new TextEncoder();
  const data = enc.encode(String(text || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}
async function verifyPassword2(rawPassword, hashed) {
  if (!hashed) return false;
  try {
    const hex = (await sha256Hex2(rawPassword)).toLowerCase();
    return hex === String(hashed || "").toLowerCase();
  } catch (_) {
    return false;
  }
}
var init_common = __esm({
  "src/utils/common.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    __name(extractEmail, "extractEmail");
    __name(normalizeEmailAlias, "normalizeEmailAlias");
    __name(generateRandomId, "generateRandomId");
    __name(isValidEmail, "isValidEmail");
    __name(sha256Hex2, "sha256Hex");
    __name(verifyPassword2, "verifyPassword");
  }
});

// node_modules/postal-mime/src/decode-strings.js
function decodeBase64(base64) {
  let bufferLength = Math.ceil(base64.length / 4) * 3;
  const len = base64.length;
  let p = 0;
  if (base64.length % 4 === 3) {
    bufferLength--;
  } else if (base64.length % 4 === 2) {
    bufferLength -= 2;
  } else if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i += 4) {
    let encoded1 = base64Lookup[base64.charCodeAt(i)];
    let encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    let encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    let encoded4 = base64Lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arrayBuffer;
}
function getDecoder(charset) {
  charset = charset || "utf8";
  let decoder;
  try {
    decoder = new TextDecoder(charset);
  } catch (err) {
    decoder = new TextDecoder("windows-1252");
  }
  return decoder;
}
async function blobToArrayBuffer(blob) {
  if ("arrayBuffer" in blob) {
    return await blob.arrayBuffer();
  }
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.onload = function(e) {
      resolve(e.target.result);
    };
    fr.onerror = function(e) {
      reject(fr.error);
    };
    fr.readAsArrayBuffer(blob);
  });
}
function getHex(c) {
  if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
    return String.fromCharCode(c);
  }
  return false;
}
function decodeWord(charset, encoding, str) {
  let splitPos = charset.indexOf("*");
  if (splitPos >= 0) {
    charset = charset.substr(0, splitPos);
  }
  encoding = encoding.toUpperCase();
  let byteStr;
  if (encoding === "Q") {
    str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
    let buf = textEncoder.encode(str);
    let encodedBytes = [];
    for (let i = 0, len = buf.length; i < len; i++) {
      let c = buf[i];
      if (i <= len - 2 && c === 61) {
        let c1 = getHex(buf[i + 1]);
        let c2 = getHex(buf[i + 2]);
        if (c1 && c2) {
          let c3 = parseInt(c1 + c2, 16);
          encodedBytes.push(c3);
          i += 2;
          continue;
        }
      }
      encodedBytes.push(c);
    }
    byteStr = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(byteStr);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, encodedBytes[i]);
    }
  } else if (encoding === "B") {
    byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
  } else {
    byteStr = textEncoder.encode(str);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeWords(str) {
  let joinString = true;
  let done = false;
  while (!done) {
    let result = (str || "").toString().replace(
      /(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g,
      (match2, left, chLeft, encodedLeftStr, chRight) => {
        if (!joinString) {
          return match2;
        }
        if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) {
          return left + "__\0JOIN\0__";
        }
        return match2;
      }
    ).replace(
      /(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g,
      (match2, left, chLeft, chRight) => {
        if (!joinString) {
          return match2;
        }
        if (chLeft === chRight) {
          return left + "__\0JOIN\0__";
        }
        return match2;
      }
    ).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(
      /=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g,
      (m, charset, encoding, text) => decodeWord(charset, encoding, text)
    );
    if (joinString && result.indexOf("\uFFFD") >= 0) {
      joinString = false;
    } else {
      return result;
    }
  }
}
function decodeURIComponentWithCharset(encodedStr, charset) {
  charset = charset || "utf-8";
  let encodedBytes = [];
  for (let i = 0; i < encodedStr.length; i++) {
    let c = encodedStr.charAt(i);
    if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
      let byte = encodedStr.substr(i + 1, 2);
      i += 2;
      encodedBytes.push(parseInt(byte, 16));
    } else if (c.charCodeAt(0) > 126) {
      c = textEncoder.encode(c);
      for (let j = 0; j < c.length; j++) {
        encodedBytes.push(c[j]);
      }
    } else {
      encodedBytes.push(c.charCodeAt(0));
    }
  }
  const byteStr = new ArrayBuffer(encodedBytes.length);
  const dataView = new DataView(byteStr);
  for (let i = 0, len = encodedBytes.length; i < len; i++) {
    dataView.setUint8(i, encodedBytes[i]);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeParameterValueContinuations(header) {
  let paramKeys = /* @__PURE__ */ new Map();
  Object.keys(header.params).forEach((key) => {
    let match2 = key.match(/\*((\d+)\*?)?$/);
    if (!match2) {
      return;
    }
    let actualKey = key.substr(0, match2.index).toLowerCase();
    let nr = Number(match2[2]) || 0;
    let paramVal;
    if (!paramKeys.has(actualKey)) {
      paramVal = {
        charset: false,
        values: []
      };
      paramKeys.set(actualKey, paramVal);
    } else {
      paramVal = paramKeys.get(actualKey);
    }
    let value = header.params[key];
    if (nr === 0 && match2[0].charAt(match2[0].length - 1) === "*" && (match2 = value.match(/^([^']*)'[^']*'(.*)$/))) {
      paramVal.charset = match2[1] || "utf-8";
      value = match2[2];
    }
    paramVal.values.push({ nr, value });
    delete header.params[key];
  });
  paramKeys.forEach((paramVal, key) => {
    header.params[key] = decodeURIComponentWithCharset(
      paramVal.values.sort((a, b) => a.nr - b.nr).map((a) => a.value).join(""),
      paramVal.charset
    );
  });
}
var textEncoder, base64Chars, base64Lookup;
var init_decode_strings = __esm({
  "node_modules/postal-mime/src/decode-strings.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    textEncoder = new TextEncoder();
    base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    base64Lookup = new Uint8Array(256);
    for (let i = 0; i < base64Chars.length; i++) {
      base64Lookup[base64Chars.charCodeAt(i)] = i;
    }
    __name(decodeBase64, "decodeBase64");
    __name(getDecoder, "getDecoder");
    __name(blobToArrayBuffer, "blobToArrayBuffer");
    __name(getHex, "getHex");
    __name(decodeWord, "decodeWord");
    __name(decodeWords, "decodeWords");
    __name(decodeURIComponentWithCharset, "decodeURIComponentWithCharset");
    __name(decodeParameterValueContinuations, "decodeParameterValueContinuations");
  }
});

// node_modules/postal-mime/src/pass-through-decoder.js
var PassThroughDecoder;
var init_pass_through_decoder = __esm({
  "node_modules/postal-mime/src/pass-through-decoder.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_decode_strings();
    PassThroughDecoder = class {
      static {
        __name(this, "PassThroughDecoder");
      }
      constructor() {
        this.chunks = [];
      }
      update(line) {
        this.chunks.push(line);
        this.chunks.push("\n");
      }
      finalize() {
        return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
      }
    };
  }
});

// node_modules/postal-mime/src/base64-decoder.js
var Base64Decoder;
var init_base64_decoder = __esm({
  "node_modules/postal-mime/src/base64-decoder.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_decode_strings();
    Base64Decoder = class {
      static {
        __name(this, "Base64Decoder");
      }
      constructor(opts) {
        opts = opts || {};
        this.decoder = opts.decoder || new TextDecoder();
        this.maxChunkSize = 100 * 1024;
        this.chunks = [];
        this.remainder = "";
      }
      update(buffer) {
        let str = this.decoder.decode(buffer);
        str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
        this.remainder += str;
        if (this.remainder.length >= this.maxChunkSize) {
          let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
          let base64Str;
          if (allowedBytes === this.remainder.length) {
            base64Str = this.remainder;
            this.remainder = "";
          } else {
            base64Str = this.remainder.substr(0, allowedBytes);
            this.remainder = this.remainder.substr(allowedBytes);
          }
          if (base64Str.length) {
            this.chunks.push(decodeBase64(base64Str));
          }
        }
      }
      finalize() {
        if (this.remainder && !/^=+$/.test(this.remainder)) {
          this.chunks.push(decodeBase64(this.remainder));
        }
        return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
      }
    };
  }
});

// node_modules/postal-mime/src/qp-decoder.js
var VALID_QP_REGEX, QP_SPLIT_REGEX, SOFT_LINE_BREAK_REGEX, PARTIAL_QP_ENDING_REGEX, QPDecoder;
var init_qp_decoder = __esm({
  "node_modules/postal-mime/src/qp-decoder.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_decode_strings();
    VALID_QP_REGEX = /^=[a-f0-9]{2}$/i;
    QP_SPLIT_REGEX = /(?==[a-f0-9]{2})/i;
    SOFT_LINE_BREAK_REGEX = /=\r?\n/g;
    PARTIAL_QP_ENDING_REGEX = /=[a-fA-F0-9]?$/;
    QPDecoder = class {
      static {
        __name(this, "QPDecoder");
      }
      constructor(opts) {
        opts = opts || {};
        this.decoder = opts.decoder || new TextDecoder();
        this.maxChunkSize = 100 * 1024;
        this.remainder = "";
        this.chunks = [];
      }
      decodeQPBytes(encodedBytes) {
        let buf = new ArrayBuffer(encodedBytes.length);
        let dataView = new DataView(buf);
        for (let i = 0, len = encodedBytes.length; i < len; i++) {
          dataView.setUint8(i, parseInt(encodedBytes[i], 16));
        }
        return buf;
      }
      decodeChunks(str) {
        str = str.replace(SOFT_LINE_BREAK_REGEX, "");
        let list = str.split(QP_SPLIT_REGEX);
        let encodedBytes = [];
        for (let part of list) {
          if (part.charAt(0) !== "=") {
            if (encodedBytes.length) {
              this.chunks.push(this.decodeQPBytes(encodedBytes));
              encodedBytes = [];
            }
            this.chunks.push(part);
            continue;
          }
          if (part.length === 3) {
            if (VALID_QP_REGEX.test(part)) {
              encodedBytes.push(part.substr(1));
            } else {
              if (encodedBytes.length) {
                this.chunks.push(this.decodeQPBytes(encodedBytes));
                encodedBytes = [];
              }
              this.chunks.push(part);
            }
            continue;
          }
          if (part.length > 3) {
            const firstThree = part.substr(0, 3);
            if (VALID_QP_REGEX.test(firstThree)) {
              encodedBytes.push(part.substr(1, 2));
              this.chunks.push(this.decodeQPBytes(encodedBytes));
              encodedBytes = [];
              part = part.substr(3);
              this.chunks.push(part);
            } else {
              if (encodedBytes.length) {
                this.chunks.push(this.decodeQPBytes(encodedBytes));
                encodedBytes = [];
              }
              this.chunks.push(part);
            }
          }
        }
        if (encodedBytes.length) {
          this.chunks.push(this.decodeQPBytes(encodedBytes));
        }
      }
      update(buffer) {
        let str = this.decoder.decode(buffer) + "\n";
        str = this.remainder + str;
        if (str.length < this.maxChunkSize) {
          this.remainder = str;
          return;
        }
        this.remainder = "";
        let partialEnding = str.match(PARTIAL_QP_ENDING_REGEX);
        if (partialEnding) {
          if (partialEnding.index === 0) {
            this.remainder = str;
            return;
          }
          this.remainder = str.substr(partialEnding.index);
          str = str.substr(0, partialEnding.index);
        }
        this.decodeChunks(str);
      }
      finalize() {
        if (this.remainder.length) {
          this.decodeChunks(this.remainder);
          this.remainder = "";
        }
        return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
      }
    };
  }
});

// node_modules/postal-mime/src/mime-node.js
var defaultDecoder, MimeNode;
var init_mime_node = __esm({
  "node_modules/postal-mime/src/mime-node.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_decode_strings();
    init_pass_through_decoder();
    init_base64_decoder();
    init_qp_decoder();
    defaultDecoder = getDecoder();
    MimeNode = class {
      static {
        __name(this, "MimeNode");
      }
      constructor(options) {
        this.options = options || {};
        this.postalMime = this.options.postalMime;
        this.root = !!this.options.parentNode;
        this.childNodes = [];
        if (this.options.parentNode) {
          this.parentNode = this.options.parentNode;
          this.depth = this.parentNode.depth + 1;
          if (this.depth > this.options.maxNestingDepth) {
            throw new Error(`Maximum MIME nesting depth of ${this.options.maxNestingDepth} levels exceeded`);
          }
          this.options.parentNode.childNodes.push(this);
        } else {
          this.depth = 0;
        }
        this.state = "header";
        this.headerLines = [];
        this.headerSize = 0;
        const parentMultipartType = this.options.parentMultipartType || null;
        const defaultContentType = parentMultipartType === "digest" ? "message/rfc822" : "text/plain";
        this.contentType = {
          value: defaultContentType,
          default: true
        };
        this.contentTransferEncoding = {
          value: "8bit"
        };
        this.contentDisposition = {
          value: ""
        };
        this.headers = [];
        this.contentDecoder = false;
      }
      setupContentDecoder(transferEncoding) {
        if (/base64/i.test(transferEncoding)) {
          this.contentDecoder = new Base64Decoder();
        } else if (/quoted-printable/i.test(transferEncoding)) {
          this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
        } else {
          this.contentDecoder = new PassThroughDecoder();
        }
      }
      async finalize() {
        if (this.state === "finished") {
          return;
        }
        if (this.state === "header") {
          this.processHeaders();
        }
        let boundaries = this.postalMime.boundaries;
        for (let i = boundaries.length - 1; i >= 0; i--) {
          let boundary = boundaries[i];
          if (boundary.node === this) {
            boundaries.splice(i, 1);
            break;
          }
        }
        await this.finalizeChildNodes();
        this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
        this.state = "finished";
      }
      async finalizeChildNodes() {
        for (let childNode of this.childNodes) {
          await childNode.finalize();
        }
      }
      // Strip RFC 822 comments (parenthesized text) from structured header values
      stripComments(str) {
        let result = "";
        let depth = 0;
        let escaped = false;
        let inQuote = false;
        for (let i = 0; i < str.length; i++) {
          const chr = str.charAt(i);
          if (escaped) {
            if (depth === 0) {
              result += chr;
            }
            escaped = false;
            continue;
          }
          if (chr === "\\") {
            escaped = true;
            if (depth === 0) {
              result += chr;
            }
            continue;
          }
          if (chr === '"' && depth === 0) {
            inQuote = !inQuote;
            result += chr;
            continue;
          }
          if (!inQuote) {
            if (chr === "(") {
              depth++;
              continue;
            }
            if (chr === ")" && depth > 0) {
              depth--;
              continue;
            }
          }
          if (depth === 0) {
            result += chr;
          }
        }
        return result;
      }
      parseStructuredHeader(str) {
        str = this.stripComments(str);
        let response = {
          value: false,
          params: {}
        };
        let key = false;
        let value = "";
        let stage = "value";
        let quote = false;
        let escaped = false;
        let chr;
        for (let i = 0, len = str.length; i < len; i++) {
          chr = str.charAt(i);
          switch (stage) {
            case "key":
              if (chr === "=") {
                key = value.trim().toLowerCase();
                stage = "value";
                value = "";
                break;
              }
              value += chr;
              break;
            case "value":
              if (escaped) {
                value += chr;
              } else if (chr === "\\") {
                escaped = true;
                continue;
              } else if (quote && chr === quote) {
                quote = false;
              } else if (!quote && chr === '"') {
                quote = chr;
              } else if (!quote && chr === ";") {
                if (key === false) {
                  response.value = value.trim();
                } else {
                  response.params[key] = value.trim();
                }
                stage = "key";
                value = "";
              } else {
                value += chr;
              }
              escaped = false;
              break;
          }
        }
        value = value.trim();
        if (stage === "value") {
          if (key === false) {
            response.value = value;
          } else {
            response.params[key] = value;
          }
        } else if (value) {
          response.params[value.toLowerCase()] = "";
        }
        if (response.value) {
          response.value = response.value.toLowerCase();
        }
        decodeParameterValueContinuations(response);
        return response;
      }
      decodeFlowedText(str, delSp) {
        return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
          if (previousValue.endsWith(" ") && previousValue !== "-- " && !previousValue.endsWith("\n-- ")) {
            if (delSp) {
              return previousValue.slice(0, -1) + currentValue;
            } else {
              return previousValue + currentValue;
            }
          } else {
            return previousValue + "\n" + currentValue;
          }
        }).replace(/^ /gm, "");
      }
      getTextContent() {
        if (!this.content) {
          return "";
        }
        let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
        if (/^flowed$/i.test(this.contentType.parsed.params.format)) {
          str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
        }
        return str;
      }
      processHeaders() {
        for (let i = this.headerLines.length - 1; i >= 0; i--) {
          let line = this.headerLines[i];
          if (i && /^\s/.test(line)) {
            this.headerLines[i - 1] += "\n" + line;
            this.headerLines.splice(i, 1);
          }
        }
        this.rawHeaderLines = [];
        for (let i = this.headerLines.length - 1; i >= 0; i--) {
          let rawLine = this.headerLines[i];
          let sep = rawLine.indexOf(":");
          let rawKey = sep < 0 ? rawLine.trim() : rawLine.substr(0, sep).trim();
          this.rawHeaderLines.push({
            key: rawKey.toLowerCase(),
            line: rawLine
          });
          let normalizedLine = rawLine.replace(/\s+/g, " ");
          sep = normalizedLine.indexOf(":");
          let key = sep < 0 ? normalizedLine.trim() : normalizedLine.substr(0, sep).trim();
          let value = sep < 0 ? "" : normalizedLine.substr(sep + 1).trim();
          this.headers.push({ key: key.toLowerCase(), originalKey: key, value });
          switch (key.toLowerCase()) {
            case "content-type":
              if (this.contentType.default) {
                this.contentType = { value, parsed: {} };
              }
              break;
            case "content-transfer-encoding":
              this.contentTransferEncoding = { value, parsed: {} };
              break;
            case "content-disposition":
              this.contentDisposition = { value, parsed: {} };
              break;
            case "content-id":
              this.contentId = value;
              break;
            case "content-description":
              this.contentDescription = value;
              break;
          }
        }
        this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
        this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
        if (this.contentType.multipart && this.contentType.parsed.params.boundary) {
          this.postalMime.boundaries.push({
            value: textEncoder.encode(this.contentType.parsed.params.boundary),
            node: this
          });
        }
        this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
        this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
        this.setupContentDecoder(this.contentTransferEncoding.encoding);
      }
      feed(line) {
        switch (this.state) {
          case "header":
            if (!line.length) {
              this.state = "body";
              return this.processHeaders();
            }
            this.headerSize += line.length;
            if (this.headerSize > this.options.maxHeadersSize) {
              let error = new Error(`Maximum header size of ${this.options.maxHeadersSize} bytes exceeded`);
              throw error;
            }
            this.headerLines.push(defaultDecoder.decode(line));
            break;
          case "body": {
            this.contentDecoder.update(line);
          }
        }
      }
    };
  }
});

// node_modules/postal-mime/src/html-entities.js
var htmlEntities, html_entities_default;
var init_html_entities = __esm({
  "node_modules/postal-mime/src/html-entities.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    htmlEntities = {
      "&AElig": "\xC6",
      "&AElig;": "\xC6",
      "&AMP": "&",
      "&AMP;": "&",
      "&Aacute": "\xC1",
      "&Aacute;": "\xC1",
      "&Abreve;": "\u0102",
      "&Acirc": "\xC2",
      "&Acirc;": "\xC2",
      "&Acy;": "\u0410",
      "&Afr;": "\u{1D504}",
      "&Agrave": "\xC0",
      "&Agrave;": "\xC0",
      "&Alpha;": "\u0391",
      "&Amacr;": "\u0100",
      "&And;": "\u2A53",
      "&Aogon;": "\u0104",
      "&Aopf;": "\u{1D538}",
      "&ApplyFunction;": "\u2061",
      "&Aring": "\xC5",
      "&Aring;": "\xC5",
      "&Ascr;": "\u{1D49C}",
      "&Assign;": "\u2254",
      "&Atilde": "\xC3",
      "&Atilde;": "\xC3",
      "&Auml": "\xC4",
      "&Auml;": "\xC4",
      "&Backslash;": "\u2216",
      "&Barv;": "\u2AE7",
      "&Barwed;": "\u2306",
      "&Bcy;": "\u0411",
      "&Because;": "\u2235",
      "&Bernoullis;": "\u212C",
      "&Beta;": "\u0392",
      "&Bfr;": "\u{1D505}",
      "&Bopf;": "\u{1D539}",
      "&Breve;": "\u02D8",
      "&Bscr;": "\u212C",
      "&Bumpeq;": "\u224E",
      "&CHcy;": "\u0427",
      "&COPY": "\xA9",
      "&COPY;": "\xA9",
      "&Cacute;": "\u0106",
      "&Cap;": "\u22D2",
      "&CapitalDifferentialD;": "\u2145",
      "&Cayleys;": "\u212D",
      "&Ccaron;": "\u010C",
      "&Ccedil": "\xC7",
      "&Ccedil;": "\xC7",
      "&Ccirc;": "\u0108",
      "&Cconint;": "\u2230",
      "&Cdot;": "\u010A",
      "&Cedilla;": "\xB8",
      "&CenterDot;": "\xB7",
      "&Cfr;": "\u212D",
      "&Chi;": "\u03A7",
      "&CircleDot;": "\u2299",
      "&CircleMinus;": "\u2296",
      "&CirclePlus;": "\u2295",
      "&CircleTimes;": "\u2297",
      "&ClockwiseContourIntegral;": "\u2232",
      "&CloseCurlyDoubleQuote;": "\u201D",
      "&CloseCurlyQuote;": "\u2019",
      "&Colon;": "\u2237",
      "&Colone;": "\u2A74",
      "&Congruent;": "\u2261",
      "&Conint;": "\u222F",
      "&ContourIntegral;": "\u222E",
      "&Copf;": "\u2102",
      "&Coproduct;": "\u2210",
      "&CounterClockwiseContourIntegral;": "\u2233",
      "&Cross;": "\u2A2F",
      "&Cscr;": "\u{1D49E}",
      "&Cup;": "\u22D3",
      "&CupCap;": "\u224D",
      "&DD;": "\u2145",
      "&DDotrahd;": "\u2911",
      "&DJcy;": "\u0402",
      "&DScy;": "\u0405",
      "&DZcy;": "\u040F",
      "&Dagger;": "\u2021",
      "&Darr;": "\u21A1",
      "&Dashv;": "\u2AE4",
      "&Dcaron;": "\u010E",
      "&Dcy;": "\u0414",
      "&Del;": "\u2207",
      "&Delta;": "\u0394",
      "&Dfr;": "\u{1D507}",
      "&DiacriticalAcute;": "\xB4",
      "&DiacriticalDot;": "\u02D9",
      "&DiacriticalDoubleAcute;": "\u02DD",
      "&DiacriticalGrave;": "`",
      "&DiacriticalTilde;": "\u02DC",
      "&Diamond;": "\u22C4",
      "&DifferentialD;": "\u2146",
      "&Dopf;": "\u{1D53B}",
      "&Dot;": "\xA8",
      "&DotDot;": "\u20DC",
      "&DotEqual;": "\u2250",
      "&DoubleContourIntegral;": "\u222F",
      "&DoubleDot;": "\xA8",
      "&DoubleDownArrow;": "\u21D3",
      "&DoubleLeftArrow;": "\u21D0",
      "&DoubleLeftRightArrow;": "\u21D4",
      "&DoubleLeftTee;": "\u2AE4",
      "&DoubleLongLeftArrow;": "\u27F8",
      "&DoubleLongLeftRightArrow;": "\u27FA",
      "&DoubleLongRightArrow;": "\u27F9",
      "&DoubleRightArrow;": "\u21D2",
      "&DoubleRightTee;": "\u22A8",
      "&DoubleUpArrow;": "\u21D1",
      "&DoubleUpDownArrow;": "\u21D5",
      "&DoubleVerticalBar;": "\u2225",
      "&DownArrow;": "\u2193",
      "&DownArrowBar;": "\u2913",
      "&DownArrowUpArrow;": "\u21F5",
      "&DownBreve;": "\u0311",
      "&DownLeftRightVector;": "\u2950",
      "&DownLeftTeeVector;": "\u295E",
      "&DownLeftVector;": "\u21BD",
      "&DownLeftVectorBar;": "\u2956",
      "&DownRightTeeVector;": "\u295F",
      "&DownRightVector;": "\u21C1",
      "&DownRightVectorBar;": "\u2957",
      "&DownTee;": "\u22A4",
      "&DownTeeArrow;": "\u21A7",
      "&Downarrow;": "\u21D3",
      "&Dscr;": "\u{1D49F}",
      "&Dstrok;": "\u0110",
      "&ENG;": "\u014A",
      "&ETH": "\xD0",
      "&ETH;": "\xD0",
      "&Eacute": "\xC9",
      "&Eacute;": "\xC9",
      "&Ecaron;": "\u011A",
      "&Ecirc": "\xCA",
      "&Ecirc;": "\xCA",
      "&Ecy;": "\u042D",
      "&Edot;": "\u0116",
      "&Efr;": "\u{1D508}",
      "&Egrave": "\xC8",
      "&Egrave;": "\xC8",
      "&Element;": "\u2208",
      "&Emacr;": "\u0112",
      "&EmptySmallSquare;": "\u25FB",
      "&EmptyVerySmallSquare;": "\u25AB",
      "&Eogon;": "\u0118",
      "&Eopf;": "\u{1D53C}",
      "&Epsilon;": "\u0395",
      "&Equal;": "\u2A75",
      "&EqualTilde;": "\u2242",
      "&Equilibrium;": "\u21CC",
      "&Escr;": "\u2130",
      "&Esim;": "\u2A73",
      "&Eta;": "\u0397",
      "&Euml": "\xCB",
      "&Euml;": "\xCB",
      "&Exists;": "\u2203",
      "&ExponentialE;": "\u2147",
      "&Fcy;": "\u0424",
      "&Ffr;": "\u{1D509}",
      "&FilledSmallSquare;": "\u25FC",
      "&FilledVerySmallSquare;": "\u25AA",
      "&Fopf;": "\u{1D53D}",
      "&ForAll;": "\u2200",
      "&Fouriertrf;": "\u2131",
      "&Fscr;": "\u2131",
      "&GJcy;": "\u0403",
      "&GT": ">",
      "&GT;": ">",
      "&Gamma;": "\u0393",
      "&Gammad;": "\u03DC",
      "&Gbreve;": "\u011E",
      "&Gcedil;": "\u0122",
      "&Gcirc;": "\u011C",
      "&Gcy;": "\u0413",
      "&Gdot;": "\u0120",
      "&Gfr;": "\u{1D50A}",
      "&Gg;": "\u22D9",
      "&Gopf;": "\u{1D53E}",
      "&GreaterEqual;": "\u2265",
      "&GreaterEqualLess;": "\u22DB",
      "&GreaterFullEqual;": "\u2267",
      "&GreaterGreater;": "\u2AA2",
      "&GreaterLess;": "\u2277",
      "&GreaterSlantEqual;": "\u2A7E",
      "&GreaterTilde;": "\u2273",
      "&Gscr;": "\u{1D4A2}",
      "&Gt;": "\u226B",
      "&HARDcy;": "\u042A",
      "&Hacek;": "\u02C7",
      "&Hat;": "^",
      "&Hcirc;": "\u0124",
      "&Hfr;": "\u210C",
      "&HilbertSpace;": "\u210B",
      "&Hopf;": "\u210D",
      "&HorizontalLine;": "\u2500",
      "&Hscr;": "\u210B",
      "&Hstrok;": "\u0126",
      "&HumpDownHump;": "\u224E",
      "&HumpEqual;": "\u224F",
      "&IEcy;": "\u0415",
      "&IJlig;": "\u0132",
      "&IOcy;": "\u0401",
      "&Iacute": "\xCD",
      "&Iacute;": "\xCD",
      "&Icirc": "\xCE",
      "&Icirc;": "\xCE",
      "&Icy;": "\u0418",
      "&Idot;": "\u0130",
      "&Ifr;": "\u2111",
      "&Igrave": "\xCC",
      "&Igrave;": "\xCC",
      "&Im;": "\u2111",
      "&Imacr;": "\u012A",
      "&ImaginaryI;": "\u2148",
      "&Implies;": "\u21D2",
      "&Int;": "\u222C",
      "&Integral;": "\u222B",
      "&Intersection;": "\u22C2",
      "&InvisibleComma;": "\u2063",
      "&InvisibleTimes;": "\u2062",
      "&Iogon;": "\u012E",
      "&Iopf;": "\u{1D540}",
      "&Iota;": "\u0399",
      "&Iscr;": "\u2110",
      "&Itilde;": "\u0128",
      "&Iukcy;": "\u0406",
      "&Iuml": "\xCF",
      "&Iuml;": "\xCF",
      "&Jcirc;": "\u0134",
      "&Jcy;": "\u0419",
      "&Jfr;": "\u{1D50D}",
      "&Jopf;": "\u{1D541}",
      "&Jscr;": "\u{1D4A5}",
      "&Jsercy;": "\u0408",
      "&Jukcy;": "\u0404",
      "&KHcy;": "\u0425",
      "&KJcy;": "\u040C",
      "&Kappa;": "\u039A",
      "&Kcedil;": "\u0136",
      "&Kcy;": "\u041A",
      "&Kfr;": "\u{1D50E}",
      "&Kopf;": "\u{1D542}",
      "&Kscr;": "\u{1D4A6}",
      "&LJcy;": "\u0409",
      "&LT": "<",
      "&LT;": "<",
      "&Lacute;": "\u0139",
      "&Lambda;": "\u039B",
      "&Lang;": "\u27EA",
      "&Laplacetrf;": "\u2112",
      "&Larr;": "\u219E",
      "&Lcaron;": "\u013D",
      "&Lcedil;": "\u013B",
      "&Lcy;": "\u041B",
      "&LeftAngleBracket;": "\u27E8",
      "&LeftArrow;": "\u2190",
      "&LeftArrowBar;": "\u21E4",
      "&LeftArrowRightArrow;": "\u21C6",
      "&LeftCeiling;": "\u2308",
      "&LeftDoubleBracket;": "\u27E6",
      "&LeftDownTeeVector;": "\u2961",
      "&LeftDownVector;": "\u21C3",
      "&LeftDownVectorBar;": "\u2959",
      "&LeftFloor;": "\u230A",
      "&LeftRightArrow;": "\u2194",
      "&LeftRightVector;": "\u294E",
      "&LeftTee;": "\u22A3",
      "&LeftTeeArrow;": "\u21A4",
      "&LeftTeeVector;": "\u295A",
      "&LeftTriangle;": "\u22B2",
      "&LeftTriangleBar;": "\u29CF",
      "&LeftTriangleEqual;": "\u22B4",
      "&LeftUpDownVector;": "\u2951",
      "&LeftUpTeeVector;": "\u2960",
      "&LeftUpVector;": "\u21BF",
      "&LeftUpVectorBar;": "\u2958",
      "&LeftVector;": "\u21BC",
      "&LeftVectorBar;": "\u2952",
      "&Leftarrow;": "\u21D0",
      "&Leftrightarrow;": "\u21D4",
      "&LessEqualGreater;": "\u22DA",
      "&LessFullEqual;": "\u2266",
      "&LessGreater;": "\u2276",
      "&LessLess;": "\u2AA1",
      "&LessSlantEqual;": "\u2A7D",
      "&LessTilde;": "\u2272",
      "&Lfr;": "\u{1D50F}",
      "&Ll;": "\u22D8",
      "&Lleftarrow;": "\u21DA",
      "&Lmidot;": "\u013F",
      "&LongLeftArrow;": "\u27F5",
      "&LongLeftRightArrow;": "\u27F7",
      "&LongRightArrow;": "\u27F6",
      "&Longleftarrow;": "\u27F8",
      "&Longleftrightarrow;": "\u27FA",
      "&Longrightarrow;": "\u27F9",
      "&Lopf;": "\u{1D543}",
      "&LowerLeftArrow;": "\u2199",
      "&LowerRightArrow;": "\u2198",
      "&Lscr;": "\u2112",
      "&Lsh;": "\u21B0",
      "&Lstrok;": "\u0141",
      "&Lt;": "\u226A",
      "&Map;": "\u2905",
      "&Mcy;": "\u041C",
      "&MediumSpace;": "\u205F",
      "&Mellintrf;": "\u2133",
      "&Mfr;": "\u{1D510}",
      "&MinusPlus;": "\u2213",
      "&Mopf;": "\u{1D544}",
      "&Mscr;": "\u2133",
      "&Mu;": "\u039C",
      "&NJcy;": "\u040A",
      "&Nacute;": "\u0143",
      "&Ncaron;": "\u0147",
      "&Ncedil;": "\u0145",
      "&Ncy;": "\u041D",
      "&NegativeMediumSpace;": "\u200B",
      "&NegativeThickSpace;": "\u200B",
      "&NegativeThinSpace;": "\u200B",
      "&NegativeVeryThinSpace;": "\u200B",
      "&NestedGreaterGreater;": "\u226B",
      "&NestedLessLess;": "\u226A",
      "&NewLine;": "\n",
      "&Nfr;": "\u{1D511}",
      "&NoBreak;": "\u2060",
      "&NonBreakingSpace;": "\xA0",
      "&Nopf;": "\u2115",
      "&Not;": "\u2AEC",
      "&NotCongruent;": "\u2262",
      "&NotCupCap;": "\u226D",
      "&NotDoubleVerticalBar;": "\u2226",
      "&NotElement;": "\u2209",
      "&NotEqual;": "\u2260",
      "&NotEqualTilde;": "\u2242\u0338",
      "&NotExists;": "\u2204",
      "&NotGreater;": "\u226F",
      "&NotGreaterEqual;": "\u2271",
      "&NotGreaterFullEqual;": "\u2267\u0338",
      "&NotGreaterGreater;": "\u226B\u0338",
      "&NotGreaterLess;": "\u2279",
      "&NotGreaterSlantEqual;": "\u2A7E\u0338",
      "&NotGreaterTilde;": "\u2275",
      "&NotHumpDownHump;": "\u224E\u0338",
      "&NotHumpEqual;": "\u224F\u0338",
      "&NotLeftTriangle;": "\u22EA",
      "&NotLeftTriangleBar;": "\u29CF\u0338",
      "&NotLeftTriangleEqual;": "\u22EC",
      "&NotLess;": "\u226E",
      "&NotLessEqual;": "\u2270",
      "&NotLessGreater;": "\u2278",
      "&NotLessLess;": "\u226A\u0338",
      "&NotLessSlantEqual;": "\u2A7D\u0338",
      "&NotLessTilde;": "\u2274",
      "&NotNestedGreaterGreater;": "\u2AA2\u0338",
      "&NotNestedLessLess;": "\u2AA1\u0338",
      "&NotPrecedes;": "\u2280",
      "&NotPrecedesEqual;": "\u2AAF\u0338",
      "&NotPrecedesSlantEqual;": "\u22E0",
      "&NotReverseElement;": "\u220C",
      "&NotRightTriangle;": "\u22EB",
      "&NotRightTriangleBar;": "\u29D0\u0338",
      "&NotRightTriangleEqual;": "\u22ED",
      "&NotSquareSubset;": "\u228F\u0338",
      "&NotSquareSubsetEqual;": "\u22E2",
      "&NotSquareSuperset;": "\u2290\u0338",
      "&NotSquareSupersetEqual;": "\u22E3",
      "&NotSubset;": "\u2282\u20D2",
      "&NotSubsetEqual;": "\u2288",
      "&NotSucceeds;": "\u2281",
      "&NotSucceedsEqual;": "\u2AB0\u0338",
      "&NotSucceedsSlantEqual;": "\u22E1",
      "&NotSucceedsTilde;": "\u227F\u0338",
      "&NotSuperset;": "\u2283\u20D2",
      "&NotSupersetEqual;": "\u2289",
      "&NotTilde;": "\u2241",
      "&NotTildeEqual;": "\u2244",
      "&NotTildeFullEqual;": "\u2247",
      "&NotTildeTilde;": "\u2249",
      "&NotVerticalBar;": "\u2224",
      "&Nscr;": "\u{1D4A9}",
      "&Ntilde": "\xD1",
      "&Ntilde;": "\xD1",
      "&Nu;": "\u039D",
      "&OElig;": "\u0152",
      "&Oacute": "\xD3",
      "&Oacute;": "\xD3",
      "&Ocirc": "\xD4",
      "&Ocirc;": "\xD4",
      "&Ocy;": "\u041E",
      "&Odblac;": "\u0150",
      "&Ofr;": "\u{1D512}",
      "&Ograve": "\xD2",
      "&Ograve;": "\xD2",
      "&Omacr;": "\u014C",
      "&Omega;": "\u03A9",
      "&Omicron;": "\u039F",
      "&Oopf;": "\u{1D546}",
      "&OpenCurlyDoubleQuote;": "\u201C",
      "&OpenCurlyQuote;": "\u2018",
      "&Or;": "\u2A54",
      "&Oscr;": "\u{1D4AA}",
      "&Oslash": "\xD8",
      "&Oslash;": "\xD8",
      "&Otilde": "\xD5",
      "&Otilde;": "\xD5",
      "&Otimes;": "\u2A37",
      "&Ouml": "\xD6",
      "&Ouml;": "\xD6",
      "&OverBar;": "\u203E",
      "&OverBrace;": "\u23DE",
      "&OverBracket;": "\u23B4",
      "&OverParenthesis;": "\u23DC",
      "&PartialD;": "\u2202",
      "&Pcy;": "\u041F",
      "&Pfr;": "\u{1D513}",
      "&Phi;": "\u03A6",
      "&Pi;": "\u03A0",
      "&PlusMinus;": "\xB1",
      "&Poincareplane;": "\u210C",
      "&Popf;": "\u2119",
      "&Pr;": "\u2ABB",
      "&Precedes;": "\u227A",
      "&PrecedesEqual;": "\u2AAF",
      "&PrecedesSlantEqual;": "\u227C",
      "&PrecedesTilde;": "\u227E",
      "&Prime;": "\u2033",
      "&Product;": "\u220F",
      "&Proportion;": "\u2237",
      "&Proportional;": "\u221D",
      "&Pscr;": "\u{1D4AB}",
      "&Psi;": "\u03A8",
      "&QUOT": '"',
      "&QUOT;": '"',
      "&Qfr;": "\u{1D514}",
      "&Qopf;": "\u211A",
      "&Qscr;": "\u{1D4AC}",
      "&RBarr;": "\u2910",
      "&REG": "\xAE",
      "&REG;": "\xAE",
      "&Racute;": "\u0154",
      "&Rang;": "\u27EB",
      "&Rarr;": "\u21A0",
      "&Rarrtl;": "\u2916",
      "&Rcaron;": "\u0158",
      "&Rcedil;": "\u0156",
      "&Rcy;": "\u0420",
      "&Re;": "\u211C",
      "&ReverseElement;": "\u220B",
      "&ReverseEquilibrium;": "\u21CB",
      "&ReverseUpEquilibrium;": "\u296F",
      "&Rfr;": "\u211C",
      "&Rho;": "\u03A1",
      "&RightAngleBracket;": "\u27E9",
      "&RightArrow;": "\u2192",
      "&RightArrowBar;": "\u21E5",
      "&RightArrowLeftArrow;": "\u21C4",
      "&RightCeiling;": "\u2309",
      "&RightDoubleBracket;": "\u27E7",
      "&RightDownTeeVector;": "\u295D",
      "&RightDownVector;": "\u21C2",
      "&RightDownVectorBar;": "\u2955",
      "&RightFloor;": "\u230B",
      "&RightTee;": "\u22A2",
      "&RightTeeArrow;": "\u21A6",
      "&RightTeeVector;": "\u295B",
      "&RightTriangle;": "\u22B3",
      "&RightTriangleBar;": "\u29D0",
      "&RightTriangleEqual;": "\u22B5",
      "&RightUpDownVector;": "\u294F",
      "&RightUpTeeVector;": "\u295C",
      "&RightUpVector;": "\u21BE",
      "&RightUpVectorBar;": "\u2954",
      "&RightVector;": "\u21C0",
      "&RightVectorBar;": "\u2953",
      "&Rightarrow;": "\u21D2",
      "&Ropf;": "\u211D",
      "&RoundImplies;": "\u2970",
      "&Rrightarrow;": "\u21DB",
      "&Rscr;": "\u211B",
      "&Rsh;": "\u21B1",
      "&RuleDelayed;": "\u29F4",
      "&SHCHcy;": "\u0429",
      "&SHcy;": "\u0428",
      "&SOFTcy;": "\u042C",
      "&Sacute;": "\u015A",
      "&Sc;": "\u2ABC",
      "&Scaron;": "\u0160",
      "&Scedil;": "\u015E",
      "&Scirc;": "\u015C",
      "&Scy;": "\u0421",
      "&Sfr;": "\u{1D516}",
      "&ShortDownArrow;": "\u2193",
      "&ShortLeftArrow;": "\u2190",
      "&ShortRightArrow;": "\u2192",
      "&ShortUpArrow;": "\u2191",
      "&Sigma;": "\u03A3",
      "&SmallCircle;": "\u2218",
      "&Sopf;": "\u{1D54A}",
      "&Sqrt;": "\u221A",
      "&Square;": "\u25A1",
      "&SquareIntersection;": "\u2293",
      "&SquareSubset;": "\u228F",
      "&SquareSubsetEqual;": "\u2291",
      "&SquareSuperset;": "\u2290",
      "&SquareSupersetEqual;": "\u2292",
      "&SquareUnion;": "\u2294",
      "&Sscr;": "\u{1D4AE}",
      "&Star;": "\u22C6",
      "&Sub;": "\u22D0",
      "&Subset;": "\u22D0",
      "&SubsetEqual;": "\u2286",
      "&Succeeds;": "\u227B",
      "&SucceedsEqual;": "\u2AB0",
      "&SucceedsSlantEqual;": "\u227D",
      "&SucceedsTilde;": "\u227F",
      "&SuchThat;": "\u220B",
      "&Sum;": "\u2211",
      "&Sup;": "\u22D1",
      "&Superset;": "\u2283",
      "&SupersetEqual;": "\u2287",
      "&Supset;": "\u22D1",
      "&THORN": "\xDE",
      "&THORN;": "\xDE",
      "&TRADE;": "\u2122",
      "&TSHcy;": "\u040B",
      "&TScy;": "\u0426",
      "&Tab;": "	",
      "&Tau;": "\u03A4",
      "&Tcaron;": "\u0164",
      "&Tcedil;": "\u0162",
      "&Tcy;": "\u0422",
      "&Tfr;": "\u{1D517}",
      "&Therefore;": "\u2234",
      "&Theta;": "\u0398",
      "&ThickSpace;": "\u205F\u200A",
      "&ThinSpace;": "\u2009",
      "&Tilde;": "\u223C",
      "&TildeEqual;": "\u2243",
      "&TildeFullEqual;": "\u2245",
      "&TildeTilde;": "\u2248",
      "&Topf;": "\u{1D54B}",
      "&TripleDot;": "\u20DB",
      "&Tscr;": "\u{1D4AF}",
      "&Tstrok;": "\u0166",
      "&Uacute": "\xDA",
      "&Uacute;": "\xDA",
      "&Uarr;": "\u219F",
      "&Uarrocir;": "\u2949",
      "&Ubrcy;": "\u040E",
      "&Ubreve;": "\u016C",
      "&Ucirc": "\xDB",
      "&Ucirc;": "\xDB",
      "&Ucy;": "\u0423",
      "&Udblac;": "\u0170",
      "&Ufr;": "\u{1D518}",
      "&Ugrave": "\xD9",
      "&Ugrave;": "\xD9",
      "&Umacr;": "\u016A",
      "&UnderBar;": "_",
      "&UnderBrace;": "\u23DF",
      "&UnderBracket;": "\u23B5",
      "&UnderParenthesis;": "\u23DD",
      "&Union;": "\u22C3",
      "&UnionPlus;": "\u228E",
      "&Uogon;": "\u0172",
      "&Uopf;": "\u{1D54C}",
      "&UpArrow;": "\u2191",
      "&UpArrowBar;": "\u2912",
      "&UpArrowDownArrow;": "\u21C5",
      "&UpDownArrow;": "\u2195",
      "&UpEquilibrium;": "\u296E",
      "&UpTee;": "\u22A5",
      "&UpTeeArrow;": "\u21A5",
      "&Uparrow;": "\u21D1",
      "&Updownarrow;": "\u21D5",
      "&UpperLeftArrow;": "\u2196",
      "&UpperRightArrow;": "\u2197",
      "&Upsi;": "\u03D2",
      "&Upsilon;": "\u03A5",
      "&Uring;": "\u016E",
      "&Uscr;": "\u{1D4B0}",
      "&Utilde;": "\u0168",
      "&Uuml": "\xDC",
      "&Uuml;": "\xDC",
      "&VDash;": "\u22AB",
      "&Vbar;": "\u2AEB",
      "&Vcy;": "\u0412",
      "&Vdash;": "\u22A9",
      "&Vdashl;": "\u2AE6",
      "&Vee;": "\u22C1",
      "&Verbar;": "\u2016",
      "&Vert;": "\u2016",
      "&VerticalBar;": "\u2223",
      "&VerticalLine;": "|",
      "&VerticalSeparator;": "\u2758",
      "&VerticalTilde;": "\u2240",
      "&VeryThinSpace;": "\u200A",
      "&Vfr;": "\u{1D519}",
      "&Vopf;": "\u{1D54D}",
      "&Vscr;": "\u{1D4B1}",
      "&Vvdash;": "\u22AA",
      "&Wcirc;": "\u0174",
      "&Wedge;": "\u22C0",
      "&Wfr;": "\u{1D51A}",
      "&Wopf;": "\u{1D54E}",
      "&Wscr;": "\u{1D4B2}",
      "&Xfr;": "\u{1D51B}",
      "&Xi;": "\u039E",
      "&Xopf;": "\u{1D54F}",
      "&Xscr;": "\u{1D4B3}",
      "&YAcy;": "\u042F",
      "&YIcy;": "\u0407",
      "&YUcy;": "\u042E",
      "&Yacute": "\xDD",
      "&Yacute;": "\xDD",
      "&Ycirc;": "\u0176",
      "&Ycy;": "\u042B",
      "&Yfr;": "\u{1D51C}",
      "&Yopf;": "\u{1D550}",
      "&Yscr;": "\u{1D4B4}",
      "&Yuml;": "\u0178",
      "&ZHcy;": "\u0416",
      "&Zacute;": "\u0179",
      "&Zcaron;": "\u017D",
      "&Zcy;": "\u0417",
      "&Zdot;": "\u017B",
      "&ZeroWidthSpace;": "\u200B",
      "&Zeta;": "\u0396",
      "&Zfr;": "\u2128",
      "&Zopf;": "\u2124",
      "&Zscr;": "\u{1D4B5}",
      "&aacute": "\xE1",
      "&aacute;": "\xE1",
      "&abreve;": "\u0103",
      "&ac;": "\u223E",
      "&acE;": "\u223E\u0333",
      "&acd;": "\u223F",
      "&acirc": "\xE2",
      "&acirc;": "\xE2",
      "&acute": "\xB4",
      "&acute;": "\xB4",
      "&acy;": "\u0430",
      "&aelig": "\xE6",
      "&aelig;": "\xE6",
      "&af;": "\u2061",
      "&afr;": "\u{1D51E}",
      "&agrave": "\xE0",
      "&agrave;": "\xE0",
      "&alefsym;": "\u2135",
      "&aleph;": "\u2135",
      "&alpha;": "\u03B1",
      "&amacr;": "\u0101",
      "&amalg;": "\u2A3F",
      "&amp": "&",
      "&amp;": "&",
      "&and;": "\u2227",
      "&andand;": "\u2A55",
      "&andd;": "\u2A5C",
      "&andslope;": "\u2A58",
      "&andv;": "\u2A5A",
      "&ang;": "\u2220",
      "&ange;": "\u29A4",
      "&angle;": "\u2220",
      "&angmsd;": "\u2221",
      "&angmsdaa;": "\u29A8",
      "&angmsdab;": "\u29A9",
      "&angmsdac;": "\u29AA",
      "&angmsdad;": "\u29AB",
      "&angmsdae;": "\u29AC",
      "&angmsdaf;": "\u29AD",
      "&angmsdag;": "\u29AE",
      "&angmsdah;": "\u29AF",
      "&angrt;": "\u221F",
      "&angrtvb;": "\u22BE",
      "&angrtvbd;": "\u299D",
      "&angsph;": "\u2222",
      "&angst;": "\xC5",
      "&angzarr;": "\u237C",
      "&aogon;": "\u0105",
      "&aopf;": "\u{1D552}",
      "&ap;": "\u2248",
      "&apE;": "\u2A70",
      "&apacir;": "\u2A6F",
      "&ape;": "\u224A",
      "&apid;": "\u224B",
      "&apos;": "'",
      "&approx;": "\u2248",
      "&approxeq;": "\u224A",
      "&aring": "\xE5",
      "&aring;": "\xE5",
      "&ascr;": "\u{1D4B6}",
      "&ast;": "*",
      "&asymp;": "\u2248",
      "&asympeq;": "\u224D",
      "&atilde": "\xE3",
      "&atilde;": "\xE3",
      "&auml": "\xE4",
      "&auml;": "\xE4",
      "&awconint;": "\u2233",
      "&awint;": "\u2A11",
      "&bNot;": "\u2AED",
      "&backcong;": "\u224C",
      "&backepsilon;": "\u03F6",
      "&backprime;": "\u2035",
      "&backsim;": "\u223D",
      "&backsimeq;": "\u22CD",
      "&barvee;": "\u22BD",
      "&barwed;": "\u2305",
      "&barwedge;": "\u2305",
      "&bbrk;": "\u23B5",
      "&bbrktbrk;": "\u23B6",
      "&bcong;": "\u224C",
      "&bcy;": "\u0431",
      "&bdquo;": "\u201E",
      "&becaus;": "\u2235",
      "&because;": "\u2235",
      "&bemptyv;": "\u29B0",
      "&bepsi;": "\u03F6",
      "&bernou;": "\u212C",
      "&beta;": "\u03B2",
      "&beth;": "\u2136",
      "&between;": "\u226C",
      "&bfr;": "\u{1D51F}",
      "&bigcap;": "\u22C2",
      "&bigcirc;": "\u25EF",
      "&bigcup;": "\u22C3",
      "&bigodot;": "\u2A00",
      "&bigoplus;": "\u2A01",
      "&bigotimes;": "\u2A02",
      "&bigsqcup;": "\u2A06",
      "&bigstar;": "\u2605",
      "&bigtriangledown;": "\u25BD",
      "&bigtriangleup;": "\u25B3",
      "&biguplus;": "\u2A04",
      "&bigvee;": "\u22C1",
      "&bigwedge;": "\u22C0",
      "&bkarow;": "\u290D",
      "&blacklozenge;": "\u29EB",
      "&blacksquare;": "\u25AA",
      "&blacktriangle;": "\u25B4",
      "&blacktriangledown;": "\u25BE",
      "&blacktriangleleft;": "\u25C2",
      "&blacktriangleright;": "\u25B8",
      "&blank;": "\u2423",
      "&blk12;": "\u2592",
      "&blk14;": "\u2591",
      "&blk34;": "\u2593",
      "&block;": "\u2588",
      "&bne;": "=\u20E5",
      "&bnequiv;": "\u2261\u20E5",
      "&bnot;": "\u2310",
      "&bopf;": "\u{1D553}",
      "&bot;": "\u22A5",
      "&bottom;": "\u22A5",
      "&bowtie;": "\u22C8",
      "&boxDL;": "\u2557",
      "&boxDR;": "\u2554",
      "&boxDl;": "\u2556",
      "&boxDr;": "\u2553",
      "&boxH;": "\u2550",
      "&boxHD;": "\u2566",
      "&boxHU;": "\u2569",
      "&boxHd;": "\u2564",
      "&boxHu;": "\u2567",
      "&boxUL;": "\u255D",
      "&boxUR;": "\u255A",
      "&boxUl;": "\u255C",
      "&boxUr;": "\u2559",
      "&boxV;": "\u2551",
      "&boxVH;": "\u256C",
      "&boxVL;": "\u2563",
      "&boxVR;": "\u2560",
      "&boxVh;": "\u256B",
      "&boxVl;": "\u2562",
      "&boxVr;": "\u255F",
      "&boxbox;": "\u29C9",
      "&boxdL;": "\u2555",
      "&boxdR;": "\u2552",
      "&boxdl;": "\u2510",
      "&boxdr;": "\u250C",
      "&boxh;": "\u2500",
      "&boxhD;": "\u2565",
      "&boxhU;": "\u2568",
      "&boxhd;": "\u252C",
      "&boxhu;": "\u2534",
      "&boxminus;": "\u229F",
      "&boxplus;": "\u229E",
      "&boxtimes;": "\u22A0",
      "&boxuL;": "\u255B",
      "&boxuR;": "\u2558",
      "&boxul;": "\u2518",
      "&boxur;": "\u2514",
      "&boxv;": "\u2502",
      "&boxvH;": "\u256A",
      "&boxvL;": "\u2561",
      "&boxvR;": "\u255E",
      "&boxvh;": "\u253C",
      "&boxvl;": "\u2524",
      "&boxvr;": "\u251C",
      "&bprime;": "\u2035",
      "&breve;": "\u02D8",
      "&brvbar": "\xA6",
      "&brvbar;": "\xA6",
      "&bscr;": "\u{1D4B7}",
      "&bsemi;": "\u204F",
      "&bsim;": "\u223D",
      "&bsime;": "\u22CD",
      "&bsol;": "\\",
      "&bsolb;": "\u29C5",
      "&bsolhsub;": "\u27C8",
      "&bull;": "\u2022",
      "&bullet;": "\u2022",
      "&bump;": "\u224E",
      "&bumpE;": "\u2AAE",
      "&bumpe;": "\u224F",
      "&bumpeq;": "\u224F",
      "&cacute;": "\u0107",
      "&cap;": "\u2229",
      "&capand;": "\u2A44",
      "&capbrcup;": "\u2A49",
      "&capcap;": "\u2A4B",
      "&capcup;": "\u2A47",
      "&capdot;": "\u2A40",
      "&caps;": "\u2229\uFE00",
      "&caret;": "\u2041",
      "&caron;": "\u02C7",
      "&ccaps;": "\u2A4D",
      "&ccaron;": "\u010D",
      "&ccedil": "\xE7",
      "&ccedil;": "\xE7",
      "&ccirc;": "\u0109",
      "&ccups;": "\u2A4C",
      "&ccupssm;": "\u2A50",
      "&cdot;": "\u010B",
      "&cedil": "\xB8",
      "&cedil;": "\xB8",
      "&cemptyv;": "\u29B2",
      "&cent": "\xA2",
      "&cent;": "\xA2",
      "&centerdot;": "\xB7",
      "&cfr;": "\u{1D520}",
      "&chcy;": "\u0447",
      "&check;": "\u2713",
      "&checkmark;": "\u2713",
      "&chi;": "\u03C7",
      "&cir;": "\u25CB",
      "&cirE;": "\u29C3",
      "&circ;": "\u02C6",
      "&circeq;": "\u2257",
      "&circlearrowleft;": "\u21BA",
      "&circlearrowright;": "\u21BB",
      "&circledR;": "\xAE",
      "&circledS;": "\u24C8",
      "&circledast;": "\u229B",
      "&circledcirc;": "\u229A",
      "&circleddash;": "\u229D",
      "&cire;": "\u2257",
      "&cirfnint;": "\u2A10",
      "&cirmid;": "\u2AEF",
      "&cirscir;": "\u29C2",
      "&clubs;": "\u2663",
      "&clubsuit;": "\u2663",
      "&colon;": ":",
      "&colone;": "\u2254",
      "&coloneq;": "\u2254",
      "&comma;": ",",
      "&commat;": "@",
      "&comp;": "\u2201",
      "&compfn;": "\u2218",
      "&complement;": "\u2201",
      "&complexes;": "\u2102",
      "&cong;": "\u2245",
      "&congdot;": "\u2A6D",
      "&conint;": "\u222E",
      "&copf;": "\u{1D554}",
      "&coprod;": "\u2210",
      "&copy": "\xA9",
      "&copy;": "\xA9",
      "&copysr;": "\u2117",
      "&crarr;": "\u21B5",
      "&cross;": "\u2717",
      "&cscr;": "\u{1D4B8}",
      "&csub;": "\u2ACF",
      "&csube;": "\u2AD1",
      "&csup;": "\u2AD0",
      "&csupe;": "\u2AD2",
      "&ctdot;": "\u22EF",
      "&cudarrl;": "\u2938",
      "&cudarrr;": "\u2935",
      "&cuepr;": "\u22DE",
      "&cuesc;": "\u22DF",
      "&cularr;": "\u21B6",
      "&cularrp;": "\u293D",
      "&cup;": "\u222A",
      "&cupbrcap;": "\u2A48",
      "&cupcap;": "\u2A46",
      "&cupcup;": "\u2A4A",
      "&cupdot;": "\u228D",
      "&cupor;": "\u2A45",
      "&cups;": "\u222A\uFE00",
      "&curarr;": "\u21B7",
      "&curarrm;": "\u293C",
      "&curlyeqprec;": "\u22DE",
      "&curlyeqsucc;": "\u22DF",
      "&curlyvee;": "\u22CE",
      "&curlywedge;": "\u22CF",
      "&curren": "\xA4",
      "&curren;": "\xA4",
      "&curvearrowleft;": "\u21B6",
      "&curvearrowright;": "\u21B7",
      "&cuvee;": "\u22CE",
      "&cuwed;": "\u22CF",
      "&cwconint;": "\u2232",
      "&cwint;": "\u2231",
      "&cylcty;": "\u232D",
      "&dArr;": "\u21D3",
      "&dHar;": "\u2965",
      "&dagger;": "\u2020",
      "&daleth;": "\u2138",
      "&darr;": "\u2193",
      "&dash;": "\u2010",
      "&dashv;": "\u22A3",
      "&dbkarow;": "\u290F",
      "&dblac;": "\u02DD",
      "&dcaron;": "\u010F",
      "&dcy;": "\u0434",
      "&dd;": "\u2146",
      "&ddagger;": "\u2021",
      "&ddarr;": "\u21CA",
      "&ddotseq;": "\u2A77",
      "&deg": "\xB0",
      "&deg;": "\xB0",
      "&delta;": "\u03B4",
      "&demptyv;": "\u29B1",
      "&dfisht;": "\u297F",
      "&dfr;": "\u{1D521}",
      "&dharl;": "\u21C3",
      "&dharr;": "\u21C2",
      "&diam;": "\u22C4",
      "&diamond;": "\u22C4",
      "&diamondsuit;": "\u2666",
      "&diams;": "\u2666",
      "&die;": "\xA8",
      "&digamma;": "\u03DD",
      "&disin;": "\u22F2",
      "&div;": "\xF7",
      "&divide": "\xF7",
      "&divide;": "\xF7",
      "&divideontimes;": "\u22C7",
      "&divonx;": "\u22C7",
      "&djcy;": "\u0452",
      "&dlcorn;": "\u231E",
      "&dlcrop;": "\u230D",
      "&dollar;": "$",
      "&dopf;": "\u{1D555}",
      "&dot;": "\u02D9",
      "&doteq;": "\u2250",
      "&doteqdot;": "\u2251",
      "&dotminus;": "\u2238",
      "&dotplus;": "\u2214",
      "&dotsquare;": "\u22A1",
      "&doublebarwedge;": "\u2306",
      "&downarrow;": "\u2193",
      "&downdownarrows;": "\u21CA",
      "&downharpoonleft;": "\u21C3",
      "&downharpoonright;": "\u21C2",
      "&drbkarow;": "\u2910",
      "&drcorn;": "\u231F",
      "&drcrop;": "\u230C",
      "&dscr;": "\u{1D4B9}",
      "&dscy;": "\u0455",
      "&dsol;": "\u29F6",
      "&dstrok;": "\u0111",
      "&dtdot;": "\u22F1",
      "&dtri;": "\u25BF",
      "&dtrif;": "\u25BE",
      "&duarr;": "\u21F5",
      "&duhar;": "\u296F",
      "&dwangle;": "\u29A6",
      "&dzcy;": "\u045F",
      "&dzigrarr;": "\u27FF",
      "&eDDot;": "\u2A77",
      "&eDot;": "\u2251",
      "&eacute": "\xE9",
      "&eacute;": "\xE9",
      "&easter;": "\u2A6E",
      "&ecaron;": "\u011B",
      "&ecir;": "\u2256",
      "&ecirc": "\xEA",
      "&ecirc;": "\xEA",
      "&ecolon;": "\u2255",
      "&ecy;": "\u044D",
      "&edot;": "\u0117",
      "&ee;": "\u2147",
      "&efDot;": "\u2252",
      "&efr;": "\u{1D522}",
      "&eg;": "\u2A9A",
      "&egrave": "\xE8",
      "&egrave;": "\xE8",
      "&egs;": "\u2A96",
      "&egsdot;": "\u2A98",
      "&el;": "\u2A99",
      "&elinters;": "\u23E7",
      "&ell;": "\u2113",
      "&els;": "\u2A95",
      "&elsdot;": "\u2A97",
      "&emacr;": "\u0113",
      "&empty;": "\u2205",
      "&emptyset;": "\u2205",
      "&emptyv;": "\u2205",
      "&emsp13;": "\u2004",
      "&emsp14;": "\u2005",
      "&emsp;": "\u2003",
      "&eng;": "\u014B",
      "&ensp;": "\u2002",
      "&eogon;": "\u0119",
      "&eopf;": "\u{1D556}",
      "&epar;": "\u22D5",
      "&eparsl;": "\u29E3",
      "&eplus;": "\u2A71",
      "&epsi;": "\u03B5",
      "&epsilon;": "\u03B5",
      "&epsiv;": "\u03F5",
      "&eqcirc;": "\u2256",
      "&eqcolon;": "\u2255",
      "&eqsim;": "\u2242",
      "&eqslantgtr;": "\u2A96",
      "&eqslantless;": "\u2A95",
      "&equals;": "=",
      "&equest;": "\u225F",
      "&equiv;": "\u2261",
      "&equivDD;": "\u2A78",
      "&eqvparsl;": "\u29E5",
      "&erDot;": "\u2253",
      "&erarr;": "\u2971",
      "&escr;": "\u212F",
      "&esdot;": "\u2250",
      "&esim;": "\u2242",
      "&eta;": "\u03B7",
      "&eth": "\xF0",
      "&eth;": "\xF0",
      "&euml": "\xEB",
      "&euml;": "\xEB",
      "&euro;": "\u20AC",
      "&excl;": "!",
      "&exist;": "\u2203",
      "&expectation;": "\u2130",
      "&exponentiale;": "\u2147",
      "&fallingdotseq;": "\u2252",
      "&fcy;": "\u0444",
      "&female;": "\u2640",
      "&ffilig;": "\uFB03",
      "&fflig;": "\uFB00",
      "&ffllig;": "\uFB04",
      "&ffr;": "\u{1D523}",
      "&filig;": "\uFB01",
      "&fjlig;": "fj",
      "&flat;": "\u266D",
      "&fllig;": "\uFB02",
      "&fltns;": "\u25B1",
      "&fnof;": "\u0192",
      "&fopf;": "\u{1D557}",
      "&forall;": "\u2200",
      "&fork;": "\u22D4",
      "&forkv;": "\u2AD9",
      "&fpartint;": "\u2A0D",
      "&frac12": "\xBD",
      "&frac12;": "\xBD",
      "&frac13;": "\u2153",
      "&frac14": "\xBC",
      "&frac14;": "\xBC",
      "&frac15;": "\u2155",
      "&frac16;": "\u2159",
      "&frac18;": "\u215B",
      "&frac23;": "\u2154",
      "&frac25;": "\u2156",
      "&frac34": "\xBE",
      "&frac34;": "\xBE",
      "&frac35;": "\u2157",
      "&frac38;": "\u215C",
      "&frac45;": "\u2158",
      "&frac56;": "\u215A",
      "&frac58;": "\u215D",
      "&frac78;": "\u215E",
      "&frasl;": "\u2044",
      "&frown;": "\u2322",
      "&fscr;": "\u{1D4BB}",
      "&gE;": "\u2267",
      "&gEl;": "\u2A8C",
      "&gacute;": "\u01F5",
      "&gamma;": "\u03B3",
      "&gammad;": "\u03DD",
      "&gap;": "\u2A86",
      "&gbreve;": "\u011F",
      "&gcirc;": "\u011D",
      "&gcy;": "\u0433",
      "&gdot;": "\u0121",
      "&ge;": "\u2265",
      "&gel;": "\u22DB",
      "&geq;": "\u2265",
      "&geqq;": "\u2267",
      "&geqslant;": "\u2A7E",
      "&ges;": "\u2A7E",
      "&gescc;": "\u2AA9",
      "&gesdot;": "\u2A80",
      "&gesdoto;": "\u2A82",
      "&gesdotol;": "\u2A84",
      "&gesl;": "\u22DB\uFE00",
      "&gesles;": "\u2A94",
      "&gfr;": "\u{1D524}",
      "&gg;": "\u226B",
      "&ggg;": "\u22D9",
      "&gimel;": "\u2137",
      "&gjcy;": "\u0453",
      "&gl;": "\u2277",
      "&glE;": "\u2A92",
      "&gla;": "\u2AA5",
      "&glj;": "\u2AA4",
      "&gnE;": "\u2269",
      "&gnap;": "\u2A8A",
      "&gnapprox;": "\u2A8A",
      "&gne;": "\u2A88",
      "&gneq;": "\u2A88",
      "&gneqq;": "\u2269",
      "&gnsim;": "\u22E7",
      "&gopf;": "\u{1D558}",
      "&grave;": "`",
      "&gscr;": "\u210A",
      "&gsim;": "\u2273",
      "&gsime;": "\u2A8E",
      "&gsiml;": "\u2A90",
      "&gt": ">",
      "&gt;": ">",
      "&gtcc;": "\u2AA7",
      "&gtcir;": "\u2A7A",
      "&gtdot;": "\u22D7",
      "&gtlPar;": "\u2995",
      "&gtquest;": "\u2A7C",
      "&gtrapprox;": "\u2A86",
      "&gtrarr;": "\u2978",
      "&gtrdot;": "\u22D7",
      "&gtreqless;": "\u22DB",
      "&gtreqqless;": "\u2A8C",
      "&gtrless;": "\u2277",
      "&gtrsim;": "\u2273",
      "&gvertneqq;": "\u2269\uFE00",
      "&gvnE;": "\u2269\uFE00",
      "&hArr;": "\u21D4",
      "&hairsp;": "\u200A",
      "&half;": "\xBD",
      "&hamilt;": "\u210B",
      "&hardcy;": "\u044A",
      "&harr;": "\u2194",
      "&harrcir;": "\u2948",
      "&harrw;": "\u21AD",
      "&hbar;": "\u210F",
      "&hcirc;": "\u0125",
      "&hearts;": "\u2665",
      "&heartsuit;": "\u2665",
      "&hellip;": "\u2026",
      "&hercon;": "\u22B9",
      "&hfr;": "\u{1D525}",
      "&hksearow;": "\u2925",
      "&hkswarow;": "\u2926",
      "&hoarr;": "\u21FF",
      "&homtht;": "\u223B",
      "&hookleftarrow;": "\u21A9",
      "&hookrightarrow;": "\u21AA",
      "&hopf;": "\u{1D559}",
      "&horbar;": "\u2015",
      "&hscr;": "\u{1D4BD}",
      "&hslash;": "\u210F",
      "&hstrok;": "\u0127",
      "&hybull;": "\u2043",
      "&hyphen;": "\u2010",
      "&iacute": "\xED",
      "&iacute;": "\xED",
      "&ic;": "\u2063",
      "&icirc": "\xEE",
      "&icirc;": "\xEE",
      "&icy;": "\u0438",
      "&iecy;": "\u0435",
      "&iexcl": "\xA1",
      "&iexcl;": "\xA1",
      "&iff;": "\u21D4",
      "&ifr;": "\u{1D526}",
      "&igrave": "\xEC",
      "&igrave;": "\xEC",
      "&ii;": "\u2148",
      "&iiiint;": "\u2A0C",
      "&iiint;": "\u222D",
      "&iinfin;": "\u29DC",
      "&iiota;": "\u2129",
      "&ijlig;": "\u0133",
      "&imacr;": "\u012B",
      "&image;": "\u2111",
      "&imagline;": "\u2110",
      "&imagpart;": "\u2111",
      "&imath;": "\u0131",
      "&imof;": "\u22B7",
      "&imped;": "\u01B5",
      "&in;": "\u2208",
      "&incare;": "\u2105",
      "&infin;": "\u221E",
      "&infintie;": "\u29DD",
      "&inodot;": "\u0131",
      "&int;": "\u222B",
      "&intcal;": "\u22BA",
      "&integers;": "\u2124",
      "&intercal;": "\u22BA",
      "&intlarhk;": "\u2A17",
      "&intprod;": "\u2A3C",
      "&iocy;": "\u0451",
      "&iogon;": "\u012F",
      "&iopf;": "\u{1D55A}",
      "&iota;": "\u03B9",
      "&iprod;": "\u2A3C",
      "&iquest": "\xBF",
      "&iquest;": "\xBF",
      "&iscr;": "\u{1D4BE}",
      "&isin;": "\u2208",
      "&isinE;": "\u22F9",
      "&isindot;": "\u22F5",
      "&isins;": "\u22F4",
      "&isinsv;": "\u22F3",
      "&isinv;": "\u2208",
      "&it;": "\u2062",
      "&itilde;": "\u0129",
      "&iukcy;": "\u0456",
      "&iuml": "\xEF",
      "&iuml;": "\xEF",
      "&jcirc;": "\u0135",
      "&jcy;": "\u0439",
      "&jfr;": "\u{1D527}",
      "&jmath;": "\u0237",
      "&jopf;": "\u{1D55B}",
      "&jscr;": "\u{1D4BF}",
      "&jsercy;": "\u0458",
      "&jukcy;": "\u0454",
      "&kappa;": "\u03BA",
      "&kappav;": "\u03F0",
      "&kcedil;": "\u0137",
      "&kcy;": "\u043A",
      "&kfr;": "\u{1D528}",
      "&kgreen;": "\u0138",
      "&khcy;": "\u0445",
      "&kjcy;": "\u045C",
      "&kopf;": "\u{1D55C}",
      "&kscr;": "\u{1D4C0}",
      "&lAarr;": "\u21DA",
      "&lArr;": "\u21D0",
      "&lAtail;": "\u291B",
      "&lBarr;": "\u290E",
      "&lE;": "\u2266",
      "&lEg;": "\u2A8B",
      "&lHar;": "\u2962",
      "&lacute;": "\u013A",
      "&laemptyv;": "\u29B4",
      "&lagran;": "\u2112",
      "&lambda;": "\u03BB",
      "&lang;": "\u27E8",
      "&langd;": "\u2991",
      "&langle;": "\u27E8",
      "&lap;": "\u2A85",
      "&laquo": "\xAB",
      "&laquo;": "\xAB",
      "&larr;": "\u2190",
      "&larrb;": "\u21E4",
      "&larrbfs;": "\u291F",
      "&larrfs;": "\u291D",
      "&larrhk;": "\u21A9",
      "&larrlp;": "\u21AB",
      "&larrpl;": "\u2939",
      "&larrsim;": "\u2973",
      "&larrtl;": "\u21A2",
      "&lat;": "\u2AAB",
      "&latail;": "\u2919",
      "&late;": "\u2AAD",
      "&lates;": "\u2AAD\uFE00",
      "&lbarr;": "\u290C",
      "&lbbrk;": "\u2772",
      "&lbrace;": "{",
      "&lbrack;": "[",
      "&lbrke;": "\u298B",
      "&lbrksld;": "\u298F",
      "&lbrkslu;": "\u298D",
      "&lcaron;": "\u013E",
      "&lcedil;": "\u013C",
      "&lceil;": "\u2308",
      "&lcub;": "{",
      "&lcy;": "\u043B",
      "&ldca;": "\u2936",
      "&ldquo;": "\u201C",
      "&ldquor;": "\u201E",
      "&ldrdhar;": "\u2967",
      "&ldrushar;": "\u294B",
      "&ldsh;": "\u21B2",
      "&le;": "\u2264",
      "&leftarrow;": "\u2190",
      "&leftarrowtail;": "\u21A2",
      "&leftharpoondown;": "\u21BD",
      "&leftharpoonup;": "\u21BC",
      "&leftleftarrows;": "\u21C7",
      "&leftrightarrow;": "\u2194",
      "&leftrightarrows;": "\u21C6",
      "&leftrightharpoons;": "\u21CB",
      "&leftrightsquigarrow;": "\u21AD",
      "&leftthreetimes;": "\u22CB",
      "&leg;": "\u22DA",
      "&leq;": "\u2264",
      "&leqq;": "\u2266",
      "&leqslant;": "\u2A7D",
      "&les;": "\u2A7D",
      "&lescc;": "\u2AA8",
      "&lesdot;": "\u2A7F",
      "&lesdoto;": "\u2A81",
      "&lesdotor;": "\u2A83",
      "&lesg;": "\u22DA\uFE00",
      "&lesges;": "\u2A93",
      "&lessapprox;": "\u2A85",
      "&lessdot;": "\u22D6",
      "&lesseqgtr;": "\u22DA",
      "&lesseqqgtr;": "\u2A8B",
      "&lessgtr;": "\u2276",
      "&lesssim;": "\u2272",
      "&lfisht;": "\u297C",
      "&lfloor;": "\u230A",
      "&lfr;": "\u{1D529}",
      "&lg;": "\u2276",
      "&lgE;": "\u2A91",
      "&lhard;": "\u21BD",
      "&lharu;": "\u21BC",
      "&lharul;": "\u296A",
      "&lhblk;": "\u2584",
      "&ljcy;": "\u0459",
      "&ll;": "\u226A",
      "&llarr;": "\u21C7",
      "&llcorner;": "\u231E",
      "&llhard;": "\u296B",
      "&lltri;": "\u25FA",
      "&lmidot;": "\u0140",
      "&lmoust;": "\u23B0",
      "&lmoustache;": "\u23B0",
      "&lnE;": "\u2268",
      "&lnap;": "\u2A89",
      "&lnapprox;": "\u2A89",
      "&lne;": "\u2A87",
      "&lneq;": "\u2A87",
      "&lneqq;": "\u2268",
      "&lnsim;": "\u22E6",
      "&loang;": "\u27EC",
      "&loarr;": "\u21FD",
      "&lobrk;": "\u27E6",
      "&longleftarrow;": "\u27F5",
      "&longleftrightarrow;": "\u27F7",
      "&longmapsto;": "\u27FC",
      "&longrightarrow;": "\u27F6",
      "&looparrowleft;": "\u21AB",
      "&looparrowright;": "\u21AC",
      "&lopar;": "\u2985",
      "&lopf;": "\u{1D55D}",
      "&loplus;": "\u2A2D",
      "&lotimes;": "\u2A34",
      "&lowast;": "\u2217",
      "&lowbar;": "_",
      "&loz;": "\u25CA",
      "&lozenge;": "\u25CA",
      "&lozf;": "\u29EB",
      "&lpar;": "(",
      "&lparlt;": "\u2993",
      "&lrarr;": "\u21C6",
      "&lrcorner;": "\u231F",
      "&lrhar;": "\u21CB",
      "&lrhard;": "\u296D",
      "&lrm;": "\u200E",
      "&lrtri;": "\u22BF",
      "&lsaquo;": "\u2039",
      "&lscr;": "\u{1D4C1}",
      "&lsh;": "\u21B0",
      "&lsim;": "\u2272",
      "&lsime;": "\u2A8D",
      "&lsimg;": "\u2A8F",
      "&lsqb;": "[",
      "&lsquo;": "\u2018",
      "&lsquor;": "\u201A",
      "&lstrok;": "\u0142",
      "&lt": "<",
      "&lt;": "<",
      "&ltcc;": "\u2AA6",
      "&ltcir;": "\u2A79",
      "&ltdot;": "\u22D6",
      "&lthree;": "\u22CB",
      "&ltimes;": "\u22C9",
      "&ltlarr;": "\u2976",
      "&ltquest;": "\u2A7B",
      "&ltrPar;": "\u2996",
      "&ltri;": "\u25C3",
      "&ltrie;": "\u22B4",
      "&ltrif;": "\u25C2",
      "&lurdshar;": "\u294A",
      "&luruhar;": "\u2966",
      "&lvertneqq;": "\u2268\uFE00",
      "&lvnE;": "\u2268\uFE00",
      "&mDDot;": "\u223A",
      "&macr": "\xAF",
      "&macr;": "\xAF",
      "&male;": "\u2642",
      "&malt;": "\u2720",
      "&maltese;": "\u2720",
      "&map;": "\u21A6",
      "&mapsto;": "\u21A6",
      "&mapstodown;": "\u21A7",
      "&mapstoleft;": "\u21A4",
      "&mapstoup;": "\u21A5",
      "&marker;": "\u25AE",
      "&mcomma;": "\u2A29",
      "&mcy;": "\u043C",
      "&mdash;": "\u2014",
      "&measuredangle;": "\u2221",
      "&mfr;": "\u{1D52A}",
      "&mho;": "\u2127",
      "&micro": "\xB5",
      "&micro;": "\xB5",
      "&mid;": "\u2223",
      "&midast;": "*",
      "&midcir;": "\u2AF0",
      "&middot": "\xB7",
      "&middot;": "\xB7",
      "&minus;": "\u2212",
      "&minusb;": "\u229F",
      "&minusd;": "\u2238",
      "&minusdu;": "\u2A2A",
      "&mlcp;": "\u2ADB",
      "&mldr;": "\u2026",
      "&mnplus;": "\u2213",
      "&models;": "\u22A7",
      "&mopf;": "\u{1D55E}",
      "&mp;": "\u2213",
      "&mscr;": "\u{1D4C2}",
      "&mstpos;": "\u223E",
      "&mu;": "\u03BC",
      "&multimap;": "\u22B8",
      "&mumap;": "\u22B8",
      "&nGg;": "\u22D9\u0338",
      "&nGt;": "\u226B\u20D2",
      "&nGtv;": "\u226B\u0338",
      "&nLeftarrow;": "\u21CD",
      "&nLeftrightarrow;": "\u21CE",
      "&nLl;": "\u22D8\u0338",
      "&nLt;": "\u226A\u20D2",
      "&nLtv;": "\u226A\u0338",
      "&nRightarrow;": "\u21CF",
      "&nVDash;": "\u22AF",
      "&nVdash;": "\u22AE",
      "&nabla;": "\u2207",
      "&nacute;": "\u0144",
      "&nang;": "\u2220\u20D2",
      "&nap;": "\u2249",
      "&napE;": "\u2A70\u0338",
      "&napid;": "\u224B\u0338",
      "&napos;": "\u0149",
      "&napprox;": "\u2249",
      "&natur;": "\u266E",
      "&natural;": "\u266E",
      "&naturals;": "\u2115",
      "&nbsp": "\xA0",
      "&nbsp;": "\xA0",
      "&nbump;": "\u224E\u0338",
      "&nbumpe;": "\u224F\u0338",
      "&ncap;": "\u2A43",
      "&ncaron;": "\u0148",
      "&ncedil;": "\u0146",
      "&ncong;": "\u2247",
      "&ncongdot;": "\u2A6D\u0338",
      "&ncup;": "\u2A42",
      "&ncy;": "\u043D",
      "&ndash;": "\u2013",
      "&ne;": "\u2260",
      "&neArr;": "\u21D7",
      "&nearhk;": "\u2924",
      "&nearr;": "\u2197",
      "&nearrow;": "\u2197",
      "&nedot;": "\u2250\u0338",
      "&nequiv;": "\u2262",
      "&nesear;": "\u2928",
      "&nesim;": "\u2242\u0338",
      "&nexist;": "\u2204",
      "&nexists;": "\u2204",
      "&nfr;": "\u{1D52B}",
      "&ngE;": "\u2267\u0338",
      "&nge;": "\u2271",
      "&ngeq;": "\u2271",
      "&ngeqq;": "\u2267\u0338",
      "&ngeqslant;": "\u2A7E\u0338",
      "&nges;": "\u2A7E\u0338",
      "&ngsim;": "\u2275",
      "&ngt;": "\u226F",
      "&ngtr;": "\u226F",
      "&nhArr;": "\u21CE",
      "&nharr;": "\u21AE",
      "&nhpar;": "\u2AF2",
      "&ni;": "\u220B",
      "&nis;": "\u22FC",
      "&nisd;": "\u22FA",
      "&niv;": "\u220B",
      "&njcy;": "\u045A",
      "&nlArr;": "\u21CD",
      "&nlE;": "\u2266\u0338",
      "&nlarr;": "\u219A",
      "&nldr;": "\u2025",
      "&nle;": "\u2270",
      "&nleftarrow;": "\u219A",
      "&nleftrightarrow;": "\u21AE",
      "&nleq;": "\u2270",
      "&nleqq;": "\u2266\u0338",
      "&nleqslant;": "\u2A7D\u0338",
      "&nles;": "\u2A7D\u0338",
      "&nless;": "\u226E",
      "&nlsim;": "\u2274",
      "&nlt;": "\u226E",
      "&nltri;": "\u22EA",
      "&nltrie;": "\u22EC",
      "&nmid;": "\u2224",
      "&nopf;": "\u{1D55F}",
      "&not": "\xAC",
      "&not;": "\xAC",
      "&notin;": "\u2209",
      "&notinE;": "\u22F9\u0338",
      "&notindot;": "\u22F5\u0338",
      "&notinva;": "\u2209",
      "&notinvb;": "\u22F7",
      "&notinvc;": "\u22F6",
      "&notni;": "\u220C",
      "&notniva;": "\u220C",
      "&notnivb;": "\u22FE",
      "&notnivc;": "\u22FD",
      "&npar;": "\u2226",
      "&nparallel;": "\u2226",
      "&nparsl;": "\u2AFD\u20E5",
      "&npart;": "\u2202\u0338",
      "&npolint;": "\u2A14",
      "&npr;": "\u2280",
      "&nprcue;": "\u22E0",
      "&npre;": "\u2AAF\u0338",
      "&nprec;": "\u2280",
      "&npreceq;": "\u2AAF\u0338",
      "&nrArr;": "\u21CF",
      "&nrarr;": "\u219B",
      "&nrarrc;": "\u2933\u0338",
      "&nrarrw;": "\u219D\u0338",
      "&nrightarrow;": "\u219B",
      "&nrtri;": "\u22EB",
      "&nrtrie;": "\u22ED",
      "&nsc;": "\u2281",
      "&nsccue;": "\u22E1",
      "&nsce;": "\u2AB0\u0338",
      "&nscr;": "\u{1D4C3}",
      "&nshortmid;": "\u2224",
      "&nshortparallel;": "\u2226",
      "&nsim;": "\u2241",
      "&nsime;": "\u2244",
      "&nsimeq;": "\u2244",
      "&nsmid;": "\u2224",
      "&nspar;": "\u2226",
      "&nsqsube;": "\u22E2",
      "&nsqsupe;": "\u22E3",
      "&nsub;": "\u2284",
      "&nsubE;": "\u2AC5\u0338",
      "&nsube;": "\u2288",
      "&nsubset;": "\u2282\u20D2",
      "&nsubseteq;": "\u2288",
      "&nsubseteqq;": "\u2AC5\u0338",
      "&nsucc;": "\u2281",
      "&nsucceq;": "\u2AB0\u0338",
      "&nsup;": "\u2285",
      "&nsupE;": "\u2AC6\u0338",
      "&nsupe;": "\u2289",
      "&nsupset;": "\u2283\u20D2",
      "&nsupseteq;": "\u2289",
      "&nsupseteqq;": "\u2AC6\u0338",
      "&ntgl;": "\u2279",
      "&ntilde": "\xF1",
      "&ntilde;": "\xF1",
      "&ntlg;": "\u2278",
      "&ntriangleleft;": "\u22EA",
      "&ntrianglelefteq;": "\u22EC",
      "&ntriangleright;": "\u22EB",
      "&ntrianglerighteq;": "\u22ED",
      "&nu;": "\u03BD",
      "&num;": "#",
      "&numero;": "\u2116",
      "&numsp;": "\u2007",
      "&nvDash;": "\u22AD",
      "&nvHarr;": "\u2904",
      "&nvap;": "\u224D\u20D2",
      "&nvdash;": "\u22AC",
      "&nvge;": "\u2265\u20D2",
      "&nvgt;": ">\u20D2",
      "&nvinfin;": "\u29DE",
      "&nvlArr;": "\u2902",
      "&nvle;": "\u2264\u20D2",
      "&nvlt;": "<\u20D2",
      "&nvltrie;": "\u22B4\u20D2",
      "&nvrArr;": "\u2903",
      "&nvrtrie;": "\u22B5\u20D2",
      "&nvsim;": "\u223C\u20D2",
      "&nwArr;": "\u21D6",
      "&nwarhk;": "\u2923",
      "&nwarr;": "\u2196",
      "&nwarrow;": "\u2196",
      "&nwnear;": "\u2927",
      "&oS;": "\u24C8",
      "&oacute": "\xF3",
      "&oacute;": "\xF3",
      "&oast;": "\u229B",
      "&ocir;": "\u229A",
      "&ocirc": "\xF4",
      "&ocirc;": "\xF4",
      "&ocy;": "\u043E",
      "&odash;": "\u229D",
      "&odblac;": "\u0151",
      "&odiv;": "\u2A38",
      "&odot;": "\u2299",
      "&odsold;": "\u29BC",
      "&oelig;": "\u0153",
      "&ofcir;": "\u29BF",
      "&ofr;": "\u{1D52C}",
      "&ogon;": "\u02DB",
      "&ograve": "\xF2",
      "&ograve;": "\xF2",
      "&ogt;": "\u29C1",
      "&ohbar;": "\u29B5",
      "&ohm;": "\u03A9",
      "&oint;": "\u222E",
      "&olarr;": "\u21BA",
      "&olcir;": "\u29BE",
      "&olcross;": "\u29BB",
      "&oline;": "\u203E",
      "&olt;": "\u29C0",
      "&omacr;": "\u014D",
      "&omega;": "\u03C9",
      "&omicron;": "\u03BF",
      "&omid;": "\u29B6",
      "&ominus;": "\u2296",
      "&oopf;": "\u{1D560}",
      "&opar;": "\u29B7",
      "&operp;": "\u29B9",
      "&oplus;": "\u2295",
      "&or;": "\u2228",
      "&orarr;": "\u21BB",
      "&ord;": "\u2A5D",
      "&order;": "\u2134",
      "&orderof;": "\u2134",
      "&ordf": "\xAA",
      "&ordf;": "\xAA",
      "&ordm": "\xBA",
      "&ordm;": "\xBA",
      "&origof;": "\u22B6",
      "&oror;": "\u2A56",
      "&orslope;": "\u2A57",
      "&orv;": "\u2A5B",
      "&oscr;": "\u2134",
      "&oslash": "\xF8",
      "&oslash;": "\xF8",
      "&osol;": "\u2298",
      "&otilde": "\xF5",
      "&otilde;": "\xF5",
      "&otimes;": "\u2297",
      "&otimesas;": "\u2A36",
      "&ouml": "\xF6",
      "&ouml;": "\xF6",
      "&ovbar;": "\u233D",
      "&par;": "\u2225",
      "&para": "\xB6",
      "&para;": "\xB6",
      "&parallel;": "\u2225",
      "&parsim;": "\u2AF3",
      "&parsl;": "\u2AFD",
      "&part;": "\u2202",
      "&pcy;": "\u043F",
      "&percnt;": "%",
      "&period;": ".",
      "&permil;": "\u2030",
      "&perp;": "\u22A5",
      "&pertenk;": "\u2031",
      "&pfr;": "\u{1D52D}",
      "&phi;": "\u03C6",
      "&phiv;": "\u03D5",
      "&phmmat;": "\u2133",
      "&phone;": "\u260E",
      "&pi;": "\u03C0",
      "&pitchfork;": "\u22D4",
      "&piv;": "\u03D6",
      "&planck;": "\u210F",
      "&planckh;": "\u210E",
      "&plankv;": "\u210F",
      "&plus;": "+",
      "&plusacir;": "\u2A23",
      "&plusb;": "\u229E",
      "&pluscir;": "\u2A22",
      "&plusdo;": "\u2214",
      "&plusdu;": "\u2A25",
      "&pluse;": "\u2A72",
      "&plusmn": "\xB1",
      "&plusmn;": "\xB1",
      "&plussim;": "\u2A26",
      "&plustwo;": "\u2A27",
      "&pm;": "\xB1",
      "&pointint;": "\u2A15",
      "&popf;": "\u{1D561}",
      "&pound": "\xA3",
      "&pound;": "\xA3",
      "&pr;": "\u227A",
      "&prE;": "\u2AB3",
      "&prap;": "\u2AB7",
      "&prcue;": "\u227C",
      "&pre;": "\u2AAF",
      "&prec;": "\u227A",
      "&precapprox;": "\u2AB7",
      "&preccurlyeq;": "\u227C",
      "&preceq;": "\u2AAF",
      "&precnapprox;": "\u2AB9",
      "&precneqq;": "\u2AB5",
      "&precnsim;": "\u22E8",
      "&precsim;": "\u227E",
      "&prime;": "\u2032",
      "&primes;": "\u2119",
      "&prnE;": "\u2AB5",
      "&prnap;": "\u2AB9",
      "&prnsim;": "\u22E8",
      "&prod;": "\u220F",
      "&profalar;": "\u232E",
      "&profline;": "\u2312",
      "&profsurf;": "\u2313",
      "&prop;": "\u221D",
      "&propto;": "\u221D",
      "&prsim;": "\u227E",
      "&prurel;": "\u22B0",
      "&pscr;": "\u{1D4C5}",
      "&psi;": "\u03C8",
      "&puncsp;": "\u2008",
      "&qfr;": "\u{1D52E}",
      "&qint;": "\u2A0C",
      "&qopf;": "\u{1D562}",
      "&qprime;": "\u2057",
      "&qscr;": "\u{1D4C6}",
      "&quaternions;": "\u210D",
      "&quatint;": "\u2A16",
      "&quest;": "?",
      "&questeq;": "\u225F",
      "&quot": '"',
      "&quot;": '"',
      "&rAarr;": "\u21DB",
      "&rArr;": "\u21D2",
      "&rAtail;": "\u291C",
      "&rBarr;": "\u290F",
      "&rHar;": "\u2964",
      "&race;": "\u223D\u0331",
      "&racute;": "\u0155",
      "&radic;": "\u221A",
      "&raemptyv;": "\u29B3",
      "&rang;": "\u27E9",
      "&rangd;": "\u2992",
      "&range;": "\u29A5",
      "&rangle;": "\u27E9",
      "&raquo": "\xBB",
      "&raquo;": "\xBB",
      "&rarr;": "\u2192",
      "&rarrap;": "\u2975",
      "&rarrb;": "\u21E5",
      "&rarrbfs;": "\u2920",
      "&rarrc;": "\u2933",
      "&rarrfs;": "\u291E",
      "&rarrhk;": "\u21AA",
      "&rarrlp;": "\u21AC",
      "&rarrpl;": "\u2945",
      "&rarrsim;": "\u2974",
      "&rarrtl;": "\u21A3",
      "&rarrw;": "\u219D",
      "&ratail;": "\u291A",
      "&ratio;": "\u2236",
      "&rationals;": "\u211A",
      "&rbarr;": "\u290D",
      "&rbbrk;": "\u2773",
      "&rbrace;": "}",
      "&rbrack;": "]",
      "&rbrke;": "\u298C",
      "&rbrksld;": "\u298E",
      "&rbrkslu;": "\u2990",
      "&rcaron;": "\u0159",
      "&rcedil;": "\u0157",
      "&rceil;": "\u2309",
      "&rcub;": "}",
      "&rcy;": "\u0440",
      "&rdca;": "\u2937",
      "&rdldhar;": "\u2969",
      "&rdquo;": "\u201D",
      "&rdquor;": "\u201D",
      "&rdsh;": "\u21B3",
      "&real;": "\u211C",
      "&realine;": "\u211B",
      "&realpart;": "\u211C",
      "&reals;": "\u211D",
      "&rect;": "\u25AD",
      "&reg": "\xAE",
      "&reg;": "\xAE",
      "&rfisht;": "\u297D",
      "&rfloor;": "\u230B",
      "&rfr;": "\u{1D52F}",
      "&rhard;": "\u21C1",
      "&rharu;": "\u21C0",
      "&rharul;": "\u296C",
      "&rho;": "\u03C1",
      "&rhov;": "\u03F1",
      "&rightarrow;": "\u2192",
      "&rightarrowtail;": "\u21A3",
      "&rightharpoondown;": "\u21C1",
      "&rightharpoonup;": "\u21C0",
      "&rightleftarrows;": "\u21C4",
      "&rightleftharpoons;": "\u21CC",
      "&rightrightarrows;": "\u21C9",
      "&rightsquigarrow;": "\u219D",
      "&rightthreetimes;": "\u22CC",
      "&ring;": "\u02DA",
      "&risingdotseq;": "\u2253",
      "&rlarr;": "\u21C4",
      "&rlhar;": "\u21CC",
      "&rlm;": "\u200F",
      "&rmoust;": "\u23B1",
      "&rmoustache;": "\u23B1",
      "&rnmid;": "\u2AEE",
      "&roang;": "\u27ED",
      "&roarr;": "\u21FE",
      "&robrk;": "\u27E7",
      "&ropar;": "\u2986",
      "&ropf;": "\u{1D563}",
      "&roplus;": "\u2A2E",
      "&rotimes;": "\u2A35",
      "&rpar;": ")",
      "&rpargt;": "\u2994",
      "&rppolint;": "\u2A12",
      "&rrarr;": "\u21C9",
      "&rsaquo;": "\u203A",
      "&rscr;": "\u{1D4C7}",
      "&rsh;": "\u21B1",
      "&rsqb;": "]",
      "&rsquo;": "\u2019",
      "&rsquor;": "\u2019",
      "&rthree;": "\u22CC",
      "&rtimes;": "\u22CA",
      "&rtri;": "\u25B9",
      "&rtrie;": "\u22B5",
      "&rtrif;": "\u25B8",
      "&rtriltri;": "\u29CE",
      "&ruluhar;": "\u2968",
      "&rx;": "\u211E",
      "&sacute;": "\u015B",
      "&sbquo;": "\u201A",
      "&sc;": "\u227B",
      "&scE;": "\u2AB4",
      "&scap;": "\u2AB8",
      "&scaron;": "\u0161",
      "&sccue;": "\u227D",
      "&sce;": "\u2AB0",
      "&scedil;": "\u015F",
      "&scirc;": "\u015D",
      "&scnE;": "\u2AB6",
      "&scnap;": "\u2ABA",
      "&scnsim;": "\u22E9",
      "&scpolint;": "\u2A13",
      "&scsim;": "\u227F",
      "&scy;": "\u0441",
      "&sdot;": "\u22C5",
      "&sdotb;": "\u22A1",
      "&sdote;": "\u2A66",
      "&seArr;": "\u21D8",
      "&searhk;": "\u2925",
      "&searr;": "\u2198",
      "&searrow;": "\u2198",
      "&sect": "\xA7",
      "&sect;": "\xA7",
      "&semi;": ";",
      "&seswar;": "\u2929",
      "&setminus;": "\u2216",
      "&setmn;": "\u2216",
      "&sext;": "\u2736",
      "&sfr;": "\u{1D530}",
      "&sfrown;": "\u2322",
      "&sharp;": "\u266F",
      "&shchcy;": "\u0449",
      "&shcy;": "\u0448",
      "&shortmid;": "\u2223",
      "&shortparallel;": "\u2225",
      "&shy": "\xAD",
      "&shy;": "\xAD",
      "&sigma;": "\u03C3",
      "&sigmaf;": "\u03C2",
      "&sigmav;": "\u03C2",
      "&sim;": "\u223C",
      "&simdot;": "\u2A6A",
      "&sime;": "\u2243",
      "&simeq;": "\u2243",
      "&simg;": "\u2A9E",
      "&simgE;": "\u2AA0",
      "&siml;": "\u2A9D",
      "&simlE;": "\u2A9F",
      "&simne;": "\u2246",
      "&simplus;": "\u2A24",
      "&simrarr;": "\u2972",
      "&slarr;": "\u2190",
      "&smallsetminus;": "\u2216",
      "&smashp;": "\u2A33",
      "&smeparsl;": "\u29E4",
      "&smid;": "\u2223",
      "&smile;": "\u2323",
      "&smt;": "\u2AAA",
      "&smte;": "\u2AAC",
      "&smtes;": "\u2AAC\uFE00",
      "&softcy;": "\u044C",
      "&sol;": "/",
      "&solb;": "\u29C4",
      "&solbar;": "\u233F",
      "&sopf;": "\u{1D564}",
      "&spades;": "\u2660",
      "&spadesuit;": "\u2660",
      "&spar;": "\u2225",
      "&sqcap;": "\u2293",
      "&sqcaps;": "\u2293\uFE00",
      "&sqcup;": "\u2294",
      "&sqcups;": "\u2294\uFE00",
      "&sqsub;": "\u228F",
      "&sqsube;": "\u2291",
      "&sqsubset;": "\u228F",
      "&sqsubseteq;": "\u2291",
      "&sqsup;": "\u2290",
      "&sqsupe;": "\u2292",
      "&sqsupset;": "\u2290",
      "&sqsupseteq;": "\u2292",
      "&squ;": "\u25A1",
      "&square;": "\u25A1",
      "&squarf;": "\u25AA",
      "&squf;": "\u25AA",
      "&srarr;": "\u2192",
      "&sscr;": "\u{1D4C8}",
      "&ssetmn;": "\u2216",
      "&ssmile;": "\u2323",
      "&sstarf;": "\u22C6",
      "&star;": "\u2606",
      "&starf;": "\u2605",
      "&straightepsilon;": "\u03F5",
      "&straightphi;": "\u03D5",
      "&strns;": "\xAF",
      "&sub;": "\u2282",
      "&subE;": "\u2AC5",
      "&subdot;": "\u2ABD",
      "&sube;": "\u2286",
      "&subedot;": "\u2AC3",
      "&submult;": "\u2AC1",
      "&subnE;": "\u2ACB",
      "&subne;": "\u228A",
      "&subplus;": "\u2ABF",
      "&subrarr;": "\u2979",
      "&subset;": "\u2282",
      "&subseteq;": "\u2286",
      "&subseteqq;": "\u2AC5",
      "&subsetneq;": "\u228A",
      "&subsetneqq;": "\u2ACB",
      "&subsim;": "\u2AC7",
      "&subsub;": "\u2AD5",
      "&subsup;": "\u2AD3",
      "&succ;": "\u227B",
      "&succapprox;": "\u2AB8",
      "&succcurlyeq;": "\u227D",
      "&succeq;": "\u2AB0",
      "&succnapprox;": "\u2ABA",
      "&succneqq;": "\u2AB6",
      "&succnsim;": "\u22E9",
      "&succsim;": "\u227F",
      "&sum;": "\u2211",
      "&sung;": "\u266A",
      "&sup1": "\xB9",
      "&sup1;": "\xB9",
      "&sup2": "\xB2",
      "&sup2;": "\xB2",
      "&sup3": "\xB3",
      "&sup3;": "\xB3",
      "&sup;": "\u2283",
      "&supE;": "\u2AC6",
      "&supdot;": "\u2ABE",
      "&supdsub;": "\u2AD8",
      "&supe;": "\u2287",
      "&supedot;": "\u2AC4",
      "&suphsol;": "\u27C9",
      "&suphsub;": "\u2AD7",
      "&suplarr;": "\u297B",
      "&supmult;": "\u2AC2",
      "&supnE;": "\u2ACC",
      "&supne;": "\u228B",
      "&supplus;": "\u2AC0",
      "&supset;": "\u2283",
      "&supseteq;": "\u2287",
      "&supseteqq;": "\u2AC6",
      "&supsetneq;": "\u228B",
      "&supsetneqq;": "\u2ACC",
      "&supsim;": "\u2AC8",
      "&supsub;": "\u2AD4",
      "&supsup;": "\u2AD6",
      "&swArr;": "\u21D9",
      "&swarhk;": "\u2926",
      "&swarr;": "\u2199",
      "&swarrow;": "\u2199",
      "&swnwar;": "\u292A",
      "&szlig": "\xDF",
      "&szlig;": "\xDF",
      "&target;": "\u2316",
      "&tau;": "\u03C4",
      "&tbrk;": "\u23B4",
      "&tcaron;": "\u0165",
      "&tcedil;": "\u0163",
      "&tcy;": "\u0442",
      "&tdot;": "\u20DB",
      "&telrec;": "\u2315",
      "&tfr;": "\u{1D531}",
      "&there4;": "\u2234",
      "&therefore;": "\u2234",
      "&theta;": "\u03B8",
      "&thetasym;": "\u03D1",
      "&thetav;": "\u03D1",
      "&thickapprox;": "\u2248",
      "&thicksim;": "\u223C",
      "&thinsp;": "\u2009",
      "&thkap;": "\u2248",
      "&thksim;": "\u223C",
      "&thorn": "\xFE",
      "&thorn;": "\xFE",
      "&tilde;": "\u02DC",
      "&times": "\xD7",
      "&times;": "\xD7",
      "&timesb;": "\u22A0",
      "&timesbar;": "\u2A31",
      "&timesd;": "\u2A30",
      "&tint;": "\u222D",
      "&toea;": "\u2928",
      "&top;": "\u22A4",
      "&topbot;": "\u2336",
      "&topcir;": "\u2AF1",
      "&topf;": "\u{1D565}",
      "&topfork;": "\u2ADA",
      "&tosa;": "\u2929",
      "&tprime;": "\u2034",
      "&trade;": "\u2122",
      "&triangle;": "\u25B5",
      "&triangledown;": "\u25BF",
      "&triangleleft;": "\u25C3",
      "&trianglelefteq;": "\u22B4",
      "&triangleq;": "\u225C",
      "&triangleright;": "\u25B9",
      "&trianglerighteq;": "\u22B5",
      "&tridot;": "\u25EC",
      "&trie;": "\u225C",
      "&triminus;": "\u2A3A",
      "&triplus;": "\u2A39",
      "&trisb;": "\u29CD",
      "&tritime;": "\u2A3B",
      "&trpezium;": "\u23E2",
      "&tscr;": "\u{1D4C9}",
      "&tscy;": "\u0446",
      "&tshcy;": "\u045B",
      "&tstrok;": "\u0167",
      "&twixt;": "\u226C",
      "&twoheadleftarrow;": "\u219E",
      "&twoheadrightarrow;": "\u21A0",
      "&uArr;": "\u21D1",
      "&uHar;": "\u2963",
      "&uacute": "\xFA",
      "&uacute;": "\xFA",
      "&uarr;": "\u2191",
      "&ubrcy;": "\u045E",
      "&ubreve;": "\u016D",
      "&ucirc": "\xFB",
      "&ucirc;": "\xFB",
      "&ucy;": "\u0443",
      "&udarr;": "\u21C5",
      "&udblac;": "\u0171",
      "&udhar;": "\u296E",
      "&ufisht;": "\u297E",
      "&ufr;": "\u{1D532}",
      "&ugrave": "\xF9",
      "&ugrave;": "\xF9",
      "&uharl;": "\u21BF",
      "&uharr;": "\u21BE",
      "&uhblk;": "\u2580",
      "&ulcorn;": "\u231C",
      "&ulcorner;": "\u231C",
      "&ulcrop;": "\u230F",
      "&ultri;": "\u25F8",
      "&umacr;": "\u016B",
      "&uml": "\xA8",
      "&uml;": "\xA8",
      "&uogon;": "\u0173",
      "&uopf;": "\u{1D566}",
      "&uparrow;": "\u2191",
      "&updownarrow;": "\u2195",
      "&upharpoonleft;": "\u21BF",
      "&upharpoonright;": "\u21BE",
      "&uplus;": "\u228E",
      "&upsi;": "\u03C5",
      "&upsih;": "\u03D2",
      "&upsilon;": "\u03C5",
      "&upuparrows;": "\u21C8",
      "&urcorn;": "\u231D",
      "&urcorner;": "\u231D",
      "&urcrop;": "\u230E",
      "&uring;": "\u016F",
      "&urtri;": "\u25F9",
      "&uscr;": "\u{1D4CA}",
      "&utdot;": "\u22F0",
      "&utilde;": "\u0169",
      "&utri;": "\u25B5",
      "&utrif;": "\u25B4",
      "&uuarr;": "\u21C8",
      "&uuml": "\xFC",
      "&uuml;": "\xFC",
      "&uwangle;": "\u29A7",
      "&vArr;": "\u21D5",
      "&vBar;": "\u2AE8",
      "&vBarv;": "\u2AE9",
      "&vDash;": "\u22A8",
      "&vangrt;": "\u299C",
      "&varepsilon;": "\u03F5",
      "&varkappa;": "\u03F0",
      "&varnothing;": "\u2205",
      "&varphi;": "\u03D5",
      "&varpi;": "\u03D6",
      "&varpropto;": "\u221D",
      "&varr;": "\u2195",
      "&varrho;": "\u03F1",
      "&varsigma;": "\u03C2",
      "&varsubsetneq;": "\u228A\uFE00",
      "&varsubsetneqq;": "\u2ACB\uFE00",
      "&varsupsetneq;": "\u228B\uFE00",
      "&varsupsetneqq;": "\u2ACC\uFE00",
      "&vartheta;": "\u03D1",
      "&vartriangleleft;": "\u22B2",
      "&vartriangleright;": "\u22B3",
      "&vcy;": "\u0432",
      "&vdash;": "\u22A2",
      "&vee;": "\u2228",
      "&veebar;": "\u22BB",
      "&veeeq;": "\u225A",
      "&vellip;": "\u22EE",
      "&verbar;": "|",
      "&vert;": "|",
      "&vfr;": "\u{1D533}",
      "&vltri;": "\u22B2",
      "&vnsub;": "\u2282\u20D2",
      "&vnsup;": "\u2283\u20D2",
      "&vopf;": "\u{1D567}",
      "&vprop;": "\u221D",
      "&vrtri;": "\u22B3",
      "&vscr;": "\u{1D4CB}",
      "&vsubnE;": "\u2ACB\uFE00",
      "&vsubne;": "\u228A\uFE00",
      "&vsupnE;": "\u2ACC\uFE00",
      "&vsupne;": "\u228B\uFE00",
      "&vzigzag;": "\u299A",
      "&wcirc;": "\u0175",
      "&wedbar;": "\u2A5F",
      "&wedge;": "\u2227",
      "&wedgeq;": "\u2259",
      "&weierp;": "\u2118",
      "&wfr;": "\u{1D534}",
      "&wopf;": "\u{1D568}",
      "&wp;": "\u2118",
      "&wr;": "\u2240",
      "&wreath;": "\u2240",
      "&wscr;": "\u{1D4CC}",
      "&xcap;": "\u22C2",
      "&xcirc;": "\u25EF",
      "&xcup;": "\u22C3",
      "&xdtri;": "\u25BD",
      "&xfr;": "\u{1D535}",
      "&xhArr;": "\u27FA",
      "&xharr;": "\u27F7",
      "&xi;": "\u03BE",
      "&xlArr;": "\u27F8",
      "&xlarr;": "\u27F5",
      "&xmap;": "\u27FC",
      "&xnis;": "\u22FB",
      "&xodot;": "\u2A00",
      "&xopf;": "\u{1D569}",
      "&xoplus;": "\u2A01",
      "&xotime;": "\u2A02",
      "&xrArr;": "\u27F9",
      "&xrarr;": "\u27F6",
      "&xscr;": "\u{1D4CD}",
      "&xsqcup;": "\u2A06",
      "&xuplus;": "\u2A04",
      "&xutri;": "\u25B3",
      "&xvee;": "\u22C1",
      "&xwedge;": "\u22C0",
      "&yacute": "\xFD",
      "&yacute;": "\xFD",
      "&yacy;": "\u044F",
      "&ycirc;": "\u0177",
      "&ycy;": "\u044B",
      "&yen": "\xA5",
      "&yen;": "\xA5",
      "&yfr;": "\u{1D536}",
      "&yicy;": "\u0457",
      "&yopf;": "\u{1D56A}",
      "&yscr;": "\u{1D4CE}",
      "&yucy;": "\u044E",
      "&yuml": "\xFF",
      "&yuml;": "\xFF",
      "&zacute;": "\u017A",
      "&zcaron;": "\u017E",
      "&zcy;": "\u0437",
      "&zdot;": "\u017C",
      "&zeetrf;": "\u2128",
      "&zeta;": "\u03B6",
      "&zfr;": "\u{1D537}",
      "&zhcy;": "\u0436",
      "&zigrarr;": "\u21DD",
      "&zopf;": "\u{1D56B}",
      "&zscr;": "\u{1D4CF}",
      "&zwj;": "\u200D",
      "&zwnj;": "\u200C"
    };
    html_entities_default = htmlEntities;
  }
});

// node_modules/postal-mime/src/text-format.js
function decodeHTMLEntities(str) {
  return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match2, entity) => {
    if (typeof html_entities_default[match2] === "string") {
      return html_entities_default[match2];
    }
    if (entity.charAt(0) !== "#" || match2.charAt(match2.length - 1) !== ";") {
      return match2;
    }
    let codePoint;
    if (entity.charAt(1) === "x") {
      codePoint = parseInt(entity.substr(2), 16);
    } else {
      codePoint = parseInt(entity.substr(1), 10);
    }
    let output = "";
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "\uFFFD";
    }
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  });
}
function escapeHtml(str) {
  return str.trim().replace(/[<>"'?&]/g, (c) => {
    let hex = c.charCodeAt(0).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return "&#x" + hex.toUpperCase() + ";";
  });
}
function textToHtml(str) {
  let html = escapeHtml(str).replace(/\n/g, "<br />");
  return "<div>" + html + "</div>";
}
function htmlToText(str) {
  str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
  str = decodeHTMLEntities(str);
  return str;
}
function formatTextAddress(address) {
  return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
function formatTextAddresses(addresses) {
  let parts = [];
  let processAddress = /* @__PURE__ */ __name((address, partCounter) => {
    if (partCounter) {
      parts.push(", ");
    }
    if (address.group) {
      let groupStart = `${address.name}:`;
      let groupEnd = `;`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatTextAddress(address));
    }
  }, "processAddress");
  addresses.forEach(processAddress);
  return parts.join("");
}
function formatHtmlAddress(address) {
  return `<a href="mailto:${escapeHtml(address.address)}" class="postal-email-address">${escapeHtml(address.name || `<${address.address}>`)}</a>`;
}
function formatHtmlAddresses(addresses) {
  let parts = [];
  let processAddress = /* @__PURE__ */ __name((address, partCounter) => {
    if (partCounter) {
      parts.push('<span class="postal-email-address-separator">, </span>');
    }
    if (address.group) {
      let groupStart = `<span class="postal-email-address-group">${escapeHtml(address.name)}:</span>`;
      let groupEnd = `<span class="postal-email-address-group">;</span>`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatHtmlAddress(address));
    }
  }, "processAddress");
  addresses.forEach(processAddress);
  return parts.join(" ");
}
function foldLines(str, lineLength, afterSpace) {
  str = (str || "").toString();
  lineLength = lineLength || 76;
  let pos = 0, len = str.length, result = "", line, match2;
  while (pos < len) {
    line = str.substr(pos, lineLength);
    if (line.length < lineLength) {
      result += line;
      break;
    }
    if (match2 = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match2[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match2 = line.match(/(\s+)[^\s]*$/)) && match2[0].length - (afterSpace ? (match2[1] || "").length : 0) < line.length) {
      line = line.substr(0, line.length - (match2[0].length - (afterSpace ? (match2[1] || "").length : 0)));
    } else if (match2 = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match2[0].substr(0, match2[0].length - (!afterSpace ? (match2[1] || "").length : 0));
    }
    result += line;
    pos += line.length;
    if (pos < len) {
      result += "\r\n";
    }
  }
  return result;
}
function formatTextHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push({ key: "From", val: formatTextAddress(message.from) });
  }
  if (message.subject) {
    rows.push({ key: "Subject", val: message.subject });
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push({ key: "Date", val: dateStr });
  }
  if (message.to && message.to.length) {
    rows.push({ key: "To", val: formatTextAddresses(message.to) });
  }
  if (message.cc && message.cc.length) {
    rows.push({ key: "Cc", val: formatTextAddresses(message.cc) });
  }
  if (message.bcc && message.bcc.length) {
    rows.push({ key: "Bcc", val: formatTextAddresses(message.bcc) });
  }
  let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  rows = rows.flatMap((row) => {
    let sepLen = maxKeyLength - row.key.length;
    let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
    let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
    let foldedLines = foldLines(row.val, 80, true).split(/\r?\n/).map((line) => line.trim());
    return foldedLines.map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
  });
  let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  let lineMarker = "-".repeat(maxLineLength);
  let template = `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
  return template;
}
function formatHtmlHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push(
      `<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message.from)}</div>`
    );
  }
  if (message.subject) {
    rows.push(
      `<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml(
        message.subject
      )}</div>`
    );
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push(
      `<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml(
        message.date
      )}">${escapeHtml(dateStr)}</div>`
    );
  }
  if (message.to && message.to.length) {
    rows.push(
      `<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message.to)}</div>`
    );
  }
  if (message.cc && message.cc.length) {
    rows.push(
      `<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.cc)}</div>`
    );
  }
  if (message.bcc && message.bcc.length) {
    rows.push(
      `<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.bcc)}</div>`
    );
  }
  let template = `<div class="postal-email-header">${rows.length ? '<div class="postal-email-header-row">' : ""}${rows.join(
    '</div>\n<div class="postal-email-header-row">'
  )}${rows.length ? "</div>" : ""}</div>`;
  return template;
}
var init_text_format = __esm({
  "node_modules/postal-mime/src/text-format.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_html_entities();
    __name(decodeHTMLEntities, "decodeHTMLEntities");
    __name(escapeHtml, "escapeHtml");
    __name(textToHtml, "textToHtml");
    __name(htmlToText, "htmlToText");
    __name(formatTextAddress, "formatTextAddress");
    __name(formatTextAddresses, "formatTextAddresses");
    __name(formatHtmlAddress, "formatHtmlAddress");
    __name(formatHtmlAddresses, "formatHtmlAddresses");
    __name(foldLines, "foldLines");
    __name(formatTextHeader, "formatTextHeader");
    __name(formatHtmlHeader, "formatHtmlHeader");
  }
});

// node_modules/postal-mime/src/address-parser.js
function _handleAddress(tokens, depth) {
  let isGroup = false;
  let state = "text";
  let address;
  let addresses = [];
  let data = {
    address: [],
    comment: [],
    group: [],
    text: [],
    textWasQuoted: []
    // Track which text tokens came from inside quotes
  };
  let i;
  let len;
  let insideQuotes = false;
  for (i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];
    let prevToken = i ? tokens[i - 1] : null;
    if (token.type === "operator") {
      switch (token.value) {
        case "<":
          state = "address";
          insideQuotes = false;
          break;
        case "(":
          state = "comment";
          insideQuotes = false;
          break;
        case ":":
          state = "group";
          isGroup = true;
          insideQuotes = false;
          break;
        case '"':
          insideQuotes = !insideQuotes;
          state = "text";
          break;
        default:
          state = "text";
          insideQuotes = false;
          break;
      }
    } else if (token.value) {
      if (state === "address") {
        token.value = token.value.replace(/^[^<]*<\s*/, "");
      }
      if (prevToken && prevToken.noBreak && data[state].length) {
        data[state][data[state].length - 1] += token.value;
        if (state === "text" && insideQuotes) {
          data.textWasQuoted[data.textWasQuoted.length - 1] = true;
        }
      } else {
        data[state].push(token.value);
        if (state === "text") {
          data.textWasQuoted.push(insideQuotes);
        }
      }
    }
  }
  if (!data.text.length && data.comment.length) {
    data.text = data.comment;
    data.comment = [];
  }
  if (isGroup) {
    data.text = data.text.join(" ");
    let groupMembers = [];
    if (data.group.length) {
      let parsedGroup = addressParser(data.group.join(","), { _depth: depth + 1 });
      parsedGroup.forEach((member) => {
        if (member.group) {
          groupMembers = groupMembers.concat(member.group);
        } else {
          groupMembers.push(member);
        }
      });
    }
    addresses.push({
      name: decodeWords(data.text || address && address.name),
      group: groupMembers
    });
  } else {
    if (!data.address.length && data.text.length) {
      for (i = data.text.length - 1; i >= 0; i--) {
        if (!data.textWasQuoted[i] && data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
          data.address = data.text.splice(i, 1);
          data.textWasQuoted.splice(i, 1);
          break;
        }
      }
      let _regexHandler = /* @__PURE__ */ __name(function(address2) {
        if (!data.address.length) {
          data.address = [address2.trim()];
          return " ";
        } else {
          return address2;
        }
      }, "_regexHandler");
      if (!data.address.length) {
        for (i = data.text.length - 1; i >= 0; i--) {
          if (!data.textWasQuoted[i]) {
            data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
            if (data.address.length) {
              break;
            }
          }
        }
      }
    }
    if (!data.text.length && data.comment.length) {
      data.text = data.comment;
      data.comment = [];
    }
    if (data.address.length > 1) {
      data.text = data.text.concat(data.address.splice(1));
    }
    data.text = data.text.join(" ");
    data.address = data.address.join(" ");
    if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
      const decodedText = decodeWords(data.text);
      if (/<[^<>]+@[^<>]+>/.test(decodedText)) {
        const parsedSubAddresses = addressParser(decodedText);
        if (parsedSubAddresses && parsedSubAddresses.length) {
          return parsedSubAddresses;
        }
      }
      return [{ address: "", name: decodedText }];
    }
    address = {
      address: data.address || data.text || "",
      name: decodeWords(data.text || data.address || "")
    };
    if (address.address === address.name) {
      if ((address.address || "").match(/@/)) {
        address.name = "";
      } else {
        address.address = "";
      }
    }
    addresses.push(address);
  }
  return addresses;
}
function addressParser(str, options) {
  options = options || {};
  let depth = options._depth || 0;
  if (depth > MAX_NESTED_GROUP_DEPTH) {
    return [];
  }
  let tokenizer = new Tokenizer(str);
  let tokens = tokenizer.tokenize();
  let addresses = [];
  let address = [];
  let parsedAddresses = [];
  tokens.forEach((token) => {
    if (token.type === "operator" && (token.value === "," || token.value === ";")) {
      if (address.length) {
        addresses.push(address);
      }
      address = [];
    } else {
      address.push(token);
    }
  });
  if (address.length) {
    addresses.push(address);
  }
  addresses.forEach((address2) => {
    address2 = _handleAddress(address2, depth);
    if (address2.length) {
      parsedAddresses = parsedAddresses.concat(address2);
    }
  });
  if (options.flatten) {
    let addresses2 = [];
    let walkAddressList = /* @__PURE__ */ __name((list) => {
      list.forEach((address2) => {
        if (address2.group) {
          return walkAddressList(address2.group);
        } else {
          addresses2.push(address2);
        }
      });
    }, "walkAddressList");
    walkAddressList(parsedAddresses);
    return addresses2;
  }
  return parsedAddresses;
}
var Tokenizer, MAX_NESTED_GROUP_DEPTH, address_parser_default;
var init_address_parser = __esm({
  "node_modules/postal-mime/src/address-parser.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_decode_strings();
    __name(_handleAddress, "_handleAddress");
    Tokenizer = class {
      static {
        __name(this, "Tokenizer");
      }
      constructor(str) {
        this.str = (str || "").toString();
        this.operatorCurrent = "";
        this.operatorExpecting = "";
        this.node = null;
        this.escaped = false;
        this.list = [];
        this.operators = {
          '"': '"',
          "(": ")",
          "<": ">",
          ",": "",
          ":": ";",
          // Semicolons are not a legal delimiter per the RFC2822 grammar other
          // than for terminating a group, but they are also not valid for any
          // other use in this context.  Given that some mail clients have
          // historically allowed the semicolon as a delimiter equivalent to the
          // comma in their UI, it makes sense to treat them the same as a comma
          // when used outside of a group.
          ";": ""
        };
      }
      /**
       * Tokenizes the original input string
       *
       * @return {Array} An array of operator|text tokens
       */
      tokenize() {
        let list = [];
        for (let i = 0, len = this.str.length; i < len; i++) {
          let chr = this.str.charAt(i);
          let nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
          this.checkChar(chr, nextChr);
        }
        this.list.forEach((node) => {
          node.value = (node.value || "").toString().trim();
          if (node.value) {
            list.push(node);
          }
        });
        return list;
      }
      /**
       * Checks if a character is an operator or text and acts accordingly
       *
       * @param {String} chr Character from the address field
       */
      checkChar(chr, nextChr) {
        if (this.escaped) {
        } else if (chr === this.operatorExpecting) {
          this.node = {
            type: "operator",
            value: chr
          };
          if (nextChr && ![" ", "	", "\r", "\n", ",", ";"].includes(nextChr)) {
            this.node.noBreak = true;
          }
          this.list.push(this.node);
          this.node = null;
          this.operatorExpecting = "";
          this.escaped = false;
          return;
        } else if (!this.operatorExpecting && chr in this.operators) {
          this.node = {
            type: "operator",
            value: chr
          };
          this.list.push(this.node);
          this.node = null;
          this.operatorExpecting = this.operators[chr];
          this.escaped = false;
          return;
        } else if (this.operatorExpecting === '"' && chr === "\\") {
          this.escaped = true;
          return;
        }
        if (!this.node) {
          this.node = {
            type: "text",
            value: ""
          };
          this.list.push(this.node);
        }
        if (chr === "\n") {
          chr = " ";
        }
        if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
          this.node.value += chr;
        }
        this.escaped = false;
      }
    };
    MAX_NESTED_GROUP_DEPTH = 50;
    __name(addressParser, "addressParser");
    address_parser_default = addressParser;
  }
});

// node_modules/postal-mime/src/base64-encoder.js
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }
  return base64;
}
var init_base64_encoder = __esm({
  "node_modules/postal-mime/src/base64-encoder.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    __name(base64ArrayBuffer, "base64ArrayBuffer");
  }
});

// node_modules/postal-mime/src/postal-mime.js
function toCamelCase(key) {
  return key.replace(/-(.)/g, (o, c) => c.toUpperCase());
}
var MAX_NESTING_DEPTH, MAX_HEADERS_SIZE, PostalMime;
var init_postal_mime = __esm({
  "node_modules/postal-mime/src/postal-mime.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_mime_node();
    init_text_format();
    init_address_parser();
    init_decode_strings();
    init_base64_encoder();
    MAX_NESTING_DEPTH = 256;
    MAX_HEADERS_SIZE = 2 * 1024 * 1024;
    __name(toCamelCase, "toCamelCase");
    PostalMime = class _PostalMime {
      static {
        __name(this, "PostalMime");
      }
      static parse(buf, options) {
        const parser = new _PostalMime(options);
        return parser.parse(buf);
      }
      constructor(options) {
        this.options = options || {};
        this.mimeOptions = {
          maxNestingDepth: this.options.maxNestingDepth || MAX_NESTING_DEPTH,
          maxHeadersSize: this.options.maxHeadersSize || MAX_HEADERS_SIZE
        };
        this.root = this.currentNode = new MimeNode({
          postalMime: this,
          ...this.mimeOptions
        });
        this.boundaries = [];
        this.textContent = {};
        this.attachments = [];
        this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
        this.started = false;
      }
      async finalize() {
        await this.root.finalize();
      }
      async processLine(line, isFinal) {
        let boundaries = this.boundaries;
        if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) {
          for (let i = boundaries.length - 1; i >= 0; i--) {
            let boundary = boundaries[i];
            if (line.length < boundary.value.length + 2) {
              continue;
            }
            let boundaryMatches = true;
            for (let j = 0; j < boundary.value.length; j++) {
              if (line[j + 2] !== boundary.value[j]) {
                boundaryMatches = false;
                break;
              }
            }
            if (!boundaryMatches) {
              continue;
            }
            let boundaryEnd = boundary.value.length + 2;
            let isTerminator = false;
            if (line.length >= boundary.value.length + 4 && line[boundary.value.length + 2] === 45 && line[boundary.value.length + 3] === 45) {
              isTerminator = true;
              boundaryEnd = boundary.value.length + 4;
            }
            let hasValidTrailing = true;
            for (let j = boundaryEnd; j < line.length; j++) {
              if (line[j] !== 32 && line[j] !== 9) {
                hasValidTrailing = false;
                break;
              }
            }
            if (!hasValidTrailing) {
              continue;
            }
            if (isTerminator) {
              await boundary.node.finalize();
              this.currentNode = boundary.node.parentNode || this.root;
            } else {
              await boundary.node.finalizeChildNodes();
              this.currentNode = new MimeNode({
                postalMime: this,
                parentNode: boundary.node,
                parentMultipartType: boundary.node.contentType.multipart,
                ...this.mimeOptions
              });
            }
            if (isFinal) {
              return this.finalize();
            }
            return;
          }
        }
        this.currentNode.feed(line);
        if (isFinal) {
          return this.finalize();
        }
      }
      readLine() {
        let startPos = this.readPos;
        let endPos = this.readPos;
        while (this.readPos < this.av.length) {
          const c = this.av[this.readPos++];
          if (c !== 13 && c !== 10) {
            endPos = this.readPos;
          }
          if (c === 10) {
            return {
              bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
              done: this.readPos >= this.av.length
            };
          }
        }
        return {
          bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
          done: this.readPos >= this.av.length
        };
      }
      async processNodeTree() {
        let textContent = {};
        let textTypes = /* @__PURE__ */ new Set();
        let textMap = this.textMap = /* @__PURE__ */ new Map();
        let forceRfc822Attachments = this.forceRfc822Attachments();
        let walk = /* @__PURE__ */ __name(async (node, alternative, related) => {
          alternative = alternative || false;
          related = related || false;
          if (!node.contentType.multipart) {
            if (this.isInlineMessageRfc822(node) && !forceRfc822Attachments) {
              const subParser = new _PostalMime();
              node.subMessage = await subParser.parse(node.content);
              if (!textMap.has(node)) {
                textMap.set(node, {});
              }
              let textEntry = textMap.get(node);
              if (node.subMessage.text || !node.subMessage.html) {
                textEntry.plain = textEntry.plain || [];
                textEntry.plain.push({ type: "subMessage", value: node.subMessage });
                textTypes.add("plain");
              }
              if (node.subMessage.html) {
                textEntry.html = textEntry.html || [];
                textEntry.html.push({ type: "subMessage", value: node.subMessage });
                textTypes.add("html");
              }
              if (subParser.textMap) {
                subParser.textMap.forEach((subTextEntry, subTextNode) => {
                  textMap.set(subTextNode, subTextEntry);
                });
              }
              for (let attachment of node.subMessage.attachments || []) {
                this.attachments.push(attachment);
              }
            } else if (this.isInlineTextNode(node)) {
              let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
              let selectorNode = alternative || node;
              if (!textMap.has(selectorNode)) {
                textMap.set(selectorNode, {});
              }
              let textEntry = textMap.get(selectorNode);
              textEntry[textType] = textEntry[textType] || [];
              textEntry[textType].push({ type: "text", value: node.getTextContent() });
              textTypes.add(textType);
            } else if (node.content) {
              const filename = node.contentDisposition?.parsed?.params?.filename || node.contentType.parsed.params.name || null;
              const attachment = {
                filename: filename ? decodeWords(filename) : null,
                mimeType: node.contentType.parsed.value,
                disposition: node.contentDisposition?.parsed?.value || null
              };
              if (related && node.contentId) {
                attachment.related = true;
              }
              if (node.contentDescription) {
                attachment.description = node.contentDescription;
              }
              if (node.contentId) {
                attachment.contentId = node.contentId;
              }
              switch (node.contentType.parsed.value) {
                // Special handling for calendar events
                case "text/calendar":
                case "application/ics": {
                  if (node.contentType.parsed.params.method) {
                    attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
                  }
                  const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
                  attachment.content = textEncoder.encode(decodedText);
                  break;
                }
                // Regular attachments
                default:
                  attachment.content = node.content;
              }
              this.attachments.push(attachment);
            }
          } else if (node.contentType.multipart === "alternative") {
            alternative = node;
          } else if (node.contentType.multipart === "related") {
            related = node;
          }
          for (let childNode of node.childNodes) {
            await walk(childNode, alternative, related);
          }
        }, "walk");
        await walk(this.root, false, false);
        textMap.forEach((mapEntry) => {
          textTypes.forEach((textType) => {
            if (!textContent[textType]) {
              textContent[textType] = [];
            }
            if (mapEntry[textType]) {
              mapEntry[textType].forEach((textEntry) => {
                switch (textEntry.type) {
                  case "text":
                    textContent[textType].push(textEntry.value);
                    break;
                  case "subMessage":
                    {
                      switch (textType) {
                        case "html":
                          textContent[textType].push(formatHtmlHeader(textEntry.value));
                          break;
                        case "plain":
                          textContent[textType].push(formatTextHeader(textEntry.value));
                          break;
                      }
                    }
                    break;
                }
              });
            } else {
              let alternativeType;
              switch (textType) {
                case "html":
                  alternativeType = "plain";
                  break;
                case "plain":
                  alternativeType = "html";
                  break;
              }
              (mapEntry[alternativeType] || []).forEach((textEntry) => {
                switch (textEntry.type) {
                  case "text":
                    switch (textType) {
                      case "html":
                        textContent[textType].push(textToHtml(textEntry.value));
                        break;
                      case "plain":
                        textContent[textType].push(htmlToText(textEntry.value));
                        break;
                    }
                    break;
                  case "subMessage":
                    {
                      switch (textType) {
                        case "html":
                          textContent[textType].push(formatHtmlHeader(textEntry.value));
                          break;
                        case "plain":
                          textContent[textType].push(formatTextHeader(textEntry.value));
                          break;
                      }
                    }
                    break;
                }
              });
            }
          });
        });
        Object.keys(textContent).forEach((textType) => {
          textContent[textType] = textContent[textType].join("\n");
        });
        this.textContent = textContent;
      }
      isInlineTextNode(node) {
        if (node.contentDisposition?.parsed?.value === "attachment") {
          return false;
        }
        switch (node.contentType.parsed?.value) {
          case "text/html":
          case "text/plain":
            return true;
          case "text/calendar":
          case "text/csv":
          default:
            return false;
        }
      }
      isInlineMessageRfc822(node) {
        if (node.contentType.parsed?.value !== "message/rfc822") {
          return false;
        }
        let disposition = node.contentDisposition?.parsed?.value || (this.options.rfc822Attachments ? "attachment" : "inline");
        return disposition === "inline";
      }
      // Check if this is a specially crafted report email where message/rfc822 content should not be inlined
      forceRfc822Attachments() {
        if (this.options.forceRfc822Attachments) {
          return true;
        }
        let forceRfc822Attachments = false;
        let walk = /* @__PURE__ */ __name((node) => {
          if (!node.contentType.multipart) {
            if (node.contentType.parsed && ["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) {
              forceRfc822Attachments = true;
            }
          }
          for (let childNode of node.childNodes) {
            walk(childNode);
          }
        }, "walk");
        walk(this.root);
        return forceRfc822Attachments;
      }
      async resolveStream(stream) {
        let chunkLen = 0;
        let chunks = [];
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value);
          chunkLen += value.length;
        }
        const result = new Uint8Array(chunkLen);
        let chunkPointer = 0;
        for (let chunk of chunks) {
          result.set(chunk, chunkPointer);
          chunkPointer += chunk.length;
        }
        return result;
      }
      async parse(buf) {
        if (this.started) {
          throw new Error("Can not reuse parser, create a new PostalMime object");
        }
        this.started = true;
        if (buf && typeof buf.getReader === "function") {
          buf = await this.resolveStream(buf);
        }
        buf = buf || new ArrayBuffer(0);
        if (typeof buf === "string") {
          buf = textEncoder.encode(buf);
        }
        if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") {
          buf = await blobToArrayBuffer(buf);
        }
        if (buf.buffer instanceof ArrayBuffer) {
          buf = new Uint8Array(buf).buffer;
        }
        this.buf = buf;
        this.av = new Uint8Array(buf);
        this.readPos = 0;
        while (this.readPos < this.av.length) {
          const line = this.readLine();
          await this.processLine(line.bytes, line.done);
        }
        await this.processNodeTree();
        const message = {
          headers: this.root.headers.map((entry) => ({ key: entry.key, originalKey: entry.originalKey, value: entry.value })).reverse()
        };
        for (const key of ["from", "sender"]) {
          const addressHeader = this.root.headers.find((line) => line.key === key);
          if (addressHeader && addressHeader.value) {
            const addresses = address_parser_default(addressHeader.value);
            if (addresses && addresses.length) {
              message[key] = addresses[0];
            }
          }
        }
        for (const key of ["delivered-to", "return-path"]) {
          const addressHeader = this.root.headers.find((line) => line.key === key);
          if (addressHeader && addressHeader.value) {
            const addresses = address_parser_default(addressHeader.value);
            if (addresses && addresses.length && addresses[0].address) {
              const camelKey = toCamelCase(key);
              message[camelKey] = addresses[0].address;
            }
          }
        }
        for (const key of ["to", "cc", "bcc", "reply-to"]) {
          const addressHeaders = this.root.headers.filter((line) => line.key === key);
          let addresses = [];
          addressHeaders.filter((entry) => entry && entry.value).map((entry) => address_parser_default(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
          if (addresses && addresses.length) {
            const camelKey = toCamelCase(key);
            message[camelKey] = addresses;
          }
        }
        for (const key of ["subject", "message-id", "in-reply-to", "references"]) {
          const header = this.root.headers.find((line) => line.key === key);
          if (header && header.value) {
            const camelKey = toCamelCase(key);
            message[camelKey] = decodeWords(header.value);
          }
        }
        let dateHeader = this.root.headers.find((line) => line.key === "date");
        if (dateHeader) {
          let date = new Date(dateHeader.value);
          if (date.toString() === "Invalid Date") {
            date = dateHeader.value;
          } else {
            date = date.toISOString();
          }
          message.date = date;
        }
        if (this.textContent?.html) {
          message.html = this.textContent.html;
        }
        if (this.textContent?.plain) {
          message.text = this.textContent.plain;
        }
        message.attachments = this.attachments;
        message.headerLines = (this.root.rawHeaderLines || []).slice().reverse();
        switch (this.attachmentEncoding) {
          case "arraybuffer":
            break;
          case "base64":
            for (let attachment of message.attachments || []) {
              if (attachment?.content) {
                attachment.content = base64ArrayBuffer(attachment.content);
                attachment.encoding = "base64";
              }
            }
            break;
          case "utf8":
            let attachmentDecoder = new TextDecoder("utf8");
            for (let attachment of message.attachments || []) {
              if (attachment?.content) {
                attachment.content = attachmentDecoder.decode(attachment.content);
                attachment.encoding = "utf8";
              }
            }
            break;
          default:
            throw new Error("Unknown attachment encoding");
        }
        return message;
      }
    };
  }
});

// src/email/parser.js
async function parseEmailBody(raw2) {
  if (!raw2) return { text: "", html: "" };
  const email = await PostalMime.parse(raw2);
  return {
    text: email.text || "",
    html: email.html || ""
  };
}
function extractVerificationCode({ subject = "", text = "", html = "" } = {}) {
  const subjectText = String(subject || "");
  const textBody = String(text || "").replace(/\s+/g, " ").trim();
  const htmlBody = stripHtml(html).replace(/\s+/g, " ").trim();
  const sources = {
    subject: subjectText,
    body: (textBody || htmlBody || "").trim()
  };
  const minLen = 4;
  const maxLen = 8;
  function normalizeDigits(s) {
    const digits = String(s || "").replace(/\D+/g, "");
    if (digits.length >= minLen && digits.length <= maxLen) return digits;
    return "";
  }
  __name(normalizeDigits, "normalizeDigits");
  const kw = "(?:verification|one[-\\s]?time|two[-\\s]?factor|2fa|security|auth|login|confirm|code|otp|Verify\u7801|\u6821\u9A8C\u7801|\u9A57\u8B49\u78BC|\u78BA\u8A8D\u78BC|\u8A8D\u8B49\u78BC|\u8A8D\u8A3C\u30B3\u30FC\u30C9|\uC778\uC99D\uCF54\uB4DC|\uCF54\uB4DC)";
  const sepClass = "[\\u00A0\\s\\-\u2013\u2014_.\xB7\u2022\u2219\u2027'']";
  const codeChunk = `([0-9](?:${sepClass}?[0-9]){3,7})`;
  const subjectOrdereds = [
    new RegExp(`${kw}[^
\rd]{0,20}(?<!\\d)${codeChunk}(?!\\d)`, "i"),
    new RegExp(`(?<!\\d)${codeChunk}(?!\\d)[^
\rd]{0,20}${kw}`, "i")
  ];
  for (const r of subjectOrdereds) {
    const m = sources.subject.match(r);
    if (m && m[1]) {
      const n = normalizeDigits(m[1]);
      if (n) return n;
    }
  }
  const bodyOrdereds = [
    new RegExp(`${kw}[\\s\\S]{0,30}?(?<!\\d)${codeChunk}(?!\\d)`, "i"),
    new RegExp(`(?<!\\d)${codeChunk}(?!\\d)[\\s\\S]{0,30}?${kw}`, "i")
  ];
  for (const r of bodyOrdereds) {
    const m = sources.body.match(r);
    if (m && m[1]) {
      const n = normalizeDigits(m[1]);
      if (n) return n;
    }
  }
  const looseBodyOrdereds = [
    new RegExp(`${kw}[\\s\\S]{0,80}?(?<!\\d)${codeChunk}(?!\\d)`, "i"),
    new RegExp(`(?<!\\d)${codeChunk}(?!\\d)[\\s\\S]{0,80}?${kw}`, "i")
  ];
  for (const r of looseBodyOrdereds) {
    const m = sources.body.match(r);
    if (m && m[1]) {
      const n = normalizeDigits(m[1]);
      if (n && !isLikelyNonVerificationCode(n, sources.body)) {
        return n;
      }
    }
  }
  return "";
}
function stripHtml(html) {
  const s = String(html || "");
  return s.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&#(\d+);/g, (_, n) => {
    try {
      return String.fromCharCode(parseInt(n, 10));
    } catch (_2) {
      return " ";
    }
  }).replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}
function isLikelyNonVerificationCode(digits, context = "") {
  if (!digits) return true;
  const year = parseInt(digits, 10);
  if (digits.length === 4 && year >= 2e3 && year <= 2099) {
    return true;
  }
  if (digits.length === 5) {
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes("address") || lowerContext.includes("street") || lowerContext.includes("zip") || lowerContext.includes("postal") || /\b[a-z]{2,}\s+\d{5}\b/i.test(context)) {
      return true;
    }
  }
  const addressPattern = new RegExp(`\\b${digits}\\s+[A-Z][a-z]+(?:,|\\b)`, "i");
  if (addressPattern.test(context)) {
    return true;
  }
  return false;
}
var init_parser = __esm({
  "src/email/parser.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_postal_mime();
    __name(parseEmailBody, "parseEmailBody");
    __name(extractVerificationCode, "extractVerificationCode");
    __name(stripHtml, "stripHtml");
    __name(isLikelyNonVerificationCode, "isLikelyNonVerificationCode");
  }
});

// src/email/receiver.js
var receiver_exports = {};
__export(receiver_exports, {
  handleEmailReceive: () => handleEmailReceive
});
async function handleEmailReceive(request, db, env) {
  try {
    const emailData = await request.json();
    const to = String(emailData?.to || "");
    const from = String(emailData?.from || "");
    const subject = String(emailData?.subject || "(\u65E0Subject)");
    const text = String(emailData?.text || "");
    const html = String(emailData?.html || "");
    const rawMailbox = extractEmail(to);
    const mailbox = normalizeEmailAlias(rawMailbox);
    const sender = extractEmail(from);
    const mailboxId = await getOrCreateMailboxId(db, mailbox);
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toUTCString();
    const boundary = "mf-" + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    let eml = "";
    if (html) {
      eml = [
        `From: <${sender}>`,
        `To: <${mailbox}>`,
        `Subject: ${subject}`,
        `Date: ${dateStr}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="utf-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        text || "",
        `--${boundary}`,
        'Content-Type: text/html; charset="utf-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        html,
        `--${boundary}--`,
        ""
      ].join("\r\n");
    } else {
      eml = [
        `From: <${sender}>`,
        `To: <${mailbox}>`,
        `Subject: ${subject}`,
        `Date: ${dateStr}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="utf-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        text || "",
        ""
      ].join("\r\n");
    }
    let objectKey = "";
    try {
      const r2 = env?.MAIL_EML;
      if (r2) {
        const y = now.getUTCFullYear();
        const m = String(now.getUTCMonth() + 1).padStart(2, "0");
        const d = String(now.getUTCDate()).padStart(2, "0");
        const hh = String(now.getUTCHours()).padStart(2, "0");
        const mm = String(now.getUTCMinutes()).padStart(2, "0");
        const ss = String(now.getUTCSeconds()).padStart(2, "0");
        const keyId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const safeMailbox = (mailbox || "unknown").toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
        objectKey = `${y}/${m}/${d}/${safeMailbox}/${hh}${mm}${ss}-${keyId}.eml`;
        await r2.put(objectKey, eml, { httpMetadata: { contentType: "message/rfc822" } });
      }
    } catch (_) {
      objectKey = "";
    }
    const previewBase = (text || html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    const preview = String(previewBase || "").slice(0, 120);
    let verificationCode = "";
    try {
      verificationCode = extractVerificationCode({ subject, text, html });
    } catch (_) {
    }
    await db.prepare(`
      INSERT INTO messages (mailbox_id, sender, to_addrs, subject, verification_code, preview, r2_bucket, r2_object_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      mailboxId,
      sender,
      String(to || ""),
      subject || "(\u65E0Subject)",
      verificationCode || null,
      preview || null,
      "mail-eml",
      objectKey || ""
    ).run();
    return Response.json({ success: true });
  } catch (error) {
    console.error("\u5904\u7406Email\u65F6\u51FA\u9519:", error);
    return new Response("\u5904\u7406Email\u5931\u8D25", { status: 500 });
  }
}
var init_receiver = __esm({
  "src/email/receiver.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    init_common();
    init_db();
    init_parser();
    __name(handleEmailReceive, "handleEmailReceive");
  }
});

// .wrangler/tmp/bundle-v7IQcV/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-v7IQcV/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/server.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/index.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/hono.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/hono-base.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/compose.js
init_checked_fetch();
init_modules_watch_stub();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/request.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/http-exception.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/request/constants.js
init_checked_fetch();
init_modules_watch_stub();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
init_checked_fetch();
init_modules_watch_stub();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_checked_fetch();
init_modules_watch_stub();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
init_checked_fetch();
init_modules_watch_stub();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
init_checked_fetch();
init_modules_watch_stub();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
init_checked_fetch();
init_modules_watch_stub();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/index.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_checked_fetch();
init_modules_watch_stub();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_checked_fetch();
init_modules_watch_stub();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_checked_fetch();
init_modules_watch_stub();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/index.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/router.js
init_checked_fetch();
init_modules_watch_stub();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router4 = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router4.add(...routes[i2]);
        }
        res = router4.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router4.match.bind(router4);
      this.#routers = [router4];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/index.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/router.js
init_checked_fetch();
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/node.js
init_checked_fetch();
init_modules_watch_stub();
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// src/middleware/app.js
init_checked_fetch();
init_modules_watch_stub();

// src/middleware/auth.js
init_checked_fetch();
init_modules_watch_stub();
var COOKIE_NAME = "iding-session";
var DEFAULT_SESSION_EXPIRE_DAYS = 7;
var keyCache = /* @__PURE__ */ new Map();
async function getOrImportKey(secret, usage) {
  const k = String(secret || "");
  for (const [cacheKey, entry] of keyCache) {
    if (entry.secret === k && entry.usage === usage) {
      return cacheKey;
    }
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(k),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
  keyCache.set(key, { secret: k, usage });
  return key;
}
__name(getOrImportKey, "getOrImportKey");
function getSessionExpireSeconds(days) {
  const d = parseInt(days, 10);
  const validDays = Number.isFinite(d) && d > 0 ? d : DEFAULT_SESSION_EXPIRE_DAYS;
  return validDays * 24 * 60 * 60;
}
__name(getSessionExpireSeconds, "getSessionExpireSeconds");
async function createJwt(secret, extraPayload = {}, expireDays = DEFAULT_SESSION_EXPIRE_DAYS) {
  const header = { alg: "HS256", typ: "JWT" };
  const expireSeconds = getSessionExpireSeconds(expireDays);
  const payload = { exp: Math.floor(Date.now() / 1e3) + expireSeconds, ...extraPayload };
  const encoder = new TextEncoder();
  const data = base64UrlEncode(JSON.stringify(header)) + "." + base64UrlEncode(JSON.stringify(payload));
  const key = await getOrImportKey(secret, "sign");
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return data + "." + base64UrlEncode(new Uint8Array(signature));
}
__name(createJwt, "createJwt");
async function verifyJwt(secret, cookieHeader) {
  if (!cookieHeader) return false;
  const cookie = cookieHeader.split(";").find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return false;
  const token = cookie.split("=")[1];
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const encoder = new TextEncoder();
    const key = await getOrImportKey(secret, "verify");
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[2]), encoder.encode(parts[0] + "." + parts[1]));
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
    if (payload.exp <= Math.floor(Date.now() / 1e3)) return false;
    return payload;
  } catch (_) {
    return false;
  }
}
__name(verifyJwt, "verifyJwt");
function buildSessionCookie(token, reqUrl = "", expireDays = DEFAULT_SESSION_EXPIRE_DAYS) {
  const maxAge = getSessionExpireSeconds(expireDays);
  try {
    const u = new URL(reqUrl || "http://localhost/");
    const isHttps = u.protocol === "https:";
    const secureFlag = isHttps ? " Secure;" : "";
    return `${COOKIE_NAME}=${token}; HttpOnly;${secureFlag} Path=/; SameSite=Strict; Max-Age=${maxAge}`;
  } catch (_) {
    return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}`;
  }
}
__name(buildSessionCookie, "buildSessionCookie");
async function verifyMailboxLogin(emailAddress, password, DB) {
  if (!emailAddress || !password) return false;
  try {
    const email = emailAddress.toLowerCase().trim();
    const result = await DB.prepare("SELECT id, address, local_part, domain, password_hash, can_login FROM mailboxes WHERE address = ?").bind(email).all();
    if (result?.results?.length > 0) {
      const mailbox = result.results[0];
      if (!mailbox.can_login) {
        return false;
      }
      let passwordValid = false;
      if (mailbox.password_hash) {
        passwordValid = await verifyPassword(password, mailbox.password_hash);
      } else {
        passwordValid = password === email;
      }
      if (!passwordValid) {
        return false;
      }
      await DB.prepare("UPDATE mailboxes SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(mailbox.id).run();
      return {
        id: mailbox.id,
        address: mailbox.address,
        localPart: mailbox.local_part,
        domain: mailbox.domain,
        role: "mailbox"
      };
    }
    return false;
  } catch (error) {
    console.error("Mailbox login verification error:", error);
    return false;
  }
}
__name(verifyMailboxLogin, "verifyMailboxLogin");
async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
var HASH_PREFIX = "pbkdf2:sha256:";
async function pbkdf2Hash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    key,
    256
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return HASH_PREFIX + saltB64 + ":" + hashB64;
}
__name(pbkdf2Hash, "pbkdf2Hash");
async function verifyPassword(rawPassword, stored) {
  if (!stored) return { valid: false };
  if (stored.startsWith(HASH_PREFIX)) {
    const parts = stored.slice(HASH_PREFIX.length).split(":");
    if (parts.length !== 2) return { valid: false };
    const [saltB64, hashB64] = parts;
    try {
      const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
      const expectedHash = new Uint8Array(atob(hashB64).split("").map((c) => c.charCodeAt(0)));
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", encoder.encode(rawPassword), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
        key,
        256
      );
      const actualHash = new Uint8Array(bits);
      if (actualHash.length !== expectedHash.length) return { valid: false };
      for (let i = 0; i < actualHash.length; i++) {
        if (actualHash[i] !== expectedHash[i]) return { valid: false };
      }
      return { valid: true };
    } catch (_) {
      return { valid: false };
    }
  }
  try {
    const hex = (await sha256Hex(rawPassword)).toLowerCase();
    const valid = hex === String(stored || "").toLowerCase();
    if (valid) {
      const newHash = await pbkdf2Hash(rawPassword);
      return { valid: true, newHash };
    }
    return { valid: false };
  } catch (_) {
    return { valid: false };
  }
}
__name(verifyPassword, "verifyPassword");
async function hashPassword(password) {
  return await pbkdf2Hash(password);
}
__name(hashPassword, "hashPassword");
function base64UrlEncode(data) {
  const s = typeof data === "string" ? data : String.fromCharCode(...data instanceof Uint8Array ? data : new Uint8Array());
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+/g, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
__name(base64UrlDecode, "base64UrlDecode");
async function verifyJwtWithCache(JWT_TOKEN, cookieHeader) {
  const token = (cookieHeader.split(";").find((s) => s.trim().startsWith("iding-session=")) || "").split("=")[1] || "";
  if (!globalThis.__JWT_CACHE__) globalThis.__JWT_CACHE__ = /* @__PURE__ */ new Map();
  const now = Date.now();
  for (const [key, value] of globalThis.__JWT_CACHE__.entries()) {
    if (value.exp <= now) {
      globalThis.__JWT_CACHE__.delete(key);
    }
  }
  let payload = false;
  if (token && globalThis.__JWT_CACHE__.has(token)) {
    const cached = globalThis.__JWT_CACHE__.get(token);
    if (cached.exp > now) {
      payload = cached.payload;
    } else {
      globalThis.__JWT_CACHE__.delete(token);
    }
  }
  if (!payload) {
    payload = JWT_TOKEN ? await verifyJwt(JWT_TOKEN, cookieHeader) : false;
    if (token && payload) {
      globalThis.__JWT_CACHE__.set(token, { payload, exp: now + 30 * 60 * 1e3 });
    }
  }
  return payload;
}
__name(verifyJwtWithCache, "verifyJwtWithCache");
function checkRootAdminOverride(request, JWT_TOKEN) {
  try {
    if (!JWT_TOKEN) return null;
    const auth = request.headers.get("Authorization") || request.headers.get("authorization") || "";
    const xToken = request.headers.get("X-Admin-Token") || request.headers.get("x-admin-token") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (bearer && bearer === JWT_TOKEN) return { role: "admin", username: "__root__", userId: 0 };
    if (xToken && xToken === JWT_TOKEN) return { role: "admin", username: "__root__", userId: 0 };
    return null;
  } catch (_) {
    return null;
  }
}
__name(checkRootAdminOverride, "checkRootAdminOverride");
async function resolveAuthPayload(request, JWT_TOKEN) {
  const root = checkRootAdminOverride(request, JWT_TOKEN);
  if (root) return root;
  return await verifyJwtWithCache(JWT_TOKEN, request?.headers?.get("Cookie") || "");
}
__name(resolveAuthPayload, "resolveAuthPayload");

// src/middleware/app.js
function authMiddleware({ allowGuest = false } = {}) {
  return async (c, next) => {
    const token = c.env.JWT_TOKEN || c.env.JWT_SECRET || "";
    const root = checkRootAdminOverride(c.req.raw, token);
    if (root) {
      c.set("authPayload", root);
      return next();
    }
    const payload = await verifyJwtWithCache(token, c.req.header("Cookie") || "");
    if (!payload) {
      if (!allowGuest) return c.text("Unauthorized", 401);
      c.set("authPayload", { role: "guest", username: "guest" });
      return next();
    }
    c.set("authPayload", payload);
    return next();
  };
}
__name(authMiddleware, "authMiddleware");
function rateLimiter({ windowMs = 6e4, max = 100 } = {}) {
  const store = /* @__PURE__ */ new Map();
  const banned = /* @__PURE__ */ new Map();
  let cleanupCounter = 0;
  return async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";
    const now = Date.now();
    const banEntry = banned.get(ip);
    if (banEntry && banEntry.until > now) {
      return c.text("Too Many Requests", 429);
    }
    if (banEntry && banEntry.until <= now) {
      banned.delete(ip);
    }
    const key = `${ip}:${c.req.path}`;
    let e = store.get(key);
    if (!e || e.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (++e.count > max) {
      const prevBan = banned.get(ip);
      const duration = prevBan ? Math.min((prevBan.duration || 3e4) * 2, 6e5) : 3e4;
      banned.set(ip, { until: now + duration, duration });
      return c.text("Too Many Requests", 429);
    }
    cleanupCounter++;
    if (cleanupCounter % 10 === 0) {
      const cutoff = now - windowMs;
      for (const [k, v] of store) {
        if (v.resetAt < cutoff) store.delete(k);
      }
      for (const [k, v] of banned) {
        if (v.until < now) banned.delete(k);
      }
    }
    return next();
  };
}
__name(rateLimiter, "rateLimiter");

// src/routes/auth.js
init_checked_fetch();
init_modules_watch_stub();
init_db();
var router = new Hono2();
router.post("/api/logout", (c) => {
  const u = new URL(c.req.url);
  const isHttps = u.protocol === "https:";
  c.header("Set-Cookie", `iding-session=; HttpOnly;${isHttps ? " Secure;" : ""} Path=/; SameSite=Strict; Max-Age=0`);
  return c.json({ success: true });
});
router.post("/api/login", rateLimiter({ windowMs: 6e4, max: 10 }), async (c) => {
  let DB;
  try {
    DB = await getInitializedDatabase(c.env);
  } catch (_) {
    return c.text("Database connection failed", 500);
  }
  const ADMIN_NAME = String(c.env.ADMIN_NAME || "admin").trim().toLowerCase();
  const ADMIN_PASSWORD = c.env.ADMIN_PASSWORD || c.env.ADMIN_PASS || "";
  const GUEST_PASSWORD = c.env.GUEST_PASSWORD || "";
  const JWT_TOKEN = c.env.JWT_TOKEN || c.env.JWT_SECRET || "";
  const SESSION_EXPIRE_DAYS = parseInt(c.env.SESSION_EXPIRE_DAYS, 10) || 7;
  let body;
  try {
    body = await c.req.json();
  } catch (_) {
    return c.text("Bad Request", 400);
  }
  const name = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "").trim();
  if (!name || !password) return c.text("Username or password cannot be empty", 400);
  if (name === ADMIN_NAME && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
    let adminUserId = 0;
    try {
      const u = await DB.prepare("SELECT id FROM users WHERE username = ?").bind(ADMIN_NAME).all();
      if (u?.results?.length) {
        adminUserId = Number(u.results[0].id);
      } else {
        await DB.prepare("INSERT INTO users (username, role, can_send, mailbox_limit) VALUES (?, 'admin', 1, 9999)").bind(ADMIN_NAME).run();
        const again = await DB.prepare("SELECT id FROM users WHERE username = ?").bind(ADMIN_NAME).all();
        adminUserId = Number(again?.results?.[0]?.id || 0);
      }
    } catch (_) {
      adminUserId = 0;
    }
    const token = await createJwt(JWT_TOKEN, { role: "admin", username: ADMIN_NAME, userId: adminUserId }, SESSION_EXPIRE_DAYS);
    c.header("Set-Cookie", buildSessionCookie(token, c.req.url, SESSION_EXPIRE_DAYS));
    return c.json({ success: true, role: "admin", can_send: 1, mailbox_limit: 9999 });
  }
  if (name === "guest" && GUEST_PASSWORD && password === GUEST_PASSWORD) {
    const token = await createJwt(JWT_TOKEN, { role: "guest", username: "guest" }, SESSION_EXPIRE_DAYS);
    c.header("Set-Cookie", buildSessionCookie(token, c.req.url, SESSION_EXPIRE_DAYS));
    return c.json({ success: true, role: "guest" });
  }
  try {
    const { results } = await DB.prepare(
      "SELECT id, password_hash, role, mailbox_limit, can_send FROM users WHERE username = ?"
    ).bind(name).all();
    if (results?.length) {
      const row = results[0];
      const pwResult = await verifyPassword(password, row.password_hash || "");
      if (pwResult.valid) {
        const role = row.role === "admin" ? "admin" : "user";
        const token = await createJwt(JWT_TOKEN, { role, username: name, userId: row.id }, SESSION_EXPIRE_DAYS);
        c.header("Set-Cookie", buildSessionCookie(token, c.req.url, SESSION_EXPIRE_DAYS));
        const canSend = role === "admin" ? 1 : row.can_send ? 1 : 0;
        const mailboxLimit = role === "admin" ? row.mailbox_limit || 20 : row.mailbox_limit || 10;
        if (pwResult.newHash) {
          try {
            await DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(pwResult.newHash, row.id).run();
          } catch (_) {
          }
        }
        return c.json({ success: true, role, can_send: canSend, mailbox_limit: mailboxLimit });
      }
    }
  } catch (_) {
  }
  try {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) {
      const info = await verifyMailboxLogin(name, password, DB);
      if (info) {
        const token = await createJwt(JWT_TOKEN, {
          role: "mailbox",
          username: name,
          mailboxId: info.id,
          mailboxAddress: info.address
        }, SESSION_EXPIRE_DAYS);
        c.header("Set-Cookie", buildSessionCookie(token, c.req.url, SESSION_EXPIRE_DAYS));
        return c.json({ success: true, role: "mailbox", mailbox: info.address, can_send: 0, mailbox_limit: 1 });
      }
    }
  } catch (_) {
  }
  return c.text("Invalid username or password", 401);
});
var auth_default = router;

// src/routes/api.js
init_checked_fetch();
init_modules_watch_stub();
init_db();

// src/api/index.js
init_checked_fetch();
init_modules_watch_stub();

// src/api/users.js
init_checked_fetch();
init_modules_watch_stub();

// src/api/helpers.js
init_checked_fetch();
init_modules_watch_stub();
init_common();
function getJwtPayload(request, options = {}) {
  if (options && options.authPayload) return options.authPayload;
  try {
    const cookie = request.headers.get("Cookie") || "";
    const token = (cookie.split(";").find((s) => s.trim().startsWith("iding-session=")) || "").split("=")[1] || "";
    const parts = token.split(".");
    if (parts.length === 3) {
      const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    }
  } catch (_) {
  }
  return null;
}
__name(getJwtPayload, "getJwtPayload");
function isStrictAdmin(request, options = {}) {
  const p = getJwtPayload(request, options);
  if (!p) return false;
  if (p.role !== "admin") return false;
  if (String(p.username || "") === "__root__") return true;
  if (options?.adminName) {
    return String(p.username || "").toLowerCase() === String(options.adminName || "").toLowerCase();
  }
  return true;
}
__name(isStrictAdmin, "isStrictAdmin");
function errorResponse(message, status = 400) {
  return new Response(message, { status });
}
__name(errorResponse, "errorResponse");
function normalizeEmailAddress(address) {
  const s = String(address || "").trim().toLowerCase();
  const m = s.match(/<([^>]+)>/);
  return (m ? m[1] : s).trim();
}
__name(normalizeEmailAddress, "normalizeEmailAddress");
function getAuthContext(request, options = {}) {
  const payload = getJwtPayload(request, options) || {};
  return {
    payload,
    strictAdmin: isStrictAdmin(request, options),
    role: payload.role || "",
    userId: Number(payload.userId || 0),
    mailboxId: Number(payload.mailboxId || 0),
    mailboxAddress: normalizeEmailAddress(payload.mailboxAddress || "")
  };
}
__name(getAuthContext, "getAuthContext");
async function getMailboxAccess(db, request, options = {}, { mailboxId = null, address = "" } = {}) {
  const ctx = getAuthContext(request, options);
  let mailbox = null;
  if (mailboxId) {
    mailbox = await db.prepare("SELECT id, address FROM mailboxes WHERE id = ? LIMIT 1").bind(Number(mailboxId)).first();
  } else {
    const normalized = normalizeEmailAddress(address);
    if (normalized) {
      mailbox = await db.prepare("SELECT id, address FROM mailboxes WHERE address = ? LIMIT 1").bind(normalized).first();
    }
  }
  if (!mailbox) {
    return { exists: false, allowed: false, mailbox: null };
  }
  if (ctx.strictAdmin) {
    return { exists: true, allowed: true, mailbox };
  }
  if (ctx.role === "mailbox") {
    const sameId = ctx.mailboxId && Number(mailbox.id) === ctx.mailboxId;
    const sameAddress = ctx.mailboxAddress && normalizeEmailAddress(mailbox.address) === ctx.mailboxAddress;
    return { exists: true, allowed: !!(sameId || sameAddress), mailbox };
  }
  if (ctx.userId) {
    const own = await db.prepare(
      "SELECT 1 FROM user_mailboxes WHERE user_id = ? AND mailbox_id = ? LIMIT 1"
    ).bind(ctx.userId, Number(mailbox.id)).first();
    return { exists: true, allowed: !!own, mailbox };
  }
  return { exists: true, allowed: false, mailbox };
}
__name(getMailboxAccess, "getMailboxAccess");
async function getMessageAccess(db, request, options = {}, messageId) {
  const id = Number(messageId || 0);
  if (!id) return { exists: false, allowed: false, message: null };
  const message = await db.prepare("SELECT id, mailbox_id FROM messages WHERE id = ? LIMIT 1").bind(id).first();
  if (!message) return { exists: false, allowed: false, message: null };
  const access = await getMailboxAccess(db, request, options, { mailboxId: message.mailbox_id });
  return { exists: true, allowed: access.allowed, message, mailbox: access.mailbox };
}
__name(getMessageAccess, "getMessageAccess");
async function getSentEmailAccess(db, request, options = {}, identifier, by = "id") {
  const column = by === "resend_id" ? "resend_id" : "id";
  const value = by === "resend_id" ? String(identifier || "") : Number(identifier || 0);
  if (!value) return { exists: false, allowed: false, sent: null };
  const sent = await db.prepare(
    `SELECT id, resend_id, from_addr FROM sent_emails WHERE ${column} = ? LIMIT 1`
  ).bind(value).first();
  if (!sent) return { exists: false, allowed: false, sent: null };
  const ctx = getAuthContext(request, options);
  if (ctx.strictAdmin) {
    return { exists: true, allowed: true, sent, mailbox: null };
  }
  const access = await getMailboxAccess(db, request, options, { address: sent.from_addr });
  return { exists: true, allowed: access.allowed, sent, mailbox: access.mailbox };
}
__name(getSentEmailAccess, "getSentEmailAccess");

// src/api/mock.js
init_checked_fetch();
init_modules_watch_stub();
var MOCK_DOMAINS = ["exa.cc", "exr.yp", "duio.ty"];
function initMockUsers() {
  if (!globalThis.__MOCK_USERS__) {
    const now = /* @__PURE__ */ new Date();
    globalThis.__MOCK_USERS__ = [
      { id: 1, username: "demo1", role: "user", can_send: 0, mailbox_limit: 5, created_at: now.toISOString().replace("T", " ").slice(0, 19) },
      { id: 2, username: "demo2", role: "user", can_send: 0, mailbox_limit: 8, created_at: now.toISOString().replace("T", " ").slice(0, 19) },
      { id: 3, username: "operator", role: "admin", can_send: 0, mailbox_limit: 20, created_at: now.toISOString().replace("T", " ").slice(0, 19) }
    ];
    globalThis.__MOCK_USER_MAILBOXES__ = /* @__PURE__ */ new Map();
    try {
      for (const u of globalThis.__MOCK_USERS__) {
        const maxCount = Math.min(u.mailbox_limit || 10, 8);
        const minCount = Math.min(3, maxCount);
        const count = Math.max(minCount, Math.min(maxCount, Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount));
        const boxes = buildMockMailboxes(count, 0, MOCK_DOMAINS);
        globalThis.__MOCK_USER_MAILBOXES__.set(u.id, boxes);
      }
    } catch (_) {
    }
    globalThis.__MOCK_USER_LAST_ID__ = 3;
  }
}
__name(initMockUsers, "initMockUsers");
function buildMockEmails(count = 5) {
  const senders = ["support@example.com", "noreply@service.com", "admin@mock.test"];
  const subjects = [
    "[\u6F14\u793A\u6570\u636E] \u6B22\u8FCE\u4F7F\u7528Temporary Mailbox",
    "[\u6F14\u793A\u6570\u636E] \u60A8\u7684Verify\u7801\u662F 123456",
    "[\u6F14\u793A\u6570\u636E] \u8BA2\u5355\u5DF2\u53D1\u8D27",
    "[\u6F14\u793A\u6570\u636E] Password\u91CD\u7F6E\u8BF7\u6C42",
    "[\u6F14\u793A\u6570\u636E] \u8D26\u6237\u5B89\u5168\u63D0\u9192"
  ];
  const previews = [
    "\u8FD9\u662F\u4E00\u5C01\u6F14\u793AEmail\uFF0C\u7528\u4E8E\u5C55\u793A\u7CFB\u7EDF\u529F\u80FD...",
    "\u60A8\u7684Verify\u7801\u662F 123456\uFF0C\u8BF7\u57285\u5206\u949F\u5185\u4F7F\u7528...",
    "\u60A8\u7684\u8BA2\u5355\u5DF2\u53D1\u8D27\uFF0C\u9884\u8BA13-5\u5929\u9001\u8FBE...",
    "\u60A8\u8BF7\u6C42\u91CD\u7F6EPassword\uFF0C\u8BF7\u70B9\u51FB\u94FE\u63A5...",
    "\u68C0\u6D4B\u5230\u60A8\u7684\u8D26\u6237\u6709\u5F02\u5E38Sign In..."
  ];
  const emails = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    emails.push({
      id: 1e3 + i,
      sender: senders[i % senders.length],
      subject: subjects[i % subjects.length],
      received_at: new Date(now - i * 36e5).toISOString(),
      is_read: i > 2 ? 1 : 0,
      preview: previews[i % previews.length],
      verification_code: i === 1 ? "123456" : null
    });
  }
  return emails;
}
__name(buildMockEmails, "buildMockEmails");
function buildMockMailboxes(count = 5, offset = 0, domains = MOCK_DOMAINS) {
  const mailboxes = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const idx = offset + i;
    const domain = domains[idx % domains.length];
    const local = `demo${String(idx + 1).padStart(3, "0")}`;
    mailboxes.push({
      id: 2e3 + idx,
      address: `${local}@${domain}`,
      created_at: new Date(now - idx * 864e5).toISOString().replace("T", " ").slice(0, 19),
      is_pinned: idx < 2 ? 1 : 0,
      password_is_default: 1,
      can_login: 0,
      forward_to: null,
      is_favorite: idx < 1 ? 1 : 0
    });
  }
  return mailboxes;
}
__name(buildMockMailboxes, "buildMockMailboxes");
function buildMockEmailDetail(emailId) {
  return {
    id: Number(emailId),
    sender: "support@example.com",
    to_addrs: "demo@exa.cc",
    subject: "[\u6F14\u793A\u6570\u636E] \u8FD9\u662F\u4E00\u5C01\u6F14\u793AEmail",
    verification_code: "123456",
    preview: "\u8FD9\u662F\u6F14\u793AEmail\u7684Message\u9884\u89C8...",
    content: "\u8FD9\u662F\u6F14\u793AEmail\u7684\u7EAF\u6587\u672CMessage\u3002\n\n\u60A8\u7684Verify\u7801\u662F\uFF1A123456\n\n\u8BF7\u57285\u5206\u949F\u5185\u4F7F\u7528\u3002",
    html_content: '<div style="padding:20px;"><h2>\u6F14\u793AEmail</h2><p>\u60A8\u7684Verify\u7801\u662F\uFF1A<strong>123456</strong></p><p>\u8BF7\u57285\u5206\u949F\u5185\u4F7F\u7528\u3002</p></div>',
    received_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_read: 1,
    r2_bucket: null,
    r2_object_key: null
  };
}
__name(buildMockEmailDetail, "buildMockEmailDetail");

// src/api/users.js
init_db();
async function handleUsersApi(request, db, url, path, options) {
  const isMock = !!options.mockOnly;
  if (isMock) {
    initMockUsers();
  }
  if (isMock && path === "/api/users" && request.method === "GET") {
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
    const sort = url.searchParams.get("sort") || "desc";
    let list = (globalThis.__MOCK_USERS__ || []).map((u) => {
      const boxes = globalThis.__MOCK_USER_MAILBOXES__?.get(u.id) || [];
      return { ...u, mailbox_count: boxes.length };
    });
    list.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sort === "asc" ? dateA - dateB : dateB - dateA;
    });
    const result = list.slice(offset, offset + limit);
    return Response.json(result);
  }
  if (isMock && path === "/api/users" && request.method === "POST") {
    try {
      const body = await request.json();
      const username = String(body.username || "").trim().toLowerCase();
      if (!username) return errorResponse("Username\u4E0D\u80FD\u4E3A\u7A7A", 400);
      const exists = (globalThis.__MOCK_USERS__ || []).some((u) => u.username === username);
      if (exists) return errorResponse("Username\u5DF2\u5B58\u5728", 400);
      const role = body.role === "admin" ? "admin" : "user";
      const mailbox_limit = Math.max(0, Number(body.mailboxLimit || 10));
      const id = ++globalThis.__MOCK_USER_LAST_ID__;
      const item = { id, username, role, can_send: 0, mailbox_limit, created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19) };
      globalThis.__MOCK_USERS__.unshift(item);
      return Response.json(item);
    } catch (e) {
      return errorResponse("Create failed", 500);
    }
  }
  if (isMock && request.method === "PATCH" && path.startsWith("/api/users/")) {
    const id = Number(path.split("/")[3]);
    const list = globalThis.__MOCK_USERS__ || [];
    const idx = list.findIndex((u) => u.id === id);
    if (idx < 0) return errorResponse("\u672A\u627E\u5230User", 404);
    try {
      const body = await request.json();
      if (typeof body.mailboxLimit !== "undefined") list[idx].mailbox_limit = Math.max(0, Number(body.mailboxLimit));
      if (typeof body.role === "string") list[idx].role = body.role === "admin" ? "admin" : "user";
      if (typeof body.can_send !== "undefined") list[idx].can_send = body.can_send ? 1 : 0;
      return Response.json({ success: true });
    } catch (_) {
      return errorResponse("\u66F4\u65B0\u5931\u8D25", 500);
    }
  }
  if (isMock && request.method === "DELETE" && path.startsWith("/api/users/")) {
    const id = Number(path.split("/")[3]);
    const list = globalThis.__MOCK_USERS__ || [];
    const idx = list.findIndex((u) => u.id === id);
    if (idx < 0) return errorResponse("\u672A\u627E\u5230User", 404);
    list.splice(idx, 1);
    globalThis.__MOCK_USER_MAILBOXES__?.delete(id);
    return Response.json({ success: true });
  }
  if (isMock && path === "/api/users/assign" && request.method === "POST") {
    try {
      const body = await request.json();
      const username = String(body.username || "").trim().toLowerCase();
      const address = String(body.address || "").trim().toLowerCase();
      const u = (globalThis.__MOCK_USERS__ || []).find((x) => x.username === username);
      if (!u) return errorResponse("User\u4E0D\u5B58\u5728", 404);
      const boxes = globalThis.__MOCK_USER_MAILBOXES__?.get(u.id) || [];
      if (boxes.length >= (u.mailbox_limit || 10)) return errorResponse("\u5DF2\u8FBE\u5230Mailbox\u4E0A\u9650", 400);
      const item = { address, created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19), is_pinned: 0 };
      boxes.unshift(item);
      globalThis.__MOCK_USER_MAILBOXES__?.set(u.id, boxes);
      return Response.json({ success: true });
    } catch (_) {
      return errorResponse("Assign\u5931\u8D25", 500);
    }
  }
  if (isMock && path === "/api/users/unassign" && request.method === "POST") {
    try {
      const body = await request.json();
      const username = String(body.username || "").trim().toLowerCase();
      const address = String(body.address || "").trim().toLowerCase();
      const u = (globalThis.__MOCK_USERS__ || []).find((x) => x.username === username);
      if (!u) return errorResponse("User\u4E0D\u5B58\u5728", 404);
      const boxes = globalThis.__MOCK_USER_MAILBOXES__?.get(u.id) || [];
      const index = boxes.findIndex((box) => box.address === address);
      if (index === -1) return errorResponse("\u8BE5Mailbox\u672AAssign\u7ED9\u8BE5User", 400);
      boxes.splice(index, 1);
      globalThis.__MOCK_USER_MAILBOXES__?.set(u.id, boxes);
      return Response.json({ success: true });
    } catch (_) {
      return errorResponse("CancelAssign\u5931\u8D25", 500);
    }
  }
  if (isMock && request.method === "GET" && path.startsWith("/api/users/") && path.endsWith("/mailboxes")) {
    const id = Number(path.split("/")[3]);
    const all = globalThis.__MOCK_USER_MAILBOXES__?.get(id) || [];
    const n = Math.min(all.length, Math.max(3, Math.min(8, Math.floor(Math.random() * 6) + 3)));
    const list = all.slice(0, n);
    return Response.json(list);
  }
  if (!isMock && path === "/api/users" && request.method === "GET") {
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
    const sort = url.searchParams.get("sort") || "desc";
    try {
      const users = await listUsersWithCounts(db, { limit, offset, sort });
      return Response.json(users);
    } catch (e) {
      return errorResponse("\u67E5\u8BE2\u5931\u8D25", 500);
    }
  }
  if (!isMock && path === "/api/users" && request.method === "POST") {
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    try {
      const body = await request.json();
      const username = String(body.username || "").trim();
      const role = (body.role || "user") === "admin" ? "admin" : "user";
      const mailboxLimit = Number(body.mailboxLimit || 10);
      const password = String(body.password || "").trim();
      let passwordHash = null;
      if (password) {
        passwordHash = await hashPassword(password);
      }
      const user = await createUser(db, { username, passwordHash, role, mailboxLimit });
      return Response.json(user);
    } catch (e) {
      return errorResponse("Create failed: " + (e?.message || e), 500);
    }
  }
  if (!isMock && request.method === "PATCH" && path.startsWith("/api/users/")) {
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    const id = Number(path.split("/")[3]);
    if (!id) return errorResponse("\u65E0\u6548ID", 400);
    try {
      const body = await request.json();
      const fields = {};
      if (typeof body.mailboxLimit !== "undefined") fields.mailbox_limit = Math.max(0, Number(body.mailboxLimit));
      if (typeof body.role === "string") fields.role = body.role === "admin" ? "admin" : "user";
      if (typeof body.can_send !== "undefined") fields.can_send = body.can_send ? 1 : 0;
      if (typeof body.password === "string" && body.password) {
        fields.password_hash = await hashPassword(String(body.password));
      }
      await updateUser(db, id, fields);
      return Response.json({ success: true });
    } catch (e) {
      return errorResponse("\u66F4\u65B0\u5931\u8D25: " + (e?.message || e), 500);
    }
  }
  if (!isMock && request.method === "DELETE" && path.startsWith("/api/users/")) {
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    const id = Number(path.split("/")[3]);
    if (!id) return errorResponse("\u65E0\u6548ID", 400);
    try {
      await deleteUser(db, id);
      return Response.json({ success: true });
    } catch (e) {
      return errorResponse("Delete failed: " + (e?.message || e), 500);
    }
  }
  if (!isMock && path === "/api/users/assign" && request.method === "POST") {
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    try {
      const body = await request.json();
      const username = String(body.username || "").trim();
      const address = String(body.address || "").trim().toLowerCase();
      if (!username || !address) return errorResponse("\u53C2\u6570\u4E0D\u5B8C\u6574", 400);
      const result = await assignMailboxToUser(db, { username, address });
      return Response.json(result);
    } catch (e) {
      return errorResponse("Assign\u5931\u8D25: " + (e?.message || e), 500);
    }
  }
  if (!isMock && path === "/api/users/unassign" && request.method === "POST") {
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    try {
      const body = await request.json();
      const username = String(body.username || "").trim();
      const address = String(body.address || "").trim().toLowerCase();
      if (!username || !address) return errorResponse("\u53C2\u6570\u4E0D\u5B8C\u6574", 400);
      const result = await unassignMailboxFromUser(db, { username, address });
      return Response.json(result);
    } catch (e) {
      return errorResponse("CancelAssign\u5931\u8D25: " + (e?.message || e), 500);
    }
  }
  if (!isMock && request.method === "GET" && path.startsWith("/api/users/") && path.endsWith("/mailboxes")) {
    const id = Number(path.split("/")[3]);
    if (!id) return errorResponse("\u65E0\u6548ID", 400);
    const payload = getJwtPayload(request, options);
    const self = Number(payload?.userId || 0) === id;
    if (!isStrictAdmin(request, options) && !self) return errorResponse("Forbidden", 403);
    try {
      const list = await getUserMailboxes(db, id);
      return Response.json(list || []);
    } catch (e) {
      return errorResponse("\u67E5\u8BE2\u5931\u8D25", 500);
    }
  }
  return null;
}
__name(handleUsersApi, "handleUsersApi");

// src/api/mailboxes.js
init_checked_fetch();
init_modules_watch_stub();
init_common();
init_cache();
init_db();

// src/api/mailboxAdmin.js
init_checked_fetch();
init_modules_watch_stub();
init_cache();
init_db();

// src/api/mailboxSettings.js
init_checked_fetch();
init_modules_watch_stub();
init_common();
async function canUserAccessMailbox(db, user, mailboxId) {
  if (user.role === "strictAdmin") {
    return true;
  }
  if ((user.role === "user" || user.role === "admin") && user.id) {
    const res = await db.prepare(
      "SELECT 1 FROM user_mailboxes WHERE user_id = ? AND mailbox_id = ? LIMIT 1"
    ).bind(user.id, mailboxId).all();
    return res.results && res.results.length > 0;
  }
  if (user.role === "mailbox" && user.mailboxId) {
    return user.mailboxId === mailboxId;
  }
  return false;
}
__name(canUserAccessMailbox, "canUserAccessMailbox");
async function handleSetForward(req, env) {
  try {
    const user = req.user;
    if (!user || user.role === "guest") {
      return new Response(JSON.stringify({ error: "\u65E0Permissions" }), { status: 403 });
    }
    const body = await req.json();
    const mailbox_id = Number(body.mailbox_id);
    const { forward_to } = body;
    if (!mailbox_id || isNaN(mailbox_id)) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11\u6709\u6548\u7684Mailbox ID" }), { status: 400 });
    }
    const forwardTarget = forward_to ? String(forward_to).trim() : null;
    if (forwardTarget && !isValidEmail(forwardTarget)) {
      return new Response(JSON.stringify({ error: "\u8F6C\u53D1\u76EE\u6807MailboxInvalid format" }), { status: 400 });
    }
    const db = env.TEMP_MAIL_DB;
    const mailbox = await db.prepare("SELECT id, address FROM mailboxes WHERE id = ? LIMIT 1").bind(mailbox_id).first();
    if (!mailbox) {
      return new Response(JSON.stringify({ error: "Mailbox does not exist" }), { status: 404 });
    }
    const hasAccess = await canUserAccessMailbox(db, user, mailbox_id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "No permission to modify this mailbox" }), { status: 403 });
    }
    await db.prepare("UPDATE mailboxes SET forward_to = ? WHERE id = ?").bind(forwardTarget, mailbox_id).run();
    return new Response(JSON.stringify({
      success: true,
      mailbox_id,
      forward_to: forwardTarget
    }), { status: 200 });
  } catch (error) {
    console.error("SettingsForwarding failed:", error);
    return new Response(JSON.stringify({ error: "SettingsForwarding failed" }), { status: 500 });
  }
}
__name(handleSetForward, "handleSetForward");
async function handleToggleFavorite(req, env) {
  try {
    const user = req.user;
    if (!user || user.role === "guest") {
      return new Response(JSON.stringify({ error: "\u65E0Permissions" }), { status: 403 });
    }
    const body = await req.json();
    const mailbox_id = Number(body.mailbox_id);
    if (!mailbox_id || isNaN(mailbox_id)) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11\u6709\u6548\u7684Mailbox ID" }), { status: 400 });
    }
    const db = env.TEMP_MAIL_DB;
    const mailbox = await db.prepare("SELECT id, is_favorite FROM mailboxes WHERE id = ? LIMIT 1").bind(mailbox_id).first();
    if (!mailbox) {
      return new Response(JSON.stringify({ error: "Mailbox does not exist" }), { status: 404 });
    }
    const hasAccess = await canUserAccessMailbox(db, user, mailbox_id);
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "No permission to modify this mailbox" }), { status: 403 });
    }
    const newFavorite = mailbox.is_favorite ? 0 : 1;
    await db.prepare("UPDATE mailboxes SET is_favorite = ? WHERE id = ?").bind(newFavorite, mailbox_id).run();
    return new Response(JSON.stringify({
      success: true,
      mailbox_id,
      is_favorite: newFavorite
    }), { status: 200 });
  } catch (error) {
    console.error("\u5207\u6362\u6536\u85CF\u5931\u8D25:", error);
    return new Response(JSON.stringify({ error: "\u5207\u6362\u6536\u85CF\u5931\u8D25" }), { status: 500 });
  }
}
__name(handleToggleFavorite, "handleToggleFavorite");
async function handleBatchFavorite(req, env) {
  try {
    const user = req.user;
    if (!user || user.role !== "strictAdmin") {
      return new Response(JSON.stringify({ error: "Admin permission required" }), { status: 403 });
    }
    const body = await req.json();
    const { mailbox_ids, is_favorite } = body;
    if (!Array.isArray(mailbox_ids) || mailbox_ids.length === 0) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11Mailbox ID \u5217\u8868" }), { status: 400 });
    }
    if (mailbox_ids.length > 100) {
      return new Response(JSON.stringify({ error: "You can modify at most 100 mailboxes at once" }), { status: 400 });
    }
    const db = env.TEMP_MAIL_DB;
    const favoriteValue = is_favorite ? 1 : 0;
    const placeholders = mailbox_ids.map(() => "?").join(",");
    await db.prepare(`UPDATE mailboxes SET is_favorite = ? WHERE id IN (${placeholders})`).bind(favoriteValue, ...mailbox_ids).run();
    return new Response(JSON.stringify({
      success: true,
      updated_count: mailbox_ids.length,
      is_favorite: favoriteValue
    }), { status: 200 });
  } catch (error) {
    console.error("Failed to set favorites in bulk:", error);
    return new Response(JSON.stringify({ error: "Failed to set favorites in bulk" }), { status: 500 });
  }
}
__name(handleBatchFavorite, "handleBatchFavorite");
async function handleBatchForward(req, env) {
  try {
    const user = req.user;
    if (!user || user.role !== "strictAdmin") {
      return new Response(JSON.stringify({ error: "Admin permission required" }), { status: 403 });
    }
    const body = await req.json();
    const { mailbox_ids, forward_to } = body;
    if (!Array.isArray(mailbox_ids) || mailbox_ids.length === 0) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11Mailbox ID \u5217\u8868" }), { status: 400 });
    }
    if (mailbox_ids.length > 100) {
      return new Response(JSON.stringify({ error: "You can modify at most 100 mailboxes at once" }), { status: 400 });
    }
    const forwardTarget = forward_to ? String(forward_to).trim() : null;
    if (forwardTarget && !isValidEmail(forwardTarget)) {
      return new Response(JSON.stringify({ error: "\u8F6C\u53D1\u76EE\u6807MailboxInvalid format" }), { status: 400 });
    }
    const db = env.TEMP_MAIL_DB;
    const placeholders = mailbox_ids.map(() => "?").join(",");
    await db.prepare(`UPDATE mailboxes SET forward_to = ? WHERE id IN (${placeholders})`).bind(forwardTarget, ...mailbox_ids).run();
    return new Response(JSON.stringify({
      success: true,
      updated_count: mailbox_ids.length,
      forward_to: forwardTarget
    }), { status: 200 });
  } catch (error) {
    console.error("\u6279\u91CFSettingsForwarding failed:", error);
    return new Response(JSON.stringify({ error: "\u6279\u91CFSettingsForwarding failed" }), { status: 500 });
  }
}
__name(handleBatchForward, "handleBatchForward");
async function handleBatchFavoriteByAddress(req, env) {
  try {
    const user = req.user;
    if (!user || user.role !== "strictAdmin") {
      return new Response(JSON.stringify({ error: "Admin permission required" }), { status: 403 });
    }
    const body = await req.json();
    const { addresses, is_favorite } = body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11Mailbox Address\u5217\u8868" }), { status: 400 });
    }
    if (addresses.length > 100) {
      return new Response(JSON.stringify({ error: "You can modify at most 100 mailboxes at once" }), { status: 400 });
    }
    const db = env.TEMP_MAIL_DB;
    const favoriteValue = is_favorite ? 1 : 0;
    const normalizedAddresses = addresses.map((a) => String(a || "").trim().toLowerCase()).filter((a) => a);
    if (normalizedAddresses.length === 0) {
      return new Response(JSON.stringify({ error: "\u6CA1\u6709\u6709\u6548\u7684Mailbox Address" }), { status: 400 });
    }
    const placeholders = normalizedAddresses.map(() => "?").join(",");
    const result = await db.prepare(`UPDATE mailboxes SET is_favorite = ? WHERE address IN (${placeholders})`).bind(favoriteValue, ...normalizedAddresses).run();
    return new Response(JSON.stringify({
      success: true,
      updated_count: result.meta?.changes || normalizedAddresses.length,
      is_favorite: favoriteValue
    }), { status: 200 });
  } catch (error) {
    console.error("Failed to set favorites in bulk:", error);
    return new Response(JSON.stringify({ error: "Failed to set favorites in bulk" }), { status: 500 });
  }
}
__name(handleBatchFavoriteByAddress, "handleBatchFavoriteByAddress");
async function handleBatchForwardByAddress(req, env) {
  try {
    const user = req.user;
    if (!user || user.role !== "strictAdmin") {
      return new Response(JSON.stringify({ error: "Admin permission required" }), { status: 403 });
    }
    const body = await req.json();
    const { addresses, forward_to } = body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return new Response(JSON.stringify({ error: "\u7F3A\u5C11Mailbox Address\u5217\u8868" }), { status: 400 });
    }
    if (addresses.length > 100) {
      return new Response(JSON.stringify({ error: "You can modify at most 100 mailboxes at once" }), { status: 400 });
    }
    const forwardTarget = forward_to ? String(forward_to).trim() : null;
    if (forwardTarget && !isValidEmail(forwardTarget)) {
      return new Response(JSON.stringify({ error: "\u8F6C\u53D1\u76EE\u6807MailboxInvalid format" }), { status: 400 });
    }
    const db = env.TEMP_MAIL_DB;
    const normalizedAddresses = addresses.map((a) => String(a || "").trim().toLowerCase()).filter((a) => a);
    if (normalizedAddresses.length === 0) {
      return new Response(JSON.stringify({ error: "\u6CA1\u6709\u6709\u6548\u7684Mailbox Address" }), { status: 400 });
    }
    const placeholders = normalizedAddresses.map(() => "?").join(",");
    const result = await db.prepare(`UPDATE mailboxes SET forward_to = ? WHERE address IN (${placeholders})`).bind(forwardTarget, ...normalizedAddresses).run();
    return new Response(JSON.stringify({
      success: true,
      updated_count: result.meta?.changes || normalizedAddresses.length,
      forward_to: forwardTarget
    }), { status: 200 });
  } catch (error) {
    console.error("\u6279\u91CFSettingsForwarding failed:", error);
    return new Response(JSON.stringify({ error: "\u6279\u91CFSettingsForwarding failed" }), { status: 500 });
  }
}
__name(handleBatchForwardByAddress, "handleBatchForwardByAddress");

// src/api/mailboxAdmin.js
async function handleMailboxAdminApi(request, db, url, path, options) {
  const isMock = !!options.mockOnly;
  if (path === "/api/mailboxes" && request.method === "DELETE") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EFDelete", 403);
    const raw2 = url.searchParams.get("address");
    if (!raw2) return errorResponse("\u7F3A\u5C11 address \u53C2\u6570", 400);
    const normalized = String(raw2 || "").trim().toLowerCase();
    try {
      const mailboxId = await getMailboxIdByAddress(db, normalized);
      if (!mailboxId) return new Response(JSON.stringify({ success: false, message: "Mailbox does not exist" }), { status: 404 });
      if (!isStrictAdmin(request, options)) {
        const payload = getJwtPayload(request, options);
        if (!payload || payload.role !== "admin" || !payload.userId) return errorResponse("Forbidden", 403);
        const own = await db.prepare("SELECT 1 FROM user_mailboxes WHERE user_id = ? AND mailbox_id = ? LIMIT 1").bind(Number(payload.userId), mailboxId).all();
        if (!own?.results?.length) return errorResponse("Forbidden", 403);
      }
      try {
        await db.exec("BEGIN");
      } catch (_) {
      }
      await db.prepare("DELETE FROM messages WHERE mailbox_id = ?").bind(mailboxId).run();
      const deleteResult = await db.prepare("DELETE FROM mailboxes WHERE id = ?").bind(mailboxId).run();
      try {
        await db.exec("COMMIT");
      } catch (_) {
      }
      const deleted = (deleteResult?.meta?.changes || 0) > 0;
      if (deleted) {
        invalidateMailboxCache(normalized);
        invalidateSystemStatCache("total_mailboxes");
      }
      return Response.json({ success: deleted, deleted });
    } catch (e) {
      try {
        await db.exec("ROLLBACK");
      } catch (_) {
      }
      return errorResponse("Delete failed", 500);
    }
  }
  if (path === "/api/mailboxes/reset-password" && request.method === "POST") {
    if (isMock) return Response.json({ success: true, mock: true });
    try {
      if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
      const address = String(url.searchParams.get("address") || "").trim().toLowerCase();
      if (!address) return errorResponse("\u7F3A\u5C11 address \u53C2\u6570", 400);
      await db.prepare("UPDATE mailboxes SET password_hash = NULL WHERE address = ?").bind(address).run();
      return Response.json({ success: true });
    } catch (e) {
      return errorResponse("\u91CD\u7F6E\u5931\u8D25", 500);
    }
  }
  if (path === "/api/mailboxes/toggle-login" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    try {
      const body = await request.json();
      const address = String(body.address || "").trim().toLowerCase();
      const canLogin = Boolean(body.can_login);
      if (!address) return errorResponse("\u7F3A\u5C11 address \u53C2\u6570", 400);
      const mbRes = await db.prepare("SELECT id FROM mailboxes WHERE address = ?").bind(address).all();
      if (!mbRes.results || mbRes.results.length === 0) {
        return errorResponse("Mailbox does not exist", 404);
      }
      await db.prepare("UPDATE mailboxes SET can_login = ? WHERE address = ?").bind(canLogin ? 1 : 0, address).run();
      return Response.json({ success: true, can_login: canLogin });
    } catch (e) {
      return errorResponse("Operation failed: " + e.message, 500);
    }
  }
  if (path === "/api/mailboxes/change-password" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    try {
      const body = await request.json();
      const address = String(body.address || "").trim().toLowerCase();
      const newPassword = String(body.new_password || "").trim();
      if (!address) return errorResponse("\u7F3A\u5C11 address \u53C2\u6570", 400);
      if (!newPassword || newPassword.length < 6) return errorResponse("Password\u957F\u5EA6\u81F3\u5C116\u4F4D", 400);
      const mbRes = await db.prepare("SELECT id FROM mailboxes WHERE address = ?").bind(address).all();
      if (!mbRes.results || mbRes.results.length === 0) {
        return errorResponse("Mailbox does not exist", 404);
      }
      const newPasswordHash = await sha256Hex2(newPassword);
      await db.prepare("UPDATE mailboxes SET password_hash = ? WHERE address = ?").bind(newPasswordHash, address).run();
      return Response.json({ success: true });
    } catch (e) {
      return errorResponse("Operation failed: " + e.message, 500);
    }
  }
  if (path === "/api/mailboxes/batch-toggle-login" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    try {
      const body = await request.json();
      const addresses = body.addresses || [];
      const canLogin = Boolean(body.can_login);
      if (!Array.isArray(addresses) || addresses.length === 0) {
        return errorResponse("\u7F3A\u5C11 addresses \u53C2\u6570\u6216\u5730\u5740\u5217\u8868\u4E3A\u7A7A", 400);
      }
      if (addresses.length > 100) {
        return errorResponse("\u5355\u6B21\u6700\u591A\u5904\u7406100\u4E2AMailbox", 400);
      }
      let successCount = 0;
      let failCount = 0;
      const results = [];
      const addressMap = /* @__PURE__ */ new Map();
      for (const address of addresses) {
        const normalizedAddress = String(address || "").trim().toLowerCase();
        if (!normalizedAddress) {
          failCount++;
          results.push({ address, success: false, error: "\u5730\u5740\u4E3A\u7A7A" });
          continue;
        }
        addressMap.set(normalizedAddress, address);
      }
      let existingMailboxes = /* @__PURE__ */ new Set();
      if (addressMap.size > 0) {
        try {
          const addressList = Array.from(addressMap.keys());
          const placeholders = addressList.map(() => "?").join(",");
          const checkResult = await db.prepare(
            `SELECT address FROM mailboxes WHERE address IN (${placeholders})`
          ).bind(...addressList).all();
          for (const row of checkResult.results || []) {
            existingMailboxes.add(row.address);
          }
        } catch (e) {
          console.error("\u6279\u91CFCheckMailbox\u5931\u8D25:", e);
        }
      }
      const batchStatements = [];
      for (const [normalizedAddress, originalAddress] of addressMap.entries()) {
        if (existingMailboxes.has(normalizedAddress)) {
          batchStatements.push({
            stmt: db.prepare("UPDATE mailboxes SET can_login = ? WHERE address = ?").bind(canLogin ? 1 : 0, normalizedAddress),
            address: normalizedAddress,
            type: "update"
          });
        } else {
          batchStatements.push({
            stmt: db.prepare("INSERT INTO mailboxes (address, can_login) VALUES (?, ?)").bind(normalizedAddress, canLogin ? 1 : 0),
            address: normalizedAddress,
            type: "insert"
          });
        }
      }
      if (batchStatements.length > 0) {
        try {
          const batchResults = await db.batch(batchStatements.map((s) => s.stmt));
          for (let i = 0; i < batchResults.length; i++) {
            const result = batchResults[i];
            const operation = batchStatements[i];
            if (result.success !== false) {
              successCount++;
              results.push({
                address: operation.address,
                success: true,
                [operation.type === "insert" ? "created" : "updated"]: true
              });
            } else {
              failCount++;
              results.push({
                address: operation.address,
                success: false,
                error: result.error || "Operation failed"
              });
            }
          }
        } catch (e) {
          console.error("Bulk Action\u6267\u884C\u5931\u8D25:", e);
          return errorResponse("Bulk Action\u5931\u8D25: " + e.message, 500);
        }
      }
      return Response.json({
        success: true,
        success_count: successCount,
        fail_count: failCount,
        total: addresses.length,
        results
      });
    } catch (e) {
      return errorResponse("Operation failed: " + e.message, 500);
    }
  }
  if (path === "/api/mailbox/forward" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    const payload = getJwtPayload(request, options);
    request.user = payload ? {
      id: payload.userId,
      role: payload.role === "admin" && isStrictAdmin(request, options) ? "strictAdmin" : payload.role,
      mailboxId: payload.mailboxId
    } : null;
    return await handleSetForward(request, { TEMP_MAIL_DB: db });
  }
  if (path === "/api/mailbox/favorite" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    const payload = getJwtPayload(request, options);
    request.user = payload ? {
      id: payload.userId,
      role: payload.role === "admin" && isStrictAdmin(request, options) ? "strictAdmin" : payload.role,
      mailboxId: payload.mailboxId
    } : null;
    return await handleToggleFavorite(request, { TEMP_MAIL_DB: db });
  }
  if (path === "/api/mailboxes/batch-favorite" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    request.user = { role: "strictAdmin" };
    return await handleBatchFavorite(request, { TEMP_MAIL_DB: db });
  }
  if (path === "/api/mailboxes/batch-forward" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    request.user = { role: "strictAdmin" };
    return await handleBatchForward(request, { TEMP_MAIL_DB: db });
  }
  if (path === "/api/mailboxes/batch-favorite-by-address" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    request.user = { role: "strictAdmin" };
    return await handleBatchFavoriteByAddress(request, { TEMP_MAIL_DB: db });
  }
  if (path === "/api/mailboxes/batch-forward-by-address" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    if (!isStrictAdmin(request, options)) return errorResponse("Forbidden", 403);
    request.user = { role: "strictAdmin" };
    return await handleBatchForwardByAddress(request, { TEMP_MAIL_DB: db });
  }
  if (path === "/api/mailbox/password" && request.method === "PUT") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u4FEE\u6539Password", 403);
    try {
      const body = await request.json();
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return errorResponse("\u5F53\u524DPassword\u548C\u65B0Password\u4E0D\u80FD\u4E3A\u7A7A", 400);
      }
      if (newPassword.length < 6) {
        return errorResponse("\u65B0Password\u957F\u5EA6\u81F3\u5C116\u4F4D", 400);
      }
      const payload = getJwtPayload(request, options);
      const mailboxAddress = payload?.mailboxAddress;
      const mailboxId = payload?.mailboxId;
      if (!mailboxAddress || !mailboxId) {
        return errorResponse("\u672A\u627E\u5230Mailbox\u4FE1\u606F", 401);
      }
      const { results } = await db.prepare("SELECT password_hash FROM mailboxes WHERE id = ? AND address = ?").bind(mailboxId, mailboxAddress).all();
      if (!results || results.length === 0) {
        return errorResponse("Mailbox does not exist", 404);
      }
      const mailbox = results[0];
      let currentPasswordValid = false;
      if (mailbox.password_hash) {
        const { verifyPassword: verifyPassword3 } = await Promise.resolve().then(() => (init_common(), common_exports));
        currentPasswordValid = await verifyPassword3(currentPassword, mailbox.password_hash);
      } else {
        currentPasswordValid = currentPassword === mailboxAddress;
      }
      if (!currentPasswordValid) {
        return errorResponse("\u5F53\u524DPassword\u9519\u8BEF", 400);
      }
      const newPasswordHash = await sha256Hex2(newPassword);
      await db.prepare("UPDATE mailboxes SET password_hash = ? WHERE id = ?").bind(newPasswordHash, mailboxId).run();
      return Response.json({ success: true, message: "Password\u4FEE\u6539\u6210\u529F" });
    } catch (error) {
      console.error("\u4FEE\u6539Password\u5931\u8D25:", error);
      return errorResponse("\u4FEE\u6539Password\u5931\u8D25", 500);
    }
  }
  return null;
}
__name(handleMailboxAdminApi, "handleMailboxAdminApi");

// src/api/mailboxes.js
async function handleMailboxesApi(request, db, mailDomains, url, path, options) {
  const isMock = !!options.mockOnly;
  if (path === "/api/domains" && request.method === "GET") {
    if (isMock) return Response.json(MOCK_DOMAINS);
    const domains = Array.isArray(mailDomains) ? mailDomains : [mailDomains || "temp.example.com"];
    return Response.json(domains);
  }
  if (path === "/api/generate") {
    const lengthParam = Number(url.searchParams.get("length") || 0);
    const randomId = generateRandomId(lengthParam || void 0);
    const domains = isMock ? MOCK_DOMAINS : Array.isArray(mailDomains) ? mailDomains : [mailDomains || "temp.example.com"];
    const domainIdx = Math.max(0, Math.min(domains.length - 1, Number(url.searchParams.get("domainIndex") || 0)));
    const chosenDomain = domains[domainIdx] || domains[0];
    const email = `${randomId}@${chosenDomain}`;
    if (!isMock) {
      try {
        const payload = getJwtPayload(request, options);
        if (payload?.userId) {
          await assignMailboxToUser(db, { userId: payload.userId, address: email });
          return Response.json({ email, expires: Date.now() + 36e5 });
        }
        await getOrCreateMailboxId(db, email);
        return Response.json({ email, expires: Date.now() + 36e5 });
      } catch (e) {
        return errorResponse(String(e?.message || "Create failed"), 400);
      }
    }
    return Response.json({ email, expires: Date.now() + 36e5 });
  }
  if (path === "/api/create" && request.method === "POST") {
    if (isMock) {
      try {
        const body = await request.json();
        const local = String(body.local || "").trim().toLowerCase();
        const valid = /^[a-z0-9._-]{1,64}$/i.test(local);
        if (!valid) return errorResponse("\u975E\u6CD5Username", 400);
        const domains = MOCK_DOMAINS;
        const domainIdx = Math.max(0, Math.min(domains.length - 1, Number(body.domainIndex || 0)));
        const chosenDomain = domains[domainIdx] || domains[0];
        const email = `${local}@${chosenDomain}`;
        return Response.json({ email, expires: Date.now() + 36e5 });
      } catch (_) {
        return errorResponse("Bad Request", 400);
      }
    }
    try {
      const body = await request.json();
      const local = String(body.local || "").trim().toLowerCase();
      const valid = /^[a-z0-9._-]{1,64}$/i.test(local);
      if (!valid) return errorResponse("\u975E\u6CD5Username", 400);
      const domains = Array.isArray(mailDomains) ? mailDomains : [mailDomains || "temp.example.com"];
      const domainIdx = Math.max(0, Math.min(domains.length - 1, Number(body.domainIndex || 0)));
      const chosenDomain = domains[domainIdx] || domains[0];
      const email = `${local}@${chosenDomain}`;
      try {
        const payload = getJwtPayload(request, options);
        const userId = payload?.userId;
        if (userId) {
          await assignMailboxToUser(db, { userId, address: email });
        } else {
          await getOrCreateMailboxId(db, email);
        }
        return Response.json({ email, expires: Date.now() + 36e5 });
      } catch (e) {
        return errorResponse(String(e?.message || "Create failed"), 400);
      }
    } catch (_) {
      return errorResponse("Bad Request", 400);
    }
  }
  if (path === "/api/mailbox/info" && request.method === "GET") {
    const address = url.searchParams.get("address");
    if (!address) return errorResponse("\u7F3A\u5C11Mailbox Address", 400);
    if (isMock) {
      return Response.json({
        id: 1,
        address,
        is_favorite: false,
        forward_to: null,
        can_login: false
      });
    }
    try {
      const { results } = await db.prepare(
        "SELECT id, address, is_favorite, forward_to, can_login FROM mailboxes WHERE address = ? LIMIT 1"
      ).bind(address.toLowerCase()).all();
      if (!results || results.length === 0) {
        return Response.json({
          id: null,
          address,
          is_favorite: false,
          forward_to: null,
          can_login: false
        });
      }
      const row = results[0];
      const access = await getMailboxAccess(db, request, options, { mailboxId: row.id });
      if (!access.allowed) return errorResponse("Forbidden", 403);
      return Response.json({
        id: row.id,
        address: row.address,
        is_favorite: !!row.is_favorite,
        forward_to: row.forward_to || null,
        can_login: !!row.can_login
      });
    } catch (e) {
      return errorResponse("\u67E5\u8BE2\u5931\u8D25", 500);
    }
  }
  if (path === "/api/user/quota" && request.method === "GET") {
    const payload = getJwtPayload(request, options);
    const uid = Number(payload?.userId || 0);
    const role = payload?.role || "";
    if (isMock) {
      return Response.json({ limit: 999, used: 2, remaining: 997 });
    }
    if (isStrictAdmin(request, options)) {
      const totalMailboxes = await getCachedSystemStat(db, "total_mailboxes", async () => {
        return await getTotalMailboxCount(db);
      });
      return Response.json({
        limit: -1,
        used: totalMailboxes,
        remaining: -1,
        note: "Admin\u65E0Mailbox\u6570\u91CF\u9650\u5236"
      });
    }
    if (!uid) return Response.json({ limit: 10, used: 0, remaining: 10 });
    const quota = await getCachedUserQuota(db, uid);
    return Response.json(quota);
  }
  if (path === "/api/mailboxes" && request.method === "GET") {
    if (isMock) {
      const searchParam = url.searchParams.get("q");
      const domainParam = url.searchParams.get("domain");
      const favoriteParam = url.searchParams.get("favorite");
      const forwardParam = url.searchParams.get("forward");
      let results = buildMockMailboxes(MOCK_DOMAINS);
      if (searchParam && searchParam.trim()) {
        const q = searchParam.trim().toLowerCase();
        results = results.filter((m) => m.address.toLowerCase().includes(q));
      }
      if (domainParam) {
        results = results.filter((m) => m.address.endsWith("@" + domainParam));
      }
      if (favoriteParam === "true" || favoriteParam === "1") {
        results = results.filter((m) => m.is_favorite);
      } else if (favoriteParam === "false" || favoriteParam === "0") {
        results = results.filter((m) => !m.is_favorite);
      }
      if (forwardParam === "true" || forwardParam === "1") {
        results = results.filter((m) => m.forward_to);
      } else if (forwardParam === "false" || forwardParam === "0") {
        results = results.filter((m) => !m.forward_to);
      }
      const pageParam = url.searchParams.get("page");
      const sizeParam = url.searchParams.get("size");
      const page = Math.max(1, Number(pageParam || 1));
      const size = Math.max(1, Math.min(500, Number(sizeParam || 20)));
      const total = results.length;
      const start = (page - 1) * size;
      const pageResult = results.slice(start, start + size);
      return Response.json({ list: pageResult, total });
    }
    const payload = getJwtPayload(request, options);
    const mailboxOnly = !!options.mailboxOnly;
    if (mailboxOnly && payload?.mailboxAddress) {
      try {
        const { results } = await db.prepare(`
          SELECT id, address, created_at, 0 AS is_pinned,
                 CASE WHEN (password_hash IS NULL OR password_hash = '') THEN 1 ELSE 0 END AS password_is_default,
                 COALESCE(can_login, 0) AS can_login,
                 forward_to, COALESCE(is_favorite, 0) AS is_favorite
          FROM mailboxes
          WHERE address = ?
          LIMIT 1
        `).bind(payload.mailboxAddress).all();
        return Response.json({ list: results || [], total: results?.length || 0 });
      } catch (e) {
        return Response.json({ list: [], total: 0 });
      }
    }
    try {
      const strictAdmin = isStrictAdmin(request, options);
      let uid = Number(payload?.userId || 0);
      if (!uid && strictAdmin) {
        const { results } = await db.prepare("SELECT id FROM users WHERE username = ?").bind(String(options?.adminName || "admin").toLowerCase()).all();
        if (results && results.length) {
          uid = Number(results[0].id);
        } else {
          const uname = String(options?.adminName || "admin").toLowerCase();
          await db.prepare("INSERT INTO users (username, role, can_send, mailbox_limit) VALUES (?, 'admin', 1, 9999)").bind(uname).run();
          const again = await db.prepare("SELECT id FROM users WHERE username = ?").bind(uname).all();
          uid = Number(again?.results?.[0]?.id || 0);
        }
      }
      if (!uid && !strictAdmin) return Response.json({ list: [], total: 0 });
      let limit, offset;
      const pageParam = url.searchParams.get("page");
      const sizeParam = url.searchParams.get("size");
      if (pageParam !== null || sizeParam !== null) {
        const page = Math.max(1, Number(pageParam || 1));
        const size = Math.max(1, Math.min(500, Number(sizeParam || 20)));
        limit = size;
        offset = (page - 1) * size;
      } else {
        limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") || 100)));
        offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
      }
      const bindParams = [];
      const whereConditions = [];
      const useUserFilter = !strictAdmin && uid;
      if (useUserFilter) {
        whereConditions.push("um.user_id = ?");
        bindParams.push(uid);
      }
      const searchParam = url.searchParams.get("q");
      const domainParam = url.searchParams.get("domain");
      const loginParam = url.searchParams.get("login");
      const favoriteParam = url.searchParams.get("favorite");
      const forwardParam = url.searchParams.get("forward");
      if (searchParam && searchParam.trim()) {
        whereConditions.push("m.address LIKE ?");
        bindParams.push(`%${searchParam.trim().toLowerCase()}%`);
      }
      if (domainParam) {
        whereConditions.push("m.domain = ?");
        bindParams.push(domainParam);
      }
      if (loginParam === "true" || loginParam === "1" || loginParam === "allowed") {
        whereConditions.push("m.can_login = 1");
      } else if (loginParam === "false" || loginParam === "0" || loginParam === "denied") {
        whereConditions.push("(m.can_login = 0 OR m.can_login IS NULL)");
      }
      if (favoriteParam === "true" || favoriteParam === "1" || favoriteParam === "favorite") {
        whereConditions.push("m.is_favorite = 1");
      } else if (favoriteParam === "false" || favoriteParam === "0" || favoriteParam === "not-favorite") {
        whereConditions.push("(m.is_favorite = 0 OR m.is_favorite IS NULL)");
      }
      if (forwardParam === "true" || forwardParam === "1" || forwardParam === "has-forward") {
        whereConditions.push("(m.forward_to IS NOT NULL AND m.forward_to != '')");
      } else if (forwardParam === "false" || forwardParam === "0" || forwardParam === "no-forward") {
        whereConditions.push("(m.forward_to IS NULL OR m.forward_to = '')");
      }
      const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";
      bindParams.push(limit, offset);
      const countBindParams = bindParams.slice(0, -2);
      if (strictAdmin && uid) {
        const adminBindParams = [uid, ...bindParams];
        const adminCountBindParams = [uid, ...countBindParams];
        const countResult = await db.prepare(`
          SELECT COUNT(*) as total
          FROM mailboxes m
          LEFT JOIN user_mailboxes um ON m.id = um.mailbox_id AND um.user_id = ?
          ${whereClause}
        `).bind(...adminCountBindParams).first();
        const total = countResult?.total || 0;
        const { results } = await db.prepare(`
          SELECT m.id, m.address, m.created_at, COALESCE(um.is_pinned, 0) AS is_pinned,
                 CASE WHEN (m.password_hash IS NULL OR m.password_hash = '') THEN 1 ELSE 0 END AS password_is_default,
                 COALESCE(m.can_login, 0) AS can_login,
                 m.forward_to, COALESCE(m.is_favorite, 0) AS is_favorite
          FROM mailboxes m
          LEFT JOIN user_mailboxes um ON m.id = um.mailbox_id AND um.user_id = ?
          ${whereClause}
          ORDER BY COALESCE(um.is_pinned, 0) DESC, m.created_at DESC
          LIMIT ? OFFSET ?
        `).bind(...adminBindParams).all();
        return Response.json({ list: results || [], total });
      } else if (strictAdmin) {
        const countResult = await db.prepare(`
          SELECT COUNT(*) as total
          FROM mailboxes m
          ${whereClause}
        `).bind(...countBindParams).first();
        const total = countResult?.total || 0;
        const { results } = await db.prepare(`
          SELECT m.id, m.address, m.created_at, 0 AS is_pinned,
                 CASE WHEN (m.password_hash IS NULL OR m.password_hash = '') THEN 1 ELSE 0 END AS password_is_default,
                 COALESCE(m.can_login, 0) AS can_login,
                 m.forward_to, COALESCE(m.is_favorite, 0) AS is_favorite
          FROM mailboxes m
          ${whereClause}
          ORDER BY m.created_at DESC
          LIMIT ? OFFSET ?
        `).bind(...bindParams).all();
        return Response.json({ list: results || [], total });
      } else {
        const countResult = await db.prepare(`
          SELECT COUNT(*) as total
          FROM user_mailboxes um
          JOIN mailboxes m ON m.id = um.mailbox_id
          ${whereClause}
        `).bind(...countBindParams).first();
        const total = countResult?.total || 0;
        const { results } = await db.prepare(`
          SELECT m.id, m.address, m.created_at, um.is_pinned,
                 CASE WHEN (m.password_hash IS NULL OR m.password_hash = '') THEN 1 ELSE 0 END AS password_is_default,
                 COALESCE(m.can_login, 0) AS can_login,
                 m.forward_to, COALESCE(m.is_favorite, 0) AS is_favorite
          FROM user_mailboxes um
          JOIN mailboxes m ON m.id = um.mailbox_id
          ${whereClause}
          ORDER BY um.is_pinned DESC, m.created_at DESC
          LIMIT ? OFFSET ?
        `).bind(...bindParams).all();
        return Response.json({ list: results || [], total });
      }
    } catch (_) {
      return Response.json({ list: [], total: 0 });
    }
  }
  if (path === "/api/mailboxes/pin" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    const address = url.searchParams.get("address");
    if (!address) return errorResponse("\u7F3A\u5C11 address \u53C2\u6570", 400);
    const payload = getJwtPayload(request, options);
    let uid = Number(payload?.userId || 0);
    if (!uid && isStrictAdmin(request, options)) {
      try {
        const { results } = await db.prepare("SELECT id FROM users WHERE username = ?").bind(String(options?.adminName || "admin").toLowerCase()).all();
        if (results && results.length) {
          uid = Number(results[0].id);
        } else {
          const uname = String(options?.adminName || "admin").toLowerCase();
          await db.prepare("INSERT INTO users (username, role, can_send, mailbox_limit) VALUES (?, 'admin', 1, 9999)").bind(uname).run();
          const again = await db.prepare("SELECT id FROM users WHERE username = ?").bind(uname).all();
          uid = Number(again?.results?.[0]?.id || 0);
        }
      } catch (_) {
        uid = 0;
      }
    }
    if (!uid) return errorResponse("\u672ASign In", 401);
    try {
      if (!isStrictAdmin(request, options)) {
        const access = await getMailboxAccess(db, request, options, { address });
        if (!access.exists) return errorResponse("Not Found", 404);
        if (!access.allowed) return errorResponse("Forbidden", 403);
      }
      const result = await toggleMailboxPin(db, address, uid);
      return Response.json({ success: true, ...result });
    } catch (e) {
      return errorResponse("Operation failed: " + e.message, 500);
    }
  }
  const adminResult = await handleMailboxAdminApi(request, db, url, path, options);
  if (adminResult) return adminResult;
  return null;
}
__name(handleMailboxesApi, "handleMailboxesApi");

// src/api/emails.js
init_checked_fetch();
init_modules_watch_stub();
init_common();
init_db();
init_parser();
function mailboxOnlyTimeFilter(enabled) {
  if (!enabled) return { sql: "", params: [] };
  return {
    sql: " AND received_at >= ?",
    params: [new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString()]
  };
}
__name(mailboxOnlyTimeFilter, "mailboxOnlyTimeFilter");
async function loadEmailBodyFromR2(r2, objectKey) {
  if (!r2 || !objectKey) return { content: "", html_content: "" };
  try {
    const obj = await r2.get(objectKey);
    if (!obj) return { content: "", html_content: "" };
    let raw2 = "";
    if (typeof obj.text === "function") raw2 = await obj.text();
    else if (typeof obj.arrayBuffer === "function") raw2 = await new Response(await obj.arrayBuffer()).text();
    else raw2 = await new Response(obj.body).text();
    const parsed = await parseEmailBody(raw2 || "");
    return { content: parsed.text || "", html_content: parsed.html || "" };
  } catch (_) {
    return { content: "", html_content: "" };
  }
}
__name(loadEmailBodyFromR2, "loadEmailBodyFromR2");
async function handleEmailsApi(request, db, url, path, options) {
  const isMock = !!options.mockOnly;
  const isMailboxOnly = !!options.mailboxOnly;
  const r2 = options.r2;
  if (path === "/api/emails" && request.method === "GET") {
    const mailbox = url.searchParams.get("mailbox");
    if (!mailbox) return errorResponse("\u7F3A\u5C11 mailbox \u53C2\u6570", 400);
    try {
      if (isMock) return Response.json(buildMockEmails(6));
      const normalized = extractEmail(mailbox).trim().toLowerCase();
      const mailboxId = await getMailboxIdByAddress(db, normalized);
      if (!mailboxId) return Response.json([]);
      const access = await getMailboxAccess(db, request, options, { mailboxId });
      if (!access.allowed) return errorResponse("Forbidden", 403);
      const filter = mailboxOnlyTimeFilter(isMailboxOnly);
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
      try {
        const { results } = await db.prepare(`
          SELECT id, sender, to_addrs, subject, received_at, is_read, preview, verification_code
          FROM messages
          WHERE mailbox_id = ?${filter.sql}
          ORDER BY received_at DESC
          LIMIT ?
        `).bind(mailboxId, ...filter.params, limit).all();
        return Response.json(results || []);
      } catch (_) {
        const { results } = await db.prepare(`
          SELECT id, sender, to_addrs, subject, received_at, is_read,
                 CASE WHEN content IS NOT NULL AND content <> ''
                      THEN SUBSTR(content, 1, 120)
                      ELSE SUBSTR(COALESCE(html_content, ''), 1, 120)
                 END AS preview
          FROM messages
          WHERE mailbox_id = ?${filter.sql}
          ORDER BY received_at DESC
          LIMIT ?
        `).bind(mailboxId, ...filter.params, limit).all();
        return Response.json(results || []);
      }
    } catch (e) {
      console.error("\u67E5\u8BE2Email\u5931\u8D25:", e);
      return errorResponse("\u67E5\u8BE2Email\u5931\u8D25", 500);
    }
  }
  if (path === "/api/emails/batch" && request.method === "GET") {
    try {
      const idsParam = String(url.searchParams.get("ids") || "").trim();
      if (!idsParam) return Response.json([]);
      const ids = idsParam.split(",").map((s) => parseInt(s, 10)).filter((n) => Number.isInteger(n) && n > 0);
      if (!ids.length) return Response.json([]);
      if (ids.length > 50) return errorResponse("\u5355\u6B21\u6700\u591A\u67E5\u8BE250\u5C01Email", 400);
      if (isMock) return Response.json(ids.map((id) => buildMockEmailDetail(id)));
      for (const id of ids) {
        const access = await getMessageAccess(db, request, options, id);
        if (access.exists && !access.allowed) return errorResponse("Forbidden", 403);
      }
      const filter = mailboxOnlyTimeFilter(isMailboxOnly);
      const placeholders = ids.map(() => "?").join(",");
      try {
        const { results } = await db.prepare(`
          SELECT id, sender, to_addrs, subject, verification_code, preview, r2_bucket, r2_object_key, received_at, is_read
          FROM messages WHERE id IN (${placeholders})${filter.sql}
        `).bind(...ids, ...filter.params).all();
        return Response.json(results || []);
      } catch (_) {
        const { results } = await db.prepare(`
          SELECT id, sender, to_addrs, subject, content, html_content, received_at, is_read
          FROM messages WHERE id IN (${placeholders})${filter.sql}
        `).bind(...ids, ...filter.params).all();
        return Response.json(results || []);
      }
    } catch (_) {
      return errorResponse("\u6279\u91CF\u67E5\u8BE2\u5931\u8D25", 500);
    }
  }
  if (request.method === "DELETE" && path === "/api/emails") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EFClear", 403);
    const mailbox = url.searchParams.get("mailbox");
    if (!mailbox) return errorResponse("\u7F3A\u5C11 mailbox \u53C2\u6570", 400);
    try {
      const normalized = extractEmail(mailbox).trim().toLowerCase();
      const mailboxId = await getMailboxIdByAddress(db, normalized);
      if (!mailboxId) return Response.json({ success: true, deletedCount: 0 });
      const access = await getMailboxAccess(db, request, options, { mailboxId });
      if (!access.allowed) return errorResponse("Forbidden", 403);
      const { results: toDelete } = await db.prepare(
        "SELECT r2_object_key FROM messages WHERE mailbox_id = ? AND r2_object_key IS NOT NULL"
      ).bind(mailboxId).all();
      const result = await db.prepare("DELETE FROM messages WHERE mailbox_id = ?").bind(mailboxId).run();
      const deletedCount = result?.meta?.changes || 0;
      if (r2 && toDelete?.length) {
        for (const { r2_object_key } of toDelete) {
          try {
            await r2.delete(r2_object_key);
          } catch (err) {
            console.error("Clear Mail\u65F6Delete R2 \u5BF9\u8C61\u5931\u8D25:", err);
          }
        }
      }
      return Response.json({ success: true, deletedCount });
    } catch (e) {
      console.error("Clear Mail\u5931\u8D25:", e);
      return errorResponse("Clear Mail\u5931\u8D25", 500);
    }
  }
  if (request.method === "GET" && path.startsWith("/api/email/") && path.endsWith("/download")) {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u4E0B\u8F7D", 403);
    const id = path.split("/")[3];
    const access = await getMessageAccess(db, request, options, id);
    if (!access.exists) return errorResponse("\u672A\u627E\u5230Email", 404);
    if (!access.allowed) return errorResponse("Forbidden", 403);
    const { results } = await db.prepare("SELECT r2_bucket, r2_object_key FROM messages WHERE id = ?").bind(id).all();
    const row = (results || [])[0];
    if (!row || !row.r2_object_key) return errorResponse("\u672A\u627E\u5230\u5BF9\u8C61", 404);
    try {
      if (!r2) return errorResponse("R2 \u672A\u7ED1\u5B9A", 500);
      const obj = await r2.get(row.r2_object_key);
      if (!obj) return errorResponse("\u5BF9\u8C61\u4E0D\u5B58\u5728", 404);
      const headers = new Headers({ "Content-Type": "message/rfc822" });
      headers.set("Content-Disposition", `attachment; filename="${String(row.r2_object_key).split("/").pop()}"`);
      return new Response(obj.body, { headers });
    } catch (_) {
      return errorResponse("\u4E0B\u8F7D\u5931\u8D25", 500);
    }
  }
  if (request.method === "GET" && path.startsWith("/api/email/")) {
    const emailId = path.split("/")[3];
    if (isMock) return Response.json(buildMockEmailDetail(emailId));
    const access = await getMessageAccess(db, request, options, emailId);
    if (!access.exists) return errorResponse("\u672A\u627E\u5230Email", 404);
    if (!access.allowed) return errorResponse("Forbidden", 403);
    try {
      const filter = mailboxOnlyTimeFilter(isMailboxOnly);
      const { results } = await db.prepare(`
        SELECT id, sender, to_addrs, subject, verification_code, preview, r2_bucket, r2_object_key, received_at, is_read
        FROM messages WHERE id = ?${filter.sql}
      `).bind(emailId, ...filter.params).all();
      if (!results || results.length === 0) return errorResponse("\u672A\u627E\u5230Email", 404);
      await db.prepare("UPDATE messages SET is_read = 1 WHERE id = ?").bind(emailId).run();
      const row = results[0];
      let { content, html_content } = await loadEmailBodyFromR2(r2, row.r2_object_key);
      if (!content && !html_content) {
        try {
          const fallback = await db.prepare("SELECT content, html_content FROM messages WHERE id = ?").bind(emailId).all();
          const fr = (fallback?.results || [])[0] || {};
          content = fr.content || "";
          html_content = fr.html_content || "";
        } catch (_) {
        }
      }
      return Response.json({
        ...row,
        content,
        html_content,
        download: row.r2_object_key ? `/api/email/${emailId}/download` : ""
      });
    } catch (_) {
      const { results } = await db.prepare(`
        SELECT id, sender, to_addrs, subject, content, html_content, received_at, is_read
        FROM messages WHERE id = ?
      `).bind(emailId).all();
      if (!results || !results.length) return errorResponse("\u672A\u627E\u5230Email", 404);
      await db.prepare("UPDATE messages SET is_read = 1 WHERE id = ?").bind(emailId).run();
      return Response.json(results[0]);
    }
  }
  if (request.method === "DELETE" && path.startsWith("/api/email/")) {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EFDelete", 403);
    const emailId = path.split("/")[3];
    if (!emailId || !Number.isInteger(parseInt(emailId, 10))) return errorResponse("\u65E0\u6548\u7684EmailID", 400);
    const access = await getMessageAccess(db, request, options, emailId);
    if (!access.exists) return errorResponse("\u672A\u627E\u5230Email", 404);
    if (!access.allowed) return errorResponse("Forbidden", 403);
    try {
      const row = await db.prepare("SELECT r2_object_key FROM messages WHERE id = ?").bind(emailId).first();
      const result = await db.prepare("DELETE FROM messages WHERE id = ?").bind(emailId).run();
      const deleted = (result?.meta?.changes || 0) > 0;
      if (deleted && r2 && row?.r2_object_key) {
        try {
          await r2.delete(row.r2_object_key);
        } catch (err) {
          console.error("Delete R2 \u5BF9\u8C61\u5931\u8D25:", err);
        }
      }
      return Response.json({
        success: true,
        deleted,
        message: deleted ? "Email deleted" : "Email\u4E0D\u5B58\u5728\u6216\u5DF2\u88ABDelete"
      });
    } catch (e) {
      console.error("DeleteEmail\u5931\u8D25:", e);
      return errorResponse("DeleteEmail\u65F6\u53D1\u751F\u9519\u8BEF: " + e.message, 500);
    }
  }
  return null;
}
__name(handleEmailsApi, "handleEmailsApi");

// src/api/send.js
init_checked_fetch();
init_modules_watch_stub();
init_cache();
init_db();

// src/email/sender.js
init_checked_fetch();
init_modules_watch_stub();
function parseResendConfig(resendToken) {
  const config = {};
  if (!resendToken) return config;
  try {
    const jsonConfig = JSON.parse(resendToken);
    if (typeof jsonConfig === "object" && jsonConfig !== null) {
      return jsonConfig;
    }
  } catch (_) {
  }
  const pairs = String(resendToken).split(",");
  for (const pair of pairs) {
    const [domain, apiKey] = pair.split("=").map((s) => s.trim());
    if (domain && apiKey) {
      config[domain.toLowerCase()] = apiKey;
    }
  }
  return config;
}
__name(parseResendConfig, "parseResendConfig");
function selectApiKeyForDomain(fromEmail, resendConfig) {
  if (!fromEmail) return "";
  if (typeof resendConfig === "string" && !resendConfig.includes("=")) {
    return resendConfig;
  }
  const config = typeof resendConfig === "object" ? resendConfig : parseResendConfig(resendConfig);
  const emailMatch = String(fromEmail).match(/@([^>]+)/);
  if (!emailMatch) return "";
  const domain = emailMatch[1].toLowerCase().trim();
  return config[domain] || "";
}
__name(selectApiKeyForDomain, "selectApiKeyForDomain");
function buildHeaders(apiKey) {
  return {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}
__name(buildHeaders, "buildHeaders");
function normalizeSendPayload(payload) {
  const {
    from,
    to,
    subject,
    html,
    text,
    cc,
    bcc,
    replyTo,
    headers,
    attachments,
    scheduledAt
  } = payload || {};
  const body = {
    from,
    to: Array.isArray(to) ? to : to ? [to] : [],
    subject,
    html,
    text
  };
  if (payload && typeof payload.fromName === "string" && from) {
    const displayName = payload.fromName.trim();
    if (displayName) {
      body.from = `${displayName} <${from}>`;
    }
  }
  if (cc) body.cc = Array.isArray(cc) ? cc : [cc];
  if (bcc) body.bcc = Array.isArray(bcc) ? bcc : [bcc];
  if (replyTo) body.reply_to = replyTo;
  if (headers && typeof headers === "object") body.headers = headers;
  if (attachments && Array.isArray(attachments)) body.attachments = attachments;
  if (scheduledAt) body.scheduled_at = scheduledAt;
  return body;
}
__name(normalizeSendPayload, "normalizeSendPayload");
async function sendEmailWithResend(apiKey, payload) {
  const body = normalizeSendPayload(payload);
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.error || resp.statusText || "Resend send failed";
    throw new Error(msg);
  }
  return data;
}
__name(sendEmailWithResend, "sendEmailWithResend");
async function sendEmailWithAutoResend(resendConfig, payload) {
  const apiKey = selectApiKeyForDomain(payload.from, resendConfig);
  if (!apiKey) {
    throw new Error(`\u672A\u627E\u5230\u57DF\u540D\u5BF9\u5E94\u7684API\u5BC6\u94A5: ${payload.from}`);
  }
  return await sendEmailWithResend(apiKey, payload);
}
__name(sendEmailWithAutoResend, "sendEmailWithAutoResend");
async function sendBatchWithResend(apiKey, payloads) {
  const items = Array.isArray(payloads) ? payloads.map(normalizeSendPayload) : [];
  const resp = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(items)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.error || resp.statusText || "Resend batch send failed";
    throw new Error(msg);
  }
  return data;
}
__name(sendBatchWithResend, "sendBatchWithResend");
async function sendBatchWithAutoResend(resendConfig, payloads) {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return [];
  }
  const groupedByDomain = {};
  for (const payload of payloads) {
    const apiKey = selectApiKeyForDomain(payload.from, resendConfig);
    if (!apiKey) {
      throw new Error(`\u672A\u627E\u5230\u57DF\u540D\u5BF9\u5E94\u7684API\u5BC6\u94A5: ${payload.from}`);
    }
    if (!groupedByDomain[apiKey]) {
      groupedByDomain[apiKey] = [];
    }
    groupedByDomain[apiKey].push(payload);
  }
  const results = [];
  const promises = Object.entries(groupedByDomain).map(async ([apiKey, groupPayloads]) => {
    try {
      const batchResult = await sendBatchWithResend(apiKey, groupPayloads);
      return { success: true, apiKey, results: batchResult };
    } catch (error) {
      return { success: false, apiKey, error: error.message };
    }
  });
  const batchResults = await Promise.all(promises);
  for (const batchResult of batchResults) {
    if (batchResult.success) {
      if (Array.isArray(batchResult.results)) {
        results.push(...batchResult.results);
      } else {
        results.push(batchResult.results);
      }
    } else {
      throw new Error(`\u6279\u91CF\u53D1\u9001\u5931\u8D25 (API\u5BC6\u94A5: ${batchResult.apiKey}): ${batchResult.error}`);
    }
  }
  return results;
}
__name(sendBatchWithAutoResend, "sendBatchWithAutoResend");
async function getEmailFromResend(apiKey, id) {
  const resp = await fetch(`https://api.resend.com/emails/${id}`, {
    method: "GET",
    headers: buildHeaders(apiKey)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.error || resp.statusText || "Resend get failed";
    throw new Error(msg);
  }
  return data;
}
__name(getEmailFromResend, "getEmailFromResend");
async function updateEmailInResend(apiKey, { id, scheduledAt }) {
  const body = {};
  if (scheduledAt) body.scheduled_at = scheduledAt;
  const resp = await fetch(`https://api.resend.com/emails/${id}`, {
    method: "PATCH",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.error || resp.statusText || "Resend update failed";
    throw new Error(msg);
  }
  return data;
}
__name(updateEmailInResend, "updateEmailInResend");
async function cancelEmailInResend(apiKey, id) {
  const resp = await fetch(`https://api.resend.com/emails/${id}/cancel`, {
    method: "POST",
    headers: buildHeaders(apiKey)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.error || resp.statusText || "Resend cancel failed";
    throw new Error(msg);
  }
  return data;
}
__name(cancelEmailInResend, "cancelEmailInResend");

// src/api/send.js
async function checkSendPermission(request, db, options) {
  const payload = getJwtPayload(request, options);
  if (!payload) return false;
  if (isStrictAdmin(request, options)) return true;
  if (payload.userId) {
    const cacheKey = `user_can_send_${payload.userId}`;
    const canSend = await getCachedSystemStat(db, cacheKey, async (db2) => {
      const { results } = await db2.prepare("SELECT can_send FROM users WHERE id = ?").bind(payload.userId).all();
      return results?.[0]?.can_send ? 1 : 0;
    });
    return canSend === 1;
  }
  return false;
}
__name(checkSendPermission, "checkSendPermission");
async function checkFromPermission(request, db, options, from) {
  if (isStrictAdmin(request, options)) return true;
  const access = await getMailboxAccess(db, request, options, { address: from });
  return access.exists && access.allowed;
}
__name(checkFromPermission, "checkFromPermission");
async function handleSendApi(request, db, url, path, options) {
  const isMock = !!options.mockOnly;
  const RESEND_API_KEY = options.resendApiKey || "";
  if (path === "/api/sent" && request.method === "GET") {
    if (isMock) return Response.json([]);
    const from = url.searchParams.get("from") || url.searchParams.get("mailbox") || "";
    if (!from) return errorResponse("\u7F3A\u5C11 from \u53C2\u6570", 400);
    try {
      if (!isStrictAdmin(request, options)) {
        const access = await getMailboxAccess(db, request, options, { address: from });
        if (access.exists && !access.allowed) return errorResponse("Forbidden", 403);
        if (!access.exists) return Response.json([]);
      }
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
      const { results } = await db.prepare(`
        SELECT id, resend_id, to_addrs as recipients, subject, created_at, status
        FROM sent_emails
        WHERE from_addr = ?
        ORDER BY datetime(created_at) DESC
        LIMIT ?
      `).bind(String(from).trim().toLowerCase(), limit).all();
      return Response.json(results || []);
    } catch (e) {
      console.error("\u67E5\u8BE2Sent records\u5931\u8D25:", e);
      return errorResponse("\u67E5\u8BE2Sent records\u5931\u8D25", 500);
    }
  }
  if (request.method === "GET" && path.startsWith("/api/sent/")) {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u67E5\u8BE2\u771F\u5B9E\u53D1\u9001", 403);
    const id = path.split("/")[3];
    try {
      const access = await getSentEmailAccess(db, request, options, id, "id");
      if (!access.exists) return errorResponse("\u672A\u627E\u5230\u53D1\u4EF6", 404);
      if (!access.allowed) return errorResponse("Forbidden", 403);
      const { results } = await db.prepare(`
        SELECT id, resend_id, from_addr, to_addrs as recipients, subject,
               html_content, text_content, status, scheduled_at, created_at
        FROM sent_emails WHERE id = ?
      `).bind(id).all();
      if (!results || !results.length) return errorResponse("\u672A\u627E\u5230\u53D1\u4EF6", 404);
      return Response.json(results[0]);
    } catch (_) {
      return errorResponse("\u67E5\u8BE2\u5931\u8D25", 500);
    }
  }
  if (request.method === "DELETE" && path.startsWith("/api/sent/")) {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    const id = path.split("/")[3];
    try {
      const access = await getSentEmailAccess(db, request, options, id, "id");
      if (!access.exists) return errorResponse("\u672A\u627E\u5230\u53D1\u4EF6", 404);
      if (!access.allowed) return errorResponse("Forbidden", 403);
      await db.prepare("DELETE FROM sent_emails WHERE id = ?").bind(id).run();
      return Response.json({ success: true });
    } catch (e) {
      return errorResponse("DeleteSent records\u5931\u8D25: " + e.message, 500);
    }
  }
  if (path === "/api/send" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u53D1\u9001", 403);
    try {
      if (!RESEND_API_KEY) return errorResponse("\u672AConfiguration Resend API Key", 500);
      const allowed = await checkSendPermission(request, db, options);
      if (!allowed) return errorResponse("Forbidden", 403);
      const sendPayload = await request.json();
      if (!await checkFromPermission(request, db, options, sendPayload.from)) {
        return errorResponse("Forbidden", 403);
      }
      const result = await sendEmailWithAutoResend(RESEND_API_KEY, sendPayload);
      await recordSentEmail(db, {
        resendId: result.id || null,
        fromName: sendPayload.fromName || null,
        from: sendPayload.from,
        to: sendPayload.to,
        subject: sendPayload.subject,
        html: sendPayload.html,
        text: sendPayload.text,
        status: "delivered",
        scheduledAt: sendPayload.scheduledAt || null
      });
      return Response.json({ success: true, id: result.id });
    } catch (e) {
      return errorResponse("\u53D1\u9001\u5931\u8D25: " + e.message, 500);
    }
  }
  if (path === "/api/send/batch" && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u53D1\u9001", 403);
    try {
      if (!RESEND_API_KEY) return errorResponse("\u672AConfiguration Resend API Key", 500);
      const allowed = await checkSendPermission(request, db, options);
      if (!allowed) return errorResponse("Forbidden", 403);
      const items = await request.json();
      if (!Array.isArray(items)) return errorResponse("Bad Request", 400);
      for (const item of items) {
        if (!await checkFromPermission(request, db, options, item?.from)) {
          return errorResponse("Forbidden", 403);
        }
      }
      const result = await sendBatchWithAutoResend(RESEND_API_KEY, items);
      try {
        const arr = Array.isArray(result) ? result : [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i]?.id;
          const payload = items[i] || {};
          await recordSentEmail(db, {
            resendId: id || null,
            fromName: payload.fromName || null,
            from: payload.from,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            status: "delivered",
            scheduledAt: payload.scheduledAt || null
          });
        }
      } catch (_) {
      }
      return Response.json({ success: true, result });
    } catch (e) {
      return errorResponse("\u6279\u91CF\u53D1\u9001\u5931\u8D25: " + e.message, 500);
    }
  }
  if (path.startsWith("/api/send/") && request.method === "GET") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u67E5\u8BE2\u771F\u5B9E\u53D1\u9001", 403);
    const id = path.split("/")[3];
    try {
      if (!RESEND_API_KEY) return errorResponse("\u672AConfiguration Resend API Key", 500);
      const access = await getSentEmailAccess(db, request, options, id, "resend_id");
      if (!access.exists) return errorResponse("\u672A\u627E\u5230\u53D1\u4EF6", 404);
      if (!access.allowed) return errorResponse("Forbidden", 403);
      const data = await getEmailFromResend(RESEND_API_KEY, id);
      return Response.json(data);
    } catch (e) {
      return errorResponse("\u67E5\u8BE2\u5931\u8D25: " + e.message, 500);
    }
  }
  if (path.startsWith("/api/send/") && request.method === "PATCH") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    const id = path.split("/")[3];
    try {
      if (!RESEND_API_KEY) return errorResponse("\u672AConfiguration Resend API Key", 500);
      const access = await getSentEmailAccess(db, request, options, id, "resend_id");
      if (!access.exists) return errorResponse("\u672A\u627E\u5230\u53D1\u4EF6", 404);
      if (!access.allowed) return errorResponse("Forbidden", 403);
      const body = await request.json();
      let data = { ok: true };
      if (body && typeof body.status === "string") {
        await updateSentEmail(db, id, { status: body.status });
      }
      if (body && body.scheduledAt) {
        data = await updateEmailInResend(RESEND_API_KEY, { id, scheduledAt: body.scheduledAt });
        await updateSentEmail(db, id, { scheduled_at: body.scheduledAt });
      }
      return Response.json(data || { ok: true });
    } catch (e) {
      return errorResponse("\u66F4\u65B0\u5931\u8D25: " + e.message, 500);
    }
  }
  if (path.startsWith("/api/send/") && path.endsWith("/cancel") && request.method === "POST") {
    if (isMock) return errorResponse("Demo Mode\u4E0D\u53EF\u64CD\u4F5C", 403);
    const id = path.split("/")[3];
    try {
      if (!RESEND_API_KEY) return errorResponse("\u672AConfiguration Resend API Key", 500);
      const access = await getSentEmailAccess(db, request, options, id, "resend_id");
      if (!access.exists) return errorResponse("\u672A\u627E\u5230\u53D1\u4EF6", 404);
      if (!access.allowed) return errorResponse("Forbidden", 403);
      const data = await cancelEmailInResend(RESEND_API_KEY, id);
      await updateSentEmail(db, id, { status: "canceled" });
      return Response.json(data);
    } catch (e) {
      return errorResponse("Cancel\u5931\u8D25: " + e.message, 500);
    }
  }
  return null;
}
__name(handleSendApi, "handleSendApi");

// src/api/index.js
async function handleApiRequest(request, db, mailDomains, options = {
  mockOnly: false,
  resendApiKey: "",
  adminName: "",
  r2: null,
  authPayload: null,
  mailboxOnly: false
}) {
  const url = new URL(request.url);
  const path = url.pathname;
  const isMock = !!options.mockOnly;
  const isMailboxOnly = !!options.mailboxOnly;
  if (isMailboxOnly) {
    const payload = getJwtPayload(request, options);
    const mailboxAddress = payload?.mailboxAddress;
    const mailboxId = payload?.mailboxId;
    const allowedPaths = ["/api/emails", "/api/email/", "/api/auth", "/api/quota", "/api/mailbox/info", "/api/mailbox/password"];
    const isAllowedPath = allowedPaths.some((allowedPath) => path.startsWith(allowedPath));
    if (!isAllowedPath) {
      return errorResponse("\u8BBF\u95EE\u88AB\u62D2\u7EDD", 403);
    }
    if (path === "/api/emails" && request.method === "GET") {
      const requestedMailbox = url.searchParams.get("mailbox");
      if (requestedMailbox && requestedMailbox.toLowerCase() !== mailboxAddress?.toLowerCase()) {
        return errorResponse("\u53EA\u80FD\u8BBF\u95EE\u81EA\u5DF1\u7684Mailbox", 403);
      }
      if (!requestedMailbox && mailboxAddress) {
        url.searchParams.set("mailbox", mailboxAddress);
      }
    }
    if (path.startsWith("/api/email/") && mailboxId) {
      const emailId = path.split("/")[3];
      if (emailId && emailId !== "batch") {
        try {
          const { results } = await db.prepare("SELECT mailbox_id FROM messages WHERE id = ? LIMIT 1").bind(emailId).all();
          if (!results || results.length === 0) {
            return errorResponse("Email\u4E0D\u5B58\u5728", 404);
          }
          if (results[0].mailbox_id !== mailboxId) {
            return errorResponse("\u65E0\u6743\u8BBF\u95EE\u6B64Email", 403);
          }
        } catch (e) {
          return errorResponse("Verify\u5931\u8D25", 500);
        }
      }
    }
  }
  let response;
  response = await handleUsersApi(request, db, url, path, options);
  if (response) return response;
  response = await handleMailboxesApi(request, db, mailDomains, url, path, options);
  if (response) return response;
  response = await handleEmailsApi(request, db, url, path, options);
  if (response) return response;
  response = await handleSendApi(request, db, url, path, options);
  if (response) return response;
  return errorResponse("\u672A\u627E\u5230 API \u8DEF\u5F84", 404);
}
__name(handleApiRequest, "handleApiRequest");

// src/routes/api.js
var router2 = new Hono2();
router2.get("/api/session", (c) => {
  const p = c.get("authPayload");
  if (!p) return c.text("Unauthorized", 401);
  const ADMIN_NAME = String(c.env.ADMIN_NAME || "admin").trim().toLowerCase();
  const resp = {
    authenticated: true,
    role: p.role || "admin",
    username: p.username || "",
    strictAdmin: p.role === "admin" && (String(p.username || "").trim().toLowerCase() === ADMIN_NAME || String(p.username || "") === "__root__")
  };
  if (p.role === "mailbox" && p.mailboxAddress) resp.mailboxAddress = p.mailboxAddress;
  return c.json(resp);
});
router2.post("/receive", async (c) => {
  const p = c.get("authPayload");
  if (!p) return c.text("Unauthorized", 401);
  let DB;
  try {
    DB = await getInitializedDatabase(c.env);
  } catch (_) {
    return c.text("Database connection failed", 500);
  }
  const { handleEmailReceive: handleEmailReceive2 } = await Promise.resolve().then(() => (init_receiver(), receiver_exports));
  return handleEmailReceive2(c.req.raw, DB, c.env);
});
router2.all("/api/*", async (c) => {
  const authPayload = c.get("authPayload");
  let DB;
  try {
    DB = await getInitializedDatabase(c.env);
  } catch (_) {
    return c.text("Database connection failed", 500);
  }
  const MAIL_DOMAINS = (c.env.MAIL_DOMAIN || "temp.example.com").split(/[,\s]+/).map((d) => d.trim()).filter(Boolean);
  const baseOpts = {
    mockOnly: false,
    resendApiKey: c.env.RESEND_API_KEY || c.env.RESEND_TOKEN || c.env.RESEND || "",
    adminName: String(c.env.ADMIN_NAME || "admin").trim().toLowerCase(),
    r2: c.env.MAIL_EML,
    authPayload
  };
  if ((authPayload?.role || "admin") === "guest") {
    return handleApiRequest(c.req.raw, DB, MAIL_DOMAINS, { ...baseOpts, mockOnly: true });
  }
  if (authPayload?.role === "mailbox") {
    return handleApiRequest(c.req.raw, DB, MAIL_DOMAINS, { ...baseOpts, mailboxOnly: true });
  }
  return handleApiRequest(c.req.raw, DB, MAIL_DOMAINS, baseOpts);
});
var api_default = router2;

// src/routes/static.js
init_checked_fetch();
init_modules_watch_stub();
var PATH_MAP = {
  "/admin": "/html/admin",
  "/admin.html": "/html/admin",
  "/mailbox": "/html/mailbox",
  "/mailbox.html": "/html/mailbox",
  "/mailboxes.html": "/html/mailboxes"
};
var PROTECTED = /* @__PURE__ */ new Set([
  "/admin",
  "/admin.html",
  "/html/admin.html",
  "/mailboxes.html",
  "/html/mailboxes.html",
  "/mailbox",
  "/mailbox.html",
  "/html/mailbox.html"
]);
var KNOWN_PATHS = /* @__PURE__ */ new Set([
  "/",
  "/index.html",
  "/favicon.svg",
  "/login",
  "/login.html",
  ...Object.keys(PATH_MAP),
  "/app.js",
  "/app.css",
  "/app-router.js",
  "/admin.js",
  "/admin.css",
  "/login.js",
  "/login.css",
  "/mailbox.js",
  "/mailbox.css",
  "/mailboxes.js",
  "/mock.js",
  "/route-guard.js",
  "/app-mobile.js",
  "/app-mobile.css",
  "/auth-guard.js",
  "/storage.js",
  "/theme-toggle.js",
  "/toast-utils.js",
  "/mailbox-settings.js",
  "/html/mailbox.html",
  "/html/mailboxes.html",
  "/html/admin.html",
  "/html/app.html",
  "/templates/app.html",
  "/templates/footer.html",
  "/templates/loading.html",
  "/templates/loading-inline.html",
  "/templates/toast.html"
]);
function serveAsset(c, targetPath) {
  if (!c.env.ASSETS?.fetch) return c.notFound();
  if (targetPath) return c.env.ASSETS.fetch(new Request(new URL(targetPath, c.req.url), c.req.raw));
  return c.env.ASSETS.fetch(c.req.raw);
}
__name(serveAsset, "serveAsset");
var router3 = new Hono2();
router3.get("/", async (c) => {
  const domains = (c.env.MAIL_DOMAIN || "temp.example.com").split(/[,\s]+/).map((d) => d.trim()).filter(Boolean);
  const JWT_TOKEN = c.env.JWT_TOKEN || c.env.JWT_SECRET || "";
  const payload = await resolveAuthPayload(c.req.raw, JWT_TOKEN);
  if (payload?.role === "mailbox") return c.redirect("/html/mailbox.html", 302);
  if (!payload) return c.redirect("/login", 302);
  if (!c.env.ASSETS?.fetch) return c.redirect("/login.html", 302);
  const resp = await c.env.ASSETS.fetch(c.req.raw);
  try {
    const text = await resp.text();
    return new Response(
      text.replace('<meta name="mail-domains" content="">', `<meta name="mail-domains" content="${domains.join(",")}">`),
      { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (_) {
    return resp;
  }
});
router3.get("/login", (c) => serveAsset(c, "/html/login.html"));
router3.get("/login.html", (c) => serveAsset(c, "/html/login.html"));
router3.get("*", async (c) => {
  const pathname = new URL(c.req.url).pathname;
  const JWT_TOKEN = c.env.JWT_TOKEN || c.env.JWT_SECRET || "";
  if (!KNOWN_PATHS.has(pathname) && !pathname.startsWith("/assets/") && !pathname.startsWith("/pic/") && !pathname.startsWith("/templates/") && !pathname.startsWith("/public/") && !pathname.startsWith("/js/") && !pathname.startsWith("/css/") && !pathname.startsWith("/html/") && !pathname.startsWith("/icons/")) {
    const payload = await resolveAuthPayload(c.req.raw, JWT_TOKEN);
    if (!payload) return c.redirect("/login", 302);
  }
  if (PROTECTED.has(pathname)) {
    const payload = await resolveAuthPayload(c.req.raw, JWT_TOKEN);
    if (!payload) {
      const redirect = pathname.includes("mailbox") ? "/html/mailbox.html" : "/admin.html";
      return c.redirect(`/login?redirect=${encodeURIComponent(redirect)}`, 302);
    }
    if (pathname.includes("mailbox") && payload.role !== "mailbox") return c.redirect("/", 302);
    if (!pathname.includes("mailbox")) {
      const allowed = payload.role === "admin" || payload.role === "guest" || payload.role === "mailbox";
      if (!allowed) return c.redirect("/", 302);
    }
  }
  return serveAsset(c, PATH_MAP[pathname] || null);
});
var static_default = router3;

// src/email/handler.js
init_checked_fetch();
init_modules_watch_stub();
init_db();
init_common();

// src/email/forwarder.js
init_checked_fetch();
init_modules_watch_stub();
function forwardByLocalPart(message, localPart, ctx, env) {
  const rules = parseForwardRules(env?.FORWARD_RULES);
  const target = resolveTargetEmail(localPart, rules);
  if (!target) return;
  try {
    ctx.waitUntil(message.forward(target));
  } catch (e) {
    console.error("Forward error:", e);
  }
}
__name(forwardByLocalPart, "forwardByLocalPart");
function parseForwardRules(rulesRaw) {
  if (rulesRaw === void 0 || rulesRaw === null) {
    return [];
  }
  const trimmed = String(rulesRaw).trim();
  if (trimmed === "" || trimmed === "[]" || trimmed.toLowerCase() === "disabled" || trimmed.toLowerCase() === "none") {
    return [];
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return normalizeRules(parsed);
    }
  } catch (_) {
  }
  const rules = [];
  for (const pair of trimmed.split(",")) {
    const [prefix, email] = pair.split("=").map((s) => (s || "").trim());
    if (!prefix || !email) continue;
    rules.push({ prefix, email });
  }
  return normalizeRules(rules);
}
__name(parseForwardRules, "parseForwardRules");
function normalizeRules(items) {
  const result = [];
  for (const it of items) {
    const prefix = String(it.prefix || "").toLowerCase();
    const email = String(it.email || "").trim();
    if (!prefix || !email) continue;
    result.push({ prefix, email });
  }
  return result;
}
__name(normalizeRules, "normalizeRules");
function resolveTargetEmail(localPart, rules) {
  const lp = String(localPart || "").toLowerCase();
  for (const r of rules) {
    if (r.prefix === "*") continue;
    if (lp.startsWith(r.prefix)) return r.email;
  }
  const wildcard = rules.find((r) => r.prefix === "*");
  return wildcard ? wildcard.email : null;
}
__name(resolveTargetEmail, "resolveTargetEmail");
function forwardByMailboxConfig(message, forwardTo, ctx) {
  if (!forwardTo || typeof forwardTo !== "string") return false;
  const target = forwardTo.trim();
  if (!target) return false;
  try {
    ctx.waitUntil(message.forward(target));
    console.log(`Email\u5DF2\u8F6C\u53D1\u81F3: ${target} (Mailbox Settings)`);
    return true;
  } catch (e) {
    console.error("Mailbox SettingsForwarding failed:", e);
    return false;
  }
}
__name(forwardByMailboxConfig, "forwardByMailboxConfig");

// src/email/handler.js
init_parser();
init_mailboxes();
async function handleEmailEvent(message, env, ctx) {
  let DB;
  try {
    DB = await getInitializedDatabase(env);
  } catch (error) {
    console.error("Email\u5904\u7406\u65F6Database connection failed:", error.message);
    return;
  }
  try {
    const headers = message.headers;
    const toHeader = headers.get("to") || headers.get("To") || "";
    const fromHeader = headers.get("from") || headers.get("From") || "";
    const subject = headers.get("subject") || headers.get("Subject") || "(\u65E0Subject)";
    let envelopeTo = "";
    try {
      const toValue = message.to;
      if (Array.isArray(toValue) && toValue.length > 0) {
        envelopeTo = typeof toValue[0] === "string" ? toValue[0] : toValue[0].address || "";
      } else if (typeof toValue === "string") {
        envelopeTo = toValue;
      }
    } catch (_) {
    }
    const resolvedRecipient = (envelopeTo || toHeader || "").toString();
    const resolvedAddr = extractEmail(resolvedRecipient);
    const normalizedAddr = normalizeEmailAlias(resolvedAddr);
    const localPart = (normalizedAddr.split("@")[0] || "").toLowerCase();
    const mailboxForwardTo = await getForwardTarget(DB, normalizedAddr);
    if (mailboxForwardTo) {
      forwardByMailboxConfig(message, mailboxForwardTo, ctx);
    } else {
      forwardByLocalPart(message, localPart, ctx, env);
    }
    let textContent = "";
    let htmlContent = "";
    let rawBuffer = null;
    try {
      const resp = new Response(message.raw);
      rawBuffer = await resp.arrayBuffer();
      const rawText = await new Response(rawBuffer).text();
      const parsed = await parseEmailBody(rawText);
      textContent = parsed.text || "";
      htmlContent = parsed.html || "";
      if (!textContent && !htmlContent) textContent = (rawText || "").slice(0, 1e5);
    } catch (_) {
    }
    const mailbox = normalizedAddr || normalizeEmailAlias(extractEmail(toHeader));
    const sender = extractEmail(fromHeader);
    const r2 = env.MAIL_EML;
    let objectKey = "";
    try {
      const now = /* @__PURE__ */ new Date();
      const y = now.getUTCFullYear();
      const m = String(now.getUTCMonth() + 1).padStart(2, "0");
      const d = String(now.getUTCDate()).padStart(2, "0");
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const ss = String(now.getUTCSeconds()).padStart(2, "0");
      const keyId = globalThis.crypto?.randomUUID && crypto.randomUUID() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const safeMailbox = (mailbox || "unknown").toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
      objectKey = `${y}/${m}/${d}/${safeMailbox}/${hh}${mm}${ss}-${keyId}.eml`;
      if (r2 && rawBuffer) {
        await r2.put(objectKey, new Uint8Array(rawBuffer), { httpMetadata: { contentType: "message/rfc822" } });
      }
    } catch (e) {
      console.error("R2 put failed:", e);
    }
    const preview = String(
      (textContent?.trim() ? textContent : (htmlContent || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) || ""
    ).slice(0, 120);
    let verificationCode = "";
    try {
      verificationCode = extractVerificationCode({ subject, text: textContent, html: htmlContent });
    } catch (_) {
    }
    const resMb = await DB.prepare("SELECT id FROM mailboxes WHERE address = ?").bind(mailbox.toLowerCase()).all();
    let mailboxId;
    if (Array.isArray(resMb?.results) && resMb.results.length) {
      mailboxId = resMb.results[0].id;
    } else {
      const [localPartMb, domain] = (mailbox || "").toLowerCase().split("@");
      if (localPartMb && domain) {
        await DB.prepare("INSERT INTO mailboxes (address, local_part, domain, password_hash, last_accessed_at) VALUES (?, ?, ?, NULL, CURRENT_TIMESTAMP)").bind((mailbox || "").toLowerCase(), localPartMb, domain).run();
        const created = await DB.prepare("SELECT id FROM mailboxes WHERE address = ?").bind((mailbox || "").toLowerCase()).all();
        mailboxId = created?.results?.[0]?.id;
      }
    }
    if (!mailboxId) throw new Error("\u65E0\u6CD5\u89E3\u6790\u6216Create mailbox \u8BB0\u5F55");
    let toAddrs = "";
    try {
      const toValue = message.to;
      if (Array.isArray(toValue)) {
        toAddrs = toValue.map((v) => typeof v === "string" ? v : v?.address || "").filter(Boolean).join(",");
      } else if (typeof toValue === "string") {
        toAddrs = toValue;
      } else {
        toAddrs = resolvedRecipient || toHeader || "";
      }
    } catch (_) {
      toAddrs = resolvedRecipient || toHeader || "";
    }
    await DB.prepare(`
      INSERT INTO messages (mailbox_id, sender, to_addrs, subject, verification_code, preview, r2_bucket, r2_object_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(mailboxId, sender, String(toAddrs || ""), subject || "(\u65E0Subject)", verificationCode || null, preview || null, "mail-eml", objectKey || "").run();
  } catch (err) {
    console.error("Email event handling error:", err);
  }
}
__name(handleEmailEvent, "handleEmailEvent");

// src/server.js
var app = new Hono2();
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "same-origin");
  c.header("X-Frame-Options", "DENY");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (c.req.url.startsWith("https:")) {
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  await next();
});
app.route("/", auth_default);
app.use("/api/*", authMiddleware({ allowGuest: true }));
app.use("/receive", authMiddleware({ allowGuest: false }));
app.route("/", api_default);
app.route("/", static_default);
var server_default = {
  fetch: app.fetch,
  async email(message, env, ctx) {
    return handleEmailEvent(message, env, ctx);
  }
};

// ../../../.npm-global/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.npm-global/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-v7IQcV/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = server_default;

// ../../../.npm-global/node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-v7IQcV/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=server.js.map
