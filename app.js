/* ============================================
   MJ's Corner — Customer Portal Application
   ============================================ */

(function () {
  'use strict';

  // ========== DEFAULT MENU DATA ==========
  const DEFAULT_MENU = [
    // ---- Burgers ----
    {
      id: 1, name: 'Classic Smash Burger', category: 'Burgers',
      description: 'Double-stacked beef patties with melted cheese, special sauce, and brioche bun',
      image: 'images/burger.jpg', mrp: 349, offerPrice: 249,
      badge: 'Bestseller', available: true
    },
    {
      id: 2, name: 'BBQ Bacon Burger', category: 'Burgers',
      description: 'Smoky BBQ sauce, crispy bacon, caramelized onions, and pepper jack cheese',
      image: 'images/burger.jpg', mrp: 399, offerPrice: 329,
      badge: '', available: true
    },
    {
      id: 3, name: 'Spicy Chicken Burger', category: 'Burgers',
      description: 'Crispy fried chicken fillet with sriracha mayo and pickled jalapeños',
      image: 'images/burger.jpg', mrp: 329, offerPrice: 269,
      badge: '🌶️ Spicy', available: true
    },
    // ---- Pizza ----
    {
      id: 4, name: 'Margherita Pizza', category: 'Pizza',
      description: 'San Marzano tomatoes, fresh mozzarella, basil, and extra-virgin olive oil',
      image: 'images/pizza.jpg', mrp: 449, offerPrice: 349,
      badge: 'Popular', available: true
    },
    {
      id: 5, name: 'Pepperoni Feast', category: 'Pizza',
      description: 'Loaded with spicy pepperoni, mozzarella, and our signature tomato sauce',
      image: 'images/pizza.jpg', mrp: 549, offerPrice: 449,
      badge: '', available: true
    },
    {
      id: 6, name: 'BBQ Chicken Pizza', category: 'Pizza',
      description: 'Grilled chicken, BBQ sauce, red onions, and smoked gouda cheese',
      image: 'images/pizza.jpg', mrp: 599, offerPrice: 479,
      badge: 'New', available: true
    },
    // ---- Pasta ----
    {
      id: 7, name: 'Chicken Alfredo', category: 'Pasta',
      description: 'Creamy fettuccine with grilled chicken, parmesan, and fresh herbs',
      image: 'images/pasta.jpg', mrp: 399, offerPrice: 329,
      badge: 'Chef\'s Pick', available: true
    },
    {
      id: 8, name: 'Penne Arrabbiata', category: 'Pasta',
      description: 'Spicy tomato sauce with garlic, chili flakes, and fresh basil',
      image: 'images/pasta.jpg', mrp: 349, offerPrice: 279,
      badge: '', available: true
    },
    // ---- Sides ----
    {
      id: 9, name: 'Loaded Cheese Fries', category: 'Sides',
      description: 'Crispy fries topped with melted cheese sauce, herbs, and spices',
      image: 'images/fries.jpg', mrp: 249, offerPrice: 179,
      badge: 'Fan Fav', available: true
    },
    {
      id: 10, name: 'Buffalo Wings', category: 'Sides',
      description: 'Glazed buffalo wings with blue cheese dip and celery sticks',
      image: 'images/wings.jpg', mrp: 379, offerPrice: 299,
      badge: '', available: true
    },
    {
      id: 11, name: 'Chicken Shawarma Wrap', category: 'Sides',
      description: 'Grilled chicken with pickled vegetables, tahini, and fresh lettuce',
      image: 'images/wrap.jpg', mrp: 279, offerPrice: 229,
      badge: '', available: true
    },
    // ---- Salads ----
    {
      id: 12, name: 'Mediterranean Bowl', category: 'Salads',
      description: 'Grilled chicken, feta, olives, tomatoes, cucumber, and lemon vinaigrette',
      image: 'images/salad.jpg', mrp: 349, offerPrice: 289,
      badge: 'Healthy', available: true
    },
    // ---- Drinks ----
    {
      id: 13, name: 'Mango Smoothie', category: 'Drinks',
      description: 'Fresh tropical mango blended with yogurt and a hint of mint',
      image: 'images/smoothie.jpg', mrp: 199, offerPrice: 149,
      badge: '', available: true
    },
    {
      id: 14, name: 'Berry Blast Smoothie', category: 'Drinks',
      description: 'Mixed berries, banana, and honey blended to perfection',
      image: 'images/smoothie.jpg', mrp: 229, offerPrice: 179,
      badge: 'New', available: true
    },
    // ---- Desserts ----
    {
      id: 15, name: 'Molten Brownie Sundae', category: 'Desserts',
      description: 'Warm chocolate brownie with vanilla ice cream and chocolate drizzle',
      image: 'images/brownie.jpg', mrp: 299, offerPrice: 229,
      badge: '🍫 Indulge', available: true
    },
    {
      id: 16, name: 'Classic Cheesecake', category: 'Desserts',
      description: 'New York style cheesecake with berry compote',
      image: 'images/brownie.jpg', mrp: 349, offerPrice: 269,
      badge: '', available: true
    }
  ];

  // ========== STATE ==========
  let state = {
    menu: [],
    cart: [],
    orderType: 'dine-in', // 'dine-in' | 'pickup' | 'delivery'
    activeCategory: 'All',
    orderCounter: parseInt(localStorage.getItem('mj_orderCounter') || '0'),
    promos: [],
    promoPopupEnabled: true,
    appliedPromo: null,
    selectedDeliveryAddressId: null
  };

  // Load from localStorage via shared MJData
  function loadState() {
    try {
      state.menu = window.MJData ? MJData.getMenu() : (JSON.parse(localStorage.getItem('mj_menu')) || [...DEFAULT_MENU]);
      state.promos = window.MJData ? MJData.getPromos() : (JSON.parse(localStorage.getItem('mj_promos')) || []);
      state.promoPopupEnabled = window.MJData ? MJData.isPromoPopupEnabled() : true;
      const savedCart = localStorage.getItem('mj_cart');
      state.cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      state.menu = window.MJData ? MJData.getMenu() : [];
      state.cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem('mj_cart', JSON.stringify(state.cart));
  }

  // ========== DOM REFERENCES ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    themeToggle: $('#themeToggle'),
    btnHeaderOrders: $('#btnHeaderOrders'),
    headerOrdersCount: $('#headerOrdersCount'),
    btnHeaderProfile: $('#btnHeaderProfile'),
    headerUserAvatar: $('#headerUserAvatar'),
    headerUserName: $('#headerUserName'),
    cartBtnHeader: $('#cartBtnHeader'),
    cartBadge: $('#cartBadge'),
    menuSection: $('#menuSection'),
    categoryNavInner: $('#categoryNavInner'),
    menuContainer: $('#menuContainer'),
    // Floating bar
    floatingCheckoutBar: $('#floatingCheckoutBar'),
    floatingBarInfo: $('#floatingBarInfo'),
    floatingItemCount: $('#floatingItemCount'),
    floatingTotal: $('#floatingTotal'),
    floatingSavings: $('#floatingSavings'),
    btnFloatingCheckout: $('#btnFloatingCheckout'),
    // Cart drawer
    cartOverlay: $('#cartOverlay'),
    cartDrawer: $('#cartDrawer'),
    cartBody: $('#cartBody'),
    cartEmpty: $('#cartEmpty'),
    cartItemsList: $('#cartItemsList'),
    cartFooter: $('#cartFooter'),
    cartCloseBtn: $('#cartCloseBtn'),
    cartSubtotal: $('#cartSubtotal'),
    cartSavings: $('#cartSavings'),
    cartTotal: $('#cartTotal'),
    btnCheckout: $('#btnCheckout'),
    // Checkout modal
    checkoutModal: $('#checkoutModal'),
    checkoutCloseBtn: $('#checkoutCloseBtn'),
    checkoutForm: $('#checkoutForm'),
    checkoutOrderTypeGrid: $('#checkoutOrderTypeGrid'),
    dineInNoticeGroup: $('#dineInNoticeGroup'),
    pickupInfoGroup: $('#pickupInfoGroup'),
    deliveryAddressGroup: $('#deliveryAddressGroup'),
    savedAddressesList: $('#savedAddressesList'),
    btnToggleAddAddress: $('#btnToggleAddAddress'),
    newAddressPanel: $('#newAddressPanel'),
    newAddrTitle: $('#newAddrTitle'),
    newAddrFull: $('#newAddrFull'),
    btnSaveNewAddress: $('#btnSaveNewAddress'),
    custName: $('#custName'),
    custPhone: $('#custPhone'),
    custNotes: $('#custNotes'),
    // Checkout Promo
    checkoutPromoInput: $('#checkoutPromoInput'),
    btnApplyCheckoutPromo: $('#btnApplyCheckoutPromo'),
    checkoutPromoChips: $('#checkoutPromoChips'),
    appliedCouponTag: $('#appliedCouponTag'),
    appliedCouponText: $('#appliedCouponText'),
    btnRemoveCoupon: $('#btnRemoveCoupon'),
    checkoutSubtotal: $('#checkoutSubtotal'),
    checkoutCouponRow: $('#checkoutCouponRow'),
    checkoutCouponLabel: $('#checkoutCouponLabel'),
    checkoutCouponDiscount: $('#checkoutCouponDiscount'),
    checkoutTotal: $('#checkoutTotal'),
    btnPlaceOrder: $('#btnPlaceOrder'),
    // Profile modal
    profileModal: $('#profileModal'),
    profileCloseBtn: $('#profileCloseBtn'),
    tabProfileDetails: $('#tabProfileDetails'),
    tabProfileAddresses: $('#tabProfileAddresses'),
    tabProfileOrders: $('#tabProfileOrders'),
    profileDetailsContent: $('#profileDetailsContent'),
    profileAddressesContent: $('#profileAddressesContent'),
    profileOrdersContent: $('#profileOrdersContent'),
    profileDetailsForm: $('#profileDetailsForm'),
    profName: $('#profName'),
    profEmail: $('#profEmail'),
    profPhone: $('#profPhone'),
    btnProfileSignOut: $('#btnProfileSignOut'),
    btnProfileAddAddress: $('#btnProfileAddAddress'),
    profileAddAddressPanel: $('#profileAddAddressPanel'),
    profileNewAddrTitle: $('#profileNewAddrTitle'),
    profileNewAddrFull: $('#profileNewAddrFull'),
    btnProfileSaveNewAddress: $('#btnProfileSaveNewAddress'),
    profileAddressList: $('#profileAddressList'),
    profileOrdersList: $('#profileOrdersList'),
    // Dedicated Orders modal
    ordersModal: $('#ordersModal'),
    ordersCloseBtn: $('#ordersCloseBtn'),
    customerOrdersList: $('#customerOrdersList'),
    // Success modal
    successModal: $('#successModal'),
    orderIdDisplay: $('#orderIdDisplay'),
    orderSuccessTypeDisplay: $('#orderSuccessTypeDisplay'),
    orderSuccessPromoDisplay: $('#orderSuccessPromoDisplay'),
    btnTrackOrderInSuccess: $('#btnTrackOrderInSuccess'),
    btnNewOrder: $('#btnNewOrder'),
    // Promo popup
    promoPopupOverlay: $('#promoPopupOverlay'),
    promoPopupClose: $('#promoPopupClose'),
    promoDismiss: $('#promoDismiss'),
    promoTitle: $('#promoTitle'),
    promoSubtitle: $('#promoSubtitle'),
    promoCode: $('#promoCode'),
    promoDesc: $('#promoDesc'),
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
    }, 2600);
  }

  // ========== USER PROFILE & HEADER ==========
  function initHeaderProfile() {
    const auth = window.MJAuth || (typeof MJAuth !== 'undefined' ? MJAuth : null);
    if (!auth) return;
    const user = auth.getCurrentUser();
    if (!user) {
      window.location.replace('login.html');
      return;
    }

    const isAdm = auth.isAdmin(user);

    if (isAdm) {
      els.headerUserAvatar.textContent = '👑';
      els.headerUserAvatar.style.background = 'linear-gradient(135deg, #d97706, #ef4444)';
      els.headerUserName.textContent = 'Admin';

      let adminLink = $('#headerAdminLink');
      if (!adminLink && els.btnHeaderProfile && els.btnHeaderProfile.parentNode) {
        adminLink = document.createElement('a');
        adminLink.id = 'headerAdminLink';
        adminLink.href = 'admin.html';
        adminLink.className = 'btn-ghost-nav';
        adminLink.style.cssText = 'color:#d97706;font-weight:700;border-color:#d97706;margin-right:8px;text-decoration:none;';
        adminLink.innerHTML = '👑 Admin Portal';
        els.btnHeaderProfile.parentNode.insertBefore(adminLink, els.btnHeaderProfile);
      }
    } else {
      const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      const firstName = user.name ? user.name.split(' ')[0] : 'Profile';

      els.headerUserAvatar.textContent = firstLetter;
      els.headerUserAvatar.style.background = 'linear-gradient(135deg, var(--accent), #ff6b6b)';
      els.headerUserName.textContent = firstName;

      const adminLink = $('#headerAdminLink');
      if (adminLink) adminLink.remove();
    }
  }

  function openProfileModal(tab = 'details') {
    const user = MJAuth.getCurrentUser();
    if (!user) return;

    // Populate personal details form
    els.profName.value = user.name || '';
    els.profEmail.value = user.email || '';
    els.profPhone.value = user.phone || '';

    // Render addresses
    renderProfileAddresses();

    // Render orders
    renderProfileOrders();

    // Switch to specified tab
    switchProfileTab(tab);

    els.profileModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProfileModal() {
    els.profileModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchProfileTab(tab) {
    els.tabProfileDetails.classList.toggle('active', tab === 'details');
    els.tabProfileAddresses.classList.toggle('active', tab === 'addresses');
    els.tabProfileOrders.classList.toggle('active', tab === 'orders');

    els.profileDetailsContent.classList.toggle('active', tab === 'details');
    els.profileAddressesContent.classList.toggle('active', tab === 'addresses');
    els.profileOrdersContent.classList.toggle('active', tab === 'orders');
  }

  function renderProfileAddresses() {
    const user = MJAuth.getCurrentUser();
    if (!user) return;
    const addresses = MJAuth.getUserAddresses(user.id);

    if (addresses.length === 0) {
      els.profileAddressList.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--text-tertiary);background:var(--bg-secondary);border-radius:var(--radius-md);">
          No saved addresses yet. Click "+ Add Address" above to save one.
        </div>
      `;
      return;
    }

    els.profileAddressList.innerHTML = addresses.map(addr => `
      <div class="profile-address-item">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="address-tag">${addr.title}</span>
            ${addr.isDefault ? '<span class="address-default-badge">★ Default</span>' : ''}
          </div>
          <div style="font-size:0.85rem;color:var(--text-secondary);">${addr.fullAddress}</div>
        </div>
        <button type="button" class="btn-admin danger" data-delete-addr="${addr.id}" title="Delete address" style="padding:6px 10px;font-size:0.8rem;">
          🗑️
        </button>
      </div>
    `).join('');

    els.profileAddressList.querySelectorAll('[data-delete-addr]').forEach(btn => {
      btn.addEventListener('click', () => {
        MJAuth.deleteUserAddress(user.id, btn.dataset.deleteAddr);
        renderProfileAddresses();
        renderCheckoutAddresses();
        showToast('Address deleted.', 'info');
      });
    });
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

  function formatOrderDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function updateHeaderOrdersBadge() {
    if (!els.headerOrdersCount) return;
    const user = MJAuth.getCurrentUser();
    if (!user) {
      els.headerOrdersCount.classList.add('hidden');
      return;
    }
    const allOrders = JSON.parse(localStorage.getItem('mj_orders') || '[]');
    const activeUserOrders = allOrders.filter(o => 
      ((o.customer && o.customer.userId === user.id) || (o.customer && o.customer.email === user.email)) &&
      ['pending', 'preparing', 'ready'].includes(o.status)
    );
    if (activeUserOrders.length > 0) {
      els.headerOrdersCount.textContent = activeUserOrders.length;
      els.headerOrdersCount.classList.remove('hidden');
    } else {
      els.headerOrdersCount.classList.add('hidden');
    }
  }

  function openOrdersModal() {
    renderCustomerOrders(els.customerOrdersList);
    els.ordersModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeOrdersModal() {
    els.ordersModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function cancelCustomerOrder(orderId) {
    const allOrders = JSON.parse(localStorage.getItem('mj_orders') || '[]');
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status !== 'pending') {
      showToast('This order can no longer be cancelled as it is already being prepared.', 'error');
      return;
    }
    order.status = 'cancelled';
    localStorage.setItem('mj_orders', JSON.stringify(allOrders));
    window.dispatchEvent(new Event('mj_orders_changed'));
    renderCustomerOrders(els.customerOrdersList);
    renderProfileOrders();
    updateHeaderOrdersBadge();
    showToast(`Order ${orderId} has been cancelled successfully.`, 'info');
  }

  function renderCustomerOrders(container) {
    if (!container) return;
    const user = MJAuth.getCurrentUser();
    if (!user) return;

    const allOrders = JSON.parse(localStorage.getItem('mj_orders') || '[]');
    const myOrders = allOrders.filter(o => 
      (o.customer && o.customer.userId === user.id) || 
      (o.customer && o.customer.email === user.email)
    );

    if (myOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 20px;color:var(--text-tertiary);">
          <div style="font-size:3.5rem;margin-bottom:12px;">🍽️</div>
          <h3 style="font-size:1.15rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">No Orders Yet</h3>
          <p style="font-size:0.88rem;max-width:320px;margin:0 auto 18px;">You haven't placed any orders yet. Discover our fresh meals and order now!</p>
          <button type="button" class="btn-admin primary" id="btnExploreMenuFromOrders" style="padding:10px 22px;border-radius:var(--radius-full);">
            🍴 Browse Menu
          </button>
        </div>
      `;
      const btnExplore = container.querySelector('#btnExploreMenuFromOrders');
      if (btnExplore) {
        btnExplore.addEventListener('click', () => {
          closeOrdersModal();
          closeProfileModal();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
      return;
    }

    const typeIcons = { 'dine-in': '🍽️ Dine-In', 'pickup': '🥡 Pickup', 'delivery': '🚗 Delivery' };

    container.innerHTML = myOrders.map(order => {
      const isCancelled = order.status === 'cancelled';
      const items = order.items || [];
      const dateFormatted = formatOrderDateTime(order.timestamp);

      // Status Stepper calculation
      let stepperHtml = '';
      if (!isCancelled) {
        const steps = [
          { key: 'pending', label: 'Order Placed', icon: '⏳' },
          { key: 'preparing', label: 'In Kitchen', icon: '👨‍🍳' },
          { key: 'ready', label: 'Ready', icon: '✅' },
          { key: 'delivered', label: order.type === 'delivery' ? 'Delivered' : 'Served', icon: '🚗' }
        ];

        const statusIdx = steps.findIndex(s => s.key === order.status);
        const fillPct = statusIdx >= 0 ? (statusIdx / (steps.length - 1)) * 100 : 0;

        stepperHtml = `
          <div class="order-tracker-stepper">
            <div class="stepper-bar-bg">
              <div class="stepper-bar-fill" style="width:${fillPct}%;"></div>
            </div>
            ${steps.map((st, idx) => {
              const isCompleted = idx < statusIdx;
              const isActive = idx === statusIdx;
              const stepCls = isCompleted ? 'completed' : (isActive ? 'active' : '');
              return `
                <div class="stepper-step ${stepCls}">
                  <div class="stepper-circle">${isCompleted ? '✓' : st.icon}</div>
                  <div class="stepper-label">${st.label}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        stepperHtml = `
          <div class="order-cancelled-banner">
            <span>❌</span>
            <span>This order was cancelled.</span>
          </div>
        `;
      }

      // Can cancel if still pending
      const canCancel = order.status === 'pending';
      const cancelBtnHtml = canCancel
        ? `<button type="button" class="btn-cancel-cust-order" data-cancel-order="${order.id}">❌ Cancel Order</button>`
        : '';

      return `
        <div class="customer-order-card" id="cust-order-${order.id}">
          <div class="customer-order-header">
            <div class="customer-order-id-group">
              <span class="customer-order-id">${order.id}</span>
              <span class="customer-order-type-badge">${typeIcons[order.type] || order.type}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <span class="status-badge ${order.status}">${order.status.toUpperCase()}</span>
              <span class="customer-order-date">${dateFormatted}</span>
            </div>
          </div>

          <!-- Stepper / Status Banner -->
          ${stepperHtml}

          <!-- Items Ordered -->
          <div class="customer-order-items-box">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
              Ordered Items (${items.length})
            </div>
            ${items.map(item => `
              <div class="customer-order-item-row">
                <img src="${item.image || 'images/burger.jpg'}" alt="${escapeHtml(item.name)}" class="customer-order-item-img" onerror="this.src='images/burger.jpg'">
                <div class="customer-order-item-info">
                  <div class="customer-order-item-name">${escapeHtml(item.name)}</div>
                  <div class="customer-order-item-sub">₹${item.offerPrice || item.mrp || 0} × ${item.qty}</div>
                </div>
                <div class="customer-order-item-total">₹${((item.offerPrice || item.mrp || 0) * (item.qty || 1))}</div>
              </div>
            `).join('')}

            ${(order.customer && (order.customer.notes || order.customer.address)) || order.coupon ? `
              <div class="customer-order-meta">
                ${order.customer.notes ? `
                  <div class="customer-order-meta-item">
                    <span>📝</span>
                    <span><strong>Kitchen Note:</strong> ${escapeHtml(order.customer.notes)}</span>
                  </div>
                ` : ''}
                ${order.customer.address ? `
                  <div class="customer-order-meta-item">
                    <span>📍</span>
                    <span><strong>Delivery to:</strong> ${escapeHtml(order.customer.address)}</span>
                  </div>
                ` : ''}
                ${order.coupon ? `
                  <div class="customer-order-meta-item" style="color:var(--success);">
                    <span>🎟️</span>
                    <span><strong>Promo '${escapeHtml(order.coupon.code)}':</strong> -₹${order.coupon.discountAmount} applied</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Footer with Total & Cancel button -->
          <div class="customer-order-footer">
            <div class="customer-order-pricing">
              ${order.coupon ? `<div class="customer-order-coupon-text">Saved ₹${order.coupon.discountAmount} with ${order.coupon.code}</div>` : ''}
              <div class="customer-order-total-amount">Total: ₹${order.total}</div>
            </div>
            <div>
              ${cancelBtnHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind cancel order buttons
    container.querySelectorAll('[data-cancel-order]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cancelOrder;
        if (confirm(`Are you sure you want to cancel order ${id}?`)) {
          cancelCustomerOrder(id);
        }
      });
    });
  }

  function renderProfileOrders() {
    renderCustomerOrders(els.profileOrdersList);
  }

  // ========== CATEGORIES & MENU ==========
  function getCategories() {
    const cats = ['All'];
    state.menu.forEach(item => {
      if (!cats.includes(item.category)) {
        cats.push(item.category);
      }
    });
    return cats;
  }

  function renderCategories() {
    const categories = getCategories();
    els.categoryNavInner.innerHTML = categories.map(cat => `
      <button class="category-pill ${cat === state.activeCategory ? 'active' : ''}" data-category="${cat}">
        ${getCategoryIcon(cat)} ${cat}
      </button>
    `).join('');

    els.categoryNavInner.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.category;
        renderCategories();
        renderMenu();
        if (state.activeCategory !== 'All') {
          const el = document.getElementById(`category-${state.activeCategory}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function getCategoryIcon(cat) {
    const icons = {
      'All': '🍴',
      'Burgers': '🍔',
      'Pizza': '🍕',
      'Pasta': '🍝',
      'Sides': '🍟',
      'Salads': '🥗',
      'Drinks': '🥤',
      'Desserts': '🍰'
    };
    return icons[cat] || '🍽️';
  }

  function renderMenu() {
    if (!state.menu || state.menu.length === 0 || !state.menu.some(i => i.available)) {
      els.menuContainer.innerHTML = `
        <div style="text-align:center;padding:80px 20px;color:var(--text-tertiary);">
          <div style="font-size:3.5rem;margin-bottom:12px;">🍽️</div>
          <h3 style="font-size:1.3rem;font-weight:700;color:var(--text-primary);margin-bottom:8px;">No Menu Items Available</h3>
          <p style="max-width:400px;margin:0 auto;font-size:0.9rem;">The kitchen is currently updating the menu. Please check back shortly!</p>
        </div>
      `;
      els.categoryNavInner.innerHTML = '';
      return;
    }

    const categories = state.activeCategory === 'All'
      ? getCategories().filter(c => c !== 'All')
      : [state.activeCategory];

    let html = '';

    categories.forEach(cat => {
      const items = state.menu.filter(i => i.category === cat && i.available);
      if (items.length === 0) return;

      html += `
        <section class="menu-section" id="category-${cat}">
          <div class="menu-section-header">
            <h2>${getCategoryIcon(cat)} ${cat}</h2>
            <span class="count">${items.length} items</span>
          </div>
          <div class="menu-grid">
            ${items.map(item => renderMenuItem(item)).join('')}
          </div>
        </section>
      `;
    });

    els.menuContainer.innerHTML = html;
    bindMenuActions();
  }

  function renderMenuItem(item) {
    const discount = item.mrp > 0 ? Math.round(((item.mrp - item.offerPrice) / item.mrp) * 100) : 0;
    const cartItem = state.cart.find(c => c.id === item.id);
    const qty = cartItem ? cartItem.qty : 0;

    return `
      <div class="menu-card" data-id="${item.id}">
        <div class="menu-card-img-wrap">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          ${item.badge ? `<span class="menu-card-badge">${item.badge}</span>` : ''}
          ${discount > 0 ? `<span class="discount-pill">${discount}% OFF</span>` : ''}
        </div>
        <div class="menu-card-content">
          <h3 class="menu-card-title">${item.name}</h3>
          <p class="menu-card-desc">${item.description}</p>
          <div class="menu-card-pricing">
            <span class="price-offer">₹${item.offerPrice}</span>
            ${item.mrp > item.offerPrice ? `<span class="price-mrp">₹${item.mrp}</span>` : ''}
          </div>
          <div class="menu-card-actions">
            ${qty === 0 ? `
              <button class="btn-add-cart" data-action="add" data-id="${item.id}">
                + Add to Cart
              </button>
            ` : `
              <div class="qty-control">
                <button data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="qty-value">${qty}</span>
                <button data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function bindMenuActions() {
    els.menuContainer.querySelectorAll('[data-action="add"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(parseInt(btn.dataset.id));
      });
    });

    els.menuContainer.querySelectorAll('[data-action="inc"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateCartQty(parseInt(btn.dataset.id), 1);
      });
    });

    els.menuContainer.querySelectorAll('[data-action="dec"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateCartQty(parseInt(btn.dataset.id), -1);
      });
    });
  }

  // ========== CART & FLOATING "GO TO CHECKOUT" BAR ==========
  function addToCart(itemId) {
    const menuItem = state.menu.find(i => i.id === itemId);
    if (!menuItem) return;

    const existing = state.cart.find(c => c.id === itemId);
    if (existing) {
      existing.qty++;
    } else {
      state.cart.push({
        id: menuItem.id,
        name: menuItem.name,
        offerPrice: menuItem.offerPrice,
        mrp: menuItem.mrp,
        image: menuItem.image,
        qty: 1
      });
    }

    saveCart();
    updateCartUI();
    renderMenu();
    showToast(`Added ${menuItem.name} to cart!`);
  }

  function updateCartQty(itemId, delta) {
    const item = state.cart.find(c => c.id === itemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter(c => c.id !== itemId);
    }

    saveCart();
    updateCartUI();
    renderMenu();
  }

  function removeFromCart(itemId) {
    state.cart = state.cart.filter(c => c.id !== itemId);
    saveCart();
    updateCartUI();
    renderMenu();
    showToast('Item removed from cart', 'info');
  }

  function getCartTotals() {
    let subtotal = 0;
    let originalTotal = 0;
    let itemCount = 0;

    state.cart.forEach(item => {
      subtotal += item.offerPrice * item.qty;
      originalTotal += item.mrp * item.qty;
      itemCount += item.qty;
    });

    const savings = originalTotal - subtotal;
    return { subtotal, savings, total: subtotal, itemCount };
  }

  function updateCartUI() {
    const totals = getCartTotals();

    // 1. Header Badge
    els.cartBadge.textContent = totals.itemCount;
    els.cartBadge.classList.toggle('show', totals.itemCount > 0);

    // 2. Floating "Go to Checkout" Bar
    if (totals.itemCount > 0) {
      els.floatingCheckoutBar.classList.remove('hidden');
      els.floatingItemCount.textContent = `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`;
      els.floatingTotal.textContent = `₹${totals.total}`;
      els.floatingSavings.textContent = totals.savings > 0 ? `Saved ₹${totals.savings}` : '';
    } else {
      els.floatingCheckoutBar.classList.add('hidden');
    }

    // 3. Cart Drawer Contents
    if (state.cart.length === 0) {
      els.cartEmpty.classList.remove('hidden');
      els.cartItemsList.innerHTML = '';
      els.cartFooter.classList.add('hidden');
      return;
    }

    els.cartEmpty.classList.add('hidden');
    els.cartFooter.classList.remove('hidden');

    els.cartSubtotal.textContent = `₹${totals.subtotal}`;
    els.cartSavings.textContent = `₹${totals.savings}`;
    els.cartTotal.textContent = `₹${totals.total}`;

    els.cartItemsList.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.offerPrice}</div>
          <div class="cart-item-controls">
            <div class="qty-control">
              <button data-cart-action="dec" data-id="${item.id}">−</button>
              <span class="qty-value">${item.qty}</span>
              <button data-cart-action="inc" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
        <button class="cart-item-remove" data-cart-action="remove" data-id="${item.id}" aria-label="Remove item">🗑️</button>
      </div>
    `).join('');

    els.cartItemsList.querySelectorAll('[data-cart-action="inc"]').forEach(btn => {
      btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id), 1));
    });
    els.cartItemsList.querySelectorAll('[data-cart-action="dec"]').forEach(btn => {
      btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id), -1));
    });
    els.cartItemsList.querySelectorAll('[data-cart-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
    });
  }

  // ========== CART DRAWER ==========
  function openCart() {
    els.cartOverlay.classList.add('open');
    els.cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCartUI();
  }

  function closeCart() {
    els.cartOverlay.classList.remove('open');
    els.cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ========== CHECKOUT LOGIC ==========
  function initCheckoutOrderType() {
    if (!els.checkoutOrderTypeGrid) return;
    const cards = els.checkoutOrderTypeGrid.querySelectorAll('.order-type-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.orderType = card.dataset.type;
        applyOrderTypeView(state.orderType);
      });
    });
  }

  function applyOrderTypeView(type) {
    if (type === 'dine-in') {
      els.dineInNoticeGroup.classList.remove('hidden');
      els.pickupInfoGroup.classList.add('hidden');
      els.deliveryAddressGroup.classList.add('hidden');
    } else if (type === 'pickup') {
      els.dineInNoticeGroup.classList.add('hidden');
      els.pickupInfoGroup.classList.remove('hidden');
      els.deliveryAddressGroup.classList.add('hidden');
    } else if (type === 'delivery') {
      els.dineInNoticeGroup.classList.add('hidden');
      els.pickupInfoGroup.classList.add('hidden');
      els.deliveryAddressGroup.classList.remove('hidden');
      renderCheckoutAddresses();
    }
  }

  function renderCheckoutAddresses() {
    const user = MJAuth.getCurrentUser();
    if (!user) return;
    const addresses = MJAuth.getUserAddresses(user.id);

    if (addresses.length === 0) {
      els.savedAddressesList.innerHTML = `
        <div style="padding:14px;background:var(--bg-secondary);border:1px dashed var(--border);border-radius:var(--radius-md);font-size:0.85rem;color:var(--text-secondary);text-align:center;">
          No address saved on this account yet. Please add your delivery address below.
        </div>
      `;
      els.newAddressPanel.classList.remove('hidden');
      return;
    }

    // Set default selected
    if (!state.selectedDeliveryAddressId || !addresses.some(a => a.id === state.selectedDeliveryAddressId)) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      state.selectedDeliveryAddressId = def ? def.id : null;
    }

    els.savedAddressesList.innerHTML = addresses.map(addr => `
      <label class="address-option-card ${addr.id === state.selectedDeliveryAddressId ? 'selected' : ''}" data-addr-id="${addr.id}">
        <input type="radio" name="checkoutAddressRadio" value="${addr.id}" ${addr.id === state.selectedDeliveryAddressId ? 'checked' : ''}>
        <div class="address-option-info">
          <div class="address-option-header">
            <span class="address-tag">${addr.title}</span>
            ${addr.isDefault ? '<span class="address-default-badge">★ Default</span>' : ''}
          </div>
          <div class="address-text">${addr.fullAddress}</div>
        </div>
      </label>
    `).join('');

    els.savedAddressesList.querySelectorAll('.address-option-card').forEach(card => {
      card.addEventListener('click', () => {
        state.selectedDeliveryAddressId = card.dataset.addrId;
        renderCheckoutAddresses();
      });
    });
  }

  function openCheckout() {
    if (state.cart.length === 0) {
      showToast('Please add items to your cart first!', 'error');
      return;
    }

    closeCart();
    setTimeout(() => {
      els.checkoutModal.classList.add('open');
      document.body.style.overflow = 'hidden';

      const user = MJAuth.getCurrentUser();
      if (user) {
        if (!els.custName.value) els.custName.value = user.name || '';
        if (!els.custPhone.value) els.custPhone.value = user.phone || '';
      }

      applyOrderTypeView(state.orderType);
      renderCheckoutPromoChips();
      updateCheckoutBreakdown();
    }, 250);
  }

  function closeCheckout() {
    els.checkoutModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ========== COUPON CODE IN CHECKOUT ==========
  function renderCheckoutPromoChips() {
    const activePromos = (state.promos || []).filter(p => p.active);
    if (activePromos.length === 0) {
      els.checkoutPromoChips.innerHTML = '<span style="font-size:0.8rem;opacity:0.65;padding:4px 0;">No active coupons available right now</span>';
      return;
    }

    els.checkoutPromoChips.innerHTML = activePromos.map(promo => {
      const discountLabel = promo.discountPercent ? `${promo.discountPercent}% OFF` : (promo.flatDiscount ? `₹${promo.flatDiscount} OFF` : 'DEAL');
      return `
        <span class="promo-chip" data-code="${promo.code}">
          🏷️ ${promo.code} (${discountLabel})
        </span>
      `;
    }).join('');

    els.checkoutPromoChips.querySelectorAll('.promo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        els.checkoutPromoInput.value = chip.dataset.code;
        applyCheckoutCoupon(chip.dataset.code);
      });
    });
  }

  function applyCheckoutCoupon(rawCode) {
    const code = (rawCode || els.checkoutPromoInput.value || '').trim().toUpperCase();
    if (!code) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }

    const promo = state.promos.find(p => p.code.toUpperCase() === code && p.active);
    if (!promo) {
      showToast(`Invalid or inactive coupon code: ${code}`, 'error');
      return;
    }

    const { subtotal } = getCartTotals();
    let discount = 0;
    if (promo.discountPercent) {
      discount = Math.round((subtotal * promo.discountPercent) / 100);
    } else if (promo.flatDiscount) {
      discount = Math.min(promo.flatDiscount, subtotal);
    } else {
      discount = Math.round(subtotal * 0.2);
    }

    state.appliedPromo = {
      code: promo.code,
      title: promo.title,
      discountAmount: discount
    };

    els.appliedCouponTag.classList.remove('hidden');
    els.appliedCouponText.textContent = `🎉 '${promo.code}' applied! You saved ₹${discount}`;
    showToast(`Coupon ${promo.code} applied! Saved ₹${discount}`);
    updateCheckoutBreakdown();
  }

  function removeCheckoutCoupon() {
    state.appliedPromo = null;
    els.appliedCouponTag.classList.add('hidden');
    els.checkoutPromoInput.value = '';
    showToast('Coupon removed.', 'info');
    updateCheckoutBreakdown();
  }

  function updateCheckoutBreakdown() {
    const { subtotal } = getCartTotals();
    els.checkoutSubtotal.textContent = `₹${subtotal}`;

    let discount = 0;
    if (state.appliedPromo) {
      discount = state.appliedPromo.discountAmount;
      els.checkoutCouponRow.classList.remove('hidden');
      els.checkoutCouponLabel.textContent = `Coupon (${state.appliedPromo.code})`;
      els.checkoutCouponDiscount.textContent = `-₹${discount}`;
    } else {
      els.checkoutCouponRow.classList.add('hidden');
    }

    const finalPayable = Math.max(0, subtotal - discount);
    els.checkoutTotal.textContent = `₹${finalPayable}`;
  }

  // ========== PLACE ORDER ==========
  function placeOrder(e) {
    e.preventDefault();

    const user = MJAuth.getCurrentUser();
    let deliveryAddress = '';

    if (state.orderType === 'delivery') {
      const addresses = user ? MJAuth.getUserAddresses(user.id) : [];
      const selected = addresses.find(a => a.id === state.selectedDeliveryAddressId);
      if (!selected) {
        showToast('Please select or add a delivery address', 'error');
        return;
      }
      deliveryAddress = `${selected.title}: ${selected.fullAddress}`;
    }

    state.orderCounter++;
    localStorage.setItem('mj_orderCounter', state.orderCounter);

    const orderId = `#MJ-${String(state.orderCounter).padStart(4, '0')}`;
    const totals = getCartTotals();
    const discount = state.appliedPromo ? state.appliedPromo.discountAmount : 0;
    const finalTotal = Math.max(0, totals.total - discount);

    const order = {
      id: orderId,
      type: state.orderType,
      items: [...state.cart],
      subtotal: totals.subtotal,
      total: finalTotal,
      coupon: state.appliedPromo ? { ...state.appliedPromo } : null,
      customer: {
        userId: user ? user.id : 'guest',
        name: els.custName.value.trim(),
        phone: els.custPhone.value.trim(),
        email: user ? user.email : '',
        address: deliveryAddress,
        notes: els.custNotes.value.trim()
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem('mj_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('mj_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('mj_orders_changed'));
    updateHeaderOrdersBadge();

    // Clear cart & coupon
    state.cart = [];
    state.appliedPromo = null;
    saveCart();
    updateCartUI();
    renderMenu();

    // Show Success Modal
    closeCheckout();
    setTimeout(() => {
      els.orderIdDisplay.textContent = orderId;

      const typeLabels = {
        'dine-in': '🍽️ Dine-In Order (Staff will serve at your table)',
        'pickup': '🥡 Express Counter Pickup (~15-20 mins)',
        'delivery': `🚗 Delivery to: ${deliveryAddress}`
      };
      els.orderSuccessTypeDisplay.textContent = typeLabels[order.type] || order.type;

      if (order.coupon) {
        els.orderSuccessPromoDisplay.textContent = `🎟️ Promo applied: ${order.coupon.code} (Saved ₹${order.coupon.discountAmount})`;
      } else {
        els.orderSuccessPromoDisplay.textContent = '';
      }

      els.successModal.classList.add('open');
    }, 300);

    els.checkoutForm.reset();
  }

  function closeSuccess() {
    els.successModal.classList.remove('open');
  }

  // ========== PROMO POPUP ==========
  function showPromoPopup(promo) {
    if (!promo) return;
    els.promoTitle.textContent = promo.title;
    els.promoSubtitle.textContent = promo.subtitle;
    els.promoCode.textContent = promo.code;
    els.promoDesc.textContent = promo.description;
    els.promoPopupOverlay.classList.add('open');
  }

  function closePromoPopup() {
    els.promoPopupOverlay.classList.remove('open');
  }

  // ========== EVENT BINDINGS ==========
  function bindEvents() {
    els.themeToggle.addEventListener('click', toggleTheme);
    els.btnHeaderProfile.addEventListener('click', () => openProfileModal('details'));

    // Cart Drawer triggers
    els.cartBtnHeader.addEventListener('click', openCart);
    els.cartOverlay.addEventListener('click', closeCart);
    els.cartCloseBtn.addEventListener('click', closeCart);
    els.btnCheckout.addEventListener('click', openCheckout);

    // Floating Bar triggers
    els.btnFloatingCheckout.addEventListener('click', openCheckout);
    els.floatingBarInfo.addEventListener('click', openCart);

    // Checkout Modal triggers
    els.checkoutCloseBtn.addEventListener('click', closeCheckout);
    els.checkoutForm.addEventListener('submit', placeOrder);

    // Coupon triggers
    els.btnApplyCheckoutPromo.addEventListener('click', () => applyCheckoutCoupon());
    els.btnRemoveCoupon.addEventListener('click', removeCheckoutCoupon);

    // Checkout Add Address toggle & save
    els.btnToggleAddAddress.addEventListener('click', () => {
      els.newAddressPanel.classList.toggle('hidden');
    });

    els.btnSaveNewAddress.addEventListener('click', () => {
      const user = MJAuth.getCurrentUser();
      const title = els.newAddrTitle.value.trim() || 'Home';
      const full = els.newAddrFull.value.trim();
      if (!full) {
        showToast('Please type a complete address', 'error');
        return;
      }
      const newAddr = MJAuth.addUserAddress(user.id, { title, fullAddress: full, isDefault: true });
      if (newAddr) {
        state.selectedDeliveryAddressId = newAddr.id;
        els.newAddrTitle.value = '';
        els.newAddrFull.value = '';
        els.newAddressPanel.classList.add('hidden');
        renderCheckoutAddresses();
        showToast(`Saved '${title}' address to your account!`, 'success');
      }
    });

    // Profile Modal tabs & triggers
    els.profileCloseBtn.addEventListener('click', closeProfileModal);
    els.tabProfileDetails.addEventListener('click', () => switchProfileTab('details'));
    els.tabProfileAddresses.addEventListener('click', () => switchProfileTab('addresses'));
    els.tabProfileOrders.addEventListener('click', () => switchProfileTab('orders'));

    // Profile Details Form
    els.profileDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = MJAuth.getCurrentUser();
      if (user) {
        MJAuth.updateUserProfile(user.id, {
          name: els.profName.value,
          phone: els.profPhone.value
        });
        initHeaderProfile();
        showToast('Profile updated successfully!', 'success');
      }
    });

    // Profile Sign Out
    els.btnProfileSignOut.addEventListener('click', () => {
      MJAuth.logout();
      showToast('Signed out. See you soon!', 'info');
      setTimeout(() => {
        window.location.replace('login.html');
      }, 500);
    });

    // Profile Add Address panel toggle & save
    els.btnProfileAddAddress.addEventListener('click', () => {
      els.profileAddAddressPanel.classList.toggle('hidden');
    });

    els.btnProfileSaveNewAddress.addEventListener('click', () => {
      const user = MJAuth.getCurrentUser();
      const title = els.profileNewAddrTitle.value.trim() || 'Home';
      const full = els.profileNewAddrFull.value.trim();
      if (!full) {
        showToast('Please enter full address', 'error');
        return;
      }
      MJAuth.addUserAddress(user.id, { title, fullAddress: full, isDefault: false });
      els.profileNewAddrTitle.value = '';
      els.profileNewAddrFull.value = '';
      els.profileAddAddressPanel.classList.add('hidden');
      renderProfileAddresses();
      renderCheckoutAddresses();
      showToast('Address saved to your account!', 'success');
    });

    // My Orders modal triggers
    if (els.btnHeaderOrders) {
      els.btnHeaderOrders.addEventListener('click', openOrdersModal);
    }
    if (els.ordersCloseBtn) {
      els.ordersCloseBtn.addEventListener('click', closeOrdersModal);
    }
    if (els.ordersModal) {
      els.ordersModal.addEventListener('click', (e) => {
        if (e.target === els.ordersModal) closeOrdersModal();
      });
    }
    if (els.btnTrackOrderInSuccess) {
      els.btnTrackOrderInSuccess.addEventListener('click', () => {
        closeSuccess();
        openOrdersModal();
      });
    }

    // Success Modal
    els.btnNewOrder.addEventListener('click', () => {
      closeSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Promo Popup
    els.promoPopupClose.addEventListener('click', closePromoPopup);
    els.promoDismiss.addEventListener('click', closePromoPopup);
    els.promoPopupOverlay.addEventListener('click', (e) => {
      if (e.target === els.promoPopupOverlay) closePromoPopup();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        closeCheckout();
        closeProfileModal();
        closeOrdersModal();
        closeSuccess();
        closePromoPopup();
      }
    });

    function handleDataUpdate() {
      state.menu = window.MJData ? MJData.getMenu() : (JSON.parse(localStorage.getItem('mj_menu')) || []);
      state.promos = window.MJData ? MJData.getPromos() : (JSON.parse(localStorage.getItem('mj_promos')) || []);
      state.promoPopupEnabled = window.MJData ? MJData.isPromoPopupEnabled() : true;
      renderCategories();
      renderMenu();
      renderCheckoutPromoChips();
    }

    function handleOrdersUpdate() {
      updateHeaderOrdersBadge();
      if (els.ordersModal && els.ordersModal.classList.contains('open')) {
        renderCustomerOrders(els.customerOrdersList);
      }
      if (els.profileModal && els.profileModal.classList.contains('open') && els.tabProfileOrders && els.tabProfileOrders.classList.contains('active')) {
        renderProfileOrders();
      }
    }

    window.addEventListener('mj_data_changed', handleDataUpdate);
    window.addEventListener('mj_orders_changed', handleOrdersUpdate);

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'mj_menu' || e.key === 'mj_promos' || e.key === 'mj_promoPopup') {
        handleDataUpdate();
      }
      if (e.key === 'mj_orders') {
        handleOrdersUpdate();
      }
      if (e.key === 'mj_currentUser') {
        initHeaderProfile();
        updateHeaderOrdersBadge();
      }
    });

    window.addEventListener('mj_auth_changed', () => {
      initHeaderProfile();
      updateHeaderOrdersBadge();
    });
  }

  // ========== INIT ==========
  function init() {
    loadState();
    initTheme();
    initHeaderProfile();
    updateHeaderOrdersBadge();
    initCheckoutOrderType();
    renderCategories();
    renderMenu();
    updateCartUI();
    bindEvents();

    // Periodic check for order status updates from admin (poll every 4s)
    setInterval(() => {
      updateHeaderOrdersBadge();
      if (els.ordersModal && els.ordersModal.classList.contains('open')) {
        renderCustomerOrders(els.customerOrdersList);
      }
    }, 4000);

    // Show promo popup once after a short delay
    if (state.promoPopupEnabled) {
      const activePromo = state.promos.find(p => p.active);
      if (activePromo) {
        setTimeout(() => showPromoPopup(activePromo), 1500);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
