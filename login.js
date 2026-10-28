/* ============================================
   MJ's Corner — Mobile OTP Login Logic
   Powered by Phone.Email & MongoDB Roles
   ============================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  let phoneEmailClientId = '11976801478974448261';

  const els = {
    themeToggle: $('#themeToggle'),
    custName: $('#custName'),
    custPhone: $('#custPhone'),
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

  // ========== GLOBAL PHONE.EMAIL LISTENER CALLBACK ==========
  window.phoneEmailListener = async function (userObj) {
    console.log('[Phone.Email] Callback triggered with:', userObj);
    const user_json_url = typeof userObj === 'string' ? userObj : (userObj && userObj.user_json_url);

    if (!user_json_url) {
      showToast('Phone.Email verification failed: No verification URL returned', 'error');
      return;
    }

    showToast('Phone verified! Signing in...', 'info');

    const name = (els.custName && els.custName.value.trim()) || '';
    const phone = (els.custPhone && els.custPhone.value.trim()) || '';

    try {
      const res = await MJAuth.loginWithPhoneEmail({
        name,
        phone,
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
