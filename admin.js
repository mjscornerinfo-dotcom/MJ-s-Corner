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
    orderFilter: 'all'
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
    // Orders
    dashboardOrdersBody: $('#dashboardOrdersBody'),
    ordersBody: $('#ordersBody'),
    btnRefreshOrders: $('#btnRefreshOrders'),
    // Menu Editor
    menuEditorList: $('#menuEditorList'),
    btnSaveMenu: $('#btnSaveMenu'),
    // Promotions
    promoList: $('#promoList'),
    promoPopupToggle: $('#promoPopupToggle'),
    btnAddPromo: $('#btnAddPromo'),
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
      case 'menu-editor': renderMenuEditor(); break;
      case 'promotions': renderPromotions(); break;
    }

    // Refresh live orders from MongoDB Atlas
    fetchOrdersFromDb();
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
            renderMetrics();
            renderStats();
            renderRecentOrders();
          } else if (state.currentPage === 'orders') {
            renderOrders();
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

    // Actions: Next-status advance button + Cancel option
    const nextStatus = getNextStatus(order.status);
    const nextBtn = (nextStatus && order.status !== 'cancelled')
      ? `<button class="btn-admin primary" data-order-id="${order.id}" data-next-status="${nextStatus}" data-action="update-status" title="Advance to ${nextStatus}">${getStatusAction(nextStatus)}</button>`
      : '';

    const cancelBtn = (order.status !== 'cancelled')
      ? `<button class="btn-admin danger" data-order-id="${order.id}" data-action="cancel-order" title="Cancel this order">❌ Cancel</button>`
      : `<span style="font-size:0.78rem;color:var(--danger);font-weight:700;">Cancelled</span>`;

    const actionsHtml = `
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        ${nextBtn}
        ${cancelBtn}
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
        <td><strong>₹${order.total}</strong></td>
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
    const order = state.orders.find(o => o.id === orderId);
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

    // 3. Cancel order button
    container.querySelectorAll('[data-action="cancel-order"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
          updateOrderStatus(orderId, 'cancelled');
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
        const id = parseInt(btn.dataset.deleteItem);
        if (confirm('Are you sure you want to delete this menu item?')) {
          state.menu = state.menu.filter(i => i.id !== id);
          saveMenu();
          renderMenuEditor();
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
        const id = parseInt(btn.dataset.promoDelete);
        state.promos = state.promos.filter(p => p.id !== id);
        savePromos();
        renderPromotions();
        showToast('Promotion deleted', 'info');
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
        <button class="user-profile-btn" id="btnAdminProfile" aria-label="Admin Profile" style="border-color:var(--accent);background:var(--accent-soft);">
          <span class="user-avatar-circle" style="background:linear-gradient(135deg, #d97706, #ef4444);">👑</span>
          <span style="font-weight:700;color:var(--accent);">Admin Active</span>
          <span style="font-size:0.68rem;opacity:0.7;">▾</span>
        </button>
        <div class="user-dropdown" id="adminDropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${(user && user.name) || 'Restaurant Admin'}</div>
            <div class="user-dropdown-email">${(user && user.phone) || (user && user.email) || '+91 99999 88888'}</div>
            <div style="font-size:0.72rem;color:var(--success);font-weight:700;margin-top:2px;">● MongoDB Role: Admin</div>
          </div>
          <a href="index.html" class="user-dropdown-item">🍽️ Customer Store</a>
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
