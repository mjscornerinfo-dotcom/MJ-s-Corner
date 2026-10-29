/* ============================================
   MJ's Corner — Passwordless Login Logic
   Powered by Phone.Email (Phone & Email OTP)
   MongoDB Atlas Session & Role Management
   ============================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  let phoneEmailClientId = '11976801478974448261';

  const els = {
    themeToggle: $('#themeToggle'),
    toastContainer: $('#toastContainer')
  };

  // ========== THEME ==========
  function initTheme() {
    const saved = localStorage.getItem('mj_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    if (els.themeToggle) {
      els.themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mj_theme', next);
    if (els.themeToggle) {
      els.themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    }
  }

  // ========== TOAST ==========
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || '✓'}</span> ${message}`;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function getRedirectUrl(defaultUrl = 'index.html') {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || defaultUrl;
  }

  // Load server configuration
  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.phoneEmailClientId) {
          phoneEmailClientId = data.phoneEmailClientId;
        }
      }
    } catch (e) {
      console.warn('Could not load /api/config:', e);
    }
  }

  // Handle successful login redirect
  function handleLoginSuccess(user) {
    const name = user.name || 'Customer';
    const role = user.role || 'customer';

    if (role === 'admin') {
      showToast(`Welcome Admin ${name}! Accessing Dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 700);
    } else {
      showToast(`Welcome to MJ's Corner, ${name}!`, 'success');
      setTimeout(() => {
        window.location.href = getRedirectUrl('index.html');
      }, 700);
    }
  }

  // ========== UNIFIED PHONE.EMAIL VERIFICATION HANDLER ==========
  async function processPhoneEmailVerification(userObj, authType = 'phone') {
    console.log(`[Phone.Email ${authType}] Callback triggered with:`, userObj);
    const user_json_url = typeof userObj === 'string' ? userObj : (userObj && userObj.user_json_url);

    if (!user_json_url) {
      showToast('Verification failed: No verification URL returned', 'error');
      return;
    }

    const label = authType === 'email' ? 'Email' : 'Phone';
    showToast(`${label} verified! Signing into MJ's Corner...`, 'info');

    try {
      const res = await MJAuth.loginWithPhoneEmail({
        user_json_url
      });

      if (res.success) {
        handleLoginSuccess(res.user);
      } else {
        showToast(res.message || 'Authentication failed', 'error');
      }
    } catch (err) {
      showToast('Authentication error: ' + err.message, 'error');
    }
  }

  // Phone Sign In Callback (triggered by sign_in_button_v1.js)
  window.phoneEmailListener = function (userObj) {
    processPhoneEmailVerification(userObj, 'phone');
  };

  // Email Sign In Callback (triggered by verify_email_v1.js)
  window.phoneEmailReceiver = function (userObj) {
    processPhoneEmailVerification(userObj, 'email');
  };

  // ========== EVENT LISTENERS ==========
  function bindEvents() {
    if (els.themeToggle) {
      els.themeToggle.addEventListener('click', toggleTheme);
    }
  }

  // ========== INIT ==========
  async function init() {
    initTheme();
    bindEvents();
    await loadConfig();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
