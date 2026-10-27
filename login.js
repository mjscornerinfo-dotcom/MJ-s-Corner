/* ============================================
   MJ's Corner — Login Page Logic
   ============================================ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    themeToggle: $('#themeToggle'),
    tabCustomer: $('#tabCustomer'),
    tabAdmin: $('#tabAdmin'),
    customerPanel: $('#customerPanel'),
    adminPanel: $('#adminPanel'),
    customerLoginForm: $('#customerLoginForm'),
    customerSignupForm: $('#customerSignupForm'),
    adminLoginForm: $('#adminLoginForm'),
    customerFormTitle: $('#customerFormTitle'),
    customerFormSubtitle: $('#customerFormSubtitle'),
    btnToggleAuthMode: $('#btnToggleAuthMode'),
    authTogglePrompt: $('#authTogglePrompt'),
    btnDemoCustomer: $('#btnDemoCustomer'),
    btnDemoAdmin: $('#btnDemoAdmin'),
    toastContainer: $('#toastContainer')
  };

  let isSignupMode = false;

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
    }, 2800);
  }

  // Check URL parameters for initial tab
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const portal = params.get('portal');
    if (portal === 'admin') {
      switchTab('admin');
    }
  }

  function getRedirectUrl(defaultUrl) {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || defaultUrl;
  }

  // ========== TABS ==========
  function switchTab(tab) {
    if (tab === 'customer') {
      els.tabCustomer.classList.add('active');
      els.tabAdmin.classList.remove('active');
      els.customerPanel.classList.add('active');
      els.adminPanel.classList.remove('active');
    } else {
      els.tabAdmin.classList.add('active');
      els.tabCustomer.classList.remove('active');
      els.adminPanel.classList.add('active');
      els.customerPanel.classList.remove('active');
    }
  }

  // ========== TOGGLE SIGNUP / SIGNIN ==========
  function toggleAuthMode() {
    isSignupMode = !isSignupMode;
    if (isSignupMode) {
      els.customerLoginForm.classList.add('hidden');
      els.customerSignupForm.classList.remove('hidden');
      els.customerFormTitle.textContent = 'Create an Account';
      els.customerFormSubtitle.textContent = 'Join MJ\'s Corner for easy ordering and exclusive rewards';
      els.authTogglePrompt.textContent = 'Already have an account?';
      els.btnToggleAuthMode.textContent = 'Sign In';
    } else {
      els.customerLoginForm.classList.remove('hidden');
      els.customerSignupForm.classList.add('hidden');
      els.customerFormTitle.textContent = 'Welcome Back';
      els.customerFormSubtitle.textContent = 'Sign in to save addresses, track orders, and checkout faster';
      els.authTogglePrompt.textContent = 'Don\'t have an account?';
      els.btnToggleAuthMode.textContent = 'Sign Up';
    }
  }

  // ========== EVENT LISTENERS ==========
  function bindEvents() {
    els.themeToggle.addEventListener('click', toggleTheme);

    els.tabCustomer.addEventListener('click', () => switchTab('customer'));
    els.tabAdmin.addEventListener('click', () => switchTab('admin'));

    els.btnToggleAuthMode.addEventListener('click', toggleAuthMode);

    // One-Click Demo Customer
    els.btnDemoCustomer.addEventListener('click', () => {
      const user = MJAuth.demoLoginCustomer();
      showToast(`Welcome back, ${user.name}! Redirecting...`, 'success');
      setTimeout(() => {
        window.location.href = getRedirectUrl('index.html');
      }, 700);
    });

    // One-Click Demo Admin
    els.btnDemoAdmin.addEventListener('click', () => {
      const admin = MJAuth.demoLoginAdmin();
      showToast(`Welcome, ${admin.name}! Entering Admin Dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 700);
    });

    // Customer Login Submit
    els.customerLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#custEmail').value;
      const password = $('#custPassword').value;

      const result = MJAuth.login(email, password, 'customer');
      if (result.success) {
        showToast(`Signed in successfully as ${result.user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = getRedirectUrl('index.html');
        }, 700);
      } else {
        showToast(result.message, 'error');
      }
    });

    // Customer Register Submit
    els.customerSignupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#regName').value;
      const email = $('#regEmail').value;
      const phone = $('#regPhone').value;
      const address = $('#regAddress').value;
      const password = $('#regPassword').value;

      const result = MJAuth.register({ name, email, phone, address, password });
      if (result.success) {
        showToast(`Account created! Welcome, ${result.user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = getRedirectUrl('index.html');
        }, 700);
      } else {
        showToast(result.message, 'error');
      }
    });

    // Admin Login Submit
    els.adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#adminEmail').value;
      const password = $('#adminPassword').value;

      const result = MJAuth.login(email, password, 'admin');
      if (result.success) {
        showToast('Admin verification successful! Opening dashboard...', 'success');
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 700);
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  // ========== INIT ==========
  function init() {
    initTheme();

    // If user is already logged in, do not show sign-in/sign-up; redirect to their portal
    const auth = window.MJAuth || (typeof MJAuth !== 'undefined' ? MJAuth : null);
    if (auth) {
      const curUser = auth.getCurrentUser();
      if (curUser) {
        const params = new URLSearchParams(window.location.search);
        const isPortalAdmin = params.get('portal') === 'admin';
        if (auth.isAdmin(curUser)) {
          window.location.replace('admin.html');
          return;
        } else if (!isPortalAdmin) {
          window.location.replace('index.html');
          return;
        }
      }
    }

    bindEvents();
    checkUrlParams();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
