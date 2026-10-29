require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const cloudinary = require('cloudinary').v2;
const { connectToMongoDB, disconnectFromMongoDB, getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Razorpay client helper
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

// Configure Cloudinary for Food Image Uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nhpdthsp',
  api_key: process.env.CLOUDINARY_API_KEY || '632611372133432',
  api_secret: process.env.CLOUDINARY_API_SECRET || '0ApwpB2b20k8dDJ0bsIjUBBXTX8'
});

// Middleware for parsing JSON & URL-encoded requests (supports large image uploads)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static assets from project root
app.use(express.static(path.join(__dirname, '.')));

// ========== DEFAULT SEED DATA (CLOUDINARY HOSTED) ==========
const DEFAULT_MENU = [
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
  {
    id: 12, name: 'Mediterranean Bowl', category: 'Salads',
    description: 'Grilled chicken, feta, olives, tomatoes, cucumber, and lemon vinaigrette',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219727/mjs_corner/food/salad.jpg', mrp: 349, offerPrice: 289,
    badge: 'Healthy', available: true,
    isVeg: false, dietary: 'non-veg',
    sizes: [],
    addons: []
  },
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
    discountType: 'percentage',
    discountValue: 25,
    scope: 'order',
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

async function seedDefaultDataIfEmpty() {
  const db = getDb();

  // Menu collection seeding & Cloudinary image normalization
  const menuCount = await db.collection('menu').countDocuments();
  if (menuCount === 0) {
    console.log('Seeding default Cloudinary menu items into MongoDB Atlas...');
    await db.collection('menu').insertMany(DEFAULT_MENU);
  } else {
    // Ensure all items pointing to old local paths use Cloudinary
    const oldItems = await db.collection('menu').find({ image: { $regex: '^images/' } }).toArray();
    for (const item of oldItems) {
      const match = DEFAULT_MENU.find(d => d.id === item.id);
      if (match) {
        await db.collection('menu').updateOne({ _id: item._id }, { $set: { image: match.image } });
      }
    }

    function isItemNameVeg(name) {
      if (!name) return false;
      const n = name.toLowerCase();
      if (n.includes('chicken') || n.includes('bacon') || n.includes('beef') || n.includes('meat') || n.includes('pork') || n.includes('fish') || n.includes('egg') || n.includes('wings') || n.includes('shawarma') || n.includes('pepperoni')) {
        return false;
      }
      if (n.includes('veg') || n.includes('paneer') || n.includes('cheese') || n.includes('margherita') || n.includes('mushroom') || n.includes('corn') || n.includes('farmhouse') || n.includes('pasta') || n.includes('smoothie') || n.includes('shake') || n.includes('brownie') || n.includes('cake') || n.includes('fries') || n.includes('salad')) {
        return true;
      }
      return false;
    }

    // Ensure all items in MongoDB have isVeg and dietary fields
    const allCurrent = await db.collection('menu').find({}).toArray();
    for (const item of allCurrent) {
      const match = DEFAULT_MENU.find(d => d.id === item.id);
      let isVegVal = item.isVeg !== undefined ? item.isVeg : (match ? match.isVeg : isItemNameVeg(item.name));
      if (item.name && item.name.toLowerCase().includes('farmhouse') && item.isVeg === false) {
        isVegVal = true;
      }
      const dietaryVal = isVegVal ? 'veg' : 'non-veg';
      await db.collection('menu').updateOne(
        { _id: item._id },
        { $set: { isVeg: isVegVal, dietary: dietaryVal } }
      );
    }
  }

  // Promotions collection seeding
  const promoCount = await db.collection('promotions').countDocuments();
  if (promoCount === 0) {
    console.log('Seeding default promotions into MongoDB Atlas...');
    await db.collection('promotions').insertMany(DEFAULT_PROMOS);
  }

  // Settings collection seeding
  const settingsCount = await db.collection('settings').countDocuments();
  if (settingsCount === 0) {
    console.log('Seeding default application settings into MongoDB Atlas...');
    await db.collection('settings').insertOne({
      key: 'app_settings',
      promoPopupEnabled: true,
      updatedAt: new Date()
    });
  }
}

// ========== HELPER FUNCTIONS ==========
async function fetchJsonFromUrl(url) {
  const resp = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'MJsCorner-Auth/1.0'
    }
  });
  if (!resp.ok) {
    throw new Error(`Phone.Email server returned HTTP ${resp.status}`);
  }
  return await resp.json();
}

function getAdminPhonesList() {
  const envVal = process.env.ADMIN_PHONES || '';
  return envVal.split(',').map(p => p.trim().replace(/\D/g, '')).filter(Boolean);
}

function getAdminEmailsList() {
  const envVal = process.env.ADMIN_EMAILS || 'admin@mjscorner.com';
  return envVal.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

function deriveNameFromEmail(email) {
  if (!email || !email.includes('@')) return 'Customer';
  const prefix = email.split('@')[0];
  const parts = prefix.split(/[._\-0-9]+/).filter(Boolean);
  if (parts.length === 0) return 'Customer';
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

async function findOrCreateUser({ name, phone = '', email = '', countryCode = '+91' }) {
  const db = getDb();
  const digitsOnly = (phone || '').replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);
  const cleanEmail = (email || '').trim().toLowerCase();

  const adminPhones = getAdminPhonesList();
  const adminEmails = getAdminEmailsList();
  const isDefaultAdmin = (last10 && adminPhones.includes(last10)) || (cleanEmail && adminEmails.includes(cleanEmail));

  // Search by phone, rawPhone suffix, or email
  const queryConditions = [];
  if (last10) {
    queryConditions.push(
      { phone: phone },
      { phone: { $regex: last10 + '$' } },
      { rawPhone: last10 }
    );
  }
  if (cleanEmail) {
    queryConditions.push({ email: cleanEmail });
  }

  let user = null;
  if (queryConditions.length > 0) {
    user = await db.collection('users').findOne({ $or: queryConditions });
  }

  const now = new Date();

  if (user) {
    const updates = { lastLogin: now };
    if (name && (!user.name || user.name === 'Customer' || user.name === 'Guest Customer')) {
      updates.name = name.trim();
    }
    if (cleanEmail && !user.email) {
      updates.email = cleanEmail;
    }
    if (phone && !user.phone) {
      updates.phone = phone.startsWith('+') ? phone : `${countryCode} ${last10}`;
      updates.countryCode = countryCode;
      updates.rawPhone = last10;
    }
    // If user matches admin criteria, ensure admin role
    if (isDefaultAdmin && user.role !== 'admin') {
      updates.role = 'admin';
    }
    await db.collection('users').updateOne({ _id: user._id }, { $set: updates });
    user = { ...user, ...updates };
  } else {
    let finalName = (name && name.trim()) || '';
    if (!finalName && cleanEmail) {
      finalName = deriveNameFromEmail(cleanEmail);
    }
    if (!finalName) {
      finalName = 'Customer';
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: finalName,
      phone: last10 ? (phone.startsWith('+') ? phone : `${countryCode} ${last10}`) : '',
      countryCode: last10 ? countryCode : '',
      rawPhone: last10 || '',
      email: cleanEmail || '',
      role: isDefaultAdmin ? 'admin' : 'customer',
      addresses: [],
      cart: [],
      createdAt: now,
      lastLogin: now
    };
    const res = await db.collection('users').insertOne(newUser);
    user = { ...newUser, _id: res.insertedId };
  }

  return {
    id: user.id || String(user._id),
    name: user.name,
    phone: user.phone || '',
    email: user.email || '',
    role: user.role || 'customer',
    addresses: user.addresses || []
  };
}

// ========== API ROUTES ==========

// Public configuration for frontend (Phone.Email client ID, Razorpay Key ID, etc.)
app.get('/api/config', (req, res) => {
  res.json({
    phoneEmailClientId: process.env.PHONE_EMAIL_CLIENT_ID || '11976801478974448261',
    hasCloudinary: !!process.env.CLOUDINARY_API_KEY,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
  });
});

// ========== RAZORPAY STANDARD WEB CHECKOUT ENDPOINTS ==========

// 1. Create Order: Calls Razorpay API (POST https://api.razorpay.com/v1/orders)
// Expects: { amount (in paise), currency, receipt }
// Returns: { order_id, amount, currency, key }
app.post('/api/create-order', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay credentials not configured on server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)'
      });
    }

    const { amount, currency = 'INR', receipt, notes } = req.body;
    const parsedAmount = parseInt(amount, 10);

    // Minimum amount validation: at least 100 paise (₹1.00)
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1.00)'
      });
    }

    const rzp = getRazorpayInstance();
    const orderOptions = {
      amount: parsedAmount,
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt || ('rcpt_' + Date.now().toString().slice(-8)),
      notes: notes || {}
    };

    const razorpayOrder = await rzp.orders.create(orderOptions);

    return res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    return res.status(500).json({
      success: false,
      error: (err.error && err.error.description) || err.message || 'Failed to create Razorpay order'
    });
  }
});

// 2. Verify Payment Signature
// Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
// Expects: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData }
app.post('/api/verify-payment', async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay secret key not configured on server'
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf-8'),
        Buffer.from(razorpay_signature, 'utf-8')
      );
    } catch (e) {
      isValid = false;
    }

    if (!isValid) {
      console.warn('[Razorpay] Signature mismatch for order:', razorpay_order_id);
      return res.status(400).json({
        success: false,
        is_paid: false,
        error: 'Payment verification failed: Signature mismatch. Order not marked as paid.'
      });
    }

    // Payment is verified! Save order with paymentStatus: 'paid' in MongoDB Atlas
    let savedOrder = null;
    if (orderData && orderData.id) {
      const db = getDb();
      const customerPhone = (orderData.customer && orderData.customer.phone) || '';
      const customerEmail = (orderData.customer && orderData.customer.email) || '';
      const customerUserId = (orderData.customer && orderData.customer.userId) || '';
      const rawDigits = customerPhone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);

      const orderDoc = {
        ...orderData,
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        paymentDetails: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          verifiedAt: new Date()
        },
        customer: {
          ...orderData.customer,
          rawPhone: last10,
          email: customerEmail.toLowerCase()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('orders').insertOne(orderDoc);
      savedOrder = orderDoc;

      // Automatically clear customer cart in MongoDB users collection upon checkout
      const clearFilters = [];
      if (last10) {
        clearFilters.push(
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 }
        );
      }
      if (customerEmail) {
        clearFilters.push({ email: customerEmail.toLowerCase() });
      }
      if (customerUserId && customerUserId !== 'guest') {
        clearFilters.push({ id: customerUserId });
      }

      if (clearFilters.length > 0) {
        await db.collection('users').updateOne(
          { $or: clearFilters },
          { $set: { cart: [], cartUpdatedAt: new Date() } }
        );
      }
    }

    return res.json({
      success: true,
      is_paid: true,
      message: 'Payment verified successfully!',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      order: savedOrder
    });
  } catch (err) {
    console.error('Razorpay verify-payment error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error while verifying payment signature'
    });
  }
});

// Phone.Email OTP Verification Callback (Phone or Email)
// Frontend receives user_json_url from phoneEmailListener or phoneEmailReceiver and posts it here
app.post('/api/auth/verify-phone-email', async (req, res) => {
  try {
    const { name: clientName, user_json_url } = req.body;
    if (!user_json_url) {
      return res.status(400).json({ success: false, message: 'Missing user_json_url from Phone.Email' });
    }

    const verifiedData = await fetchJsonFromUrl(user_json_url);
    console.log('[Phone.Email Verified Payload]:', verifiedData);

    const countryCode = verifiedData.user_country_code || verifiedData.country_code || '91';
    const rawNumber = verifiedData.user_phone_number || verifiedData.phone_no || '';
    const verifiedEmail = (verifiedData.user_email_id || verifiedData.email || '').trim().toLowerCase();

    if (!rawNumber && !verifiedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Neither phone number nor email was verified by Phone.Email.'
      });
    }

    let cleanPhone = '';
    let formattedCountry = '+91';
    if (rawNumber) {
      formattedCountry = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
      const digits = rawNumber.replace(/\D/g, '').slice(-10);
      cleanPhone = `${formattedCountry} ${digits}`;
    }

    let derivedName = clientName || '';
    if (!derivedName) {
      const parts = [verifiedData.user_first_name, verifiedData.user_last_name].filter(Boolean).map(s => s.trim());
      if (parts.length > 0) {
        derivedName = parts.join(' ');
      }
    }

    const user = await findOrCreateUser({
      name: derivedName,
      phone: cleanPhone,
      email: verifiedEmail,
      countryCode: formattedCountry
    });

    return res.json({
      success: true,
      message: verifiedEmail && !cleanPhone ? 'Email verified successfully via Phone.Email!' : 'Phone verified successfully via Phone.Email!',
      user
    });
  } catch (err) {
    console.error('Phone.Email verification failed:', err);
    return res.status(500).json({ success: false, message: err.message || 'Verification failed.' });
  }
});



// Sync or fetch fresh user role & profile from MongoDB by phone or email or userId
app.get('/api/auth/user/:identifier', async (req, res) => {
  try {
    const db = getDb();
    const identifier = decodeURIComponent(req.params.identifier).trim();
    let query;

    if (identifier.includes('@')) {
      query = { email: identifier.toLowerCase() };
    } else {
      const rawDigits = identifier.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      query = {
        $or: [
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 },
          { id: identifier }
        ]
      };
    }

    const user = await db.collection('users').findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in MongoDB' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id || String(user._id),
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'customer',
        addresses: user.addresses || []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Sync user addresses and name to MongoDB
app.post('/api/auth/sync-user', async (req, res) => {
  try {
    const db = getDb();
    const { phone, email, userId, addresses, name } = req.body;
    if (!phone && !email && !userId) {
      return res.status(400).json({ success: false, message: 'User identifier required' });
    }

    const query = [];
    if (userId) query.push({ id: userId });
    if (email) query.push({ email: email.trim().toLowerCase() });
    if (phone) {
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      if (last10) {
        query.push(
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 }
        );
      }
    }

    const updates = {};
    if (Array.isArray(addresses)) updates.addresses = addresses;
    if (name) updates.name = name;
    if (email) updates.email = email.trim().toLowerCase();
    if (phone) {
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      if (last10) {
        updates.phone = phone.startsWith('+') ? phone : `+91 ${last10}`;
        updates.rawPhone = last10;
      }
    }

    await db.collection('users').updateOne(
      { $or: query },
      { $set: updates }
    );

    return res.json({ success: true, message: 'User updated in MongoDB' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin User Management: List all accounts in MongoDB
app.get('/api/admin/users', async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin User Management: Assign/Update Role in MongoDB
app.post('/api/admin/set-role', async (req, res) => {
  try {
    const db = getDb();
    const { phone, email, userId, role } = req.body;
    if ((!phone && !email && !userId) || !role) {
      return res.status(400).json({ success: false, message: 'User identifier and role are required' });
    }

    const query = [];
    if (userId) query.push({ id: userId });
    if (email) query.push({ email: email.trim().toLowerCase() });
    if (phone) {
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      if (last10) {
        query.push(
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 }
        );
      }
    }

    const result = await db.collection('users').updateOne(
      { $or: query },
      { $set: { role: role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'No user found in MongoDB with that identifier' });
    }

    return res.json({ success: true, message: `Role updated to ${role} in MongoDB!` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Cloudinary Food Image Upload Endpoint
app.post('/api/upload-food-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: 'mjs_corner/food',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return res.json({
      success: true,
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Image upload failed' });
  }
});

// ========== MENU ENDPOINTS (MONGODB ATLAS) ==========
app.get('/api/menu', async (req, res) => {
  try {
    const db = getDb();
    const menu = await db.collection('menu').find({}).sort({ id: 1 }).toArray();
    res.json({ success: true, menu: menu.length > 0 ? menu : DEFAULT_MENU });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, menu: DEFAULT_MENU });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const db = getDb();
    const { menu } = req.body;
    if (!Array.isArray(menu)) {
      return res.status(400).json({ success: false, message: 'Menu array required' });
    }
    await db.collection('menu').deleteMany({});
    if (menu.length > 0) {
      const cleanMenu = menu.map(({ _id, ...item }) => item);
      await db.collection('menu').insertMany(cleanMenu);
    }
    res.json({ success: true, message: 'Menu updated in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/menu/reset', async (req, res) => {
  try {
    const db = getDb();
    await db.collection('menu').deleteMany({});
    await db.collection('menu').insertMany(DEFAULT_MENU);
    res.json({ success: true, menu: DEFAULT_MENU, message: 'Menu reset to Cloudinary defaults in MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== PROMOTIONS ENDPOINTS (MONGODB ATLAS) ==========
app.get('/api/promotions', async (req, res) => {
  try {
    const db = getDb();
    const promos = await db.collection('promotions').find({}).sort({ id: 1 }).toArray();
    res.json({ success: true, promotions: promos.length > 0 ? promos : DEFAULT_PROMOS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, promotions: DEFAULT_PROMOS });
  }
});

app.post('/api/promotions', async (req, res) => {
  try {
    const db = getDb();
    const { promotions } = req.body;
    if (!Array.isArray(promotions)) {
      return res.status(400).json({ success: false, message: 'Promotions array required' });
    }
    await db.collection('promotions').deleteMany({});
    if (promotions.length > 0) {
      const cleanPromos = promotions.map(({ _id, ...item }) => item);
      await db.collection('promotions').insertMany(cleanPromos);
    }
    res.json({ success: true, message: 'Promotions updated in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== SETTINGS ENDPOINTS (MONGODB ATLAS) ==========
app.get('/api/settings', async (req, res) => {
  try {
    const db = getDb();
    const settings = await db.collection('settings').findOne({ key: 'app_settings' });
    res.json({ success: true, settings: settings || { promoPopupEnabled: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const db = getDb();
    const updates = req.body || {};
    delete updates._id;
    delete updates.key;
    await db.collection('settings').updateOne(
      { key: 'app_settings' },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Settings updated in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== USER CART ISOLATION ENDPOINTS (MONGODB ATLAS) ==========
app.get('/api/user/cart/:identifier', async (req, res) => {
  try {
    const db = getDb();
    const identifier = decodeURIComponent(req.params.identifier).trim();
    let query;

    if (identifier.includes('@')) {
      query = { email: identifier.toLowerCase() };
    } else {
      const rawDigits = identifier.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      query = {
        $or: [
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 },
          { id: identifier }
        ]
      };
    }

    const user = await db.collection('users').findOne(query);

    if (!user) {
      return res.json({ success: true, cart: [] });
    }

    res.json({ success: true, cart: user.cart || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/user/cart', async (req, res) => {
  try {
    const db = getDb();
    const { phone, email, userId, cart } = req.body;
    if (!phone && !email && !userId) {
      return res.status(400).json({ success: false, message: 'User identifier is required' });
    }

    const query = [];
    if (userId && userId !== 'guest') query.push({ id: userId });
    if (email) query.push({ email: email.trim().toLowerCase() });
    if (phone) {
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      if (last10) {
        query.push(
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 }
        );
      }
    }

    const user = await db.collection('users').findOne({ $or: query });

    if (user) {
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            cart: Array.isArray(cart) ? cart : [],
            cartUpdatedAt: new Date()
          }
        }
      );
    } else {
      const rawDigits = (phone || '').replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      const cleanEmail = (email || '').trim().toLowerCase();
      await db.collection('users').insertOne({
        id: userId || ('usr_' + Date.now()),
        name: cleanEmail ? deriveNameFromEmail(cleanEmail) : 'Customer',
        phone: last10 ? (phone.startsWith('+') ? phone : `+91 ${last10}`) : '',
        countryCode: last10 ? '+91' : '',
        rawPhone: last10 || '',
        email: cleanEmail || '',
        role: 'customer',
        addresses: [],
        cart: Array.isArray(cart) ? cart : [],
        cartUpdatedAt: new Date(),
        createdAt: new Date()
      });
    }

    res.json({ success: true, message: 'User cart updated in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== ORDERS MANAGEMENT & ISOLATION (MONGODB ATLAS) ==========
// Admin sees all orders; customers see only their own orders
app.get('/api/orders', async (req, res) => {
  try {
    const db = getDb();
    const { phone, email, userId } = req.query;
    let query = {};

    const orClauses = [];
    if (phone && phone.trim()) {
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      if (last10) {
        orClauses.push(
          { 'customer.phone': { $regex: last10 + '$' } },
          { 'customer.rawPhone': last10 }
        );
      }
    }
    if (email && email.trim()) {
      orClauses.push({ 'customer.email': email.trim().toLowerCase() });
    }
    if (userId && userId.trim() && userId !== 'guest') {
      orClauses.push({ 'customer.userId': userId.trim() });
    }

    if (orClauses.length > 0) {
      query = { $or: orClauses };
    }

    const orders = await db.collection('orders').find(query).sort({ timestamp: -1, createdAt: -1 }).toArray();
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer places an order -> persists to MongoDB Atlas & clears their cart
app.post('/api/orders', async (req, res) => {
  try {
    const db = getDb();
    const orderData = req.body;
    if (!orderData || !orderData.id) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    const customerPhone = (orderData.customer && orderData.customer.phone) || '';
    const customerEmail = (orderData.customer && orderData.customer.email) || '';
    const customerUserId = (orderData.customer && orderData.customer.userId) || '';
    const rawDigits = customerPhone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const orderDoc = {
      ...orderData,
      customer: {
        ...orderData.customer,
        rawPhone: last10,
        email: customerEmail.toLowerCase()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('orders').insertOne(orderDoc);

    // Automatically clear customer cart in MongoDB users collection upon checkout
    const clearFilters = [];
    if (last10) {
      clearFilters.push(
        { phone: { $regex: last10 + '$' } },
        { rawPhone: last10 }
      );
    }
    if (customerEmail) {
      clearFilters.push({ email: customerEmail.toLowerCase() });
    }
    if (customerUserId && customerUserId !== 'guest') {
      clearFilters.push({ id: customerUserId });
    }

    if (clearFilters.length > 0) {
      await db.collection('users').updateOne(
        { $or: clearFilters },
        { $set: { cart: [], cartUpdatedAt: new Date() } }
      );
    }

    res.json({ success: true, order: orderDoc, message: 'Order created in MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update order status in MongoDB Atlas (Admin or Customer cancel)
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const db = getDb();
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const result = await db.collection('orders').updateOne(
      { id: orderId },
      { $set: { status: status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found in MongoDB' });
    }

    res.json({ success: true, message: `Order status updated to ${status} in MongoDB Atlas` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== STATIC & HTML ROUTE ALIASES ==========
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for root or any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Connect to MongoDB and seed defaults when starting the server
connectToMongoDB()
  .then(async () => {
    await seedDefaultDataIfEmpty();
    app.listen(PORT, () => {
      console.log(`MJ's Corner running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to MongoDB error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});

module.exports = app;
