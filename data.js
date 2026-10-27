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

  const DEFAULT_PROMOS = [
    {
      id: 1,
      title: '🎉 Grand Opening!',
      subtitle: 'Celebrate with us',
      code: 'MJOPEN',
      description: 'Get 25% off on your first order',
      active: true,
      discountPercent: 25
    },
    {
      id: 2,
      title: '🍕 Pizza Mania',
      subtitle: 'Limited time only',
      code: 'PIZZA50',
      description: 'Flat ₹50 off on all pizzas',
      active: true,
      flatDiscount: 50
    },
    {
      id: 3,
      title: '⚡ Flash Sale',
      subtitle: 'Weekend Treat',
      code: 'SAVE20',
      description: 'Get 20% off on your order',
      active: true,
      discountPercent: 20
    }
  ];

  // Seed storage if never initialized
  function initStorage() {
    if (localStorage.getItem(STORAGE_KEY_MENU) === null) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU));
    }
    if (localStorage.getItem(STORAGE_KEY_PROMOS) === null) {
      localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(DEFAULT_PROMOS));
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
