const username = document.getElementById('username');
const pwd = document.getElementById('pwd');
const btn = document.getElementById('login');
const err = document.getElementById('err');

let isSubmitting = false;

(function showLoginMessage() {
  const msg = sessionStorage.getItem('mf:login-message');
  if (!msg) return;
  sessionStorage.removeItem('mf:login-message');
  setTimeout(() => {
    if (typeof showToast === 'function') {
      showToast(msg, 'info');
    } else if (err) {
      err.textContent = msg;
      err.style.color = '#6366f1';
    }
  }, 300);
})();

async function doLogin() {
  if (isSubmitting) return;

  const user = (username.value || '').trim();
  const password = (pwd.value || '').trim();

  if (!user) {
    err.textContent = 'Username cannot be empty';
    await showToast('Username cannot be empty', 'warn');
    return;
  }

  if (!password) {
    err.textContent = 'Password cannot be empty';
    await showToast('Password cannot be empty', 'warn');
    return;
  }

  err.textContent = '';
  isSubmitting = true;
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = 'Entering...';

  try {
    const target = (() => {
      try {
        const u = new URL(location.href);
        const t = (u.searchParams.get('redirect') || '').trim();
        return t || '/';
      } catch (_) {
        return '/';
      }
    })();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        let finalTarget = target;
        if (result.role === 'mailbox') {
          finalTarget = '/html/mailbox.html';
        } else if (target === '/' && (result.role === 'admin' || result.role === 'guest')) {
          finalTarget = '/';
        }

        await showToast('Access successful, redirecting...', 'success');
        setTimeout(() => {
          location.replace(finalTarget);
        }, 1200);
        return;
      }
    } else {
      const errorText = await response.text();
      err.textContent = errorText || 'Access failed';
      await showToast(errorText || 'Access failed', 'warn');
      isSubmitting = false;
      btn.disabled = false;
      btn.textContent = original;
      return;
    }

    if (window.AuthGuard && window.AuthGuard.goLoading) {
      window.AuthGuard.goLoading(target, 'Entering...', { force: true });
    } else {
      location.replace('/templates/loading.html?redirect=' + encodeURIComponent(target) + '&status=' + encodeURIComponent('Entering...') + '&force=1');
    }
    return;
  } catch (e) {
    err.textContent = 'Network error, please try again';
    await showToast('Network connection failed, please check your network and try again.', 'warn');
    isSubmitting = false;
    btn.disabled = false;
    btn.textContent = original;
    location.replace('/templates/loading.html?status=' + encodeURIComponent('Entering...') + '&force=1');
    return;
  } finally {
    if (isSubmitting) {
      isSubmitting = false;
      btn.disabled = false;
      btn.textContent = original;
    }
  }
}

btn.addEventListener('click', doLogin);
pwd.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
username.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
