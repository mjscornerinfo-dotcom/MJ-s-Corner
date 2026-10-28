require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const cloudinary = require('cloudinary').v2;
const { connectToMongoDB, disconnectFromMongoDB, getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

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
    sizes: [],
    addons: []
  },
  {
    id: 8, name: 'Penne Arrabbiata', category: 'Pasta',
    description: 'Spicy tomato sauce with garlic, chili flakes, and fresh basil',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219725/mjs_corner/food/pasta.jpg', mrp: 349, offerPrice: 279,
    badge: '', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 9, name: 'Loaded Cheese Fries', category: 'Sides',
    description: 'Crispy fries topped with melted cheese sauce, herbs, and spices',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219724/mjs_corner/food/fries.jpg', mrp: 249, offerPrice: 179,
    badge: 'Fan Fav', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 10, name: 'Buffalo Wings', category: 'Sides',
    description: 'Glazed buffalo wings with blue cheese dip and celery sticks',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219729/mjs_corner/food/wings.jpg', mrp: 379, offerPrice: 299,
    badge: '', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 11, name: 'Chicken Shawarma Wrap', category: 'Sides',
    description: 'Grilled chicken with pickled vegetables, tahini, and fresh lettuce',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219730/mjs_corner/food/wrap.jpg', mrp: 279, offerPrice: 229,
    badge: '', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 12, name: 'Mediterranean Bowl', category: 'Salads',
    description: 'Grilled chicken, feta, olives, tomatoes, cucumber, and lemon vinaigrette',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219727/mjs_corner/food/salad.jpg', mrp: 349, offerPrice: 289,
    badge: 'Healthy', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 13, name: 'Mango Smoothie', category: 'Drinks',
    description: 'Fresh tropical mango blended with yogurt and a hint of mint',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219728/mjs_corner/food/smoothie.jpg', mrp: 199, offerPrice: 149,
    badge: '', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 14, name: 'Berry Blast Smoothie', category: 'Drinks',
    description: 'Mixed berries, banana, and honey blended to perfection',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219728/mjs_corner/food/smoothie.jpg', mrp: 229, offerPrice: 179,
    badge: 'New', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 15, name: 'Molten Brownie Sundae', category: 'Desserts',
    description: 'Warm chocolate brownie with vanilla ice cream and chocolate drizzle',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219722/mjs_corner/food/brownie.jpg', mrp: 299, offerPrice: 229,
    badge: '🍫 Indulge', available: true,
    sizes: [],
    addons: []
  },
  {
    id: 16, name: 'Classic Cheesecake', category: 'Desserts',
    description: 'New York style cheesecake with berry compote',
    image: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793219722/mjs_corner/food/brownie.jpg', mrp: 349, offerPrice: 269,
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
  const envVal = process.env.ADMIN_PHONES || '9999988888,9876543210';
  return envVal.split(',').map(p => p.trim().replace(/\D/g, '')).filter(Boolean);
}

async function findOrCreateUser({ name, phone, countryCode = '+91' }) {
  const db = getDb();
  const digitsOnly = phone.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);
  const adminPhones = getAdminPhonesList();
  const isDefaultAdmin = adminPhones.includes(last10);

  // Search by exact phone, regex suffix, or rawPhone
  let user = await db.collection('users').findOne({
    $or: [
      { phone: phone },
      { phone: { $regex: last10 + '$' } },
      { rawPhone: last10 }
    ]
  });

  const now = new Date();

  if (user) {
    const updates = { lastLogin: now };
    if (name && (!user.name || user.name === 'Customer' || user.name === 'Guest Customer')) {
      updates.name = name.trim();
    }
    // If phone is configured in ADMIN_PHONES, ensure admin role
    if (isDefaultAdmin && user.role !== 'admin') {
      updates.role = 'admin';
    }
    await db.collection('users').updateOne({ _id: user._id }, { $set: updates });
    user = { ...user, ...updates };
  } else {
    const newUser = {
      id: 'usr_' + Date.now(),
      name: (name && name.trim()) || 'Customer',
      phone: phone.startsWith('+') ? phone : `${countryCode} ${last10}`,
      countryCode: countryCode,
      rawPhone: last10,
      role: isDefaultAdmin ? 'admin' : 'customer',
      addresses: [],
      createdAt: now,
      lastLogin: now
    };
    const res = await db.collection('users').insertOne(newUser);
    user = { ...newUser, _id: res.insertedId };
  }

  return {
    id: user.id || String(user._id),
    name: user.name,
    phone: user.phone,
    role: user.role || 'customer',
    addresses: user.addresses || []
  };
}

// ========== API ROUTES ==========

// Public configuration for frontend (Phone.Email client ID, etc.)
app.get('/api/config', (req, res) => {
  res.json({
    phoneEmailClientId: process.env.PHONE_EMAIL_CLIENT_ID || '',
    hasCloudinary: !!process.env.CLOUDINARY_API_KEY
  });
});

// Phone.Email OTP Verification Callback
// Frontend receives user_json_url from phoneEmailListener and posts it here
app.post('/api/auth/verify-phone-email', async (req, res) => {
  try {
    const { name, user_json_url } = req.body;
    if (!user_json_url) {
      return res.status(400).json({ success: false, message: 'Missing user_json_url from Phone.Email' });
    }

    const verifiedData = await fetchJsonFromUrl(user_json_url);
    const countryCode = verifiedData.user_country_code || verifiedData.country_code || '91';
    const rawNumber = verifiedData.user_phone_number || verifiedData.phone_no || '';
    if (!rawNumber) {
      return res.status(400).json({ success: false, message: 'Phone number could not be verified from Phone.Email.' });
    }

    const formattedCountry = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    const cleanPhone = `${formattedCountry} ${rawNumber.replace(/\D/g, '').slice(-10)}`;

    const user = await findOrCreateUser({
      name: name || verifiedData.user_first_name || '',
      phone: cleanPhone,
      countryCode: formattedCountry
    });

    return res.json({
      success: true,
      message: 'Verified successfully via Phone.Email!',
      user
    });
  } catch (err) {
    console.error('Phone.Email verification failed:', err);
    return res.status(500).json({ success: false, message: err.message || 'Verification failed.' });
  }
});



// Sync or fetch fresh user role & profile from MongoDB
app.get('/api/auth/user/:phone', async (req, res) => {
  try {
    const db = getDb();
    const rawDigits = req.params.phone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const user = await db.collection('users').findOne({
      $or: [
        { phone: { $regex: last10 + '$' } },
        { rawPhone: last10 }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in MongoDB' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id || String(user._id),
        name: user.name,
        phone: user.phone,
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
    const { phone, addresses, name } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    const rawDigits = phone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const updates = {};
    if (Array.isArray(addresses)) updates.addresses = addresses;
    if (name) updates.name = name;

    await db.collection('users').updateOne(
      {
        $or: [
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 }
        ]
      },
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
    const { phone, role } = req.body;
    if (!phone || !role) {
      return res.status(400).json({ success: false, message: 'Phone and role are required' });
    }

    const rawDigits = phone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const result = await db.collection('users').updateOne(
      {
        $or: [
          { phone: { $regex: last10 + '$' } },
          { rawPhone: last10 }
        ]
      },
      { $set: { role: role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'No user found with that phone number' });
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
app.get('/api/user/cart/:phone', async (req, res) => {
  try {
    const db = getDb();
    const rawDigits = req.params.phone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const user = await db.collection('users').findOne({
      $or: [
        { phone: { $regex: last10 + '$' } },
        { rawPhone: last10 }
      ]
    });

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
    const { phone, cart } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const rawDigits = phone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const user = await db.collection('users').findOne({
      $or: [
        { phone: { $regex: last10 + '$' } },
        { rawPhone: last10 }
      ]
    });

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
      await db.collection('users').insertOne({
        id: 'usr_' + Date.now(),
        name: 'Customer',
        phone: phone.startsWith('+') ? phone : `+91 ${last10}`,
        countryCode: '+91',
        rawPhone: last10,
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
    const { phone } = req.query;
    let query = {};

    if (phone && phone.trim()) {
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      query = {
        $or: [
          { 'customer.phone': { $regex: last10 + '$' } },
          { 'customer.rawPhone': last10 },
          { 'customer.userId': phone }
        ]
      };
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
    const rawDigits = customerPhone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10);

    const orderDoc = {
      ...orderData,
      customer: {
        ...orderData.customer,
        rawPhone: last10
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('orders').insertOne(orderDoc);

    // Automatically clear customer cart in MongoDB users collection upon checkout
    if (last10) {
      await db.collection('users').updateOne(
        {
          $or: [
            { phone: { $regex: last10 + '$' } },
            { rawPhone: last10 }
          ]
        },
        {
          $set: { cart: [], cartUpdatedAt: new Date() }
        }
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
