/* ============================================
   MJ's Corner — Mobile OTP Login Logic
   Powered by Phone.Email & MongoDB Roles
   ============================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let phoneEmailClientId = '11976801478974448261';

  const els = {
    themeToggle: $('#themeToggle'),
    phoneLoginForm: $('#phoneLoginForm'),
    custName: $('#custName'),
    custPhone: $('#custPhone'),
    btnPhoneEmailLogin: $('#btnPhoneEmailLogin'),
    adminNoticeBanner: $('#adminNoticeBanner'),
    adminNoticeText: $('#adminNoticeText'),
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

  // Check URL parameters for access alerts
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const denied = params.get('denied');
    const portal = params.get('portal');

    if (denied === 'admin' || portal === 'admin') {
      if (els.adminNoticeBanner) {
        els.adminNoticeBanner.classList.remove('hidden');
        if (els.adminNoticeText) {
          els.adminNoticeText.innerHTML = `
            <strong>Admin Access Restricted:</strong> There is no separate login page for Admin.
            Simply log in with your Name and Mobile Number. If your account has <code>role: 'admin'</code> in MongoDB Atlas or is listed in <code>ADMIN_PHONES</code>, you will automatically gain access to the Admin Dashboard.
          `;
        }
      }
    }
  }

  // Load server configuration (Phone.Email Client ID)
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
  // Phone.Email invokes this window function upon OTP success in the popup
  window.phoneEmailListener = async function (userObj) {
    console.log('[Phone.Email] Callback triggered with:', userObj);
    const user_json_url = typeof userObj === 'string' ? userObj : (userObj && userObj.user_json_url);

    if (!user_json_url) {
      showToast('Phone.Email verification failed: No verification URL returned', 'error');
      return;
    }

    showToast('Phone verified via Phone.Email! Authenticating with MongoDB...', 'info');

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

  // Launch Phone.Email verification popup
  function launchPhoneEmailPopup() {
    const name = (els.custName.value || '').trim();
    if (!name) {
      showToast('Please enter your full name', 'error');
      els.custName.focus();
      return;
    }

    // If official Phone.Email button element exists inside container, trigger its click
    const officialBtn = document.querySelector('.pe_signin_button button') || 
                        document.querySelector('.pe_signin_button a') ||
                        document.querySelector('.pe_signin_button iframe');
    if (officialBtn && officialBtn.click) {
      officialBtn.click();
      return;
    }

    const clientId = phoneEmailClientId || '11976801478974448261';
    const redirectUri = window.location.origin + '/login.html';
    const authUrl = `https://www.phone.email/auth/log-in?client_id=${clientId}&redirect_url=${encodeURIComponent(redirectUri)}`;
    const w = 500;
    const h = 580;
    const left = (screen.width - w) / 2;
    const top = (screen.height - h) / 2;

    window.open(
      authUrl,
      'peLoginWindow',
      `toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=${w},height=${h},top=${top},left=${left}`
    );
  }

  // ========== EVENT LISTENERS ==========
  function bindEvents() {
    if (els.themeToggle) {
      els.themeToggle.addEventListener('click', toggleTheme);
    }

    if (els.btnPhoneEmailLogin) {
      els.btnPhoneEmailLogin.addEventListener('click', launchPhoneEmailPopup);
    }
  }

  // ========== INIT ==========
  async function init() {
    initTheme();
    bindEvents();
    checkUrlParams();
    await loadConfig();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
