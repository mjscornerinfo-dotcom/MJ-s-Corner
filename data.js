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
      image: 'images/burger.jpg', mrp: 349, offerPrice: 249,
      badge: 'Bestseller', available: true,
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
      image: 'images/burger.jpg', mrp: 399, offerPrice: 329,
      badge: '', available: true,
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
      image: 'images/burger.jpg', mrp: 329, offerPrice: 269,
      badge: '🌶️ Spicy', available: true,
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
      image: 'images/pizza.jpg', mrp: 449, offerPrice: 349,
      badge: 'Popular', available: true,
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
      image: 'images/pizza.jpg', mrp: 549, offerPrice: 449,
      badge: '', available: true,
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
      image: 'images/pizza.jpg', mrp: 599, offerPrice: 479,
      badge: 'New', available: true,
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
      image: 'images/pasta.jpg', mrp: 399, offerPrice: 329,
      badge: 'Chef\'s Pick', available: true,
      sizes: [],
      addons: []
    },
    {
      id: 8, name: 'Penne Arrabbiata', category: 'Pasta',
      description: 'Spicy tomato sauce with garlic, chili flakes, and fresh basil',
      image: 'images/pasta.jpg', mrp: 349, offerPrice: 279,
      badge: '', available: true,
      sizes: [],
      addons: []
    },
    // ---- Sides ----
    {
      id: 9, name: 'Loaded Cheese Fries', category: 'Sides',
      description: 'Crispy fries topped with melted cheese sauce, herbs, and spices',
      image: 'images/fries.jpg', mrp: 249, offerPrice: 179,
      badge: 'Fan Fav', available: true,
      sizes: [],
      addons: []
    },
    {
      id: 10, name: 'Buffalo Wings', category: 'Sides',
      description: 'Glazed buffalo wings with blue cheese dip and celery sticks',
      image: 'images/wings.jpg', mrp: 379, offerPrice: 299,
      badge: '', available: true,
      sizes: [],
      addons: []
    },
    {
      id: 11, name: 'Chicken Shawarma Wrap', category: 'Sides',
      description: 'Grilled chicken with pickled vegetables, tahini, and fresh lettuce',
      image: 'images/wrap.jpg', mrp: 279, offerPrice: 229,
      badge: '', available: true,
      sizes: [],
      addons: []
    },
    // ---- Salads ----
    {
      id: 12, name: 'Mediterranean Bowl', category: 'Salads',
      description: 'Grilled chicken, feta, olives, tomatoes, cucumber, and lemon vinaigrette',
      image: 'images/salad.jpg', mrp: 349, offerPrice: 289,
      badge: 'Healthy', available: true,
      sizes: [],
      addons: []
    },
    // ---- Drinks ----
    {
      id: 13, name: 'Mango Smoothie', category: 'Drinks',
      description: 'Fresh tropical mango blended with yogurt and a hint of mint',
      image: 'images/smoothie.jpg', mrp: 199, offerPrice: 149,
      badge: '', available: true,
      sizes: [],
      addons: []
    },
    {
      id: 14, name: 'Berry Blast Smoothie', category: 'Drinks',
      description: 'Mixed berries, banana, and honey blended to perfection',
      image: 'images/smoothie.jpg', mrp: 229, offerPrice: 179,
      badge: 'New', available: true,
      sizes: [],
      addons: []
    },
    // ---- Desserts ----
    {
      id: 15, name: 'Molten Brownie Sundae', category: 'Desserts',
      description: 'Warm chocolate brownie with vanilla ice cream and chocolate drizzle',
      image: 'images/brownie.jpg', mrp: 299, offerPrice: 229,
      badge: '🍫 Indulge', available: true,
      sizes: [],
      addons: []
    },
    {
      id: 16, name: 'Classic Cheesecake', category: 'Desserts',
      description: 'New York style cheesecake with berry compote',
      image: 'images/brownie.jpg', mrp: 349, offerPrice: 269,
      badge: '', available: true,
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

  // Seed storage if never initialized
  function initStorage() {
    if (localStorage.getItem(STORAGE_KEY_MENU) === null) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
    } else {
      // Migrate existing menu items to have sizes & addons if missing
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_MENU));
        if (Array.isArray(stored)) {
          let modified = false;
          stored.forEach(item => {
            if (item.sizes === undefined) {
              const def = DEFAULT_MENU.find(d => d.id === item.id);
              item.sizes = def && def.sizes ? JSON.parse(JSON.stringify(def.sizes)) : [];
              modified = true;
            }
            if (item.addons === undefined) {
              const def = DEFAULT_MENU.find(d => d.id === item.id);
              item.addons = def && def.addons ? JSON.parse(JSON.stringify(def.addons)) : [];
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
      localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(DEFAULT_PROMOS));
    } else {
      // Migrate existing promos to support discountType, discountValue, scope, comboCategories
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_PROMOS));
        if (Array.isArray(stored)) {
          let modified = false;
          // If stored promos are only the old 3 default promos without combo, merge in combo promos
          const hasCombo = stored.some(p => p.scope === 'combo' || p.code === 'PIZZADRINK');
          if (!hasCombo) {
            const pizzaCombo = DEFAULT_PROMOS.find(p => p.code === 'PIZZADRINK');
            if (pizzaCombo) {
              stored.splice(1, 0, JSON.parse(JSON.stringify(pizzaCombo)));
              modified = true;
            }
          }
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
  }

  function resetToDefaults() {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
    localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(DEFAULT_PROMOS));
    localStorage.setItem(STORAGE_KEY_POPUP, 'true');
    window.dispatchEvent(new Event('mj_data_changed'));
  }

  initStorage();

  return {
    getMenu,
    saveMenu,
    getPromos,
    savePromos,
    isPromoPopupEnabled,
    setPromoPopupEnabled,
    resetToDefaults,
    DEFAULT_MENU,
    DEFAULT_PROMOS
  };
})();

window.MJData = MJData;
