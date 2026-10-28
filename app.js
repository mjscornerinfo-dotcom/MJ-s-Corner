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
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219704/mjs_corner/food/burger.jpg', mrp: 349, offerPrice: 249,
      badge: 'Bestseller', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [
        { name: 'Single Patty', price: 249 },
        { name: 'Double Patty', price: 329 }
      ],
      addons: [
        { name: 'Extra Cheese Slice', price: 30 },
        { name: 'Crispy Bacon Strip', price: 50 },
        { name: 'Grilled Mushrooms', price: 40 }
      ]
    },
    {
      id: 2, name: 'BBQ Bacon Burger', category: 'Burgers',
      description: 'Smoky BBQ sauce, crispy bacon, caramelized onions, and pepper jack cheese',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219704/mjs_corner/food/burger.jpg', mrp: 399, offerPrice: 329,
      badge: '', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [
        { name: 'Single Patty', price: 329 },
        { name: 'Double Patty', price: 399 }
      ],
      addons: [
        { name: 'Extra Cheese Slice', price: 30 },
        { name: 'Smoky BBQ Dip', price: 25 }
      ]
    },
    {
      id: 3, name: 'Spicy Chicken Burger', category: 'Burgers',
      description: 'Crispy fried chicken fillet with sriracha mayo and pickled jalapeños',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219704/mjs_corner/food/burger.jpg', mrp: 329, offerPrice: 269,
      badge: '🌶️ Spicy', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [
        { name: 'Single Fillet', price: 269 },
        { name: 'Double Fillet', price: 349 }
      ],
      addons: [
        { name: 'Extra Cheese Slice', price: 30 },
        { name: 'Pickled Jalapeños', price: 25 }
      ]
    },
    // ---- Pizza ----
    {
      id: 4, name: 'Margherita Pizza', category: 'Pizza',
      description: 'San Marzano tomatoes, fresh mozzarella, basil, and extra-virgin olive oil',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219726/mjs_corner/food/pizza.jpg', mrp: 449, offerPrice: 349,
      badge: 'Popular', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [
        { name: 'Regular (8")', price: 349 },
        { name: 'Medium (10")', price: 479 },
        { name: 'Large (12")', price: 599 }
      ],
      addons: [
        { name: 'Cheese Burst Option', price: 99 },
        { name: 'Extra Mozzarella', price: 60 },
        { name: 'Garlic Butter Crust', price: 40 }
      ]
    },
    {
      id: 5, name: 'Pepperoni Feast', category: 'Pizza',
      description: 'Loaded with spicy pepperoni, mozzarella, and our signature tomato sauce',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219726/mjs_corner/food/pizza.jpg', mrp: 549, offerPrice: 449,
      badge: '', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [
        { name: 'Regular (8")', price: 449 },
        { name: 'Medium (10")', price: 599 },
        { name: 'Large (12")', price: 749 }
      ],
      addons: [
        { name: 'Cheese Burst Option', price: 99 },
        { name: 'Extra Pepperoni', price: 80 }
      ]
    },
    {
      id: 6, name: 'BBQ Chicken Pizza', category: 'Pizza',
      description: 'Grilled chicken, BBQ sauce, red onions, and smoked gouda cheese',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219726/mjs_corner/food/pizza.jpg', mrp: 599, offerPrice: 479,
      badge: 'New', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [
        { name: 'Regular (8")', price: 479 },
        { name: 'Medium (10")', price: 629 },
        { name: 'Large (12")', price: 779 }
      ],
      addons: [
        { name: 'Cheese Burst Option', price: 99 },
        { name: 'Smoked Gouda Topping', price: 70 }
      ]
    },
    // ---- Pasta ----
    {
      id: 7, name: 'Chicken Alfredo', category: 'Pasta',
      description: 'Creamy fettuccine with grilled chicken, parmesan, and fresh herbs',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219725/mjs_corner/food/pasta.jpg', mrp: 399, offerPrice: 329,
      badge: 'Chef\'s Pick', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [],
      addons: []
    },
    {
      id: 8, name: 'Penne Arrabbiata', category: 'Pasta',
      description: 'Spicy tomato sauce with garlic, chili flakes, and fresh basil',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219725/mjs_corner/food/pasta.jpg', mrp: 349, offerPrice: 279,
      badge: '', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [],
      addons: []
    },
    // ---- Sides ----
    {
      id: 9, name: 'Loaded Cheese Fries', category: 'Sides',
      description: 'Crispy fries topped with melted cheese sauce, herbs, and spices',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219724/mjs_corner/food/fries.jpg', mrp: 249, offerPrice: 179,
      badge: 'Fan Fav', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [],
      addons: []
    },
    {
      id: 10, name: 'Buffalo Wings', category: 'Sides',
      description: 'Glazed buffalo wings with blue cheese dip and celery sticks',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219729/mjs_corner/food/wings.jpg', mrp: 379, offerPrice: 299,
      badge: '', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [],
      addons: []
    },
    {
      id: 11, name: 'Chicken Shawarma Wrap', category: 'Sides',
      description: 'Grilled chicken with pickled vegetables, tahini, and fresh lettuce',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219730/mjs_corner/food/wrap.jpg', mrp: 279, offerPrice: 229,
      badge: '', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [],
      addons: []
    },
    // ---- Salads ----
    {
      id: 12, name: 'Mediterranean Bowl', category: 'Salads',
      description: 'Grilled chicken, feta, olives, tomatoes, cucumber, and lemon vinaigrette',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219727/mjs_corner/food/salad.jpg', mrp: 349, offerPrice: 289,
      badge: 'Healthy', available: true,
      isVeg: false, dietary: 'non-veg',
      sizes: [],
      addons: []
    },
    // ---- Drinks ----
    {
      id: 13, name: 'Mango Smoothie', category: 'Drinks',
      description: 'Fresh tropical mango blended with yogurt and a hint of mint',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219728/mjs_corner/food/smoothie.jpg', mrp: 199, offerPrice: 149,
      badge: '', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [],
      addons: []
    },
    {
      id: 14, name: 'Berry Blast Smoothie', category: 'Drinks',
      description: 'Mixed berries, banana, and honey blended to perfection',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219728/mjs_corner/food/smoothie.jpg', mrp: 229, offerPrice: 179,
      badge: 'New', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [],
      addons: []
    },
    // ---- Desserts ----
    {
      id: 15, name: 'Molten Brownie Sundae', category: 'Desserts',
      description: 'Warm chocolate brownie with vanilla ice cream and chocolate drizzle',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219722/mjs_corner/food/brownie.jpg', mrp: 299, offerPrice: 229,
      badge: '🍫 Indulge', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [],
      addons: []
    },
    {
      id: 16, name: 'Classic Cheesecake', category: 'Desserts',
      description: 'New York style cheesecake with berry compote',
      image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219722/mjs_corner/food/brownie.jpg', mrp: 349, offerPrice: 269,
      badge: '', available: true,
      isVeg: true, dietary: 'veg',
      sizes: [],
      addons: []
    }
  ];

  // ========== USER ISOLATION HELPERS ==========
  function getCartStorageKey(user) {
    const cur = user !== undefined ? user : (window.MJAuth ? MJAuth.getCurrentUser() : null);
    if (!cur || !cur.phone) return 'mj_cart_guest';
    const raw = cur.phone.replace(/\D/g, '').slice(-10);
    return `mj_cart_${raw}`;
  }

  function getOrdersStorageKey(user) {
    const cur = user !== undefined ? user : (window.MJAuth ? MJAuth.getCurrentUser() : null);
    if (!cur || !cur.phone) return 'mj_orders_guest';
    const raw = cur.phone.replace(/\D/g, '').slice(-10);
    return `mj_orders_${raw}`;
  }

  // ========== STATE ==========
  let state = {
    menu: [],
    cart: [],
    orderType: 'dine-in', // 'dine-in' | 'pickup' | 'delivery'
    activeCategory: 'All',
    dietaryFilter: 'all', // 'all' | 'veg' | 'non-veg'
    orderCounter: parseInt(localStorage.getItem('mj_orderCounter') || '0'),
    promos: [],
    promoPopupEnabled: true,
    appliedPromo: null,
    selectedDeliveryAddressId: null
  };

  // Load from localStorage & MongoDB Atlas
  function loadState() {
    try {
      state.menu = window.MJData ? MJData.getMenu() : (JSON.parse(localStorage.getItem('mj_menu')) || [...DEFAULT_MENU]);
      state.promos = window.MJData ? MJData.getPromos() : (JSON.parse(localStorage.getItem('mj_promos')) || []);
      state.promoPopupEnabled = window.MJData ? MJData.isPromoPopupEnabled() : true;
      loadCartForUser();
    } catch (e) {
      state.menu = window.MJData ? MJData.getMenu() : [];
      state.cart = [];
    }
  }

  function loadCartForUser(user) {
    const cur = user !== undefined ? user : (window.MJAuth ? MJAuth.getCurrentUser() : null);
    const key = getCartStorageKey(cur);
    try {
      const saved = localStorage.getItem(key);
      state.cart = saved ? JSON.parse(saved) : [];
      state.cart.forEach(c => {
        if (!c.cartKey) {
          const sName = c.selectedSize ? c.selectedSize.name : '';
          const aNames = (c.selectedAddons || []).map(a => a.name).sort().join('|');
          c.cartKey = `${c.id}__${sName}__${aNames}`;
        }
      });
    } catch (e) {
      state.cart = [];
    }

    // Sync user cart with MongoDB Atlas if customer is signed in
    if (cur && cur.phone) {
      fetch(`/api/user/cart/${encodeURIComponent(cur.phone)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.cart)) {
            // If local was empty and DB has cart, populate it
            if (state.cart.length === 0 && data.cart.length > 0) {
              state.cart = data.cart;
              state.cart.forEach(c => {
                if (!c.cartKey) {
                  const sName = c.selectedSize ? c.selectedSize.name : '';
                  const aNames = (c.selectedAddons || []).map(a => a.name).sort().join('|');
                  c.cartKey = `${c.id}__${sName}__${aNames}`;
                }
              });
              localStorage.setItem(key, JSON.stringify(state.cart));
              updateCartUI();
              renderMenu();
            }
          }
        })
        .catch(() => {});
    }
  }

  let cartSyncTimer = null;
  function saveCart(syncToDb = true) {
    const cur = window.MJAuth ? MJAuth.getCurrentUser() : null;
    const key = getCartStorageKey(cur);
    localStorage.setItem(key, JSON.stringify(state.cart));

    // Debounced sync to MongoDB Atlas for logged-in customer
    if (syncToDb && cur && cur.phone) {
      clearTimeout(cartSyncTimer);
      cartSyncTimer = setTimeout(() => {
        fetch('/api/user/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cur.phone, cart: state.cart })
        }).catch(err => console.warn('Could not save user cart to MongoDB:', err));
      }, 400);
    }
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
    cartPromoBanners: $('#cartPromoBanners'),
    cartItemsList: $('#cartItemsList'),
    cartFooter: $('#cartFooter'),
    cartCloseBtn: $('#cartCloseBtn'),
    cartSubtotal: $('#cartSubtotal'),
    cartCouponRow: $('#cartCouponRow'),
    cartCouponLabel: $('#cartCouponLabel'),
    cartCouponDiscount: $('#cartCouponDiscount'),
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
    // Item Customization Modal
    customizationModal: $('#customizationModal'),
    customizationCloseBtn: $('#customizationCloseBtn'),
    customItemImg: $('#customItemImg'),
    customItemTitle: $('#customItemTitle'),
    customItemCategory: $('#customItemCategory'),
    customItemDesc: $('#customItemDesc'),
    customSizesGroup: $('#customSizesGroup'),
    customSizesList: $('#customSizesList'),
    customAddonsGroup: $('#customAddonsGroup'),
    customAddonsList: $('#customAddonsList'),
    btnCustomQtyDec: $('#btnCustomQtyDec'),
    btnCustomQtyInc: $('#btnCustomQtyInc'),
    customQtyVal: $('#customQtyVal'),
    customTotalDisplay: $('#customTotalDisplay'),
    btnConfirmAddToCart: $('#btnConfirmAddToCart'),
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

    // Official logo exclusively used in header profile avatar
    if (els.headerUserAvatar) {
      if (els.headerUserAvatar.tagName === 'IMG') {
        els.headerUserAvatar.src = 'LOGO.jpg';
      } else {
        els.headerUserAvatar.textContent = isAdm ? '👑' : (user.name ? user.name.charAt(0).toUpperCase() : 'U');
      }
    }

    if (isAdm) {
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
      const firstName = user.name ? user.name.split(' ')[0] : 'Profile';
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

  async function fetchCustomerOrders() {
    const user = window.MJAuth ? MJAuth.getCurrentUser() : null;
    if (!user || !user.phone) return [];
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(user.phone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          localStorage.setItem(getOrdersStorageKey(user), JSON.stringify(data.orders));
          return data.orders;
        }
      }
    } catch (e) {
      console.warn('Orders fetch note:', e);
    }
    return JSON.parse(localStorage.getItem(getOrdersStorageKey(user)) || '[]');
  }

  function updateHeaderOrdersBadge() {
    if (!els.headerOrdersCount) return;
    const user = window.MJAuth ? MJAuth.getCurrentUser() : null;
    if (!user || !user.phone) {
      els.headerOrdersCount.classList.add('hidden');
      return;
    }
    const userLast10 = user.phone.replace(/\D/g, '').slice(-10);
    const userOrders = JSON.parse(localStorage.getItem(getOrdersStorageKey(user)) || '[]');
    const activeUserOrders = userOrders.filter(o => {
      if (!o.customer) return false;
      const orderPhone = (o.customer.phone || '').replace(/\D/g, '').slice(-10);
      return (orderPhone === userLast10 || o.customer.userId === user.id) &&
             ['pending', 'preparing', 'ready'].includes(o.status);
    });
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
    // Refresh customer orders in background from MongoDB
    fetchCustomerOrders().then(orders => {
      if (els.ordersModal.classList.contains('open')) {
        renderCustomerOrders(els.customerOrdersList);
      }
    });
  }

  function closeOrdersModal() {
    els.ordersModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // 2-minute cancellation timer constants & helpers
  const CANCEL_WINDOW_SECONDS = 120; // 2 minutes

  function getOrderCancelRemainingSeconds(order) {
    if (!order || !order.timestamp || order.status !== 'pending') return 0;
    const elapsedSeconds = Math.floor((Date.now() - new Date(order.timestamp).getTime()) / 1000);
    return Math.max(0, CANCEL_WINDOW_SECONDS - elapsedSeconds);
  }

  function formatCountdownTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updateCancelTimers() {
    const countdownEls = document.querySelectorAll('.cancel-countdown[data-order-id]');
    if (countdownEls.length === 0) return;

    const user = window.MJAuth ? MJAuth.getCurrentUser() : null;
    const userOrders = JSON.parse(localStorage.getItem(getOrdersStorageKey(user)) || '[]');
    let needsRerender = false;

    countdownEls.forEach(el => {
      const orderId = el.dataset.orderId;
      const order = userOrders.find(o => o.id === orderId);
      const remaining = getOrderCancelRemainingSeconds(order);
      if (remaining > 0) {
        el.textContent = formatCountdownTime(remaining);
      } else {
        needsRerender = true;
      }
    });

    if (needsRerender) {
      if (els.ordersModal && els.ordersModal.classList.contains('open')) {
        renderCustomerOrders(els.customerOrdersList);
      }
      if (els.profileModal && els.profileModal.classList.contains('open') && els.tabProfileOrders && els.tabProfileOrders.classList.contains('active')) {
        renderProfileOrders();
      }
    }
  }

  async function cancelCustomerOrder(orderId) {
    const user = window.MJAuth ? MJAuth.getCurrentUser() : null;
    const ordersKey = getOrdersStorageKey(user);
    const userOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const order = userOrders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status !== 'pending') {
      showToast('This order can no longer be cancelled as it is already being prepared.', 'error');
      return;
    }
    const remainingSecs = getOrderCancelRemainingSeconds(order);
    if (remainingSecs <= 0) {
      showToast('The 2-minute cancellation timer has expired. Your order is confirmed with the kitchen.', 'error');
      renderCustomerOrders(els.customerOrdersList);
      renderProfileOrders();
      return;
    }
    order.status = 'cancelled';
    localStorage.setItem(ordersKey, JSON.stringify(userOrders));
    window.dispatchEvent(new Event('mj_orders_changed'));
    renderCustomerOrders(els.customerOrdersList);
    renderProfileOrders();
    updateHeaderOrdersBadge();

    // Persist cancel status in MongoDB Atlas
    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
    } catch (e) {
      console.warn('Could not update cancelled status in MongoDB:', e);
    }

    showToast(`Order ${orderId} has been cancelled successfully.`, 'info');
  }

  function renderCustomerOrders(container) {
    if (!container) return;
    const user = window.MJAuth ? MJAuth.getCurrentUser() : null;
    if (!user) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 20px;color:var(--text-tertiary);">
          <img src="LOGO.jpg" alt="MJ's Corner Logo" style="width:68px;height:68px;border-radius:50%;object-fit:cover;margin:0 auto 16px;border:2px solid var(--accent);box-shadow:0 4px 14px rgba(0,0,0,0.15);display:block;">
          <h3 style="font-size:1.15rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">Sign In to View Orders</h3>
          <p style="font-size:0.88rem;max-width:320px;margin:0 auto 18px;">Please log in with your mobile OTP to view your isolated order history and track deliveries.</p>
          <a href="login.html" class="btn-admin primary" style="display:inline-block;padding:10px 22px;border-radius:var(--radius-full);text-decoration:none;">
            📱 Login with Mobile OTP
          </a>
        </div>
      `;
      return;
    }

    const userLast10 = (user.phone || '').replace(/\D/g, '').slice(-10);
    const userOrders = JSON.parse(localStorage.getItem(getOrdersStorageKey(user)) || '[]');
    const myOrders = userOrders.filter(o => {
      if (!o.customer) return false;
      const orderPhone = (o.customer.phone || '').replace(/\D/g, '').slice(-10);
      return (userLast10 && orderPhone === userLast10) || 
             (user.id && o.customer.userId === user.id) ||
             (user.email && o.customer.email === user.email);
    });

    if (myOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 20px;color:var(--text-tertiary);">
          <img src="LOGO.jpg" alt="MJ's Corner Logo" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 16px;border:2px solid var(--accent);box-shadow:0 4px 14px rgba(0,0,0,0.15);display:block;">
          <h3 style="font-size:1.15rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">No Orders Yet</h3>
          <p style="font-size:0.88rem;max-width:320px;margin:0 auto 18px;">You haven't placed any orders yet on this account. Discover our fresh meals and order now!</p>
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

      // 2-minute cancellation timer logic
      const remainingCancelSecs = getOrderCancelRemainingSeconds(order);
      const canCancel = order.status === 'pending' && remainingCancelSecs > 0;

      let cancelSectionHtml = '';
      if (order.status === 'pending') {
        if (canCancel) {
          cancelSectionHtml = `
            <div class="cancel-timer-wrap">
              <span class="cancel-timer-text" title="2-minute cancellation window">
                ⏱️ Cancel in: <strong class="cancel-countdown" data-order-id="${order.id}">${formatCountdownTime(remainingCancelSecs)}</strong>
              </span>
              <button type="button" class="btn-cancel-cust-order" data-cancel-order="${order.id}">
                ❌ Cancel Order
              </button>
            </div>
          `;
        } else {
          cancelSectionHtml = `
            <div class="cancel-window-expired-tag" title="Cancellation window closed after 2 minutes">
              🔒 Cancel window closed (Kitchen preparing)
            </div>
          `;
        }
      }

      return `
        <div class="customer-order-card" id="cust-order-${order.id}">
          <div class="customer-order-header">
            <div class="customer-order-id-group" style="display:flex;align-items:center;gap:8px;">
              <img src="LOGO.jpg" alt="MJ's Corner" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid var(--accent);flex-shrink:0;">
              <div>
                <span class="customer-order-id">${order.id}</span>
                <span class="customer-order-type-badge">${typeIcons[order.type] || order.type}</span>
              </div>
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
            ${items.map(item => {
              const sizeLabel = item.selectedSize ? ` <span class="order-item-size-tag">(${escapeHtml(item.selectedSize.name)})</span>` : '';
              const addonsLabel = item.selectedAddons && item.selectedAddons.length > 0
                ? `<div class="order-item-addons-tag">🧀 + ${item.selectedAddons.map(a => escapeHtml(a.name)).join(', ')}</div>`
                : '';
              return `
              <div class="customer-order-item-row">
                <img src="${item.image || 'images/burger.jpg'}" alt="${escapeHtml(item.name)}" class="customer-order-item-img" onerror="this.src='images/burger.jpg'">
                <div class="customer-order-item-info">
                  <div class="customer-order-item-name">${escapeHtml(item.name)}${sizeLabel}</div>
                  ${addonsLabel}
                  <div class="customer-order-item-sub">₹${item.offerPrice || item.mrp || 0} × ${item.qty}</div>
                </div>
                <div class="customer-order-item-total">₹${((item.offerPrice || item.mrp || 0) * (item.qty || 1))}</div>
              </div>
            `;
            }).join('')}

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
              ${cancelSectionHtml}
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
    let renderedCount = 0;

    categories.forEach(cat => {
      let items = state.menu.filter(i => i.category === cat && i.available);

      // Filter by dietary preference ('all' | 'veg' | 'non-veg')
      if (state.dietaryFilter === 'veg') {
        items = items.filter(i => i.isVeg === true || i.dietary === 'veg');
      } else if (state.dietaryFilter === 'non-veg') {
        items = items.filter(i => i.isVeg === false || i.dietary === 'non-veg');
      }

      if (items.length === 0) return;
      renderedCount += items.length;

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

    if (renderedCount === 0) {
      const filterLabel = state.dietaryFilter === 'veg' ? 'Pure Veg' : (state.dietaryFilter === 'non-veg' ? 'Non-Veg' : '');
      html = `
        <div style="text-align:center;padding:70px 20px;color:var(--text-tertiary);">
          <div style="font-size:3rem;margin-bottom:12px;">${state.dietaryFilter === 'veg' ? '🥗' : '🍗'}</div>
          <h3 style="font-size:1.2rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">No ${filterLabel} Items in ${state.activeCategory === 'All' ? 'Menu' : state.activeCategory}</h3>
          <p style="max-width:380px;margin:0 auto 16px;font-size:0.88rem;">Try selecting 'All' or a different category to see available items.</p>
          <button type="button" class="btn-admin secondary" id="btnResetDietaryFilter" style="padding:8px 20px;border-radius:var(--radius-full);">
            Show All Items
          </button>
        </div>
      `;
    }

    els.menuContainer.innerHTML = html;

    const btnReset = els.menuContainer.querySelector('#btnResetDietaryFilter');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.dietaryFilter = 'all';
        updateDietaryFilterUI();
        renderMenu();
      });
    }

    bindMenuActions();
  }

  // ========== ITEM CUSTOMIZATION (SIZES & ADD-ONS) ==========
  let customizationState = {
    item: null,
    selectedSize: null,
    selectedAddons: [],
    qty: 1
  };

  function hasCustomizations(item) {
    if (!item) return false;
    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
    const hasAddons = Array.isArray(item.addons) && item.addons.length > 0;
    return hasSizes || hasAddons;
  }

  function openCustomizationModal(item) {
    if (!item) return;
    customizationState.item = item;
    customizationState.qty = 1;
    customizationState.selectedAddons = [];

    // Pre-select first size if sizes exist
    if (Array.isArray(item.sizes) && item.sizes.length > 0) {
      customizationState.selectedSize = { ...item.sizes[0] };
    } else {
      customizationState.selectedSize = null;
    }

    if (els.customItemImg) els.customItemImg.src = item.image || 'images/burger.jpg';
    if (els.customItemTitle) {
      const isVeg = item.isVeg !== undefined ? item.isVeg : (item.dietary === 'veg');
      els.customItemTitle.innerHTML = `
        <span class="dietary-mini-badge ${isVeg ? 'veg' : 'non-veg'}" style="margin-right:8px;" title="${isVeg ? 'Pure Veg' : 'Non-Veg'}">
          <span class="dietary-dot"></span>
        </span>
        <span>${escapeHtml(item.name)}</span>
      `;
    }
    if (els.customItemCategory) els.customItemCategory.textContent = item.category;
    if (els.customItemDesc) els.customItemDesc.textContent = item.description || '';

    // Render Sizes
    if (Array.isArray(item.sizes) && item.sizes.length > 0) {
      if (els.customSizesGroup) els.customSizesGroup.classList.remove('hidden');
      renderCustomSizes(item.sizes);
    } else {
      if (els.customSizesGroup) els.customSizesGroup.classList.add('hidden');
      if (els.customSizesList) els.customSizesList.innerHTML = '';
    }

    // Render Add-ons
    if (Array.isArray(item.addons) && item.addons.length > 0) {
      if (els.customAddonsGroup) els.customAddonsGroup.classList.remove('hidden');
      renderCustomAddons(item.addons);
    } else {
      if (els.customAddonsGroup) els.customAddonsGroup.classList.add('hidden');
      if (els.customAddonsList) els.customAddonsList.innerHTML = '';
    }

    updateCustomizationTotal();

    if (els.customizationModal) {
      els.customizationModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCustomizationModal() {
    if (els.customizationModal) {
      els.customizationModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    customizationState.item = null;
  }

  function renderCustomSizes(sizes) {
    if (!els.customSizesList) return;
    els.customSizesList.innerHTML = sizes.map((s, idx) => {
      const isSelected = customizationState.selectedSize && customizationState.selectedSize.name === s.name;
      return `
        <div class="custom-option-card ${isSelected ? 'selected' : ''}" data-size-idx="${idx}">
          <div class="custom-option-left">
            <span class="custom-option-indicator">${isSelected ? '●' : ''}</span>
            <span>${escapeHtml(s.name)}</span>
          </div>
          <span class="custom-option-price">₹${s.price}</span>
        </div>
      `;
    }).join('');

    els.customSizesList.querySelectorAll('.custom-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.sizeIdx);
        customizationState.selectedSize = { ...sizes[idx] };
        renderCustomSizes(sizes);
        updateCustomizationTotal();
      });
    });
  }

  function renderCustomAddons(addons) {
    if (!els.customAddonsList) return;
    els.customAddonsList.innerHTML = addons.map((a, idx) => {
      const isSelected = customizationState.selectedAddons.some(sel => sel.name === a.name);
      return `
        <div class="custom-option-card ${isSelected ? 'selected' : ''}" data-addon-idx="${idx}">
          <div class="custom-option-left">
            <span class="custom-option-indicator checkbox">${isSelected ? '✓' : ''}</span>
            <span>${escapeHtml(a.name)}</span>
          </div>
          <span class="custom-option-price">+₹${a.price}</span>
        </div>
      `;
    }).join('');

    els.customAddonsList.querySelectorAll('.custom-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.addonIdx);
        const addon = addons[idx];
        const existingIdx = customizationState.selectedAddons.findIndex(sel => sel.name === addon.name);
        if (existingIdx >= 0) {
          customizationState.selectedAddons.splice(existingIdx, 1);
        } else {
          customizationState.selectedAddons.push({ ...addon });
        }
        renderCustomAddons(addons);
        updateCustomizationTotal();
      });
    });
  }

  function getCustomizationUnitPrice() {
    if (!customizationState.item) return 0;
    const basePrice = customizationState.selectedSize 
      ? Number(customizationState.selectedSize.price) 
      : Number(customizationState.item.offerPrice || customizationState.item.mrp || 0);
    const addonsTotal = customizationState.selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
    return basePrice + addonsTotal;
  }

  function updateCustomizationTotal() {
    if (els.customQtyVal) els.customQtyVal.textContent = customizationState.qty;
    const unitPrice = getCustomizationUnitPrice();
    const total = unitPrice * customizationState.qty;
    if (els.customTotalDisplay) {
      els.customTotalDisplay.textContent = `₹${total}`;
    }
  }

  function confirmCustomAddToCart() {
    const item = customizationState.item;
    if (!item) return;

    if (Array.isArray(item.sizes) && item.sizes.length > 0 && !customizationState.selectedSize) {
      showToast('Please select a size first', 'error');
      return;
    }

    addItemToCart(
      item,
      customizationState.selectedSize,
      customizationState.selectedAddons,
      customizationState.qty
    );

    const descParts = [];
    if (customizationState.selectedSize) descParts.push(customizationState.selectedSize.name);
    if (customizationState.selectedAddons.length > 0) {
      descParts.push(`with ${customizationState.selectedAddons.map(a => a.name).join(', ')}`);
    }
    const customSummary = descParts.length > 0 ? ` (${descParts.join(' ')})` : '';

    notifyActivePromosForItem(item, customSummary);
    closeCustomizationModal();
  }

  function notifyActivePromosForItem(menuItem, customSummary = '') {
    if (!menuItem) return;

    // Check all categories currently in cart
    const cartCategories = new Set();
    state.cart.forEach(c => {
      const m = state.menu.find(i => i.id === c.id);
      if (m && m.category) cartCategories.add(m.category);
    });

    const activePromos = (state.promos || []).filter(p => p.active);

    // 1. Combo offer check
    const comboPromo = activePromos.find(p => 
      p.scope === 'combo' && 
      Array.isArray(p.comboCategories) && 
      p.comboCategories.includes(menuItem.category)
    );

    if (comboPromo) {
      const cat1 = comboPromo.comboCategories[0];
      const cat2 = comboPromo.comboCategories[1];
      const hasBoth = cartCategories.has(cat1) && cartCategories.has(cat2);
      const discountLabel = comboPromo.discountType === 'percentage' 
        ? `${comboPromo.discountValue}% OFF` 
        : `₹${comboPromo.discountValue} OFF`;

      if (hasBoth) {
        showToast(`Added ${menuItem.name}! 🎉 Combo Unlocked: Open cart to apply '${comboPromo.code}' for ${discountLabel}!`, 'success');
        return;
      } else {
        const missing = cartCategories.has(cat1) ? cat2 : cat1;
        showToast(`Added ${menuItem.name}${customSummary}! 💡 Combo Deal: Add any ${missing} to get ${discountLabel} with '${comboPromo.code}'!`, 'info');
        return;
      }
    }

    // 2. Category offer check
    const catPromo = activePromos.find(p => p.scope === 'category' && p.targetCategory === menuItem.category);
    if (catPromo) {
      const discountLabel = catPromo.discountType === 'percentage' 
        ? `${catPromo.discountValue}% OFF` 
        : `₹${catPromo.discountValue} OFF`;
      showToast(`Added ${menuItem.name}${customSummary}! 🏷️ Offer available: Use code '${catPromo.code}' in cart for ${discountLabel}!`, 'success');
      return;
    }

    // 3. Item offer check
    const itemPromo = activePromos.find(p => p.scope === 'item' && parseInt(p.targetItemId) === menuItem.id);
    if (itemPromo) {
      const discountLabel = itemPromo.discountType === 'percentage' 
        ? `${itemPromo.discountValue}% OFF` 
        : `₹${itemPromo.discountValue} OFF`;
      showToast(`Added ${menuItem.name}${customSummary}! ⚡ Use code '${itemPromo.code}' for ${discountLabel}!`, 'success');
      return;
    }

    // 4. All Items offer check
    const allItemsPromo = activePromos.find(p => p.scope === 'all_items');
    if (allItemsPromo) {
      const discountLabel = allItemsPromo.discountType === 'percentage' 
        ? `${allItemsPromo.discountValue}% OFF` 
        : `₹${allItemsPromo.discountValue} OFF`;
      showToast(`Added ${menuItem.name}${customSummary}! ✨ Storewide Deal: Use code '${allItemsPromo.code}' for ${discountLabel}!`, 'success');
      return;
    }

    showToast(`Added ${menuItem.name}${customSummary} to cart!`);
  }

  function renderMenuItem(item) {
    const customizable = hasCustomizations(item);
    const discount = item.mrp > 0 ? Math.round(((item.mrp - item.offerPrice) / item.mrp) * 100) : 0;
    
    // For non-customizable items, direct cart item matching:
    const cartItem = !customizable ? state.cart.find(c => c.id === item.id) : null;
    const qty = cartItem ? cartItem.qty : 0;

    // For customizable items, sum total qty across all variants in cart:
    const variantQtyInCart = customizable 
      ? state.cart.filter(c => c.id === item.id).reduce((sum, c) => sum + c.qty, 0)
      : 0;

    // Price display
    let pricingHtml = '';
    if (customizable && Array.isArray(item.sizes) && item.sizes.length > 0) {
      const minPrice = Math.min(...item.sizes.map(s => Number(s.price)));
      pricingHtml = `
        <div class="menu-card-pricing">
          <span class="price-offer">From ₹${minPrice}</span>
          ${item.mrp > minPrice ? `<span class="price-mrp">₹${item.mrp}</span>` : ''}
        </div>
        <div class="customizable-tag">✨ Customizable options</div>
      `;
    } else {
      pricingHtml = `
        <div class="menu-card-pricing">
          <span class="price-offer">₹${item.offerPrice}</span>
          ${item.mrp > item.offerPrice ? `<span class="price-mrp">₹${item.mrp}</span>` : ''}
        </div>
        ${customizable ? `<div class="customizable-tag">✨ Extra add-ons available</div>` : ''}
      `;
    }

    let actionsHtml = '';
    if (customizable) {
      actionsHtml = `
        <button class="btn-add-cart" data-action="customize" data-id="${item.id}">
          ${variantQtyInCart > 0 ? `+ Add More (${variantQtyInCart} in cart)` : '✨ Customize & Add'}
        </button>
      `;
    } else {
      if (qty === 0) {
        actionsHtml = `
          <button class="btn-add-cart" data-action="add" data-id="${item.id}">
            + Add to Cart
          </button>
        `;
      } else {
        actionsHtml = `
          <div class="qty-control">
            <button data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${qty}</span>
            <button data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        `;
      }
    }

    // Check for any active promotions applicable to this item or its category
    const activePromos = (state.promos || []).filter(p => p.active);
    let promoBadgesHtml = '';

    // 1. Item-specific offer
    const itemPromo = activePromos.find(p => p.scope === 'item' && parseInt(p.targetItemId) === item.id);
    if (itemPromo) {
      const offLabel = itemPromo.discountType === 'percentage' ? `${itemPromo.discountValue}% OFF` : `₹${itemPromo.discountValue} OFF`;
      promoBadgesHtml += `<div class="menu-promo-badge item-deal">⚡ Deal: <strong>${offLabel}</strong> with code <strong>${escapeHtml(itemPromo.code)}</strong></div>`;
    }

    // 2. Category-specific offer
    const catPromo = activePromos.find(p => p.scope === 'category' && p.targetCategory === item.category);
    if (catPromo) {
      const offLabel = catPromo.discountType === 'percentage' ? `${catPromo.discountValue}% OFF` : `₹${catPromo.discountValue} OFF`;
      promoBadgesHtml += `<div class="menu-promo-badge category-deal">🏷️ Offer: <strong>${offLabel}</strong> with code <strong>${escapeHtml(catPromo.code)}</strong></div>`;
    }

    // 3. Combo offer
    const comboOffer = activePromos.find(p => 
      p.scope === 'combo' && 
      Array.isArray(p.comboCategories) && 
      p.comboCategories.includes(item.category)
    );
    if (comboOffer) {
      const otherCat = (comboOffer.comboCategories || []).find(c => c !== item.category) || 'Drink';
      const offLabel = comboOffer.discountType === 'percentage' 
        ? `${comboOffer.discountValue}% OFF` 
        : `₹${comboOffer.discountValue} OFF`;
      promoBadgesHtml += `<div class="menu-promo-badge combo-deal">🍕🥤 Combo: Pair with <strong>${escapeHtml(otherCat)}</strong> for <strong>${offLabel}</strong> (${escapeHtml(comboOffer.code)})</div>`;
    }

    // 4. All Items offer
    const allItemsOffer = activePromos.find(p => p.scope === 'all_items');
    if (allItemsOffer) {
      const offLabel = allItemsOffer.discountType === 'percentage' 
        ? `${allItemsOffer.discountValue}% OFF` 
        : `₹${allItemsOffer.discountValue} OFF`;
      promoBadgesHtml += `<div class="menu-promo-badge all-items-deal">✨ Storewide Deal: <strong>${offLabel}</strong> with code <strong>${escapeHtml(allItemsOffer.code)}</strong></div>`;
    }

    const isVeg = item.isVeg !== undefined ? item.isVeg : (item.dietary === 'veg');
    const dietaryClass = isVeg ? 'veg' : 'non-veg';
    const dietaryTitle = isVeg ? 'Pure Veg' : 'Non-Veg';

    return `
      <div class="menu-card ${customizable ? 'is-customizable' : ''}" data-id="${item.id}">
        <div class="menu-card-img-wrap">
          <div class="dietary-badge ${dietaryClass}" title="${dietaryTitle}">
            <span class="dietary-dot"></span>
          </div>
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          ${item.badge ? `<span class="menu-card-badge">${item.badge}</span>` : ''}
          ${discount > 0 ? `<span class="discount-pill">${discount}% OFF</span>` : ''}
        </div>
        <div class="menu-card-content">
          <h3 class="menu-card-title">${item.name}</h3>
          <p class="menu-card-desc">${item.description}</p>
          ${pricingHtml}
          ${promoBadgesHtml}
          <div class="menu-card-actions">
            ${actionsHtml}
          </div>
        </div>
      </div>
    `;
  }

  function bindMenuActions() {
    // Add to Cart for non-customizable items
    els.menuContainer.querySelectorAll('[data-action="add"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(parseInt(btn.dataset.id));
      });
    });

    // Customize button for customizable items
    els.menuContainer.querySelectorAll('[data-action="customize"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = state.menu.find(i => i.id === parseInt(btn.dataset.id));
        if (item) openCustomizationModal(item);
      });
    });

    // Also clicking customizable card anywhere opens customization modal
    els.menuContainer.querySelectorAll('.menu-card.is-customizable').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const item = state.menu.find(i => i.id === parseInt(card.dataset.id));
        if (item) openCustomizationModal(item);
      });
    });

    // Non-customizable quantity increment
    els.menuContainer.querySelectorAll('[data-action="inc"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateCartQty(btn.dataset.id, 1);
      });
    });

    // Non-customizable quantity decrement
    els.menuContainer.querySelectorAll('[data-action="dec"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateCartQty(btn.dataset.id, -1);
      });
    });
  }

  // ========== CART & FLOATING "GO TO CHECKOUT" BAR ==========
  function addItemToCart(menuItem, selectedSize = null, selectedAddons = [], qty = 1) {
    if (!menuItem) return;

    const sizeName = selectedSize ? selectedSize.name : '';
    const addonNames = (selectedAddons || []).map(a => a.name).sort().join('|');
    const cartKey = `${menuItem.id}__${sizeName}__${addonNames}`;

    const basePrice = selectedSize ? Number(selectedSize.price) : Number(menuItem.offerPrice || menuItem.mrp || 0);
    const addonsTotal = (selectedAddons || []).reduce((sum, a) => sum + Number(a.price || 0), 0);
    const unitPrice = basePrice + addonsTotal;
    const unitMrp = Math.max(menuItem.mrp || 0, unitPrice);

    const existing = state.cart.find(c => c.cartKey === cartKey);
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({
        cartKey: cartKey,
        id: menuItem.id,
        name: menuItem.name,
        selectedSize: selectedSize ? { name: selectedSize.name, price: Number(selectedSize.price) } : null,
        selectedAddons: (selectedAddons || []).map(a => ({ name: a.name, price: Number(a.price) })),
        offerPrice: unitPrice,
        mrp: unitMrp,
        image: menuItem.image,
        qty: qty
      });
    }

    saveCart();
    updateCartUI();
    renderMenu();
  }

  function addToCart(itemId) {
    const menuItem = state.menu.find(i => i.id === itemId);
    if (!menuItem) return;

    if (hasCustomizations(menuItem)) {
      openCustomizationModal(menuItem);
      return;
    }

    addItemToCart(menuItem, null, [], 1);
    notifyActivePromosForItem(menuItem);
  }

  function updateCartQty(keyOrId, delta) {
    const item = state.cart.find(c => c.cartKey === String(keyOrId) || c.id === parseInt(keyOrId));
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter(c => c !== item);
    }

    saveCart();
    updateCartUI();
    renderMenu();
  }

  function removeFromCart(keyOrId) {
    const item = state.cart.find(c => c.cartKey === String(keyOrId) || c.id === parseInt(keyOrId));
    if (!item) return;

    state.cart = state.cart.filter(c => c !== item);
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

    const savings = Math.max(0, originalTotal - subtotal);
    return { subtotal, savings, total: subtotal, itemCount };
  }

  // ========== PROMO EVALUATION & IN-CART COMBOS ==========
  function calculatePromoDiscount(promo) {
    if (!promo || !promo.active) {
      return { discount: 0, eligible: false, message: 'This promo is inactive or invalid.' };
    }

    const { subtotal } = getCartTotals();
    if (promo.minOrderValue && subtotal < Number(promo.minOrderValue)) {
      return {
        discount: 0,
        eligible: false,
        message: `Minimum cart value of ₹${promo.minOrderValue} required for '${promo.code}'.`
      };
    }

    const getCategoryItems = (cat) => {
      return state.cart.filter(item => {
        const menuItem = state.menu.find(m => m.id === item.id);
        return menuItem && menuItem.category && menuItem.category.toLowerCase() === String(cat).toLowerCase();
      });
    };

    const scope = promo.scope || 'order';
    const discountType = promo.discountType || (promo.flatDiscount ? 'flat' : 'percentage');
    const discountVal = Number(promo.discountValue !== undefined ? promo.discountValue : (promo.discountPercent || promo.flatDiscount || 20));

    if (scope === 'combo') {
      const cats = Array.isArray(promo.comboCategories) && promo.comboCategories.length >= 2 
        ? promo.comboCategories 
        : ['Pizza', 'Drinks'];
      const cat1 = cats[0];
      const cat2 = cats[1];
      const items1 = getCategoryItems(cat1);
      const items2 = getCategoryItems(cat2);

      if (items1.length === 0 || items2.length === 0) {
        const missing = [];
        if (items1.length === 0) missing.push(cat1);
        if (items2.length === 0) missing.push(cat2);
        return {
          discount: 0,
          eligible: false,
          message: `Add ${missing.join(' and ')} to your cart to unlock the '${promo.code}' combo deal!`
        };
      }

      // Both categories present! Calculate discount on the combo items
      const comboSubtotal = [...items1, ...items2].reduce((sum, item) => sum + (item.offerPrice * item.qty), 0);
      let discount = 0;
      if (discountType === 'percentage') {
        discount = Math.round((comboSubtotal * discountVal) / 100);
      } else {
        discount = Math.min(discountVal, comboSubtotal);
      }
      return { discount: Math.max(1, discount), eligible: true, message: '' };
    }

    if (scope === 'category') {
      const targetCat = promo.targetCategory || 'All';
      const items = targetCat === 'All' ? state.cart : getCategoryItems(targetCat);
      if (items.length === 0) {
        return {
          discount: 0,
          eligible: false,
          message: `This coupon requires at least one item from '${targetCat}' in your cart.`
        };
      }
      const catSubtotal = items.reduce((sum, item) => sum + (item.offerPrice * item.qty), 0);
      let discount = 0;
      if (discountType === 'percentage') {
        discount = Math.round((catSubtotal * discountVal) / 100);
      } else {
        discount = Math.min(discountVal, catSubtotal);
      }
      return { discount: Math.max(1, discount), eligible: true, message: '' };
    }

    if (scope === 'item') {
      const targetId = parseInt(promo.targetItemId);
      const item = state.cart.find(c => c.id === targetId);
      if (!item) {
        const m = state.menu.find(m => m.id === targetId);
        return {
          discount: 0,
          eligible: false,
          message: `This coupon is only valid for ${m ? m.name : 'the specified item'}.`
        };
      }
      const itemTotal = item.offerPrice * item.qty;
      let discount = 0;
      if (discountType === 'percentage') {
        discount = Math.round((itemTotal * discountVal) / 100);
      } else {
        discount = Math.min(discountVal, itemTotal);
      }
      return { discount: Math.max(1, discount), eligible: true, message: '' };
    }

    // Default: Entire Order
    let discount = 0;
    if (discountType === 'percentage') {
      discount = Math.round((subtotal * discountVal) / 100);
    } else {
      discount = Math.min(discountVal, subtotal);
    }
    return { discount: Math.max(1, discount), eligible: true, message: '' };
  }

  function renderCartPromoBanners() {
    if (!els.cartPromoBanners) return;
    if (state.cart.length === 0) {
      els.cartPromoBanners.innerHTML = '';
      return;
    }

    // Map categories in cart
    const cartCategories = new Set();
    state.cart.forEach(c => {
      const m = state.menu.find(i => i.id === c.id);
      if (m && m.category) cartCategories.add(m.category);
      else if (c.category) cartCategories.add(c.category);
    });

    const activePromos = (state.promos || []).filter(p => p.active);
    let html = '';

    activePromos.forEach(promo => {
      const discountType = promo.discountType || (promo.flatDiscount ? 'flat' : 'percentage');
      const discountVal = promo.discountValue !== undefined ? promo.discountValue : (promo.discountPercent || promo.flatDiscount || 20);
      const discountLabel = discountType === 'percentage' ? `${discountVal}% OFF` : `₹${discountVal} OFF`;
      const isApplied = state.appliedPromo && state.appliedPromo.code === promo.code;

      if (promo.scope === 'combo') {
        const cats = Array.isArray(promo.comboCategories) && promo.comboCategories.length >= 2 
          ? promo.comboCategories 
          : ['Pizza', 'Drinks'];
        const cat1 = cats[0];
        const cat2 = cats[1];
        const has1 = cartCategories.has(cat1);
        const has2 = cartCategories.has(cat2);

        // Case A: Full combo unlocked!
        if (has1 && has2) {
          html += `
            <div class="cart-combo-card unlocked">
              <div class="combo-card-left">
                <div class="combo-badge-pill unlocked">🎉 COMBO UNLOCKED</div>
                <div class="combo-card-title">${escapeHtml(promo.title || `${cat1} + ${cat2} Combo`)}</div>
                <div class="combo-card-desc">You've added both <strong>${escapeHtml(cat1)}</strong> & <strong>${escapeHtml(cat2)}</strong>! Save ${discountLabel}.</div>
              </div>
              <button type="button" class="btn-combo-action ${isApplied ? 'applied' : ''}" data-apply-promo="${escapeHtml(promo.code)}">
                ${isApplied ? '✓ Applied' : 'Apply Deal 🏷️'}
              </button>
            </div>
          `;
        }
        // Case B: Teaser - Customer has 1 of the categories, but missing the other!
        else if (has1 || has2) {
          const presentCat = has1 ? cat1 : cat2;
          const missingCat = has1 ? cat2 : cat1;
          const quickAddOptions = state.menu.filter(m => m.category === missingCat && m.available).slice(0, 3);
          const quickAddHtml = quickAddOptions.length > 0 ? `
            <div class="combo-quick-add-strip">
              <span class="quick-add-label">Quick add ${escapeHtml(missingCat)}:</span>
              <div class="quick-add-buttons">
                ${quickAddOptions.map(q => `
                  <button type="button" class="btn-quick-add-item" data-quick-add-id="${q.id}">
                    + ${escapeHtml(q.name)} (₹${q.offerPrice})
                  </button>
                `).join('')}
              </div>
            </div>
          ` : '';

          html += `
            <div class="cart-combo-card teaser">
              <div class="combo-card-left">
                <div class="combo-badge-pill teaser">💡 COMBO OFFER AVAILABLE</div>
                <div class="combo-card-title">Add a <strong>${escapeHtml(missingCat)}</strong> to get <strong>${discountLabel}</strong>!</div>
                <div class="combo-card-desc">Pair your ${escapeHtml(presentCat)} with any ${escapeHtml(missingCat)} to unlock promo <strong>${escapeHtml(promo.code)}</strong>.</div>
                ${quickAddHtml}
              </div>
              <button type="button" class="btn-combo-action browse" data-jump-cat="${escapeHtml(missingCat)}">
                Browse ${escapeHtml(missingCat)} ➔
              </button>
            </div>
          `;
        }
      } else if (promo.scope === 'category') {
        const targetCat = promo.targetCategory;
        if (targetCat && cartCategories.has(targetCat)) {
          html += `
            <div class="cart-combo-card unlocked">
              <div class="combo-card-left">
                <div class="combo-badge-pill category">📁 ${escapeHtml(targetCat)} OFFER</div>
                <div class="combo-card-title">${escapeHtml(promo.title || promo.code)}</div>
                <div class="combo-card-desc">Save <strong>${discountLabel}</strong> on items in ${escapeHtml(targetCat)}.</div>
              </div>
              <button type="button" class="btn-combo-action ${isApplied ? 'applied' : ''}" data-apply-promo="${escapeHtml(promo.code)}">
                ${isApplied ? '✓ Applied' : 'Apply 🏷️'}
              </button>
            </div>
          `;
        }
      } else if (promo.scope === 'item') {
        const targetItem = state.menu.find(m => m.id === parseInt(promo.targetItemId));
        const hasItem = state.cart.some(c => c.id === parseInt(promo.targetItemId));
        if (hasItem && targetItem) {
          html += `
            <div class="cart-combo-card unlocked">
              <div class="combo-card-left">
                <div class="combo-badge-pill item">⚡ ${escapeHtml(targetItem.name)} DEAL</div>
                <div class="combo-card-title">${escapeHtml(promo.title || promo.code)}</div>
                <div class="combo-card-desc">Save <strong>${discountLabel}</strong> on ${escapeHtml(targetItem.name)}.</div>
              </div>
              <button type="button" class="btn-combo-action ${isApplied ? 'applied' : ''}" data-apply-promo="${escapeHtml(promo.code)}">
                ${isApplied ? '✓ Applied' : 'Apply 🏷️'}
              </button>
            </div>
          `;
        }
      } else if (promo.scope === 'all_items') {
        if (state.cart.length > 0) {
          html += `
            <div class="cart-combo-card unlocked">
              <div class="combo-card-left">
                <div class="combo-badge-pill all-items">✨ ALL ITEMS OFFER</div>
                <div class="combo-card-title">${escapeHtml(promo.title || promo.code)}</div>
                <div class="combo-card-desc">Save <strong>${discountLabel}</strong> across all menu items!</div>
              </div>
              <button type="button" class="btn-combo-action ${isApplied ? 'applied' : ''}" data-apply-promo="${escapeHtml(promo.code)}">
                ${isApplied ? '✓ Applied' : 'Apply Deal 🏷️'}
              </button>
            </div>
          `;
        }
      }
    });

    els.cartPromoBanners.innerHTML = html;

    // Bind apply buttons
    els.cartPromoBanners.querySelectorAll('[data-apply-promo]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyCheckoutCoupon(btn.dataset.applyPromo);
      });
    });

    // Bind quick add buttons
    els.cartPromoBanners.querySelectorAll('[data-quick-add-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = parseInt(btn.dataset.quickAddId);
        const qItem = state.menu.find(i => i.id === itemId);
        if (!qItem) return;
        if (hasCustomizations(qItem)) {
          closeCart();
          openCustomizationModal(qItem);
        } else {
          addItemToCart(qItem, null, [], 1);
          notifyActivePromosForItem(qItem);
        }
      });
    });

    // Bind browse missing combo category button
    els.cartPromoBanners.querySelectorAll('[data-jump-cat]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = btn.dataset.jumpCat;
        closeCart();
        state.activeCategory = cat;
        renderCategories();
        renderMenu();
        const section = document.getElementById(`category-${cat}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        showToast(`Select your ${cat} to complete the combo!`, 'info');
      });
    });
  }

  function updateCartUI() {
    const totals = getCartTotals();

    // Map categories in cart
    const cartCategories = new Set();
    state.cart.forEach(c => {
      const m = state.menu.find(i => i.id === c.id);
      if (m && m.category) cartCategories.add(m.category);
      else if (c.category) cartCategories.add(c.category);
    });

    // Re-validate applied coupon against current cart contents
    if (state.appliedPromo) {
      const promoObj = state.promos.find(p => p.code === state.appliedPromo.code);
      if (!promoObj || !promoObj.active) {
        state.appliedPromo = null;
      } else {
        const res = calculatePromoDiscount(promoObj);
        if (!res.eligible) {
          state.appliedPromo = null;
          showToast(`Coupon '${promoObj.code}' removed: ${res.message}`, 'info');
        } else {
          state.appliedPromo.discountAmount = res.discount;
        }
      }
    }

    const couponDiscount = state.appliedPromo ? state.appliedPromo.discountAmount : 0;
    const finalTotal = Math.max(0, totals.subtotal - couponDiscount);
    const totalSavings = totals.savings + couponDiscount;

    // 1. Header Badge
    els.cartBadge.textContent = totals.itemCount;
    els.cartBadge.classList.toggle('show', totals.itemCount > 0);

    // 2. Floating "Go to Checkout" Bar
    if (totals.itemCount > 0) {
      els.floatingCheckoutBar.classList.remove('hidden');
      els.floatingItemCount.textContent = `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`;
      els.floatingTotal.textContent = `₹${finalTotal}`;
      els.floatingSavings.textContent = totalSavings > 0 ? `Saved ₹${totalSavings}` : '';
    } else {
      els.floatingCheckoutBar.classList.add('hidden');
    }

    // 3. Cart Drawer Contents
    if (state.cart.length === 0) {
      els.cartEmpty.classList.remove('hidden');
      if (els.cartPromoBanners) els.cartPromoBanners.innerHTML = '';
      els.cartItemsList.innerHTML = '';
      els.cartFooter.classList.add('hidden');
      return;
    }

    els.cartEmpty.classList.add('hidden');
    els.cartFooter.classList.remove('hidden');

    // Render In-Cart Promo Suggestions / Unlocked Banners
    renderCartPromoBanners();

    els.cartSubtotal.textContent = `₹${totals.subtotal}`;
    if (state.appliedPromo) {
      if (els.cartCouponRow) {
        els.cartCouponRow.classList.remove('hidden');
        els.cartCouponLabel.textContent = `Coupon (${state.appliedPromo.code})`;
        els.cartCouponDiscount.textContent = `-₹${state.appliedPromo.discountAmount}`;
      }
    } else {
      if (els.cartCouponRow) els.cartCouponRow.classList.add('hidden');
    }
    els.cartSavings.textContent = `₹${totalSavings}`;
    els.cartTotal.textContent = `₹${finalTotal}`;

    const activePromos = (state.promos || []).filter(p => p.active);

    els.cartItemsList.innerHTML = state.cart.map(item => {
      const sizeTag = item.selectedSize ? `<span class="cart-item-option-pill">📏 ${escapeHtml(item.selectedSize.name)}</span>` : '';
      const addonsTag = item.selectedAddons && item.selectedAddons.length > 0
        ? `<div class="cart-item-option-pill">🧀 ${item.selectedAddons.map(a => escapeHtml(a.name)).join(', ')}</div>`
        : '';
      const keyAttr = escapeHtml(item.cartKey || String(item.id));

      // Determine promo badge for this cart item
      const menuItem = state.menu.find(m => m.id === item.id);
      const itemCat = (menuItem && menuItem.category) || item.category;
      let itemPromoTag = '';

      if (state.appliedPromo) {
        const p = state.promos.find(x => x.code === state.appliedPromo.code);
        if (p) {
          if (p.scope === 'combo' && Array.isArray(p.comboCategories) && p.comboCategories.includes(itemCat)) {
            itemPromoTag = `<span class="cart-item-deal-badge applied">🎉 Combo Deal Applied</span>`;
          } else if (p.scope === 'category' && p.targetCategory === itemCat) {
            itemPromoTag = `<span class="cart-item-deal-badge applied">🏷️ Category Deal Applied</span>`;
          } else if (p.scope === 'item' && parseInt(p.targetItemId) === item.id) {
            itemPromoTag = `<span class="cart-item-deal-badge applied">⚡ Item Deal Applied</span>`;
          } else if (p.scope === 'all_items') {
            itemPromoTag = `<span class="cart-item-deal-badge applied">✨ Storewide Deal Applied</span>`;
          }
        }
      }

      if (!itemPromoTag) {
        const comboP = activePromos.find(p => p.scope === 'combo' && Array.isArray(p.comboCategories) && p.comboCategories.includes(itemCat));
        if (comboP) {
          const cat1 = comboP.comboCategories[0];
          const cat2 = comboP.comboCategories[1];
          const hasBoth = cartCategories.has(cat1) && cartCategories.has(cat2);
          if (hasBoth) {
            itemPromoTag = `<span class="cart-item-deal-badge combo">🎉 Combo Unlocked (${escapeHtml(comboP.code)})</span>`;
          } else {
            const missing = cartCategories.has(cat1) ? cat2 : cat1;
            itemPromoTag = `<span class="cart-item-deal-badge eligible">💡 Add ${escapeHtml(missing)} for offer</span>`;
          }
        } else {
          const catP = activePromos.find(p => p.scope === 'category' && p.targetCategory === itemCat);
          if (catP) {
            itemPromoTag = `<span class="cart-item-deal-badge eligible">🏷️ ${escapeHtml(catP.code)} eligible</span>`;
          } else {
            const itemP = activePromos.find(p => p.scope === 'item' && parseInt(p.targetItemId) === item.id);
            if (itemP) {
              itemPromoTag = `<span class="cart-item-deal-badge eligible">⚡ ${escapeHtml(itemP.code)} eligible</span>`;
            } else {
              const allP = activePromos.find(p => p.scope === 'all_items');
              if (allP) {
                itemPromoTag = `<span class="cart-item-deal-badge eligible">✨ ${escapeHtml(allP.code)} eligible</span>`;
              }
            }
          }
        }
      }

      return `
      <div class="cart-item">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          ${itemPromoTag ? `<div class="cart-item-promo-row">${itemPromoTag}</div>` : ''}
          ${sizeTag ? `<div>${sizeTag}</div>` : ''}
          ${addonsTag ? `<div>${addonsTag}</div>` : ''}
          <div class="cart-item-price">₹${item.offerPrice}</div>
          <div class="cart-item-controls">
            <div class="qty-control">
              <button data-cart-action="dec" data-key="${keyAttr}">−</button>
              <span class="qty-value">${item.qty}</span>
              <button data-cart-action="inc" data-key="${keyAttr}">+</button>
            </div>
          </div>
        </div>
        <button class="cart-item-remove" data-cart-action="remove" data-key="${keyAttr}" aria-label="Remove item">🗑️</button>
      </div>
      `;
    }).join('');

    els.cartItemsList.querySelectorAll('[data-cart-action="inc"]').forEach(btn => {
      btn.addEventListener('click', () => updateCartQty(btn.dataset.key, 1));
    });
    els.cartItemsList.querySelectorAll('[data-cart-action="dec"]').forEach(btn => {
      btn.addEventListener('click', () => updateCartQty(btn.dataset.key, -1));
    });
    els.cartItemsList.querySelectorAll('[data-cart-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
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
      const discountType = promo.discountType || (promo.flatDiscount ? 'flat' : 'percentage');
      const discountVal = promo.discountValue !== undefined ? promo.discountValue : (promo.discountPercent || promo.flatDiscount || 20);
      const discountLabel = discountType === 'percentage' ? `${discountVal}% OFF` : `₹${discountVal} OFF`;

      let scopeLabel = '';
      if (promo.scope === 'combo') {
        const cats = Array.isArray(promo.comboCategories) ? promo.comboCategories.join(' + ') : 'Combo';
        scopeLabel = ` • Combo: ${cats}`;
      } else if (promo.scope === 'category') {
        scopeLabel = ` • On ${promo.targetCategory || 'Category'}`;
      } else if (promo.scope === 'all_items') {
        scopeLabel = ' • All Items';
      } else if (promo.scope === 'item') {
        const targetItem = state.menu.find(m => m.id === parseInt(promo.targetItemId));
        scopeLabel = targetItem ? ` • On ${targetItem.name}` : ' • Specific Item';
      }

      return `
        <span class="promo-chip" data-code="${escapeHtml(promo.code)}">
          🏷️ <strong>${escapeHtml(promo.code)}</strong> (${discountLabel}${scopeLabel})
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

    const res = calculatePromoDiscount(promo);
    if (!res.eligible) {
      showToast(res.message, 'error');
      return;
    }

    state.appliedPromo = {
      code: promo.code,
      title: promo.title,
      discountAmount: res.discount,
      promoData: promo
    };

    if (els.appliedCouponTag) els.appliedCouponTag.classList.remove('hidden');
    if (els.appliedCouponText) els.appliedCouponText.textContent = `🎉 '${promo.code}' applied! You saved ₹${res.discount}`;
    showToast(`Coupon ${promo.code} applied! Saved ₹${res.discount}`);
    updateCartUI();
    updateCheckoutBreakdown();
  }

  function removeCheckoutCoupon() {
    state.appliedPromo = null;
    if (els.appliedCouponTag) els.appliedCouponTag.classList.add('hidden');
    els.checkoutPromoInput.value = '';
    showToast('Coupon removed.', 'info');
    updateCartUI();
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

    const customerPhone = els.custPhone.value.trim() || (user ? user.phone : '');
    const rawDigits = customerPhone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const order = {
      id: orderId,
      type: state.orderType,
      items: [...state.cart],
      subtotal: totals.subtotal,
      total: finalTotal,
      coupon: state.appliedPromo ? { ...state.appliedPromo } : null,
      customer: {
        userId: user ? user.id : 'guest',
        name: els.custName.value.trim() || (user ? user.name : 'Customer'),
        phone: customerPhone,
        rawPhone: last10,
        email: user ? (user.email || '') : '',
        address: deliveryAddress,
        notes: els.custNotes.value.trim()
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Save order strictly for this user account
    const ordersKey = getOrdersStorageKey(user);
    const userOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    userOrders.unshift(order);
    localStorage.setItem(ordersKey, JSON.stringify(userOrders));
    window.dispatchEvent(new Event('mj_orders_changed'));
    updateHeaderOrdersBadge();

    // Persist order to MongoDB Atlas
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).catch(err => console.warn('Could not save order to MongoDB Atlas:', err));

    // Clear cart & coupon locally and MongoDB
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
        els.orderSuccessPromoDisplay.textContent = `🎟️ Promo applied: ${order.coupon.code} (Saved ₹${order.coupon.discountAmount}) · ⏱️ 2-min cancel window active`;
      } else {
        els.orderSuccessPromoDisplay.textContent = '⏱️ 2-minute cancellation timer active. You can cancel from "My Orders".';
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

    // Item Customization Modal triggers
    if (els.customizationCloseBtn) {
      els.customizationCloseBtn.addEventListener('click', closeCustomizationModal);
    }
    if (els.customizationModal) {
      els.customizationModal.addEventListener('click', (e) => {
        if (e.target === els.customizationModal) closeCustomizationModal();
      });
    }
    if (els.btnCustomQtyDec) {
      els.btnCustomQtyDec.addEventListener('click', () => {
        if (customizationState.qty > 1) {
          customizationState.qty--;
          updateCustomizationTotal();
        }
      });
    }
    if (els.btnCustomQtyInc) {
      els.btnCustomQtyInc.addEventListener('click', () => {
        if (customizationState.qty < 99) {
          customizationState.qty++;
          updateCustomizationTotal();
        }
      });
    }
    if (els.btnConfirmAddToCart) {
      els.btnConfirmAddToCart.addEventListener('click', confirmCustomAddToCart);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCustomizationModal();
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
      const cur = window.MJAuth ? MJAuth.getCurrentUser() : null;
      if (!cur) {
        // Completely clear in-memory cart on logout so it never leaks to another user
        state.cart = [];
        state.appliedPromo = null;
        localStorage.removeItem('mj_cart_guest');
      } else {
        // Load the isolated cart strictly for this authenticated customer
        loadCartForUser(cur);
      }
      initHeaderProfile();
      updateCartUI();
      renderMenu();
      updateHeaderOrdersBadge();
      if (els.ordersModal && els.ordersModal.classList.contains('open')) {
        renderCustomerOrders(els.customerOrdersList);
      }
      if (els.profileModal && els.profileModal.classList.contains('open') && els.tabProfileOrders && els.tabProfileOrders.classList.contains('active')) {
        renderProfileOrders();
      }
    });
  }

  // ========== DIETARY FILTER CONTROLS ==========
  function initDietaryFilters() {
    const filterBar = $('#dietaryFilterBar');
    if (!filterBar) return;
    filterBar.querySelectorAll('.dietary-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.dietaryFilter = btn.dataset.dietary || 'all';
        updateDietaryFilterUI();
        renderMenu();
      });
    });
  }

  function updateDietaryFilterUI() {
    const filterBar = $('#dietaryFilterBar');
    if (!filterBar) return;
    filterBar.querySelectorAll('.dietary-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dietary === state.dietaryFilter);
    });
  }

  // ========== INIT ==========
  function init() {
    loadState();
    initTheme();
    initHeaderProfile();
    updateHeaderOrdersBadge();
    initCheckoutOrderType();
    initDietaryFilters();
    renderCategories();
    renderMenu();
    updateCartUI();
    bindEvents();

    // Periodic live orders sync with MongoDB Atlas (poll every 5s if logged in)
    setInterval(() => {
      const user = window.MJAuth ? MJAuth.getCurrentUser() : null;
      if (user && user.phone) {
        fetchCustomerOrders().then(() => {
          updateHeaderOrdersBadge();
          if (els.ordersModal && els.ordersModal.classList.contains('open')) {
            renderCustomerOrders(els.customerOrdersList);
          }
          if (els.profileModal && els.profileModal.classList.contains('open') && els.tabProfileOrders && els.tabProfileOrders.classList.contains('active')) {
            renderProfileOrders();
          }
        });
      }
    }, 5000);

    // Live 1-second ticking countdown timer for 2-minute order cancellation window
    setInterval(updateCancelTimers, 1000);

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
