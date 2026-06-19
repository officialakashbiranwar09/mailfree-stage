// ========== 路由管理系统 ==========
// 为电脑端添加完整的 hash 路由支持，与手机端保持一致

// 立即Save当前hash到sessionStorage，防止PermissionsVerify过程中丢失
try {
  if (location.hash) {
    sessionStorage.setItem('mf:preservedHash', location.hash);
  }
} catch(_) {}

(function() {
  const RouteManager = {
    currentView: null,
    initialized: false,
    originalHash: null,
    isHandlingPopstate: false,
    
    // 初始化路由
    init() {
      if (this.initialized) return;
      this.initialized = true;
      
      // 立即Save原始hash，防止PermissionsVerify过程中丢失
      this.originalHash = location.hash || '';
      
      // 尝试从sessionStorage恢复Save的hash
      try {
        const preservedHash = sessionStorage.getItem('mf:preservedHash');
        if (preservedHash && !this.originalHash) {
          this.originalHash = preservedHash;
          sessionStorage.removeItem('mf:preservedHash'); // 使用后清除
        }
      } catch(_) {}
      
      // 监听 hash 变化和浏览器历史导航
      window.addEventListener('hashchange', () => {
        // console.log('hashchange事件触发，当前hash:', location.hash);
        this.handleRoute();
      });
      
      window.addEventListener('popstate', (event) => {
        // console.log('popstate事件触发，当前hash:', location.hash, '事件Status:', event.state);
        // popstate 事件专门处理浏览器的前进/后退按钮
        this.isHandlingPopstate = true;
        this.handleRoute();
        // 重置标记，避免影响后续的主动导航
        setTimeout(() => {
          this.isHandlingPopstate = false;
        }, 100);
      });
      
      // 延迟初始化路由处理，等待PermissionsVerify完成
      setTimeout(() => {
        // Check是否已经通过PermissionsVerify
        const authChecked = sessionStorage.getItem('auth_checked');
        if (authChecked) {
          this.restoreAndHandleRoute();
        } else {
          // 如果还没Verify，继续等待
          this.waitForAuth();
        }
      }, 500);
      
      // 绑定导航事件
      this.bindNavigationEvents();
    },
    
    // 等待PermissionsVerify完成
    waitForAuth() {
      let attempts = 0;
      const checkAuth = () => {
        const authChecked = sessionStorage.getItem('auth_checked');
        if (authChecked) {
          this.restoreAndHandleRoute();
        } else {
          attempts++;
          if (attempts < 20) { // 最多等待10秒
            setTimeout(checkAuth, 500);
          }
        }
      };
      setTimeout(checkAuth, 500);
    },
    
    // 恢复原始hash并处理路由
    restoreAndHandleRoute() {
      // 如果有Save的原始hash，先恢复它
      if (this.originalHash && this.originalHash !== location.hash) {
        try {
          // 静默恢复hash，不触发hashchange事件
          history.replaceState(null, '', this.originalHash || '#');
        } catch(_) {}
      }
      // 然后处理路由
      this.handleRoute();
    },
    
    // 处理路由变化
    handleRoute() {
      const currentHash = location.hash.slice(1);
      // 智能default路由：只有在User本来就没有hash时才使用default路由
      const hash = currentHash || (this.originalHash ? this.originalHash.slice(1) : 'inbox');
      
      // 避免重复处理相同路由
      if (this.currentView === hash) return;
      
      this.currentView = hash;
      
      switch(hash) {
        case 'inbox':
          this.showInbox();
          break;
        case 'sent':
          this.showSent();
          break;
        case 'generate':
          this.showGenerate();
          break;
        case 'history':
          this.showHistory();
          break;
        case 'mail':
          // 兼容旧的 #mail 路由，根据当前Status决定显示Inbox还是Sent Mail
          if (window.isSentView) {
            this.showSent();
          } else {
            this.showInbox();
          }
          break;
        default:
          // default显示Inbox
          this.showInbox();
      }
      
      // 更新 sessionStorage 中的当前视图
      try {
        sessionStorage.setItem('mf:currentView', hash);
      } catch(_) {}
    },
    
    // 显示Inbox
    showInbox() {
      if (typeof window.switchToInbox === 'function') {
        window.switchToInbox();
        // 更新 URL - 只在User主动导航时Create历史记录，避免重复记录
        if (location.hash !== '#inbox') {
          // Check是否是浏览器前进后退触发，如果是则不再Create新记录
          const isPopstateNavigation = this.isHandlingPopstate;
          if (!isPopstateNavigation) {
            history.pushState({ mfView: 'inbox', timestamp: Date.now() }, '', '#inbox');
          }
        }
      }
      this.updateActiveNav('inbox');
    },
    
    // 显示Sent Mail
    showSent() {
      if (typeof window.switchToSent === 'function') {
        window.switchToSent();
        // 更新 URL - 只在User主动导航时Create历史记录，避免重复记录
        if (location.hash !== '#sent') {
          // Check是否是浏览器前进后退触发，如果是则不再Create新记录
          const isPopstateNavigation = this.isHandlingPopstate;
          if (!isPopstateNavigation) {
            history.pushState({ mfView: 'sent', timestamp: Date.now() }, '', '#sent');
          }
        }
      }
      this.updateActiveNav('sent');
    },
    
    // 显示生成Mailbox（主要用于统一路由）
    showGenerate() {
      // 电脑端生成Mailbox始终显示，这里主要是更新 URL
      this.updateActiveNav('generate');
      if (location.hash !== '#generate') {
        history.pushState({ mfView: 'generate' }, '', '#generate');
      }
      try {
        const genCard = document.querySelector('.generate-card');
        if (genCard) genCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch(_) {}
    },
    
    // 显示Recent Mailboxes（主要用于统一路由）
    showHistory() {
      // 电脑端Recent Mailboxes始终显示，这里主要是更新 URL
      this.updateActiveNav('history');
      if (location.hash !== '#history') {
        history.pushState({ mfView: 'history' }, '', '#history');
      }
      try {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch(_) {}
    },
    
    // 更新导航激活Status
    updateActiveNav(view) {
      // 更新Inbox/Sent Mail标签
      if (view === 'inbox' || view === 'mail') {
        const tabInbox = document.getElementById('tab-inbox');
        const tabSent = document.getElementById('tab-sent');
        if (tabInbox) tabInbox.setAttribute('aria-pressed', 'true');
        if (tabSent) tabSent.setAttribute('aria-pressed', 'false');
      } else if (view === 'sent') {
        const tabInbox = document.getElementById('tab-inbox');
        const tabSent = document.getElementById('tab-sent');
        if (tabInbox) tabInbox.setAttribute('aria-pressed', 'false');
        if (tabSent) tabSent.setAttribute('aria-pressed', 'true');
      }
    },
    
    // 绑定导航事件
    bindNavigationEvents() {
      // 重写Inbox/Sent Mail切换按钮的点击事件
      setTimeout(() => {
        const tabInbox = document.getElementById('tab-inbox');
        const tabSent = document.getElementById('tab-sent');
        
        if (tabInbox) {
          // Save原始的点击处理函数
          const originalInboxClick = tabInbox.onclick;
          tabInbox.onclick = (e) => {
            e.preventDefault();
            this.navigate('inbox');
            // 如果有原始处理函数，也执行它
            if (typeof originalInboxClick === 'function') {
              originalInboxClick.call(tabInbox, e);
            }
          };
        }
        
        if (tabSent) {
          // Save原始的点击处理函数
          const originalSentClick = tabSent.onclick;
          tabSent.onclick = (e) => {
            e.preventDefault();
            this.navigate('sent');
            // 如果有原始处理函数，也执行它
            if (typeof originalSentClick === 'function') {
              originalSentClick.call(tabSent, e);
            }
          };
        }
      }, 500); // 延迟确保按钮已Create
    },
    
    // 导航到指定路由
    navigate(route) {
      // 确保路由以 # 开头
      const targetHash = `#${route}`;
      
      if (location.hash === targetHash) {
        // 如果已在目标路由，手动触发处理
        this.currentView = null;
        this.handleRoute();
      } else {
        // 更新 URL，会自动触发 hashchange 事件
        // 直接Settings location.hash 会自动Create历史记录条目
        location.hash = route;
      }
    },
    
    // 用于其他地方调用的导航方法
    goToInbox() { this.navigate('inbox'); },
    goToSent() { this.navigate('sent'); },
    goToGenerate() { this.navigate('generate'); },
    goToHistory() { this.navigate('history'); }
  };
  
  // 页面加载完成后初始化路由
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RouteManager.init());
  } else {
    // 延迟初始化，确保其他组件已加载
    setTimeout(() => RouteManager.init(), 500);
  }
  
  // 导出路由管理器供其他模块使用
  window.RouteManager = RouteManager;
})();
