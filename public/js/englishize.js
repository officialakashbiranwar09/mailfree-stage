const PHRASES = [
  ['临时邮箱服务', 'Temporary Mailbox Service'],
  ['临时邮箱', 'Temporary Mailbox'],
  ['邮箱服务', 'Mailbox Service'],
  ['用户管理', 'User Management'],
  ['邮箱管理', 'Mailbox Management'],
  ['邮箱总览', 'Mailbox Overview'],
  ['所有邮箱', 'All Mailboxes'],
  ['历史邮箱', 'Recent Mailboxes'],
  ['邮箱设置', 'Mailbox Settings'],
  ['邮件详情', 'Email Details'],
  ['收件箱', 'Inbox'],
  ['发件箱', 'Sent Mail'],
  ['发邮件', 'Compose Mail'],
  ['清空邮件', 'Clear Mail'],
  ['刷新邮件', 'Refresh Mail'],
  ['转发设置', 'Forward Settings'],
  ['收藏邮箱', 'Favorite Mailbox'],
  ['邮箱后缀', 'Domain'],
  ['用户名长度', 'Username Length'],
  ['随机生成', 'Random Generate'],
  ['随机人名', 'Random Name'],
  ['切换自定义', 'Switch to Custom'],
  ['生成临时邮箱', 'Generate Temporary Mailbox'],
  ['当前邮箱', 'Current Mailbox'],
  ['复制邮箱', 'Copy Mailbox'],
  ['确认操作', 'Confirm Action'],
  ['新邮件', 'New Email'],
  ['收件人', 'Recipients'],
  ['发件名称（可选）', 'From Name (Optional)'],
  ['主题', 'Subject'],
  ['内容', 'Message'],
  ['取消', 'Cancel'],
  ['确定', 'OK'],
  ['搜索历史邮箱', 'Search recent mailboxes'],
  ['搜索邮箱地址', 'Search mailbox address'],
  ['搜索', 'Search'],
  ['登录状态', 'Login Status'],
  ['收藏状态', 'Favorite Status'],
  ['转发状态', 'Forward Status'],
  ['已收藏', 'Favorited'],
  ['未收藏', 'Not Favorited'],
  ['已设置', 'Set'],
  ['未设置', 'Not Set'],
  ['批量放行', 'Allow Selected'],
  ['批量禁止', 'Deny Selected'],
  ['批量收藏', 'Favorite Selected'],
  ['批量取消收藏', 'Unfavorite Selected'],
  ['批量转发', 'Set Forwarding'],
  ['清除转发', 'Clear Forwarding'],
  ['卡片网格视图', 'Card Grid View'],
  ['列表行视图', 'List View'],
  ['暂无数据', 'No Data'],
  ['重置邮箱密码', 'Reset Mailbox Password'],
  ['修改邮箱密码', 'Change Mailbox Password'],
  ['邮箱地址', 'Mailbox Address'],
  ['邮箱地址列表', 'Mailbox Address List'],
  ['邮箱用户', 'Mailbox User'],
  ['用户列表', 'User List'],
  ['创建用户', 'Create User'],
  ['分配邮箱', 'Assign Mailbox'],
  ['取消分配', 'Unassign'],
  ['退出登录', 'Sign Out'],
  ['切换主题', 'Toggle Theme'],
  ['处理中', 'Processing'],
  ['加载中', 'Loading'],
  ['超级管理员', 'Super Admin'],
  ['高级用户', 'Power User'],
  ['演示模式', 'Demo Mode'],
  ['观看模式', 'View Mode'],
  ['请先选择一个邮箱', 'Please select a mailbox first'],
  ['请先生成或选择一个邮箱', 'Please generate or select a mailbox first'],
  ['请选择一个邮箱', 'Please select a mailbox'],
  ['邮件已删除', 'Email deleted'],
  ['邮箱已删除', 'Mailbox deleted'],
  ['邮箱生成成功！', 'Mailbox created successfully!'],
  ['随机人名邮箱生成成功！', 'Random-name mailbox created successfully!'],
  ['用户名不合法，仅限字母/数字/._-', 'Invalid username. Letters, numbers, and ._-/ only.'],
  ['已创建邮箱：', 'Mailbox created: '],
  ['生成失败', 'Creation failed'],
  ['邮箱生成失败', 'Mailbox creation failed'],
  ['邮件已清空', 'Emails cleared'],
  ['邮箱已清空', 'Mailbox cleared'],
  ['已复制：', 'Copied: '],
  ['确定删除邮箱', 'Delete mailbox'],
  ['所有邮件将被清空', 'All emails will be deleted'],
  ['请先选择邮箱', 'Please select a mailbox first'],
  ['请先生成邮箱', 'Please generate a mailbox first'],
  ['请先选择一个邮箱', 'Please select a mailbox first'],
  ['已复制', 'Copied'],
  ['操作成功', 'Operation successful'],
  ['操作失败', 'Operation failed'],
  ['加载失败', 'Loading failed'],
  ['保存成功', 'Saved successfully'],
  ['保存失败', 'Save failed'],
  ['创建失败', 'Create failed'],
  ['删除失败', 'Delete failed'],
  ['清空失败', 'Clear failed'],
  ['复制失败', 'Copy failed'],
  ['转发失败', 'Forwarding failed'],
  ['用户名或密码不能为空', 'Username or password cannot be empty'],
  ['用户名或密码错误', 'Invalid username or password'],
  ['没有有效的邮箱地址', 'No valid mailbox addresses'],
  ['没有有效的邮箱', 'No valid mailboxes'],
  ['无权限操作此邮箱', 'No permission to modify this mailbox'],
  ['需要管理员权限', 'Admin permission required'],
  ['单次最多操作 100 个邮箱', 'You can modify at most 100 mailboxes at once'],
  ['数据库连接失败', 'Database connection failed'],
  ['邮箱不存在', 'Mailbox does not exist'],
  ['格式无效', 'Invalid format'],
  ['管理员无邮箱数量限制', 'Admins have no mailbox limit'],
  ['登录到临时邮箱', 'Enter Temporary Mailbox'],
  ['账号：guest，密码：guest，将进入观看模式。', 'Account: guest, password: guest. This opens view mode.'],
  ['账号：guest，密码：guest，进入观看模式。', 'Account: guest, password: guest. This opens view mode.'],
  ['当前为演示管理页', 'This is a demo admin page'],
  ['本地调试', 'Local debugging'],
  ['注意事项', 'Notes'],
  ['常见问题', 'FAQ'],
  ['快速开始', 'Quick Start'],
  ['部署', 'Deployment'],
  ['功能特性', 'Features'],
  ['版本历史', 'Version history'],
  ['项目展示', 'Project showcase'],
  ['页面展示', 'Page preview'],
  ['浅色模式', 'Light mode'],
  ['深色模式', 'Dark mode'],
  ['联系', 'Contact'],
  ['感谢', 'Thanks'],
  ['许可证', 'License'],
  ['体验地址', 'Demo URL'],
  ['体验账号', 'Demo account'],
  ['体验密码', 'Demo password'],
  ['请重试', 'Please try again'],
  ['请检查', 'Please check'],
  ['请确认', 'Please confirm'],
];

const ATTRIBUTE_NAMES = ['title', 'aria-label', 'placeholder', 'alt', 'value'];

function translateString(value) {
  if (!value || !/[\u4e00-\u9fff]/.test(value)) return value;
  let out = value;
  for (const [from, to] of PHRASES) {
    out = out.split(from).join(to);
  }
  out = out.replace(/[一-龥]+/g, '').replace(/\s{2,}/g, ' ').trim();
  return out || value;
}

function translateNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const next = translateString(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node;
  for (const attr of ATTRIBUTE_NAMES) {
    if (el.hasAttribute?.(attr)) {
      const current = el.getAttribute(attr);
      const next = translateString(current);
      if (next !== current) el.setAttribute(attr, next);
    }
  }
  for (const child of el.childNodes || []) translateNode(child);
}

function run() {
  document.documentElement.lang = 'en';
  document.title = translateString(document.title);
  translateNode(document.body);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'characterData') {
      translateNode(mutation.target);
      continue;
    }
    for (const node of mutation.addedNodes) translateNode(node);
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    run();
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  }, { once: true });
} else {
  run();
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
}
