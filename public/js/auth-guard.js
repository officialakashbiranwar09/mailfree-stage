// 入口最早阶段尝试Save当前 hash，避免在任何重定向前丢失
try{
  if (location.hash) {
    sessionStorage.setItem('mf:preservedHash', location.hash);
  }
}catch(_){ }

(function(){
  function isDirectAddressBarVisit(){
    try{
      // 无引用来源或历史很短，视作地址栏直达/Refresh
      if (!document.referrer) return true;
      if (window.history && window.history.length <= 1) return true;
    }catch(_){ }
    return false;
  }
  // 预取Home关键数据并写入 sessionStorage，供首屏直接复用
  async function prefetchHomeData(){
    try{
      const save = (key, data) => {
        try{ sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); }catch(_){ }
      };
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 8000);
      const opts = { method: 'GET', headers: { 'Cache-Control': 'no-cache' }, keepalive: true, signal: controller.signal };
      const mailboxes = fetch('/api/mailboxes?limit=10&offset=0', opts).then(r => r.ok ? r.json() : { list: [] }).then(data => save('mf:prefetch:mailboxes', Array.isArray(data) ? data : (data.list || []) )).catch(()=>{});
      const quota = fetch('/api/user/quota', opts).then(r => r.ok ? r.json() : null).then(data => { if (data) save('mf:prefetch:quota', data); }).catch(()=>{});
      const domains = fetch('/api/domains', opts).then(r => r.ok ? r.json() : []).then(list => { if (Array.isArray(list) && list.length) save('mf:prefetch:domains', list); }).catch(()=>{});
      // 不阻塞太久：最多等待 800ms 即跳转，其余继续后台完成（keepalive）
      await Promise.race([
        Promise.all([mailboxes, quota, domains]),
        new Promise(res => setTimeout(res, 800))
      ]);
      clearTimeout(timeout);
    }catch(_){ }
  }
  function getRedirectTarget(){
    try{ 
      const u = new URL(location.href); 
      let redirectParam = u.searchParams.get('redirect') || '/';
      // 优先从 sessionStorage 读取在来源页Save的 hash
      let preservedHash = '';
      try{ preservedHash = sessionStorage.getItem('mf:preservedHash') || ''; }catch(_){ }
      // 当前页若也带有 hash 作为兜底
      const currentHash = location.hash || '';
      const hashToUse = preservedHash || currentHash;
      if ((redirectParam === '/' || redirectParam === '/html/app.html') && hashToUse) {
        return redirectParam + hashToUse;
      }
      return redirectParam;
    }catch(_){ 
      // 发生错误时，优先使用已Save的 hash
      try{ const ph = sessionStorage.getItem('mf:preservedHash'); if (ph) return '/' + ph; }catch(_){ }
      return location.hash ? '/' + location.hash : '/'; 
    }
  }
  function hasRedirectParam(){
    try{ const u = new URL(location.href); return !!u.searchParams.get('redirect'); }catch(_){ return false; }
  }
  function pollAuth(maxWaitMs = 2000, intervalMs = 200){
    const target = getRedirectTarget();
    const shouldWait = hasRedirectParam();
    const start = Date.now();
    let isForced = false;
    try{ const u = new URL(location.href); isForced = (u.searchParams.get('force') === '1'); }catch(_){ }
    (async function attempt(){
      try{
        // 延长超时时间，减少误判
        const controller = new AbortController();
        const tid = setTimeout(()=>{ try{ controller.abort(); }catch(_){ } }, 1500); // 从400ms增加到1500ms
        const response = await fetch('/api/session', { method: 'GET', headers: { 'Cache-Control': 'no-cache' }, signal: controller.signal });
        clearTimeout(tid);
        if (response.ok){
          try{ sessionStorage.setItem('auth_checked', 'true'); sessionStorage.setItem('auth_checked_ts', String(Date.now())); }catch(_){ }
          // Access确认后立刻预取Home数据
          try{ await prefetchHomeData(); }catch(_){ }
          return void window.location.replace(target);
        }
        // 未通过：若目标为 /admin.html 则保持在 loading 等待，不跳Access，避免泄露 admin
        if (target === '/html/admin.html'){
          if (isForced || (Date.now() - start) < maxWaitMs){ setTimeout(attempt, intervalMs); return; }
          return void window.location.replace('/login');
        }
      }catch(_){ }
      // 强制模式：持续等待，但减少等待时间
      if (isForced && (Date.now() - start) < 6000){ setTimeout(attempt, intervalMs); return; }
      if (shouldWait && (Date.now() - start) < maxWaitMs){ setTimeout(attempt, intervalMs); return; }
      // 在跳转到Access页前，先Checkcookie并清理
      try{
        var hasCookie = document.cookie.split(';').some(function(c){ return c.trim().indexOf('iding-session=') === 0; });
        if (hasCookie) {
          // 如果有cookie但Verify失败，说明cookie可能已过期，清除它
          document.cookie = 'iding-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }catch(_){}
      // default回Access页
      window.location.replace('/login');
    })();
  }

  // Check并处理已AccessUser访问Access页的情况
  function checkLoginPageAccess(){
    try{
      if (location.pathname === '/login' || location.pathname === '/html/login.html'){
        var hasToken = document.cookie.split(';').some(function(c){ return c.trim().indexOf('iding-session=') === 0; });
        if (hasToken){
          // 如果是从其他页面跳转过来的（有referrer），先Verifycookie是否真的有效
          // 避免无效cookie导致的循环跳转
          if (document.referrer) {
            // 异步Verifycookie有效性
            (async function(){
              try{
                const controller = new AbortController();
                const tid = setTimeout(()=>{ try{ controller.abort(); }catch(_){ } }, 1500);
                const r = await fetch('/api/session', { 
                  method: 'GET', 
                  headers: { 'Cache-Control': 'no-cache' }, 
                  signal: controller.signal,
                  credentials: 'include'
                });
                clearTimeout(tid);
                if (r && r.ok) {
                  // cookie有效，跳转
                  var target = '/';
                  try{
                    var ph = sessionStorage.getItem('mf:preservedHash') || '';
                    if (!ph && location.hash) ph = location.hash;
                    if (ph) target += ph;
                  }catch(_){ }
                  location.replace(target);
                } else {
                  // cookie无效，清除它
                  document.cookie = 'iding-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                }
              }catch(_){
                // Verify失败，保持在Access页
              }
            })();
            return true;
          } else {
            // 直接访问Access页且有cookie，立即跳转
            var target = '/';
            try{
              var ph = sessionStorage.getItem('mf:preservedHash') || '';
              if (!ph && location.hash) ph = location.hash;
              if (ph) target += ph;
            }catch(_){ }
            location.replace(target);
            return true;
          }
        }
      }
    }catch(_){ }
    return false;
  }
  
  // 立即执行Check，无论文档Status如何
  checkLoginPageAccess();

  window.AuthGuard = {
    pollAuth,
    checkLoginPageAccess,
    goLoading: function(target, statusText, options){
      try{
        const force = options && options.force ? true : false;
        // 仅地址栏直达时进入 loading Check；否则直接按目标/Access处理
        if (isDirectAddressBarVisit() || force){
          const params = new URLSearchParams();
          if (target) params.set('redirect', target);
          if (statusText) params.set('status', statusText);
          if (force) params.set('force', '1');
          const q = params.toString();
          location.replace('/templates/loading.html' + (q ? ('?' + q) : ''));
        }else{
          // 非直达：避免进入 loading 轮询，改为快速Session校验
          const quickCheck = async () => {
            try{
              const controller = new AbortController();
              const tid = setTimeout(()=>{ try{ controller.abort(); }catch(_){ } }, 1500); // 从500ms延长到1500ms
              const r = await fetch('/api/session', { method:'GET', headers:{ 'Cache-Control':'no-cache' }, signal: controller.signal, credentials: 'include' });
              clearTimeout(tid);
              if (r && r.ok){
                try{ sessionStorage.setItem('auth_checked','true'); }catch(_){ }
                if (target){
                  // 已在目标页则不再跳转，避免循环
                  try{ const u = new URL(target, location.origin); if (u.pathname === location.pathname) return; }catch(_){ }
                  location.replace(target);
                }
                return;
              }
            }catch(_){ }
            location.replace('/login');
          };
          quickCheck();
        }
      }catch(_){ location.replace('/login'); }
    }
  };

  // autorun for loading page
  if (document.currentScript && document.currentScript.dataset.autorun === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      // 若带有 force=1，则强制在 loading 页面执行更长时间的轮询
      let forced = false;
      try{ const u = new URL(location.href); forced = (u.searchParams.get('force') === '1'); }catch(_){ }
      // 只有地址栏直达或强制模式下才执行轮询Check
      if (forced || isDirectAddressBarVisit()){
        pollAuth(forced ? 5000 : 1500, 150);
      }else{
        // 非直达则尽快Back目标或Home
        try{
          const u = new URL(location.href);
          const target = u.searchParams.get('redirect') || '/';
          window.location.replace(target);
        }catch(_){ window.location.replace('/login'); }
      }
    });
  }
})();
