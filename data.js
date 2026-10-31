/* ============================================
   MJ's Corner — Shared Menu & Promotions Data
   Single Source of Truth for Customer & Admin
   ============================================ */

var MJData = (function () {
  'use strict';

  const STORAGE_KEY_MENU = 'mj_menu';
  const STORAGE_KEY_PROMOS = 'mj_promos';
  const STORAGE_KEY_POPUP = 'mj_promoPopup';

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

  const DEFAULT_PROMOS = [
    {
      id: 1,
      title: '🎉 Grand Opening!',
      subtitle: 'Celebrate with us',
      code: 'MJOPEN',
      description: 'Get 25% off on entire order',
      active: true,
      discountType: 'percentage', // 'percentage' | 'flat'
      discountValue: 25,
      scope: 'order', // 'order' | 'all_items' | 'category' | 'combo' | 'item'
      targetCategory: 'All',
      targetItemId: null,
      comboCategories: [],
      minOrderValue: 0
    },
    {
      id: 2,
      title: '🍕🥤 Pizza & Drinks Combo',
      subtitle: 'Pair & Save Big',
      code: 'PIZZADRINK',
      description: 'Get 20% off when you order Pizza and Drinks together',
      active: true,
      discountType: 'percentage',
      discountValue: 20,
      scope: 'combo',
      targetCategory: '',
      targetItemId: null,
      comboCategories: ['Pizza', 'Drinks'],
      minOrderValue: 0
    },
    {
      id: 3,
      title: '🍕 Pizza Mania',
      subtitle: 'Flat discount',
      code: 'PIZZA50',
      description: 'Flat ₹50 off on all pizzas',
      active: true,
      discountType: 'flat',
      discountValue: 50,
      scope: 'category',
      targetCategory: 'Pizza',
      targetItemId: null,
      comboCategories: [],
      minOrderValue: 299
    },
    {
      id: 4,
      title: '🍔🍟 Burger & Sides Combo',
      subtitle: 'The Classic Pair',
      code: 'BURGERCOMBO',
      description: 'Get 15% off when you pair any Burger with Sides',
      active: true,
      discountType: 'percentage',
      discountValue: 15,
      scope: 'combo',
      targetCategory: '',
      targetItemId: null,
      comboCategories: ['Burgers', 'Sides'],
      minOrderValue: 0
    }
  ];

  // Seed storage if never initialized and migrate images to Cloudinary
  function initStorage() {
    if (typeof localStorage === 'undefined') return;
    const isInitialized = localStorage.getItem('mj_initialized') === 'true';

    if (localStorage.getItem(STORAGE_KEY_MENU) === null) {
      if (!isInitialized) {
        localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
      } else {
        localStorage.setItem(STORAGE_KEY_MENU, '[]');
      }
    } else {
      // Migrate existing menu items to have Cloudinary URLs, sizes & addons
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_MENU));
        if (Array.isArray(stored)) {
          let modified = false;
          stored.forEach(item => {
            const def = DEFAULT_MENU.find(d => d.id === item.id);
            // Replace local images with Cloudinary URLs
            if (item.image && item.image.startsWith('images/')) {
              if (def) {
                item.image = def.image;
                modified = true;
              }
            }
            if (item.sizes === undefined) {
              item.sizes = def && def.sizes ? JSON.parse(JSON.stringify(def.sizes)) : [];
              modified = true;
            }
            if (item.addons === undefined) {
              item.addons = def && def.addons ? JSON.parse(JSON.stringify(def.addons)) : [];
              modified = true;
            }
            if (item.isVeg === undefined) {
              item.isVeg = def ? def.isVeg : false;
              modified = true;
            }
            if (!item.dietary) {
              item.dietary = def ? def.dietary : (item.isVeg ? 'veg' : 'non-veg');
              modified = true;
            }
          });
          if (modified) {
            localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(stored));
          }
        }
      } catch (e) {}
    }
    if (localStorage.getItem(STORAGE_KEY_PROMOS) === null) {
      if (!isInitialized) {
        localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(DEFAULT_PROMOS));
      } else {
        localStorage.setItem(STORAGE_KEY_PROMOS, '[]');
      }
    } else {
      // Migrate existing promos to support discountType, discountValue, scope, comboCategories
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_PROMOS));
        if (Array.isArray(stored)) {
          let modified = false;
          stored.forEach(promo => {
            if (!promo.discountType) {
              if (promo.flatDiscount) {
                promo.discountType = 'flat';
                promo.discountValue = promo.flatDiscount;
              } else {
                promo.discountType = 'percentage';
                promo.discountValue = promo.discountPercent || 20;
              }
              modified = true;
            }
            if (!promo.scope) {
              if (promo.code === 'PIZZA50') {
                promo.scope = 'category';
                promo.targetCategory = 'Pizza';
              } else if (promo.code === 'PIZZADRINK') {
                promo.scope = 'combo';
                promo.comboCategories = ['Pizza', 'Drinks'];
              } else {
                promo.scope = 'order';
                promo.targetCategory = 'All';
              }
              modified = true;
            }
            if (promo.comboCategories === undefined) {
              promo.comboCategories = promo.code === 'PIZZADRINK' ? ['Pizza', 'Drinks'] : [];
              modified = true;
            }
            if (promo.minOrderValue === undefined) {
              promo.minOrderValue = 0;
              modified = true;
            }
          });
          if (modified) {
            localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(stored));
          }
        }
      } catch (e) {}
    }
    if (localStorage.getItem(STORAGE_KEY_POPUP) === null) {
      localStorage.setItem(STORAGE_KEY_POPUP, 'true');
    }
  }

  function getMenu() {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY_MENU);
      return data !== null ? JSON.parse(data) : [...DEFAULT_MENU];
    } catch (e) {
      return [...DEFAULT_MENU];
    }
  }

  function saveMenu(menu) {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menu));
    window.dispatchEvent(new Event('mj_data_changed'));

    // Persist to MongoDB Atlas
    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu })
    }).catch(err => console.warn('Could not save menu to MongoDB:', err));
  }

  function getPromos() {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROMOS);
      return data !== null ? JSON.parse(data) : [...DEFAULT_PROMOS];
    } catch (e) {
      return [...DEFAULT_PROMOS];
    }
  }

  function savePromos(promos) {
    localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promos));
    window.dispatchEvent(new Event('mj_data_changed'));

    // Persist to MongoDB Atlas
    fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promotions: promos })
    }).catch(err => console.warn('Could not save promos to MongoDB:', err));
  }

  function isPromoPopupEnabled() {
    initStorage();
    try {
      const val = localStorage.getItem(STORAGE_KEY_POPUP);
      return val !== null ? JSON.parse(val) : true;
    } catch (e) {
      return true;
    }
  }

  function setPromoPopupEnabled(val) {
    localStorage.setItem(STORAGE_KEY_POPUP, JSON.stringify(val));
    window.dispatchEvent(new Event('mj_data_changed'));

    // Persist to MongoDB Atlas
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoPopupEnabled: val })
    }).catch(err => console.warn('Could not save settings to MongoDB:', err));
  }

  function deleteMenuItem(id) {
    initStorage();
    let menu = getMenu();
    menu = menu.filter(item => String(item.id) !== String(id));
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menu));
    window.dispatchEvent(new Event('mj_data_changed'));

    fetch(`/api/menu/${encodeURIComponent(id)}`, { method: 'DELETE' })
      .catch(err => console.warn('Could not delete menu item in MongoDB:', err));
  }

  function deletePromo(id) {
    initStorage();
    let promos = getPromos();
    promos = promos.filter(p => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promos));
    window.dispatchEvent(new Event('mj_data_changed'));

    fetch(`/api/promotions/${encodeURIComponent(id)}`, { method: 'DELETE' })
      .catch(err => console.warn('Could not delete promo in MongoDB:', err));
  }

  function resetMenu() {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
    localStorage.setItem('mj_initialized', 'true');
    window.dispatchEvent(new Event('mj_data_changed'));

    return fetch('/api/menu/reset', { method: 'POST' })
      .then(r => r.json())
      .catch(err => console.warn('Could not reset menu in MongoDB:', err));
  }

  function resetPromos() {
    localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(DEFAULT_PROMOS));
    localStorage.setItem('mj_initialized', 'true');
    window.dispatchEvent(new Event('mj_data_changed'));

    return fetch('/api/promotions/reset', { method: 'POST' })
      .then(r => r.json())
      .catch(err => console.warn('Could not reset promos in MongoDB:', err));
  }

  function resetToDefaults() {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
    localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(DEFAULT_PROMOS));
    localStorage.setItem(STORAGE_KEY_POPUP, 'true');
    localStorage.setItem('mj_initialized', 'true');
    window.dispatchEvent(new Event('mj_data_changed'));

    fetch('/api/menu/reset', { method: 'POST' })
      .catch(err => console.warn('Could not reset menu in MongoDB:', err));
    fetch('/api/promotions/reset', { method: 'POST' })
      .catch(err => console.warn('Could not reset promos in MongoDB:', err));
  }

  // Sync menu, promos, and settings from MongoDB Atlas
  async function syncFromDb() {
    try {
      // 1. Menu
      const menuResp = await fetch('/api/menu');
      if (menuResp.ok) {
        const menuData = await menuResp.json();
        if (menuData.success && Array.isArray(menuData.menu)) {
          localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menuData.menu));
          localStorage.setItem('mj_initialized', 'true');
        }
      }

      // 2. Promotions
      const promoResp = await fetch('/api/promotions');
      if (promoResp.ok) {
        const promoData = await promoResp.json();
        if (promoData.success && Array.isArray(promoData.promotions)) {
          localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promoData.promotions));
          localStorage.setItem('mj_initialized', 'true');
        }
      }

      // 3. Settings
      const setResp = await fetch('/api/settings');
      if (setResp.ok) {
        const setData = await setResp.json();
        if (setData.success && setData.settings) {
          if (setData.settings.promoPopupEnabled !== undefined) {
            localStorage.setItem(STORAGE_KEY_POPUP, JSON.stringify(setData.settings.promoPopupEnabled));
          }
        }
      }

      window.dispatchEvent(new Event('mj_data_changed'));
    } catch (e) {
      console.warn('MongoDB sync note (working offline / cache):', e.message);
    }
  }

  initStorage();
  // Background initial sync
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    setTimeout(syncFromDb, 100);
  }

  return {
    getMenu,
    saveMenu,
    deleteMenuItem,
    resetMenu,
    getPromos,
    savePromos,
    deletePromo,
    resetPromos,
    isPromoPopupEnabled,
    setPromoPopupEnabled,
    resetToDefaults,
    syncFromDb,
    DEFAULT_MENU,
    DEFAULT_PROMOS
  };
})();

if (typeof window !== 'undefined') {
  window.MJData = MJData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MJData;
}
