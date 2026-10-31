/* ============================================
   MJ's Corner — Admin Portal Application
   ============================================ */

(function () {
  'use strict';

  // ========== STATE ==========
  let state = {
    orders: [],
    menu: [],
    promos: [],
    promoPopupEnabled: true,
    currentPage: 'dashboard',
    orderFilter: 'all',
    storeOnline: true,
    deliveryFee: 50,
    billingFilter: {
      dateRange: 'all',
      type: 'all',
      payment: 'all',
      search: '',
      from: '',
      to: ''
    },
    posCart: {},
    currentInvoiceOrder: null,
    invoiceFormat: 'tax-invoice'
  };

  // ========== DOM REFERENCES ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    themeToggle: $('#themeToggle'),
    sidebarToggle: $('#sidebarToggle'),
    sidebar: $('#sidebar'),
    sidebarOverlay: $('#sidebarOverlay'),
    adminContent: $('#adminContent'),
    // Stats
    statTotalOrders: $('#statTotalOrders'),
    statRevenue: $('#statRevenue'),
    statPending: $('#statPending'),
    statMenuItems: $('#statMenuItems'),
    // Dashboard Store Controls
    btnToggleStoreMode: $('#btnToggleStoreMode'),
    storeModeLabelText: $('#storeModeLabelText'),
    dashboardLivePill: $('#dashboardLivePill'),
    inputDeliveryFee: $('#inputDeliveryFee'),
    btnSaveDeliveryFee: $('#btnSaveDeliveryFee'),
    btnOpenPosModal: $('#btnOpenPosModal'),
    // Orders
    dashboardOrdersBody: $('#dashboardOrdersBody'),
    ordersBody: $('#ordersBody'),
    btnRefreshOrders: $('#btnRefreshOrders'),
    // Billing & Reports
    pageBilling: $('#pageBilling'),
    billingTotalSales: $('#billingTotalSales'),
    billingOnlinePaid: $('#billingOnlinePaid'),
    billingOfflinePaid: $('#billingOfflinePaid'),
    billingDeliveryFees: $('#billingDeliveryFees'),
    billingDateFilter: $('#billingDateFilter'),
    billingCustomDates: $('#billingCustomDates'),
    billingDateFrom: $('#billingDateFrom'),
    billingDateTo: $('#billingDateTo'),
    billingTypeFilter: $('#billingTypeFilter'),
    billingPaymentFilter: $('#billingPaymentFilter'),
    billingSearchInput: $('#billingSearchInput'),
    btnResetBillingFilters: $('#btnResetBillingFilters'),
    billingOrdersBody: $('#billingOrdersBody'),
    btnExportExcel: $('#btnExportExcel'),
    btnPrintBillingReport: $('#btnPrintBillingReport'),
    btnBillingCreatePos: $('#btnBillingCreatePos'),
    // POS / Offline Order Modal
    offlineOrderModal: $('#offlineOrderModal'),
    closeOfflineOrderModalBtn: $('#closeOfflineOrderModalBtn'),
    offlineOrderForm: $('#offlineOrderForm'),
    posOrderType: $('#posOrderType'),
    posCustomerName: $('#posCustomerName'),
    posCustomerPhone: $('#posCustomerPhone'),
    posPaymentMethod: $('#posPaymentMethod'),
    posDeliveryAddressGroup: $('#posDeliveryAddressGroup'),
    posDeliveryAddress: $('#posDeliveryAddress'),
    posItemsList: $('#posItemsList'),
    posSubtotalText: $('#posSubtotalText'),
    posDeliveryRow: $('#posDeliveryRow'),
    posDeliveryText: $('#posDeliveryText'),
    posTotalText: $('#posTotalText'),
    // Invoice Modal
    invoiceModal: $('#invoiceModal'),
    closeInvoiceModalBtn: $('#closeInvoiceModalBtn'),
    invoiceModalContent: $('#invoiceModalContent'),
    btnPrintInvoiceModal: $('#btnPrintInvoiceModal'),
    // Menu Editor
    menuEditorList: $('#menuEditorList'),
    btnSaveMenu: $('#btnSaveMenu'),
    btnRestoreSampleMenu: $('#btnRestoreSampleMenu'),
    // Promotions
    promoList: $('#promoList'),
    promoPopupToggle: $('#promoPopupToggle'),
    btnAddPromo: $('#btnAddPromo'),
    btnRestoreSamplePromos: $('#btnRestoreSamplePromos'),
    // Toast
    toastContainer: $('#toastContainer'),
    // Auth
    adminUserWrap: $('#adminUserWrap')
  };

  // ========== THEME ==========
  function initTheme() {
    const saved = localStorage.getItem('mj_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    els.themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mj_theme', next);
    els.themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
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
    }, 2500);
  }

  // ========== SIDEBAR ==========
  function toggleSidebar() {
    els.sidebar.classList.toggle('open');
    els.sidebarOverlay.classList.toggle('open');
  }

  function closeSidebar() {
    els.sidebar.classList.remove('open');
    els.sidebarOverlay.classList.remove('open');
  }

  // ========== NAVIGATION ==========
  function navigateTo(page) {
    state.currentPage = page;

    // Update nav items
    $$('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Show/hide pages
    $$('.admin-page').forEach(p => p.classList.add('hidden'));
    const pageEl = $(`#page${capitalize(page)}`);
    if (pageEl) pageEl.classList.remove('hidden');

    // Load page data
    loadData();
    closeSidebar();
  }

  function capitalize(str) {
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }

  // ========== DATA LOADING ==========
  function loadData() {
    state.orders = JSON.parse(localStorage.getItem('mj_orders') || '[]');
    state.menu = window.MJData ? MJData.getMenu() : JSON.parse(localStorage.getItem('mj_menu') || '[]');
    state.promos = window.MJData ? MJData.getPromos() : JSON.parse(localStorage.getItem('mj_promos') || '[]');
    state.promoPopupEnabled = window.MJData ? MJData.isPromoPopupEnabled() : true;

    switch (state.currentPage) {
      case 'dashboard': renderDashboard(); break;
      case 'orders': renderOrders(); break;
      case 'billing': renderBilling(); break;
      case 'menu-editor': renderMenuEditor(); break;
      case 'promotions': renderPromotions(); break;
    }

    // Refresh live orders and settings from MongoDB Atlas
    fetchOrdersFromDb();
    fetchSettings();
  }

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.storeOnline !== undefined) state.storeOnline = data.settings.storeOnline;
          if (data.settings.deliveryCharge !== undefined) state.deliveryFee = data.settings.deliveryCharge;
          updateStoreControlsUI();
        }
      }
    } catch (e) {
      console.warn('Settings sync note:', e);
    }
  }

  async function fetchOrdersFromDb() {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          state.orders = data.orders;
          localStorage.setItem('mj_orders', JSON.stringify(data.orders));
          if (state.currentPage === 'dashboard') {
            renderDashboard();
          } else if (state.currentPage === 'orders') {
            renderOrders();
          } else if (state.currentPage === 'billing') {
            renderBilling();
          }
        }
      }
    } catch (e) {
      console.warn('Orders sync note:', e);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ========== DASHBOARD ==========
  function renderDashboard() {
    const orders = state.orders;
    const totalOrders = orders.length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    const menuItems = state.menu.filter(m => m.available).length;

    els.statTotalOrders.textContent = totalOrders;
    els.statRevenue.textContent = `₹${revenue.toLocaleString('en-IN')}`;
    els.statPending.textContent = pending;
    els.statMenuItems.textContent = menuItems;

    // Recent orders (last 5)
    const recent = orders.slice(0, 5);
    if (recent.length === 0) {
      els.dashboardOrdersBody.innerHTML = `
        <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-tertiary);">
          No orders yet. Orders placed on the customer portal will appear here.
        </td></tr>`;
    } else {
      els.dashboardOrdersBody.innerHTML = recent.map(order => renderOrderRow(order, false)).join('');
      bindOrderActions(els.dashboardOrdersBody);
    }
  }

  // ========== ORDERS ==========
  function renderOrders() {
    const filter = state.orderFilter;
    let orders = state.orders;
    if (filter !== 'all') {
      orders = orders.filter(o => o.status === filter);
    }

    if (orders.length === 0) {
      els.ordersBody.innerHTML = `
        <tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-tertiary);">
          No ${filter === 'all' ? '' : filter} orders found
        </td></tr>`;
    } else {
      els.ordersBody.innerHTML = orders.map(order => renderOrderRow(order, true)).join('');
      bindOrderActions(els.ordersBody);
    }
  }

  function renderOrderRow(order, showTime) {
    const items = order.items || [];
    const totalQty = items.reduce((acc, i) => acc + (i.qty || 1), 0);
    const time = showTime ? `<td>${formatTime(order.timestamp)}</td>` : '';
    const typeIcons = { 'dine-in': '🍽️', 'pickup': '🥡', 'delivery': '🚗' };

    // Dropdown menu in items section
    const itemsDropdownHtml = `
      <details class="order-items-dropdown">
        <summary class="order-items-summary" title="Click to view all ordered items">
          <span>📦 ${totalQty} Item${totalQty !== 1 ? 's' : ''}</span>
          <span style="font-size:0.7rem;opacity:0.8;">▾</span>
        </summary>
        <div class="order-items-dropdown-list">
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;padding-bottom:4px;border-bottom:1px solid var(--border);">
            Ordered Items (${items.length} item${items.length !== 1 ? 's' : ''})
          </div>
          ${items.map(item => {
            const sizeLabel = item.selectedSize ? ` <span style="color:var(--accent);font-weight:700;">(${escapeHtml(item.selectedSize.name)})</span>` : '';
            const addonsLabel = item.selectedAddons && item.selectedAddons.length > 0
              ? `<div style="font-size:0.73rem;color:var(--text-secondary);font-weight:600;margin-top:2px;">🧀 + ${item.selectedAddons.map(a => escapeHtml(a.name)).join(', ')}</div>`
              : '';
            return `
            <div class="order-item-chip">
              <img src="${item.image || 'images/burger.jpg'}" alt="${escapeHtml(item.name)}" class="order-item-chip-img" onerror="this.src='images/burger.jpg'">
              <div class="order-item-chip-details">
                <div class="order-item-chip-name">${escapeHtml(item.name)}${sizeLabel}</div>
                ${addonsLabel}
                <div class="order-item-chip-price">₹${item.offerPrice || item.price || 0} × <strong>${item.qty || 1}</strong> = <strong>₹${((item.offerPrice || item.price || 0) * (item.qty || 1))}</strong></div>
              </div>
            </div>
          `;
          }).join('')}
          ${order.customer && order.customer.notes ? `
            <div class="order-item-chip-note">
              <strong>📝 Notes:</strong> ${escapeHtml(order.customer.notes)}
            </div>
          ` : ''}
          ${order.customer && order.customer.address ? `
            <div class="order-item-chip-address">
              <strong>📍 Delivery Address:</strong> ${escapeHtml(order.customer.address)}
            </div>
          ` : ''}
          ${order.coupon ? `
            <div class="order-item-chip-promo">
              🎟️ Promo: <strong>${escapeHtml(order.coupon.code)}</strong> (Saved ₹${order.coupon.discountAmount})
            </div>
          ` : ''}
        </div>
      </details>
    `;

    // Manual status selector
    const statusSelectHtml = `
      <div class="status-select-wrap">
        <select class="status-select ${order.status}" data-order-id="${order.id}" data-action="manual-status" title="Manually update order status">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>👨‍🍳 Preparing</option>
          <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>✅ Ready</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>🚗 Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </div>
    `;

    // Actions: Next-status advance button + Cancel + Print Invoice + Delete
    const nextStatus = getNextStatus(order.status);
    const nextBtn = (nextStatus && order.status !== 'cancelled')
      ? `<button class="btn-admin primary" data-order-id="${order.id}" data-next-status="${nextStatus}" data-action="update-status" title="Advance to ${nextStatus}">${getStatusAction(nextStatus)}</button>`
      : '';

    const cancelBtn = (order.status !== 'cancelled')
      ? `<button class="btn-admin danger" data-order-id="${order.id}" data-action="cancel-order" title="Cancel this order">❌ Cancel</button>`
      : `<span style="font-size:0.78rem;color:var(--danger);font-weight:700;">Cancelled</span>`;

    const invoiceBtn = `<button class="btn-admin secondary" data-order-id="${order.id}" data-action="print-invoice" title="View & Print Invoice" style="padding:5px 9px;font-size:0.75rem;">🖨️ Invoice</button>`;
    const deleteBtn = `<button class="btn-admin danger delete-order-btn" data-order-id="${order.id}" data-action="delete-order" title="Permanently delete this order" style="padding:5px 8px;font-size:0.75rem;">🗑️</button>`;

    const actionsHtml = `
      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
        ${nextBtn}
        ${cancelBtn}
        ${invoiceBtn}
        ${deleteBtn}
      </div>
    `;

    return `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>
          <div style="font-weight:600;">${escapeHtml(order.customer.name)}</div>
          <div style="font-size:0.75rem;color:var(--text-tertiary);">${escapeHtml(order.customer.phone || '')}</div>
        </td>
        <td>${typeIcons[order.type] || ''} ${order.type}</td>
        <td>${itemsDropdownHtml}</td>
        <td>
          <strong>₹${order.total}</strong>
          <div style="margin-top:4px;">
            <span class="order-payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}">
              ${order.paymentMethod === 'promo_free' ? '🎟️ Free Order' : (order.paymentStatus === 'paid' ? '💳 Paid (Razorpay)' : '💳 Payment Pending')}
            </span>
          </div>
        </td>
        ${time}
        <td>${statusSelectHtml}</td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }

  function getNextStatus(current) {
    const flow = { pending: 'preparing', preparing: 'ready', ready: 'delivered' };
    return flow[current] || null;
  }

  function getStatusAction(status) {
    const labels = { preparing: '👨‍🍳 Start', ready: '✅ Ready', delivered: '🚗 Deliver' };
    return labels[status] || status;
  }

  function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => String(o.id) === String(orderId) || String(o._id) === String(orderId));
    if (order) {
      order.status = newStatus;
      localStorage.setItem('mj_orders', JSON.stringify(state.orders));
      window.dispatchEvent(new Event('mj_orders_changed'));
      loadData();
      showToast(`Order ${orderId} status set to '${newStatus}'`);

      // Persist status change to MongoDB Atlas
      fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(err => console.warn('Could not update order status in MongoDB:', err));
    }
  }

  function bindOrderActions(container) {
    // 1. Manual status dropdown
    container.querySelectorAll('[data-action="manual-status"]').forEach(select => {
      select.addEventListener('change', () => {
        updateOrderStatus(select.dataset.orderId, select.value);
      });
    });

    // 2. Next status quick button
    container.querySelectorAll('[data-action="update-status"]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateOrderStatus(btn.dataset.orderId, btn.dataset.nextStatus);
      });
    });

    // 3. Cancel order button (Admin can cancel any active order)
    container.querySelectorAll('[data-action="cancel-order"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orderId = btn.dataset.orderId;
        if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
          updateOrderStatus(orderId, 'cancelled');
        }
      });
    });

    // 4. Print invoice button
    container.querySelectorAll('[data-action="print-invoice"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openInvoiceModal(btn.dataset.orderId);
      });
    });

    // 5. Delete order button
    container.querySelectorAll('[data-action="delete-order"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const orderId = btn.dataset.orderId;
        if (confirm(`Are you sure you want to permanently delete order ${orderId}? This cannot be undone.`)) {
          try {
            const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
            if (res.ok) {
              state.orders = state.orders.filter(o => String(o.id) !== String(orderId) && String(o._id) !== String(orderId));
              localStorage.setItem('mj_orders', JSON.stringify(state.orders));
              showToast(`Order ${orderId} deleted permanently.`, 'info');
              loadData();
            } else {
              showToast('Failed to delete order from server', 'error');
            }
          } catch (err) {
            showToast('Network error while deleting order', 'error');
          }
        }
      });
    });
  }

  function formatTime(timestamp) {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // ========== STORE CONTROLS (ONLINE/OFFLINE & DELIVERY CHARGE) ==========
  function initStoreControls() {
    updateStoreControlsUI();

    if (els.btnToggleStoreMode) {
      els.btnToggleStoreMode.addEventListener('click', async () => {
        state.storeOnline = !state.storeOnline;
        updateStoreControlsUI();
        showToast(`Store is now ${state.storeOnline ? 'ONLINE (Accepting Orders)' : 'OFFLINE (Orders Paused)'}`, state.storeOnline ? 'success' : 'info');

        try {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storeOnline: state.storeOnline })
          });
        } catch (e) {
          console.warn('Could not save store status to MongoDB:', e);
        }
      });
    }

    if (els.btnSaveDeliveryFee && els.inputDeliveryFee) {
      els.btnSaveDeliveryFee.addEventListener('click', async () => {
        const fee = Math.max(0, parseInt(els.inputDeliveryFee.value, 10) || 0);
        state.deliveryFee = fee;
        showToast(`Delivery fee saved: ₹${fee}`, 'success');

        try {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryCharge: fee })
          });
        } catch (e) {
          console.warn('Could not save delivery fee to MongoDB:', e);
        }
      });
    }

    if (els.btnOpenPosModal) {
      els.btnOpenPosModal.addEventListener('click', openPosModal);
    }
    if (els.btnBillingCreatePos) {
      els.btnBillingCreatePos.addEventListener('click', openPosModal);
    }
  }

  function updateStoreControlsUI() {
    if (els.btnToggleStoreMode && els.storeModeLabelText) {
      if (state.storeOnline) {
        els.btnToggleStoreMode.className = 'btn-store-mode online';
        els.storeModeLabelText.textContent = '🟢 Store is ONLINE (Accepting Orders)';
        if (els.dashboardLivePill) {
          els.dashboardLivePill.className = 'store-live-pill';
          els.dashboardLivePill.textContent = 'Live';
        }
      } else {
        els.btnToggleStoreMode.className = 'btn-store-mode offline';
        els.storeModeLabelText.textContent = '🔴 Store is OFFLINE (Orders Paused)';
        if (els.dashboardLivePill) {
          els.dashboardLivePill.className = 'store-live-pill offline';
          els.dashboardLivePill.textContent = 'Offline';
        }
      }
    }

    if (els.inputDeliveryFee) {
      els.inputDeliveryFee.value = state.deliveryFee || 50;
    }
  }

  // ========== BILLING & REVENUE REPORTS ==========
  function renderBilling() {
    if (!els.pageBilling) return;

    const orders = state.orders;
    const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
    const onlinePaid = orders.filter(o => o.paymentMethod === 'razorpay' && o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
    const offlinePaid = orders.filter(o => o.paymentMethod !== 'razorpay' && o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
    const deliveryFees = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    if (els.billingTotalSales) els.billingTotalSales.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
    if (els.billingOnlinePaid) els.billingOnlinePaid.textContent = `₹${onlinePaid.toLocaleString('en-IN')}`;
    if (els.billingOfflinePaid) els.billingOfflinePaid.textContent = `₹${offlinePaid.toLocaleString('en-IN')}`;
    if (els.billingDeliveryFees) els.billingDeliveryFees.textContent = `₹${deliveryFees.toLocaleString('en-IN')}`;

    const filtered = getFilteredBillingOrders();
    if (!els.billingOrdersBody) return;

    if (filtered.length === 0) {
      els.billingOrdersBody.innerHTML = `
        <tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-tertiary);">
          No billing records found matching your filters.
        </td></tr>`;
    } else {
      els.billingOrdersBody.innerHTML = filtered.map(order => renderBillingRow(order)).join('');
      bindOrderActions(els.billingOrdersBody);
    }
  }

  function getFilteredBillingOrders() {
    let list = [...state.orders];
    const filter = state.billingFilter;

    // Date Range Filter
    const now = new Date();
    if (filter.dateRange === 'today') {
      const todayStr = now.toDateString();
      list = list.filter(o => new Date(o.timestamp || o.createdAt || Date.now()).toDateString() === todayStr);
    } else if (filter.dateRange === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      const yestStr = yest.toDateString();
      list = list.filter(o => new Date(o.timestamp || o.createdAt || Date.now()).toDateString() === yestStr);
    } else if (filter.dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(o => new Date(o.timestamp || o.createdAt || Date.now()) >= weekAgo);
    } else if (filter.dateRange === 'month') {
      const month = now.getMonth();
      const year = now.getFullYear();
      list = list.filter(o => {
        const d = new Date(o.timestamp || o.createdAt || Date.now());
        return d.getMonth() === month && d.getFullYear() === year;
      });
    } else if (filter.dateRange === 'custom' && filter.from) {
      const fromD = new Date(filter.from);
      fromD.setHours(0, 0, 0, 0);
      const toD = filter.to ? new Date(filter.to) : new Date();
      toD.setHours(23, 59, 59, 999);
      list = list.filter(o => {
        const d = new Date(o.timestamp || o.createdAt || Date.now());
        return d >= fromD && d <= toD;
      });
    }

    // Type Filter
    if (filter.type !== 'all') {
      list = list.filter(o => o.type === filter.type);
    }

    // Payment Filter
    if (filter.payment !== 'all') {
      list = list.filter(o => o.paymentStatus === filter.payment);
    }

    // Search query
    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      list = list.filter(o => {
        const idMatch = (o.id || '').toLowerCase().includes(q);
        const nameMatch = (o.customer && o.customer.name || '').toLowerCase().includes(q);
        const phoneMatch = (o.customer && o.customer.phone || '').includes(q);
        return idMatch || nameMatch || phoneMatch;
      });
    }

    return list;
  }

  function renderBillingRow(order) {
    const items = order.items || [];
    const totalQty = items.reduce((acc, i) => acc + (i.qty || 1), 0);
    const d = new Date(order.timestamp || order.createdAt || Date.now());
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const timeStr = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    const typeIcons = { 'dine-in': '🍽️', 'pickup': '🥡', 'delivery': '🚗' };

    const itemsSummary = items.map(i => `${escapeHtml(i.name)} × ${i.qty || 1}`).join(', ');
    const discount = (order.coupon && order.coupon.discountAmount) || 0;
    const delivery = order.deliveryFee || 0;
    const subtotal = order.subtotal || Math.max(0, (order.total || 0) + discount - delivery);

    let paymentBadge = `<span class="order-payment-badge paid">💳 Razorpay</span>`;
    if (order.paymentMethod === 'cash') paymentBadge = `<span class="order-payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}">💵 Cash</span>`;
    else if (order.paymentMethod === 'upi_pos') paymentBadge = `<span class="order-payment-badge paid">⚡ UPI Counter</span>`;
    else if (order.paymentMethod === 'card_pos') paymentBadge = `<span class="order-payment-badge paid">💳 Card POS</span>`;
    else if (order.paymentMethod === 'promo_free') paymentBadge = `<span class="order-payment-badge paid">🎟️ Free</span>`;

    const statusBadge = `<span class="status-badge ${order.status}">${order.status.toUpperCase()}</span>`;

    return `
      <tr>
        <td><strong>${escapeHtml(order.id)}</strong></td>
        <td>
          <div style="font-weight:600;">${dateStr}</div>
          <div style="font-size:0.75rem;color:var(--text-tertiary);">${timeStr}</div>
        </td>
        <td>
          <div style="font-weight:600;">${escapeHtml(order.customer && order.customer.name || 'Walk-in')}</div>
          <div style="font-size:0.75rem;color:var(--text-tertiary);">${escapeHtml(order.customer && order.customer.phone || '')}</div>
        </td>
        <td>${typeIcons[order.type] || ''} ${order.type}</td>
        <td>
          <span title="${escapeHtml(itemsSummary)}" style="cursor:help;border-bottom:1px dotted var(--text-tertiary);">
            ${totalQty} items
          </span>
        </td>
        <td>₹${subtotal}</td>
        <td>₹${delivery}</td>
        <td>${discount > 0 ? `<span style="color:var(--success);">-₹${discount}</span>` : '₹0'}</td>
        <td><strong style="color:var(--accent);">₹${order.total || 0}</strong></td>
        <td>${paymentBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex;gap:5px;">
            <button class="btn-admin secondary" data-order-id="${order.id}" data-action="print-invoice" title="View & Print Invoice" style="padding:4px 8px;font-size:0.75rem;">🖨️</button>
            <button class="btn-admin danger delete-order-btn" data-order-id="${order.id}" data-action="delete-order" title="Delete Order" style="padding:4px 8px;font-size:0.75rem;">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }

  // ========== EXCEL (.XLSX/.CSV) EXPORT ==========
  function exportOrdersToExcel(ordersToExport) {
    if (!ordersToExport || ordersToExport.length === 0) {
      showToast('No orders available to export', 'error');
      return;
    }

    const headers = [
      'Order ID',
      'Date & Time',
      'Customer Name',
      'Phone',
      'Delivery Address',
      'Order Type',
      'Items Summary',
      'Subtotal (INR)',
      'Delivery Fee (INR)',
      'Discount (INR)',
      'Grand Total (INR)',
      'Payment Method',
      'Payment Status',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Order Status'
    ];

    const rows = ordersToExport.map(o => {
      const itemsSummary = (o.items || []).map(i => `${i.name}${i.selectedSize ? ' (' + i.selectedSize.name + ')' : ''} x${i.qty || 1}`).join('; ');
      const discount = o.coupon ? (o.coupon.discountAmount || 0) : 0;
      const delivery = o.deliveryFee || 0;
      const subtotal = o.subtotal || Math.max(0, (o.total || 0) + discount - delivery);
      const razorpayOrder = (o.paymentDetails && o.paymentDetails.razorpay_order_id) || '';
      const razorpayPayment = (o.paymentDetails && o.paymentDetails.razorpay_payment_id) || '';

      return [
        `"${o.id || ''}"`,
        `"${new Date(o.timestamp || o.createdAt || Date.now()).toLocaleString('en-IN')}"`,
        `"${(o.customer && o.customer.name ? o.customer.name.replace(/"/g, '""') : '')}"`,
        `"${(o.customer && o.customer.phone ? o.customer.phone : '')}"`,
        `"${(o.customer && o.customer.address ? o.customer.address.replace(/"/g, '""') : '')}"`,
        `"${o.type || ''}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        subtotal,
        delivery,
        discount,
        o.total || 0,
        `"${o.paymentMethod || 'online'}"`,
        `"${o.paymentStatus || 'pending'}"`,
        `"${razorpayOrder}"`,
        `"${razorpayPayment}"`,
        `"${o.status || 'pending'}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MJs_Corner_Billing_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Excel/CSV billing report downloaded successfully!', 'success');
  }

  // ========== PRINT FINANCIAL REPORT (PDF) ==========
  function printBillingReport(ordersToPrint) {
    if (!ordersToPrint || ordersToPrint.length === 0) {
      showToast('No orders available to print report', 'error');
      return;
    }

    const totalSales = ordersToPrint.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCount = ordersToPrint.length;
    const onlinePaid = ordersToPrint.filter(o => o.paymentMethod === 'razorpay' && o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
    const offlinePaid = ordersToPrint.filter(o => o.paymentMethod !== 'razorpay' && o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Popup blocker prevented opening print window. Please allow popups.', 'error');
      return;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MJ's Corner - Billing & Financial Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
          .title { font-size: 22px; font-weight: 800; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .stats-row { display: flex; gap: 14px; margin-bottom: 18px; }
          .stat-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; background: #f8fafc; }
          .stat-val { font-size: 18px; font-weight: 800; color: #e63946; }
          .stat-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; }
          .footer { margin-top: 20px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 8px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MJ'S CORNER — FINANCIAL & BILLING STATEMENT</div>
          <div class="subtitle">Generated on ${new Date().toLocaleString('en-IN')} | Total Orders: ${totalCount}</div>
        </div>
        <div class="stats-row">
          <div class="stat-box"><div class="stat-val">₹${totalSales.toLocaleString('en-IN')}</div><div class="stat-lbl">Gross Revenue</div></div>
          <div class="stat-box"><div class="stat-val">${totalCount}</div><div class="stat-lbl">Total Orders</div></div>
          <div class="stat-box"><div class="stat-val">₹${onlinePaid.toLocaleString('en-IN')}</div><div class="stat-lbl">Online Paid</div></div>
          <div class="stat-box"><div class="stat-val">₹${offlinePaid.toLocaleString('en-IN')}</div><div class="stat-lbl">Counter / Cash</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th><th>Date/Time</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToPrint.map(o => `
              <tr>
                <td><strong>${escapeHtml(o.id)}</strong></td>
                <td>${new Date(o.timestamp || o.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                <td>${escapeHtml((o.customer && o.customer.name) || 'Walk-in')}</td>
                <td>${o.type}</td>
                <td>${(o.items || []).map(i => `${escapeHtml(i.name)} (${i.qty})`).join(', ')}</td>
                <td><strong>₹${o.total}</strong></td>
                <td>${o.paymentStatus === 'paid' ? 'PAID (' + (o.paymentMethod || '') + ')' : 'PENDING'}</td>
                <td>${(o.status || '').toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Confidential Financial Summary · MJ's Corner Restaurant Management Portal</div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(reportHtml);
    printWin.document.close();
  }

  // ========== INVOICE MODAL & MULTI-FORMAT PRINTING ==========
  function openInvoiceModal(orderId) {
    const order = state.orders.find(o => String(o.id) === String(orderId) || String(o._id) === String(orderId));
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }

    state.currentInvoiceOrder = order;
    state.invoiceFormat = 'tax-invoice';

    // Update active tab UI
    $$('.btn-inv-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.invFormat === state.invoiceFormat);
    });

    renderCurrentInvoice();

    if (els.invoiceModal) {
      els.invoiceModal.classList.add('open');
    }
  }

  function renderCurrentInvoice() {
    if (!els.invoiceModalContent || !state.currentInvoiceOrder) return;
    els.invoiceModalContent.innerHTML = renderInvoiceHtml(state.currentInvoiceOrder, state.invoiceFormat);
  }

  function renderInvoiceHtml(order, format = 'tax-invoice') {
    if (!order) return '<p>No order selected.</p>';

    const d = new Date(order.timestamp || order.createdAt || Date.now());
    const formattedDate = d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    const orderType = (order.type || 'takeout').toLowerCase();
    const isDelivery = orderType === 'delivery';
    const isTakeout = orderType === 'pickup' || orderType === 'takeout';
    const isDineIn = orderType === 'dine-in';

    const customer = order.customer || {};
    const items = order.items || [];

    const subtotal = order.subtotal || items.reduce((s, i) => s + ((i.offerPrice || i.price || 0) * (i.qty || 1)), 0);
    const deliveryFee = order.deliveryFee || (isDelivery ? (state.deliveryFee || 50) : 0);
    const discount = (order.coupon && order.coupon.discountAmount) || 0;
    const gstPercent = 5;
    const gstAmount = Math.round((subtotal * gstPercent) / 100);
    const grandTotal = order.total || Math.max(0, subtotal - discount + deliveryFee);

    let paymentMethodLabel = 'Paid Online via Razorpay';
    if (order.paymentMethod === 'cash') paymentMethodLabel = 'Cash at Counter';
    else if (order.paymentMethod === 'upi_pos') paymentMethodLabel = 'UPI / QR at Counter';
    else if (order.paymentMethod === 'card_pos') paymentMethodLabel = 'Card Machine / POS';
    else if (order.paymentMethod === 'complimentary') paymentMethodLabel = 'Complimentary / Staff';
    else if (order.paymentMethod === 'promo_free') paymentMethodLabel = '100% Promo Coupon Discount';

    const isPaid = order.paymentStatus === 'paid';
    const txnId = (order.paymentDetails && order.paymentDetails.razorpay_payment_id)
      || (order.paymentDetails && order.paymentDetails.razorpay_order_id)
      || ('TXN-' + (order.id || '').replace('#', '') + '-' + d.getTime().toString().slice(-4));

    if (format === 'kot') {
      // Kitchen Order Ticket
      return `
        <div class="invoice-paper kot-format">
          <div style="text-align:center;border-bottom:2px dashed #000;padding-bottom:10px;margin-bottom:12px;">
            <h2 style="margin:0;font-size:1.5rem;font-weight:900;">KITCHEN ORDER TICKET (KOT)</h2>
            <div style="font-size:1.3rem;font-weight:900;margin:6px 0;">ORDER ${order.id}</div>
            <div style="font-size:1rem;font-weight:700;">TYPE: ${order.type ? order.type.toUpperCase() : 'TAKEOUT'}</div>
            <div style="font-size:0.85rem;margin-top:4px;">Time: ${formattedDate} | ${formattedTime}</div>
          </div>
          <div style="margin-bottom:12px;">
            <div><strong>Customer:</strong> ${escapeHtml(customer.name || 'Walk-in')}</div>
            ${customer.phone ? `<div><strong>Phone:</strong> ${escapeHtml(customer.phone)}</div>` : ''}
            ${customer.notes ? `<div style="margin-top:4px;padding:6px;background:#f0f0f0;border-radius:4px;"><strong>Special Instructions:</strong> “${escapeHtml(customer.notes)}”</div>` : ''}
          </div>
          <table class="kot-table" style="width:100%;border-collapse:collapse;margin-bottom:14px;">
            <thead>
              <tr style="border-bottom:1.5px solid #000;text-align:left;">
                <th style="padding:6px 0;">Item</th>
                <th style="padding:6px 0;text-align:right;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => {
                const size = i.selectedSize ? ` <span style="font-weight:700;">[${escapeHtml(i.selectedSize.name)}]</span>` : '';
                const addons = i.selectedAddons && i.selectedAddons.length > 0 ? `<div style="font-size:0.8rem;color:#444;">+ ${i.selectedAddons.map(a => escapeHtml(a.name)).join(', ')}</div>` : '';
                return `
                  <tr style="border-bottom:1px dashed #ccc;">
                    <td style="padding:8px 0;font-size:1rem;font-weight:700;">
                      ${escapeHtml(i.name)}${size}
                      ${addons}
                    </td>
                    <td style="padding:8px 0;text-align:right;font-size:1.2rem;font-weight:900;">
                      × ${i.qty || 1}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div style="text-align:center;font-size:0.85rem;border-top:2px dashed #000;padding-top:8px;">
            Chef's Station Copy · Expedite Order Promptly
          </div>
        </div>
      `;
    }

    if (format === 'thermal') {
      // 80mm Thermal Receipt format
      return `
        <div class="invoice-paper thermal-format" style="max-width:320px;margin:0 auto;font-family:'Courier New', monospace;font-size:12px;line-height:1.35;">
          <div style="text-align:center;margin-bottom:8px;">
            <div style="font-size:16px;font-weight:900;">MJ'S CORNER</div>
            <div style="font-size:10px;">Authentic Italian Kitchen & Burgers</div>
            <div style="font-size:10px;">Shop 4, City Center, Main Road</div>
            <div style="font-size:10px;">Ph: +91 98765 43210</div>
            <div style="border-bottom:1px dashed #000;margin:8px 0;"></div>
            <div style="font-size:14px;font-weight:900;">ORDER ${order.id}</div>
            <div style="font-size:10px;">${formattedDate} ${formattedTime}</div>
            <div style="font-size:11px;font-weight:700;">[${order.type ? order.type.toUpperCase() : 'TAKEOUT'}]</div>
          </div>
          <div style="border-bottom:1px dashed #000;margin-bottom:6px;padding-bottom:4px;">
            <div>Cust: ${escapeHtml(customer.name || 'Guest')}</div>
            ${customer.phone ? `<div>Ph: ${escapeHtml(customer.phone)}</div>` : ''}
            ${customer.address ? `<div>Addr: ${escapeHtml(customer.address)}</div>` : ''}
          </div>
          <table style="width:100%;margin-bottom:6px;">
            ${items.map(i => `
              <tr>
                <td style="padding:2px 0;">${escapeHtml(i.name)} ${i.selectedSize ? '(' + i.selectedSize.name + ')' : ''}</td>
                <td style="text-align:right;">${i.qty}x</td>
                <td style="text-align:right;">₹${((i.offerPrice || i.price || 0) * (i.qty || 1))}</td>
              </tr>
            `).join('')}
          </table>
          <div style="border-top:1px dashed #000;padding-top:4px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span><span>₹${subtotal}</span></div>
            ${deliveryFee > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Delivery:</span><span>₹${deliveryFee}</span></div>` : ''}
            ${discount > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Discount:</span><span>-₹${discount}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;font-weight:900;font-size:14px;border-top:1px solid #000;margin-top:4px;padding-top:2px;">
              <span>TOTAL:</span><span>₹${grandTotal}</span>
            </div>
            <div style="font-size:10px;margin-top:4px;">Payment: ${paymentMethodLabel}</div>
            <div style="font-size:10px;">Status: ${isPaid ? 'PAID' : 'PENDING'} (${txnId})</div>
          </div>
          <div style="text-align:center;font-size:10px;border-top:1px dashed #000;padding-top:6px;">
            Thank you for ordering with us!<br>
            Visit again: https://mjscorner.com
          </div>
        </div>
      `;
    }

    // Standard Tax Invoice (adhering strictly to user's requested layout)
    return `
      <div class="invoice-paper tax-invoice-format">
        <!-- Restaurant Header -->
        <div class="invoice-header">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="LOGO.jpg" alt="MJ's Corner Logo" style="width:58px;height:58px;border-radius:10px;object-fit:cover;border:1px solid #ddd;">
            <div>
              <h1 class="invoice-restaurant-name" style="margin:0;font-size:1.55rem;font-weight:800;color:#1e293b;">MJ's Corner</h1>
              <div class="invoice-tagline" style="font-size:0.92rem;color:#e63946;font-weight:600;margin-top:2px;">
                Authentic Wood-Fired Pizza, Burgers & Italian Kitchen
              </div>
            </div>
          </div>
          <div class="invoice-contact-bar" style="margin-top:10px;font-size:0.83rem;color:#64748b;border-bottom:1.5px solid #e2e8f0;padding-bottom:10px;">
            Shop 4, Near City Center, Main Road, India | +91 98765 43210 | https://mjscorner.com
          </div>
        </div>

        <!-- Order & Customer Details -->
        <div class="invoice-section-title" style="margin-top:16px;font-size:1.05rem;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">
          Order & Customer Details
        </div>
        <div class="invoice-meta-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:0.9rem;">
          <div>
            <div style="margin-bottom:6px;"><strong>Invoice / Order Number:</strong> <span style="font-weight:800;color:#e63946;">${escapeHtml(order.id)}</span></div>
            <div style="margin-bottom:6px;"><strong>Date & Time:</strong> ${formattedDate} | ${formattedTime}</div>
            <div style="margin-top:8px;">
              <strong>Order Type:</strong><br>
              <span style="display:inline-flex;gap:14px;margin-top:4px;">
                <span>[${isDelivery ? 'X' : '&nbsp;'}] Delivery</span>
                <span>[${isTakeout ? 'X' : '&nbsp;'}] Takeout</span>
                <span>[${isDineIn ? 'X' : '&nbsp;'}] Dine-In</span>
              </span>
            </div>
          </div>
          <div>
            <div style="margin-bottom:6px;"><strong>Customer Name:</strong> ${escapeHtml(customer.name || 'Walk-in Customer')}</div>
            <div style="margin-bottom:6px;"><strong>Phone Number:</strong> ${escapeHtml(customer.phone || 'N/A')}</div>
            ${isDelivery ? `<div style="margin-bottom:6px;"><strong>Delivery Address:</strong> ${escapeHtml(customer.address || 'Address provided at order')}</div>` : ''}
            <div><strong>Delivery Instructions:</strong> “${escapeHtml(customer.notes || 'Please prepare freshly and ring the doorbell.')}”</div>
          </div>
        </div>

        <!-- Itemized Order Summary -->
        <div class="invoice-section-title" style="margin-top:20px;font-size:1.05rem;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">
          Itemized Order Summary
        </div>
        <table class="invoice-table" style="width:100%;border-collapse:collapse;margin-top:10px;font-size:0.88rem;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;text-align:left;">
              <th style="padding:10px 12px;">Item Description</th>
              <th style="padding:10px 8px;text-align:center;">Qty</th>
              <th style="padding:10px 12px;text-align:right;">Unit Price</th>
              <th style="padding:10px 12px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const unitPrice = item.offerPrice || item.price || 0;
              const qty = item.qty || 1;
              const itemTotal = unitPrice * qty;
              const sizeTxt = item.selectedSize ? `<div style="font-size:0.8rem;color:#e63946;font-weight:600;">Size: ${escapeHtml(item.selectedSize.name)}</div>` : '';
              const addonsTxt = item.selectedAddons && item.selectedAddons.length > 0
                ? `<div style="font-size:0.78rem;color:#64748b;">Addons: ${item.selectedAddons.map(a => escapeHtml(a.name)).join(', ')}</div>`
                : '';
              return `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 12px;">
                    <div style="font-weight:700;color:#1e293b;">${escapeHtml(item.name)}</div>
                    ${sizeTxt}
                    ${addonsTxt}
                  </td>
                  <td style="padding:10px 8px;text-align:center;font-weight:600;">${qty}</td>
                  <td style="padding:10px 12px;text-align:right;">₹${unitPrice.toFixed(2)}</td>
                  <td style="padding:10px 12px;text-align:right;font-weight:700;">₹${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Payment & Totals Breakdown -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
          <!-- Estimated Fulfillment -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:0.86rem;">
            <div style="font-weight:800;color:#0f172a;text-transform:uppercase;margin-bottom:8px;">Estimated Fulfillment</div>
            <div style="margin-bottom:6px;"><strong>Estimated ${isDelivery ? 'Delivery' : 'Pickup'} Time:</strong> 30 – 45 Minutes</div>
            <div style="margin-bottom:6px;"><strong>Assigned Driver / Delivery Executive:</strong> ${isDelivery ? 'Ramesh K. (Courier Partner)' : 'N/A (Counter Pickup)'}</div>
            <div style="margin-top:12px;border-top:1px dashed #cbd5e1;padding-top:8px;">
              <div style="font-weight:700;color:#1e293b;">Payment Method:</div>
              <div style="color:#475569;">${escapeHtml(paymentMethodLabel)}</div>
              <div style="margin-top:4px;">
                <strong style="color:${isPaid ? '#10b981' : '#f59e0b'};">Transaction Status: ${isPaid ? 'PAID' : 'PENDING'}</strong>
                <div style="font-size:0.78rem;color:#64748b;">(Transaction ID: ${escapeHtml(txnId)})</div>
              </div>
            </div>
          </div>

          <!-- Totals Breakdown -->
          <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:8px;padding:14px;font-size:0.88rem;">
            <div style="font-weight:800;color:#0f172a;text-transform:uppercase;margin-bottom:8px;">Payment & Totals Breakdown</div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Packaging & Container Fee:</span><span>₹0.00</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>GST (5%):</span><span>Included (₹${gstAmount.toFixed(2)})</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Delivery Fee:</span><span>₹${deliveryFee.toFixed(2)}</span></div>
            ${discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#10b981;font-weight:600;"><span>Promo Discount (${escapeHtml((order.coupon && order.coupon.code) || 'OFFER')}):</span><span>-₹${discount.toFixed(2)}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Tip / Delivery Partner Contribution:</span><span>₹0.00</span></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:6px;border-top:2px solid #0f172a;font-size:1.15rem;font-weight:900;color:#e63946;">
              <span>Grand Total:</span>
              <span>₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer & Customer Notes -->
        <div class="invoice-footer" style="margin-top:24px;border-top:1.5px solid #e2e8f0;padding-top:14px;font-size:0.82rem;color:#64748b;line-height:1.45;">
          <div style="font-weight:700;color:#1e293b;margin-bottom:4px;">Thank you for ordering with us! We hope you enjoy your meal.</div>
          <div>Got an issue with your order? Reach out to our support team immediately at <strong>support@mjscorner.com</strong> or call us directly at <strong>+91 98765 43210</strong>.</div>
          <div style="margin-top:4px;">Follow us on social media: <strong>@mjscorner</strong></div>
          <div style="margin-top:4px;color:#e63946;font-weight:600;">Rate your experience & get 10% off your next order: https://mjscorner.com/feedback</div>
        </div>
      </div>
    `;
  }

  // ========== MANUAL OFFLINE / POS ORDER BUILDER ==========
  function openPosModal() {
    state.posCart = {};
    if (els.posOrderType) els.posOrderType.value = 'dine-in';
    if (els.posCustomerName) els.posCustomerName.value = 'Walk-in Customer';
    if (els.posCustomerPhone) els.posCustomerPhone.value = '';
    if (els.posDeliveryAddress) els.posDeliveryAddress.value = '';
    if (els.posDeliveryAddressGroup) els.posDeliveryAddressGroup.style.display = 'none';

    renderPosItems();
    updatePosTotals();

    if (els.offlineOrderModal) {
      els.offlineOrderModal.classList.add('open');
    }
  }

  function renderPosItems() {
    if (!els.posItemsList) return;
    const menu = state.menu.filter(m => m.available);
    if (menu.length === 0) {
      els.posItemsList.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-tertiary);">No menu items found. Please add menu items first.</div>';
      return;
    }

    els.posItemsList.innerHTML = menu.map(item => {
      const qty = state.posCart[item.id] || 0;
      return `
        <div class="pos-item-row" style="display:flex;align-items:center;justify-content:space-between;padding:8px;border-bottom:1px solid var(--border);background:var(--bg-card);margin-bottom:4px;border-radius:var(--radius-sm);">
          <div>
            <div style="font-weight:700;font-size:0.88rem;">${escapeHtml(item.name)}</div>
            <div style="font-size:0.78rem;color:var(--accent);font-weight:600;">₹${item.offerPrice || item.price || 0}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="btn-admin secondary pos-qty-btn" data-pos-action="minus" data-item-id="${item.id}" style="padding:2px 8px;font-size:0.9rem;font-weight:800;">-</button>
            <span style="font-weight:800;min-width:20px;text-align:center;" id="pos-qty-${item.id}">${qty}</span>
            <button type="button" class="btn-admin primary pos-qty-btn" data-pos-action="plus" data-item-id="${item.id}" style="padding:2px 8px;font-size:0.9rem;font-weight:800;">+</button>
          </div>
        </div>
      `;
    }).join('');

    els.posItemsList.querySelectorAll('.pos-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.itemId;
        const action = btn.dataset.posAction;
        const cur = state.posCart[id] || 0;
        if (action === 'plus') {
          state.posCart[id] = cur + 1;
        } else if (action === 'minus') {
          state.posCart[id] = Math.max(0, cur - 1);
        }
        const qtyEl = $(`#pos-qty-${id}`);
        if (qtyEl) qtyEl.textContent = state.posCart[id];
        updatePosTotals();
      });
    });
  }

  function updatePosTotals() {
    let subtotal = 0;
    Object.entries(state.posCart).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const item = state.menu.find(m => String(m.id) === String(itemId));
        if (item) {
          subtotal += (item.offerPrice || item.price || 0) * qty;
        }
      }
    });

    const isDelivery = els.posOrderType && els.posOrderType.value === 'delivery';
    const deliveryFee = isDelivery ? (state.deliveryFee || 50) : 0;
    const total = subtotal + deliveryFee;

    if (els.posSubtotalText) els.posSubtotalText.textContent = `₹${subtotal}`;
    if (els.posDeliveryRow) els.posDeliveryRow.style.display = isDelivery ? 'flex' : 'none';
    if (els.posDeliveryText) els.posDeliveryText.textContent = `₹${deliveryFee}`;
    if (els.posTotalText) els.posTotalText.textContent = `₹${total}`;
  }

  async function submitPosOrder(e) {
    e.preventDefault();

    const selectedItems = [];
    Object.entries(state.posCart).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const item = state.menu.find(m => String(m.id) === String(itemId));
        if (item) {
          selectedItems.push({
            id: item.id,
            name: item.name,
            offerPrice: item.offerPrice || item.price || 0,
            price: item.mrp || item.offerPrice || 0,
            image: item.image,
            qty: qty,
            selectedSize: item.sizes && item.sizes.length > 0 ? item.sizes[0] : null,
            selectedAddons: []
          });
        }
      }
    });

    if (selectedItems.length === 0) {
      showToast('Please select at least 1 menu item for the order.', 'error');
      return;
    }

    const orderType = (els.posOrderType && els.posOrderType.value) || 'dine-in';
    const custName = (els.posCustomerName && els.posCustomerName.value.trim()) || 'Walk-in Customer';
    const custPhone = (els.posCustomerPhone && els.posCustomerPhone.value.trim()) || '';
    const payMethod = (els.posPaymentMethod && els.posPaymentMethod.value) || 'cash';
    const deliveryAddress = (els.posDeliveryAddress && els.posDeliveryAddress.value.trim()) || '';

    let subtotal = 0;
    selectedItems.forEach(i => subtotal += (i.offerPrice * i.qty));
    const deliveryFee = orderType === 'delivery' ? (state.deliveryFee || 50) : 0;
    const grandTotal = subtotal + deliveryFee;

    const btn = $('#btnSubmitPosOrder');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Creating Order...';
    }

    try {
      const payload = {
        type: orderType,
        items: selectedItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: grandTotal,
        customer: {
          userId: 'pos_counter',
          name: custName,
          phone: custPhone,
          address: deliveryAddress,
          notes: 'POS Counter Order'
        },
        paymentStatus: payMethod === 'complimentary' ? 'paid' : (payMethod ? 'paid' : 'pending'),
        paymentMethod: payMethod,
        status: 'pending',
        source: 'pos',
        timestamp: new Date().toISOString()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        showToast(`Offline Order ${data.orderId || data.order.id} created successfully!`, 'success');
        state.orders.unshift(data.order);
        localStorage.setItem('mj_orders', JSON.stringify(state.orders));

        if (els.offlineOrderModal) els.offlineOrderModal.classList.remove('open');

        // Immediately open printable invoice
        openInvoiceModal(data.order.id);
        loadData();
      } else {
        showToast((data && data.message) || 'Failed to create offline order', 'error');
      }
    } catch (err) {
      showToast('Network error creating order: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✓ Confirm & Place Order (Print Invoice)';
      }
    }
  }

  function renderSizesInputs(item) {
    const sizes = item.sizes || [];
    if (sizes.length === 0) {
      return `<div style="font-size:0.75rem;color:var(--text-tertiary);font-style:italic;padding:4px 0;">No sizes configured (uses standard price ₹${item.offerPrice}). Click "+ Add Size" to add options like Regular, Medium, Large.</div>`;
    }
    return sizes.map((s, idx) => `
      <div class="variant-edit-row">
        <input type="text" value="${escapeHtml(s.name)}" placeholder="Size name (e.g. Regular (8'') or Single Patty)" data-variant="size-name" data-item-id="${item.id}" data-idx="${idx}" style="flex:2;">
        <div style="display:flex;align-items:center;gap:4px;flex:1;">
          <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:600;">₹</span>
          <input type="number" value="${s.price}" placeholder="Price" min="0" data-variant="size-price" data-item-id="${item.id}" data-idx="${idx}" style="width:100%;">
        </div>
        <button type="button" class="btn-admin danger" data-action="del-size" data-item-id="${item.id}" data-idx="${idx}" style="padding:6px 10px;font-size:0.75rem;" title="Delete size">🗑️</button>
      </div>
    `).join('');
  }

  function renderAddonsInputs(item) {
    const addons = item.addons || [];
    if (addons.length === 0) {
      return `<div style="font-size:0.75rem;color:var(--text-tertiary);font-style:italic;padding:4px 0;">No extra add-ons configured. Click "+ Add Extra Add-on" to add extras like Cheese Burst Option, Extra Cheese Slice.</div>`;
    }
    return addons.map((a, idx) => `
      <div class="variant-edit-row">
        <input type="text" value="${escapeHtml(a.name)}" placeholder="Add-on name (e.g. Cheese Burst Option, Extra Cheese)" data-variant="addon-name" data-item-id="${item.id}" data-idx="${idx}" style="flex:2;">
        <div style="display:flex;align-items:center;gap:4px;flex:1;">
          <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:600;">+₹</span>
          <input type="number" value="${a.price}" placeholder="Extra cost" min="0" data-variant="addon-price" data-item-id="${item.id}" data-idx="${idx}" style="width:100%;">
        </div>
        <button type="button" class="btn-admin danger" data-action="del-addon" data-item-id="${item.id}" data-idx="${idx}" style="padding:6px 10px;font-size:0.75rem;" title="Delete add-on">🗑️</button>
      </div>
    `).join('');
  }

  function bindVariantEvents(card, item) {
    // Size inputs
    card.querySelectorAll('[data-variant="size-name"]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (item.sizes && item.sizes[idx]) {
          item.sizes[idx].name = e.target.value;
        }
      });
    });

    card.querySelectorAll('[data-variant="size-price"]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (item.sizes && item.sizes[idx]) {
          item.sizes[idx].price = parseInt(e.target.value) || 0;
        }
      });
    });

    card.querySelectorAll('[data-action="del-size"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx);
        if (item.sizes) {
          item.sizes.splice(idx, 1);
          const container = card.querySelector(`#sizes-container-${item.id}`);
          if (container) {
            container.innerHTML = renderSizesInputs(item);
            bindVariantEvents(card, item);
          }
        }
      });
    });

    // Add-on inputs
    card.querySelectorAll('[data-variant="addon-name"]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (item.addons && item.addons[idx]) {
          item.addons[idx].name = e.target.value;
        }
      });
    });

    card.querySelectorAll('[data-variant="addon-price"]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        if (item.addons && item.addons[idx]) {
          item.addons[idx].price = parseInt(e.target.value) || 0;
        }
      });
    });

    card.querySelectorAll('[data-action="del-addon"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx);
        if (item.addons) {
          item.addons.splice(idx, 1);
          const container = card.querySelector(`#addons-container-${item.id}`);
          if (container) {
            container.innerHTML = renderAddonsInputs(item);
            bindVariantEvents(card, item);
          }
        }
      });
    });
  }

  // ========== MENU EDITOR ==========
  function renderMenuEditor() {
    if (state.menu.length === 0) {
      els.menuEditorList.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:32px;">No menu items found.</p>';
      return;
    }

    // Group by category
    const grouped = {};
    state.menu.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    let html = '';
    Object.entries(grouped).forEach(([category, items]) => {
      html += `<h3 style="font-family:var(--font-display);margin:24px 0 12px;font-size:1.15rem;">${category}</h3>`;
      items.forEach(item => {
        const discount = item.mrp > 0 ? Math.round(((item.mrp - item.offerPrice) / item.mrp) * 100) : 0;
        html += `
          <div class="edit-card" id="edit-item-${item.id}" data-item-id="${item.id}">
            <div class="edit-card-img" style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <img src="${item.image}" alt="${item.name}" id="edit-img-${item.id}" style="width:72px;height:72px;border-radius:var(--radius-md);object-fit:cover;border:1px solid var(--border);">
              <label class="btn-file-upload">
                <span>📷 Upload Photo</span>
                <input type="file" accept="image/*" class="file-input-hidden" data-upload-id="${item.id}">
              </label>
            </div>
            <div class="edit-card-info" style="flex:1;">
              <div class="edit-card-name" style="font-size:1rem;font-weight:700;display:flex;align-items:center;gap:8px;">
                <span class="dietary-mini-badge ${item.isVeg ? 'veg' : 'non-veg'}" title="${item.isVeg ? 'Pure Veg' : 'Non-Veg'}">
                  <span class="dietary-dot"></span>
                </span>
                <span>${item.name}</span>
              </div>
              <div class="edit-card-category" style="margin-bottom:8px;">
                ${item.category} ${item.badge ? `· <span style="font-weight:600;color:var(--accent);">${item.badge}</span>` : ''} 
                · <span class="offer-pct-badge" id="badge-pct-${item.id}">${discount}% OFF</span>
              </div>
              <div class="edit-card-fields" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;">
                <div>
                  <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:2px;">Dietary</label>
                  <select data-field="dietary" data-id="${item.id}" style="width:100%;padding:7px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);font-size:0.82rem;font-weight:600;">
                    <option value="veg" ${item.isVeg ? 'selected' : ''}>🟢 Pure Veg</option>
                    <option value="non-veg" ${!item.isVeg ? 'selected' : ''}>🔴 Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:2px;">MRP (₹)</label>
                  <input type="number" value="${item.mrp}" data-field="mrp" data-id="${item.id}" min="0">
                </div>
                <div>
                  <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:2px;">Offer Discount (%)</label>
                  <input type="number" value="${discount}" data-field="discountPercent" data-id="${item.id}" min="0" max="100">
                </div>
                <div>
                  <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:2px;">Offer Price (₹)</label>
                  <input type="number" value="${item.offerPrice}" data-field="offerPrice" data-id="${item.id}" min="0">
                </div>
                <div>
                  <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:2px;">Badge Tag</label>
                  <input type="text" value="${item.badge || ''}" data-field="badge" data-id="${item.id}" placeholder="e.g. Bestseller">
                </div>
              </div>

              <!-- Sizes & Extra Add-ons Editor -->
              <div class="edit-card-variants">
                <!-- Sizes Block -->
                <div class="variants-section-block">
                  <div class="variants-section-header">
                    <span style="font-size:0.82rem;font-weight:700;color:var(--text-primary);">📏 Sizes & Size Pricing <span style="font-size:0.72rem;color:var(--text-tertiary);font-weight:500;">(e.g. Regular, Medium, Large)</span></span>
                    <button type="button" class="btn-admin secondary btn-add-size" data-item-id="${item.id}" style="padding:3px 8px;font-size:0.75rem;">
                      ➕ Add Size
                    </button>
                  </div>
                  <div class="item-sizes-container" id="sizes-container-${item.id}">
                    ${renderSizesInputs(item)}
                  </div>
                </div>

                <!-- Add-ons Block -->
                <div class="variants-section-block">
                  <div class="variants-section-header">
                    <span style="font-size:0.82rem;font-weight:700;color:var(--text-primary);">🧀 Extra Add-ons & Extra Cost <span style="font-size:0.72rem;color:var(--text-tertiary);font-weight:500;">(e.g. Cheese Burst, Extra Cheese)</span></span>
                    <button type="button" class="btn-admin secondary btn-add-addon" data-item-id="${item.id}" style="padding:3px 8px;font-size:0.75rem;">
                      ➕ Add Extra Add-on
                    </button>
                  </div>
                  <div class="item-addons-container" id="addons-container-${item.id}">
                    ${renderAddonsInputs(item)}
                  </div>
                </div>
              </div>

              <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <label class="toggle-switch" style="flex-shrink:0;">
                    <input type="checkbox" ${item.available ? 'checked' : ''} data-field="available" data-id="${item.id}">
                    <span class="toggle-slider"></span>
                  </label>
                  <span style="font-size:0.82rem;font-weight:600;color:var(--text-secondary);">${item.available ? 'Available to Order' : 'Hidden from Menu'}</span>
                </div>
                <button type="button" class="btn-admin danger" data-delete-item="${item.id}" style="padding:4px 10px;font-size:0.78rem;">
                  🗑️ Delete Item
                </button>
              </div>
            </div>
          </div>
        `;
      });
    });

    els.menuEditorList.innerHTML = html;

  async function uploadImageToCloudinary(base64Data, itemName = 'food') {
    try {
      showToast(`☁️ Uploading to Cloudinary CDN...`, 'info');
      const res = await fetch('/api/upload-food-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.warn('Cloudinary upload error, using local data:', err);
      showToast('Cloudinary notice: ' + (err.message || 'Saved locally'), 'info');
      return base64Data;
    }
  }

  // Bind local file uploads for each card
    els.menuEditorList.querySelectorAll('input[type="file"][data-upload-id]').forEach(input => {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const id = parseInt(input.dataset.uploadId);
        const item = state.menu.find(i => i.id === id);
        if (!item) return;

        const reader = new FileReader();
        reader.onload = async (loadEvt) => {
          const rawBase64 = loadEvt.target.result;
          const imgEl = $(`#edit-img-${id}`);
          if (imgEl) imgEl.src = rawBase64;

          const cdnUrl = await uploadImageToCloudinary(rawBase64, item.name);
          item.image = cdnUrl;
          if (imgEl) imgEl.src = cdnUrl;
          saveMenu();
          showToast(`☁️ Cloudinary photo saved for ${item.name}!`, 'success');
        };
        reader.readAsDataURL(file);
      });
    });

    // Bind field changes & interlinked calculations
    els.menuEditorList.querySelectorAll('.edit-card').forEach(card => {
      const id = parseInt(card.dataset.itemId);
      const item = state.menu.find(i => i.id === id);
      if (!item) return;

      const mrpInput = card.querySelector('input[data-field="mrp"]');
      const pctInput = card.querySelector('input[data-field="discountPercent"]');
      const priceInput = card.querySelector('input[data-field="offerPrice"]');
      const badgeInput = card.querySelector('input[data-field="badge"]');
      const availInput = card.querySelector('input[data-field="available"]');
      const pctBadge = card.querySelector(`#badge-pct-${id}`);

      // 1. Changing Offer % -> auto calculates Offer Price
      if (pctInput) {
        pctInput.addEventListener('input', () => {
          const pct = Math.max(0, Math.min(100, parseInt(pctInput.value) || 0));
          const newPrice = Math.round(item.mrp * (1 - pct / 100));
          item.offerPrice = newPrice;
          if (priceInput) priceInput.value = newPrice;
          if (pctBadge) pctBadge.textContent = `${pct}% OFF`;
        });
      }

      // 2. Changing Offer Price -> auto calculates Offer %
      if (priceInput) {
        priceInput.addEventListener('input', () => {
          const price = Math.max(0, parseInt(priceInput.value) || 0);
          item.offerPrice = price;
          const newPct = item.mrp > 0 ? Math.max(0, Math.round(((item.mrp - price) / item.mrp) * 100)) : 0;
          if (pctInput) pctInput.value = newPct;
          if (pctBadge) pctBadge.textContent = `${newPct}% OFF`;
        });
      }

      // 3. Changing MRP -> recalculates based on current %
      if (mrpInput) {
        mrpInput.addEventListener('input', () => {
          item.mrp = Math.max(0, parseInt(mrpInput.value) || 0);
          const pct = parseInt(pctInput ? pctInput.value : '0') || 0;
          const newPrice = Math.round(item.mrp * (1 - pct / 100));
          item.offerPrice = newPrice;
          if (priceInput) priceInput.value = newPrice;
          if (pctBadge) pctBadge.textContent = `${pct}% OFF`;
        });
      }

      // 4. Dietary, Badge & Availability
      const dietarySelect = card.querySelector('select[data-field="dietary"]');
      if (dietarySelect) {
        dietarySelect.addEventListener('change', () => {
          item.dietary = dietarySelect.value;
          item.isVeg = (dietarySelect.value === 'veg');
          const badgeEl = card.querySelector('.edit-card-name .dietary-mini-badge');
          if (badgeEl) {
            badgeEl.className = `dietary-mini-badge ${item.isVeg ? 'veg' : 'non-veg'}`;
            badgeEl.title = item.isVeg ? 'Pure Veg' : 'Non-Veg';
          }
        });
      }

      if (badgeInput) {
        badgeInput.addEventListener('change', () => {
          item.badge = badgeInput.value.trim();
        });
      }

      if (availInput) {
        availInput.addEventListener('change', () => {
          item.available = availInput.checked;
        });
      }

      // 5. Variants (Sizes & Add-ons) binding
      bindVariantEvents(card, item);

      // Add Size button trigger
      const btnAddSize = card.querySelector('.btn-add-size');
      if (btnAddSize) {
        btnAddSize.addEventListener('click', () => {
          if (!item.sizes) item.sizes = [];
          item.sizes.push({ name: '', price: item.offerPrice || 0 });
          const container = card.querySelector(`#sizes-container-${item.id}`);
          if (container) {
            container.innerHTML = renderSizesInputs(item);
            bindVariantEvents(card, item);
          }
        });
      }

      // Add Addon button trigger
      const btnAddAddon = card.querySelector('.btn-add-addon');
      if (btnAddAddon) {
        btnAddAddon.addEventListener('click', () => {
          if (!item.addons) item.addons = [];
          item.addons.push({ name: '', price: 30 });
          const container = card.querySelector(`#addons-container-${item.id}`);
          if (container) {
            container.innerHTML = renderAddonsInputs(item);
            bindVariantEvents(card, item);
          }
        });
      }
    });

    // Delete item handler
    els.menuEditorList.querySelectorAll('[data-delete-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deleteItem;
        if (confirm('Are you sure you want to delete this menu item?')) {
          if (window.MJData && MJData.deleteMenuItem) {
            MJData.deleteMenuItem(id);
          }
          state.menu = state.menu.filter(i => String(i.id) !== String(id));
          saveMenu();
          renderMenuEditor();
          showToast('Menu item deleted permanently.', 'info');
        }
      });
    });
  }

  function saveMenu() {
    state.menu.forEach(item => {
      if (Array.isArray(item.sizes)) {
        item.sizes = item.sizes.filter(s => s && s.name && s.name.trim() !== '');
      }
      if (Array.isArray(item.addons)) {
        item.addons = item.addons.filter(a => a && a.name && a.name.trim() !== '');
      }
    });
    if (window.MJData) {
      MJData.saveMenu(state.menu);
    } else {
      localStorage.setItem('mj_menu', JSON.stringify(state.menu));
    }
    showToast('Menu, sizes & add-ons saved successfully! Synced in real-time.', 'success');
  }

  // ========== PROMOTIONS ==========
  function getMenuCategories() {
    const defaultCats = ['Burgers', 'Pizza', 'Pasta', 'Sides', 'Salads', 'Drinks', 'Desserts'];
    const fromMenu = state.menu.map(m => m.category).filter(Boolean);
    return Array.from(new Set(defaultCats.concat(fromMenu)));
  }

  function renderPromotions() {
    // Update popup toggle
    const toggle = els.promoPopupToggle.querySelector('input');
    toggle.checked = state.promoPopupEnabled;

    if (state.promos.length === 0) {
      els.promoList.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:32px;">No promotions created yet.</p>';
      return;
    }

    const categories = getMenuCategories();

    els.promoList.innerHTML = state.promos.map(promo => {
      // Ensure default fields
      const discountType = promo.discountType || (promo.flatDiscount ? 'flat' : 'percentage');
      const discountValue = promo.discountValue !== undefined ? promo.discountValue : (promo.discountPercent || promo.flatDiscount || 15);
      const scope = promo.scope || 'order';
      const comboCats = Array.isArray(promo.comboCategories) && promo.comboCategories.length >= 2 
        ? promo.comboCategories 
        : ['Pizza', 'Drinks'];

      const badgeLabel = discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`;
      let scopeLabel = 'Entire Order';
      if (scope === 'all_items') scopeLabel = 'All Items';
      else if (scope === 'combo') scopeLabel = `Combo: ${comboCats.join(' + ')}`;
      else if (scope === 'category') scopeLabel = `Category: ${promo.targetCategory || 'All'}`;
      else if (scope === 'item') {
        const itemObj = state.menu.find(m => m.id === parseInt(promo.targetItemId));
        scopeLabel = itemObj ? `Item: ${itemObj.name}` : 'Specific Item';
      }

      return `
      <div class="promo-card" id="promo-card-${promo.id}">
        <div class="promo-card-header">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div class="promo-card-title">${escapeHtml(promo.title)}</div>
            <span class="promo-badge-tag ${discountType}">
              ${badgeLabel}
            </span>
            <span class="promo-scope-tag ${scope}">
              ${scopeLabel}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <label class="toggle-switch" title="Toggle active status">
              <input type="checkbox" ${promo.active ? 'checked' : ''} data-promo-toggle="${promo.id}">
              <span class="toggle-slider"></span>
            </label>
            <button class="btn-admin danger" data-promo-delete="${promo.id}" title="Delete promotion">🗑️</button>
          </div>
        </div>

        <div class="promo-fields">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" value="${escapeHtml(promo.title)}" data-promo-field="title" data-promo-id="${promo.id}" placeholder="e.g. Pizza & Drinks Combo">
          </div>
          <div class="form-group">
            <label>Promo Code *</label>
            <input type="text" value="${escapeHtml(promo.code)}" data-promo-field="code" data-promo-id="${promo.id}" style="text-transform:uppercase;font-weight:700;letter-spacing:0.04em;" placeholder="e.g. PIZZADRINK">
          </div>
          <div class="form-group">
            <label>Subtitle / Tagline</label>
            <input type="text" value="${escapeHtml(promo.subtitle || '')}" data-promo-field="subtitle" data-promo-id="${promo.id}" placeholder="e.g. Pair & Save Big">
          </div>
          <div class="form-group">
            <label>Customer Description</label>
            <input type="text" value="${escapeHtml(promo.description || '')}" data-promo-field="description" data-promo-id="${promo.id}" placeholder="e.g. Get 20% off when you order Pizza and Drinks together">
          </div>

          <!-- Discount Type: Rupees or Percentage -->
          <div class="form-group">
            <label>Discount Type *</label>
            <select data-promo-field="discountType" data-promo-id="${promo.id}">
              <option value="percentage" ${discountType === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
              <option value="flat" ${discountType === 'flat' ? 'selected' : ''}>Rupees (₹ Flat Discount)</option>
            </select>
          </div>

          <!-- Discount Value -->
          <div class="form-group">
            <label>Discount Value (${discountType === 'percentage' ? '%' : '₹'}) *</label>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:700;color:var(--text-secondary);">${discountType === 'percentage' ? '%' : '₹'}</span>
              <input type="number" min="1" max="${discountType === 'percentage' ? '100' : '9999'}" value="${discountValue}" data-promo-field="discountValue" data-promo-id="${promo.id}">
            </div>
          </div>

          <!-- Offer Target / Scope -->
          <div class="form-group">
            <label>Offer Target / Scope *</label>
            <select data-promo-field="scope" data-promo-id="${promo.id}">
              <option value="order" ${scope === 'order' ? 'selected' : ''}>Entire Order (Cart Discount)</option>
              <option value="all_items" ${scope === 'all_items' ? 'selected' : ''}>All Items (Storewide Item Offer)</option>
              <option value="category" ${scope === 'category' ? 'selected' : ''}>Specific Category</option>
              <option value="combo" ${scope === 'combo' ? 'selected' : ''}>Combo Offer (e.g. Pizza + Drinks)</option>
              <option value="item" ${scope === 'item' ? 'selected' : ''}>Specific Menu Item</option>
            </select>
          </div>

          <!-- Min Order Value -->
          <div class="form-group">
            <label>Min Order Value (₹, Optional)</label>
            <input type="number" min="0" value="${promo.minOrderValue || 0}" data-promo-field="minOrderValue" data-promo-id="${promo.id}" placeholder="0 for no minimum">
          </div>
        </div>

        <!-- Conditional Scope Details -->
        ${scope === 'all_items' ? `
          <div class="promo-scope-config-box">
            <div style="font-size:0.84rem;color:var(--text-secondary);line-height:1.4;">
              ✨ <strong>All Items Offer:</strong> Applies to every single menu item. Deal badges will automatically display on all menu cards, on-add toasts, and inside the cart.
            </div>
          </div>
        ` : ''}
        ${scope === 'category' ? `
          <div class="promo-scope-config-box">
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-weight:700;color:var(--text-primary);margin-bottom:6px;display:block;">🎯 Target Category (Offer applies to items in this category):</label>
              <select data-promo-field="targetCategory" data-promo-id="${promo.id}">
                ${categories.map(cat => `<option value="${cat}" ${(promo.targetCategory || 'Pizza') === cat ? 'selected' : ''}>${cat}</option>`).join('')}
              </select>
            </div>
          </div>
        ` : ''}

        ${scope === 'combo' ? `
          <div class="promo-scope-config-box combo-config">
            <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
              🍕🥤 Combo Requirements (Customer must add items from BOTH categories to unlock):
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group" style="margin-bottom:0;">
                <label>Primary Category</label>
                <select data-promo-combo-cat="0" data-promo-id="${promo.id}">
                  ${categories.map(cat => `<option value="${cat}" ${comboCats[0] === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label>+ Companion Category</label>
                <select data-promo-combo-cat="1" data-promo-id="${promo.id}">
                  ${categories.map(cat => `<option value="${cat}" ${comboCats[1] === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:8px;line-height:1.4;">
              💡 <strong>Customer Experience:</strong> If a customer adds any <strong>${comboCats[0]}</strong> to their cart, an interactive combo banner instantly reflects in the cart urging them to add a <strong>${comboCats[1]}</strong> to get ${discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}!
            </div>
          </div>
        ` : ''}

        ${scope === 'item' ? `
          <div class="promo-scope-config-box">
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-weight:700;color:var(--text-primary);margin-bottom:6px;display:block;">🍔 Select Target Menu Item:</label>
              <select data-promo-field="targetItemId" data-promo-id="${promo.id}">
                ${state.menu.map(m => `<option value="${m.id}" ${parseInt(promo.targetItemId) === m.id ? 'selected' : ''}>${escapeHtml(m.name)} (₹${m.offerPrice})</option>`).join('')}
              </select>
            </div>
          </div>
        ` : ''}
      </div>
      `;
    }).join('');

    // Bind promo field changes
    els.promoList.querySelectorAll('[data-promo-field]').forEach(input => {
      input.addEventListener('change', () => {
        const id = parseInt(input.dataset.promoId);
        const field = input.dataset.promoField;
        const promo = state.promos.find(p => p.id === id);
        if (promo) {
          if (field === 'discountValue' || field === 'minOrderValue' || field === 'targetItemId') {
            promo[field] = parseFloat(input.value) || 0;
          } else {
            promo[field] = input.value;
          }

          // Keep legacy fields in sync for backward compatibility
          if (promo.discountType === 'percentage') {
            promo.discountPercent = promo.discountValue;
            delete promo.flatDiscount;
          } else {
            promo.flatDiscount = promo.discountValue;
            delete promo.discountPercent;
          }

          savePromos();
          // If discountType or scope changed, re-render to reflect new options
          if (field === 'discountType' || field === 'scope') {
            renderPromotions();
          }
        }
      });
    });

    // Bind combo category selectors
    els.promoList.querySelectorAll('[data-promo-combo-cat]').forEach(select => {
      select.addEventListener('change', () => {
        const id = parseInt(select.dataset.promoId);
        const idx = parseInt(select.dataset.promoComboCat);
        const promo = state.promos.find(p => p.id === id);
        if (promo) {
          if (!Array.isArray(promo.comboCategories)) {
            promo.comboCategories = ['Pizza', 'Drinks'];
          }
          promo.comboCategories[idx] = select.value;
          savePromos();
          renderPromotions();
        }
      });
    });

    // Bind promo toggle
    els.promoList.querySelectorAll('[data-promo-toggle]').forEach(input => {
      input.addEventListener('change', () => {
        const id = parseInt(input.dataset.promoToggle);
        const promo = state.promos.find(p => p.id === id);
        if (promo) {
          promo.active = input.checked;
          savePromos();
          showToast(`Promotion ${promo.active ? 'activated' : 'deactivated'}`);
        }
      });
    });

    // Bind promo delete
    els.promoList.querySelectorAll('[data-promo-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.promoDelete;
        if (confirm('Are you sure you want to delete this promotion?')) {
          if (window.MJData && MJData.deletePromo) {
            MJData.deletePromo(id);
          }
          state.promos = state.promos.filter(p => String(p.id) !== String(id));
          savePromos();
          renderPromotions();
          showToast('Promotion deleted permanently.', 'info');
        }
      });
    });
  }

  function addPromotion() {
    const newId = state.promos.length > 0 ? Math.max(...state.promos.map(p => p.id)) + 1 : 1;
    state.promos.push({
      id: newId,
      title: '🍕🥤 Pizza & Drinks Combo',
      subtitle: 'Pair & Save Big',
      code: 'COMBO' + newId,
      description: 'Get 20% off when you order Pizza and Drinks together',
      active: true,
      discountType: 'percentage',
      discountValue: 20,
      scope: 'combo',
      targetCategory: 'Pizza',
      targetItemId: null,
      comboCategories: ['Pizza', 'Drinks'],
      minOrderValue: 0
    });
    savePromos();
    renderPromotions();
    showToast('New combo promotion added! You can customize its categories, discount, and code.', 'success');
  }

  function savePromos() {
    if (window.MJData) {
      MJData.savePromos(state.promos);
    } else {
      localStorage.setItem('mj_promos', JSON.stringify(state.promos));
    }
  }

  function togglePromoPopup() {
    const toggle = els.promoPopupToggle.querySelector('input');
    state.promoPopupEnabled = toggle.checked;
    if (window.MJData) {
      MJData.setPromoPopupEnabled(state.promoPopupEnabled);
    } else {
      localStorage.setItem('mj_promoPopup', JSON.stringify(state.promoPopupEnabled));
    }
    showToast(`Promo popup ${state.promoPopupEnabled ? 'enabled' : 'disabled'}`);
  }

  // ========== EVENT BINDINGS ==========
  function bindEvents() {
    // Theme
    els.themeToggle.addEventListener('click', toggleTheme);

    // Sidebar
    els.sidebarToggle.addEventListener('click', toggleSidebar);
    els.sidebarOverlay.addEventListener('click', closeSidebar);

    // Navigation
    $$('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => navigateTo(item.dataset.page));
    });

    // Order filters
    $$('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.orderFilter = btn.dataset.filter;
        $$('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderOrders();
      });
    });

    // Refresh orders
    els.btnRefreshOrders.addEventListener('click', () => {
      loadData();
      showToast('Orders refreshed', 'info');
    });

    // Save menu
    els.btnSaveMenu.addEventListener('click', saveMenu);
    const btnSaveMenuBottom = $('#btnSaveMenuBottom');
    if (btnSaveMenuBottom) btnSaveMenuBottom.addEventListener('click', saveMenu);

    // New Item Modal
    const btnOpenNewItemModal = $('#btnOpenNewItemModal');
    const closeNewItemModalBtn = $('#closeNewItemModalBtn');
    const newItemModal = $('#newItemModal');
    const newItemForm = $('#newItemForm');
    const newItemMrp = $('#newItemMrp');
    const newItemOfferPct = $('#newItemOfferPct');
    const newItemOfferPrice = $('#newItemOfferPrice');
    const newItemFileInput = $('#newItemFileInput');
    const newItemImgPreview = $('#newItemImgPreview');
    let newItemImageData = 'images/burger.jpg';

    if (btnOpenNewItemModal && newItemModal) {
      btnOpenNewItemModal.addEventListener('click', () => {
        newItemModal.classList.add('open');
      });
    }

    if (closeNewItemModalBtn && newItemModal) {
      closeNewItemModalBtn.addEventListener('click', () => {
        newItemModal.classList.remove('open');
      });
    }

    // Interlinked calculations for new item
    if (newItemMrp && newItemOfferPct && newItemOfferPrice) {
      newItemOfferPct.addEventListener('input', () => {
        const mrp = parseInt(newItemMrp.value) || 0;
        const pct = Math.max(0, Math.min(100, parseInt(newItemOfferPct.value) || 0));
        newItemOfferPrice.value = Math.round(mrp * (1 - pct / 100));
      });

      newItemOfferPrice.addEventListener('input', () => {
        const mrp = parseInt(newItemMrp.value) || 0;
        const price = parseInt(newItemOfferPrice.value) || 0;
        newItemOfferPct.value = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;
      });

      newItemMrp.addEventListener('input', () => {
        const mrp = parseInt(newItemMrp.value) || 0;
        const pct = parseInt(newItemOfferPct.value) || 0;
        newItemOfferPrice.value = Math.round(mrp * (1 - pct / 100));
      });
    }

    // New item photo upload from local device
    if (newItemFileInput) {
      newItemFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (loadEvt) => {
          const rawBase64 = loadEvt.target.result;
          if (newItemImgPreview) newItemImgPreview.src = rawBase64;

          const cdnUrl = await uploadImageToCloudinary(rawBase64, 'new_menu_item');
          newItemImageData = cdnUrl;
          if (newItemImgPreview) newItemImgPreview.src = cdnUrl;
          showToast('☁️ Photo uploaded to Cloudinary successfully!', 'success');
        };
        reader.readAsDataURL(file);
      });
    }

    // New item submit
    if (newItemForm) {
      newItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#newItemName').value.trim();
        const category = $('#newItemCategory').value;
        const desc = $('#newItemDesc').value.trim();
        const mrp = parseInt(newItemMrp.value) || 0;
        const offerPrice = parseInt(newItemOfferPrice.value) || mrp;
        const badge = $('#newItemBadge').value.trim();
        const dietaryRadio = document.querySelector('input[name="newItemDietary"]:checked');
        const dietary = dietaryRadio ? dietaryRadio.value : 'veg';
        const isVeg = dietary === 'veg';

        const newItem = {
          id: Date.now(),
          name,
          category,
          description: desc,
          image: newItemImageData,
          mrp,
          offerPrice,
          badge,
          available: true,
          isVeg,
          dietary,
          sizes: [],
          addons: []
        };

        state.menu.unshift(newItem);
        saveMenu();
        renderMenuEditor();
        newItemModal.classList.remove('open');
        newItemForm.reset();
        newItemImageData = 'images/burger.jpg';
        if (newItemImgPreview) newItemImgPreview.src = newItemImageData;
        showToast(`'${name}' successfully added to the menu!`, 'success');
      });
    }

    // Add promotion
    els.btnAddPromo.addEventListener('click', addPromotion);

    // Promo popup toggle
    els.promoPopupToggle.addEventListener('change', togglePromoPopup);

    // Restore Sample Menu
    if (els.btnRestoreSampleMenu) {
      els.btnRestoreSampleMenu.addEventListener('click', async () => {
        if (confirm('Restore sample menu items? Any custom menu changes will be reset to defaults.')) {
          if (window.MJData && MJData.resetMenu) {
            await MJData.resetMenu();
          }
          loadData();
          showToast('Sample menu restored successfully!', 'success');
        }
      });
    }

    // Restore Sample Promos
    if (els.btnRestoreSamplePromos) {
      els.btnRestoreSamplePromos.addEventListener('click', async () => {
        if (confirm('Restore sample promotional coupons?')) {
          if (window.MJData && MJData.resetPromos) {
            await MJData.resetPromos();
          }
          loadData();
          showToast('Sample promotions restored successfully!', 'success');
        }
      });
    }

    // Billing Exports
    if (els.btnExportExcel) {
      els.btnExportExcel.addEventListener('click', () => {
        exportOrdersToExcel(getFilteredBillingOrders());
      });
    }

    if (els.btnPrintBillingReport) {
      els.btnPrintBillingReport.addEventListener('click', () => {
        printBillingReport(getFilteredBillingOrders());
      });
    }

    // Billing Filters
    if (els.billingDateFilter) {
      els.billingDateFilter.addEventListener('change', () => {
        state.billingFilter.dateRange = els.billingDateFilter.value;
        if (els.billingCustomDates) {
          els.billingCustomDates.classList.toggle('hidden', state.billingFilter.dateRange !== 'custom');
        }
        renderBilling();
      });
    }

    if (els.billingDateFrom) {
      els.billingDateFrom.addEventListener('change', () => {
        state.billingFilter.from = els.billingDateFrom.value;
        renderBilling();
      });
    }

    if (els.billingDateTo) {
      els.billingDateTo.addEventListener('change', () => {
        state.billingFilter.to = els.billingDateTo.value;
        renderBilling();
      });
    }

    if (els.billingTypeFilter) {
      els.billingTypeFilter.addEventListener('change', () => {
        state.billingFilter.type = els.billingTypeFilter.value;
        renderBilling();
      });
    }

    if (els.billingPaymentFilter) {
      els.billingPaymentFilter.addEventListener('change', () => {
        state.billingFilter.payment = els.billingPaymentFilter.value;
        renderBilling();
      });
    }

    if (els.billingSearchInput) {
      els.billingSearchInput.addEventListener('input', () => {
        state.billingFilter.search = els.billingSearchInput.value;
        renderBilling();
      });
    }

    if (els.btnResetBillingFilters) {
      els.btnResetBillingFilters.addEventListener('click', () => {
        state.billingFilter = { dateRange: 'all', type: 'all', payment: 'all', search: '', from: '', to: '' };
        if (els.billingDateFilter) els.billingDateFilter.value = 'all';
        if (els.billingTypeFilter) els.billingTypeFilter.value = 'all';
        if (els.billingPaymentFilter) els.billingPaymentFilter.value = 'all';
        if (els.billingSearchInput) els.billingSearchInput.value = '';
        if (els.billingDateFrom) els.billingDateFrom.value = '';
        if (els.billingDateTo) els.billingDateTo.value = '';
        if (els.billingCustomDates) els.billingCustomDates.classList.add('hidden');
        renderBilling();
      });
    }

    // Invoice Modal format tabs & print
    $$('.btn-inv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.invoiceFormat = tab.dataset.invFormat;
        $$('.btn-inv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderCurrentInvoice();
      });
    });

    if (els.btnPrintInvoiceModal) {
      els.btnPrintInvoiceModal.addEventListener('click', () => {
        window.print();
      });
    }

    if (els.closeInvoiceModalBtn && els.invoiceModal) {
      els.closeInvoiceModalBtn.addEventListener('click', () => {
        els.invoiceModal.classList.remove('open');
      });
    }

    // POS / Offline order modal events
    if (els.closeOfflineOrderModalBtn && els.offlineOrderModal) {
      els.closeOfflineOrderModalBtn.addEventListener('click', () => {
        els.offlineOrderModal.classList.remove('open');
      });
    }

    if (els.posOrderType) {
      els.posOrderType.addEventListener('change', () => {
        const isDelivery = els.posOrderType.value === 'delivery';
        if (els.posDeliveryAddressGroup) {
          els.posDeliveryAddressGroup.style.display = isDelivery ? 'block' : 'none';
        }
        updatePosTotals();
      });
    }

    if (els.offlineOrderForm) {
      els.offlineOrderForm.addEventListener('submit', submitPosOrder);
    }

    // Init store operations controls
    initStoreControls();

    // Auto-refresh (poll every 5 seconds for new orders)
    setInterval(() => {
      const freshOrders = JSON.parse(localStorage.getItem('mj_orders') || '[]');
      if (JSON.stringify(freshOrders) !== JSON.stringify(state.orders)) {
        state.orders = freshOrders;
        if (state.currentPage === 'dashboard') renderDashboard();
        if (state.currentPage === 'orders') renderOrders();
      }
    }, 5000);

    // Listen for data and storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'mj_orders' || e.key === 'mj_menu' || e.key === 'mj_promos' || e.key === 'mj_promoPopup') {
        loadData();
      }
      if (e.key === 'mj_currentUser') {
        initAdminAuth();
      }
    });

    window.addEventListener('mj_data_changed', () => {
      loadData();
    });

    window.addEventListener('mj_orders_changed', () => {
      loadData();
    });

    window.addEventListener('mj_auth_changed', () => {
      initAdminAuth();
    });

    // Close admin dropdown on outside click
    document.addEventListener('click', (e) => {
      const dropdown = $('#adminDropdown');
      const btn = $('#btnAdminProfile');
      if (dropdown && dropdown.classList.contains('show')) {
        if (!dropdown.contains(e.target) && (!btn || !btn.contains(e.target))) {
          dropdown.classList.remove('show');
        }
      }
    });
  }

  // ========== ADMIN AUTH ==========
  function initAdminAuth() {
    if (!els.adminUserWrap) return;
    const auth = window.MJAuth || (typeof MJAuth !== 'undefined' ? MJAuth : null);
    const user = auth ? auth.getCurrentUser() : null;
    const isAdm = auth ? auth.isAdmin(user) : false;

    if (isAdm) {
      els.adminUserWrap.innerHTML = `
        <button class="admin-active-indicator-btn" id="btnAdminProfile" aria-label="Admin Profile" title="Logged in as Admin (click for settings)">
          <div class="admin-avatar-crown">👑</div>
          <div class="admin-active-info">
            <span class="admin-active-title">
              <span class="admin-live-pulse-dot"></span>
              Admin Active
            </span>
          </div>
          <span class="admin-active-caret">▾</span>
        </button>
        <div class="user-dropdown admin-user-dropdown" id="adminDropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${(user && user.name) || 'Restaurant Admin'}</div>
            <div class="user-dropdown-email">${(user && user.phone) || (user && user.email) || 'Administrator'}</div>
            <div class="admin-dropdown-role">
              <span>🛡️</span> MongoDB Role: Admin
            </div>
          </div>
          <a href="index.html" class="user-dropdown-item">🍽️ Visit Customer Store</a>
          <button class="user-dropdown-item danger" id="btnLogoutAdmin">🚪 Sign Out</button>
        </div>
      `;

      const btnAdminProfile = $('#btnAdminProfile');
      const adminDropdown = $('#adminDropdown');
      const btnLogoutAdmin = $('#btnLogoutAdmin');

      if (btnAdminProfile && adminDropdown) {
        btnAdminProfile.addEventListener('click', (e) => {
          e.stopPropagation();
          adminDropdown.classList.toggle('show');
        });
      }

      if (btnLogoutAdmin) {
        btnLogoutAdmin.addEventListener('click', () => {
          MJAuth.logout();
          showToast('Signed out of Admin', 'info');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 500);
        });
      }
    } else {
      window.location.replace('login.html?denied=admin');
    }
  }

  // ========== INIT ==========
  function init() {
    initTheme();
    initAdminAuth();
    loadData();
    bindEvents();
    // Live orders sync from MongoDB Atlas every 8 seconds
    setInterval(fetchOrdersFromDb, 8000);
    window.addEventListener('focus', fetchOrdersFromDb);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
