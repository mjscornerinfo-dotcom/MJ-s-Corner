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

// ========== HELPER FUNCTIONS ==========
function fetchJsonFromUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error('Invalid JSON from Phone.Email: ' + e.message));
        }
      });
    }).on('error', reject);
  });
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

// Direct OTP Verification (Test Mode or Direct Verification)
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { name, phone, otp } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number' });
    }

    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp) {
      return res.status(400).json({ success: false, message: 'Please enter the OTP' });
    }

    const digitsOnly = phone.replace(/\D/g, '');
    const last10 = digitsOnly.slice(-10);
    if (last10.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const fullPhone = `+91 ${last10}`;
    const user = await findOrCreateUser({
      name: (name && name.trim()) || 'Customer',
      phone: fullPhone,
      countryCode: '+91'
    });

    return res.json({
      success: true,
      message: 'OTP verified successfully!',
      user
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ success: false, message: err.message || 'OTP verification failed' });
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

// Connect to MongoDB when starting the server
connectToMongoDB()
  .then(() => {
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
