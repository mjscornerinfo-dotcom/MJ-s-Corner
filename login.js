/* ============================================
   MJ's Corner — Unified Mobile OTP Login Logic
   Powered by Phone.Email & MongoDB Roles
   ============================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let phoneEmailClientId = '';

  const els = {
    themeToggle: $('#themeToggle'),
    phoneLoginForm: $('#phoneLoginForm'),
    custName: $('#custName'),
    custPhone: $('#custPhone'),
    custOtp: $('#custOtp'),
    btnPhoneEmailLogin: $('#btnPhoneEmailLogin'),
    btnVerifyOtp: $('#btnVerifyOtp'),
    btnDemoCustomer: $('#btnDemoCustomer'),
    btnDemoAdmin: $('#btnDemoAdmin'),
    adminNoticeBanner: $('#adminNoticeBanner'),
    adminNoticeText: $('#adminNoticeText'),
    toastContainer: $('#toastContainer'),
    pheIncludedContent: $('#pheIncludedContent')
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
        phoneEmailClientId = data.phoneEmailClientId || '';
        
        // If client ID is present, initialize Phone.Email button
        if (phoneEmailClientId && els.pheIncludedContent) {
          els.pheIncludedContent.setAttribute('data-client-id', phoneEmailClientId);
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
    if (!userObj || !userObj.user_json_url) {
      showToast('Phone.Email verification failed: No verification URL returned', 'error');
      return;
    }

    showToast('Phone verified via Phone.Email! Authenticating...', 'info');

    const name = (els.custName && els.custName.value.trim()) || 'Customer';
    const phone = (els.custPhone && els.custPhone.value.trim()) || '';

    const res = await MJAuth.loginWithPhoneEmail({
      name,
      phone,
      user_json_url: userObj.user_json_url
    });

    if (res.success) {
      handleLoginSuccess(res.user);
    } else {
      showToast(res.message || 'Authentication failed', 'error');
    }
  };

  // Launch Phone.Email verification popup
  function launchPhoneEmailPopup() {
    const name = (els.custName.value || '').trim();
    const phone = (els.custPhone.value || '').trim().replace(/\D/g, '');

    if (!name) {
      showToast('Please enter your full name', 'error');
      els.custName.focus();
      return;
    }

    if (phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      els.custPhone.focus();
      return;
    }

    if (phoneEmailClientId) {
      // Centered popup window for Phone.Email
      const redirectUri = window.location.origin + '/login.html';
      const authUrl = `https://www.phone.email/auth/log-in?client_id=${phoneEmailClientId}&redirect_url=${encodeURIComponent(redirectUri)}`;
      const w = 500;
      const h = 580;
      const left = (screen.width - w) / 2;
      const top = (screen.height - h) / 2;

      window.open(
        authUrl,
        'peLoginWindow',
        `toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=${w},height=${h},top=${top},left=${left}`
      );
    } else {
      // If PHONE_EMAIL_CLIENT_ID is not yet configured, provide helpful guidance & test OTP
      showToast('Phone.Email Client ID not yet set in .env. Test OTP mode activated (use 123456)', 'info');
      els.custOtp.value = '123456';
      els.custOtp.focus();
    }
  }

  // ========== DIRECT OTP SUBMIT ==========
  async function handleDirectOtpSubmit(e) {
    if (e) e.preventDefault();

    const name = (els.custName.value || '').trim();
    const phone = (els.custPhone.value || '').trim();
    const otp = (els.custOtp.value || '').trim();

    if (!name) {
      showToast('Please enter your full name', 'error');
      els.custName.focus();
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      els.custPhone.focus();
      return;
    }

    if (!otp) {
      showToast('Please enter the 6-digit OTP (e.g. 123456)', 'error');
      els.custOtp.focus();
      return;
    }

    els.btnVerifyOtp.disabled = true;
    els.btnVerifyOtp.textContent = 'Verifying OTP...';

    const res = await MJAuth.loginWithPhoneOtp({
      name,
      phone: `+91 ${cleanDigits.slice(-10)}`,
      otp
    });

    els.btnVerifyOtp.disabled = false;
    els.btnVerifyOtp.textContent = 'Verify OTP & Sign In →';

    if (res.success) {
      handleLoginSuccess(res.user);
    } else {
      showToast(res.message || 'OTP verification failed', 'error');
    }
  }

  // ========== EVENT LISTENERS ==========
  function bindEvents() {
    if (els.themeToggle) {
      els.themeToggle.addEventListener('click', toggleTheme);
    }

    if (els.btnPhoneEmailLogin) {
      els.btnPhoneEmailLogin.addEventListener('click', launchPhoneEmailPopup);
    }

    if (els.phoneLoginForm) {
      els.phoneLoginForm.addEventListener('submit', handleDirectOtpSubmit);
    }

    // Testing Shortcuts
    if (els.btnDemoCustomer) {
      els.btnDemoCustomer.addEventListener('click', async () => {
        els.custName.value = 'Alex Johnson';
        els.custPhone.value = '9876543210';
        els.custOtp.value = '123456';
        showToast('Demo Customer selected! Signing in...', 'info');
        const user = await MJAuth.demoLoginCustomer();
        handleLoginSuccess(user);
      });
    }

    if (els.btnDemoAdmin) {
      els.btnDemoAdmin.addEventListener('click', async () => {
        els.custName.value = 'Restaurant Admin';
        els.custPhone.value = '9999988888';
        els.custOtp.value = '123456';
        showToast('Demo Admin selected! Signing in...', 'info');
        const admin = await MJAuth.demoLoginAdmin();
        handleLoginSuccess(admin);
      });
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
