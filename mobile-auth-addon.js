'use strict';

/**
 * Additive native-customer API for the existing Express/MongoDB service.
 * Mount with mountMobileApi(app, { getDb, findOrCreateUser, getNextOrderId, getRazorpayInstance }).
 * It registers only /api/mobile/* routes. It does not replace existing web routes.
 */
module.exports = function mountMobileApi(app, {
  getDb,
  findOrCreateUser,
  getNextOrderId,
  getRazorpayInstance
}) {
  const crypto = require('crypto');
  const windows = new Map();
  let indexesReady;
  const SESSION_DAYS = 30;
  const QUOTE_MINUTES = 10;
  const MAX_LINES = 40;

  function hitLimit(key, limit = 12) {
    const now = Date.now();
    const entry = windows.get(key);
    if (!entry || now - entry.start >= 60_000) {
      windows.set(key, { start: now, count: 1 });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  }

  function verifyPhoneEmailJwt(token) {
    const secret = process.env.PHONE_EMAIL_API_KEY;
    if (!secret) throw Object.assign(new Error('Phone.Email backend verification is not configured.'), { status: 503 });
    if (typeof token !== 'string' || token.length < 32 || token.length > 8192) throw new Error('Phone.Email verification token is invalid.');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Phone.Email verification token is invalid.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (header.alg !== 'HS256') throw new Error('Phone.Email token algorithm is not allowed.');
    const expected = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
    const actual = Buffer.from(parts[2], 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Phone.Email signature verification failed.');
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.exp !== 'number' || claims.exp <= now) throw new Error('Phone.Email token has expired.');
    if (typeof claims.iat === 'number' && claims.iat > now + 60) throw new Error('Phone.Email token is not yet valid.');
    if (!claims.country_code || !claims.phone_no) throw new Error('Phone.Email token has no verified phone number.');
    return claims;
  }

  async function ensureIndexes(db) {
    if (!indexesReady) indexesReady = Promise.all([
      db.collection('mobile_sessions').createIndex({ tokenHash: 1 }, { unique: true }),
      db.collection('mobile_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection('mobile_sessions').createIndex({ userId: 1 }),
      db.collection('mobile_checkout_quotes').createIndex({ quoteId: 1 }, { unique: true }),
      db.collection('mobile_checkout_quotes').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection('mobile_checkout_quotes').createIndex({ userId: 1, status: 1 }),
      db.collection('orders').createIndex({ mobileQuoteId: 1 }, { unique: true, partialFilterExpression: { mobileQuoteId: { $type: 'string' } } })
    ]);
    return indexesReady;
  }

  function safeUser(user) {
    return {
      id: user.id || String(user._id), name: user.name || '', phone: user.phone || '',
      email: user.email || '', role: user.role || 'customer',
      addresses: Array.isArray(user.addresses) ? user.addresses : []
    };
  }

  async function requireMobileSession(req, res, next) {
    try {
      const match = /^Bearer ([A-Za-z0-9_-]{40,128})$/.exec(req.get('authorization') || '');
      if (!match) return res.status(401).json({ success: false, message: 'Sign-in required.' });
      const db = getDb();
      await ensureIndexes(db);
      const tokenHash = crypto.createHash('sha256').update(match[1]).digest('hex');
      const session = await db.collection('mobile_sessions').findOne({ tokenHash, expiresAt: { $gt: new Date() } });
      if (!session) return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
      const user = await db.collection('users').findOne({ id: session.userId });
      if (!user) return res.status(401).json({ success: false, message: 'Customer account is unavailable.' });
      req.mobileSession = session;
      req.mobileCustomer = user;
      next();
    } catch (error) {
      console.error('[Mobile API] session lookup failed:', error.message);
      res.status(500).json({ success: false, message: 'Could not validate customer session.' });
    }
  }

  function cleanAddress(input) {
    const title = String(input && input.title || '').trim().slice(0, 40);
    const fullAddress = String(input && input.fullAddress || '').trim().slice(0, 500);
    if (!title || fullAddress.length < 8) throw Object.assign(new Error('Enter an address label and a complete delivery address.'), { status: 400 });
    return { id: String(input.id || `addr_${crypto.randomUUID()}`).slice(0, 80), title, fullAddress, isDefault: Boolean(input.isDefault) };
  }

  function cleanCartInput(lines) {
    if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) throw Object.assign(new Error(`Cart must contain between 1 and ${MAX_LINES} items.`), { status: 400 });
    return lines.map(line => {
      const id = Number(line && (line.id ?? line.itemId));
      const quantity = Number(line && (line.qty ?? line.quantity));
      const selectedSize = line && (line.selectedSize || line.size);
      const sizeName = typeof selectedSize === 'string' ? selectedSize : (selectedSize && selectedSize.name) || '';
      const selectedAddons = line && (line.selectedAddons || line.addons) || [];
      if (!Number.isSafeInteger(id) || id < 0 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 50) {
        throw Object.assign(new Error('An item or quantity in the cart is invalid.'), { status: 400 });
      }
      if (!Array.isArray(selectedAddons) || selectedAddons.length > 20) throw Object.assign(new Error('The selected add-ons are invalid.'), { status: 400 });
      const addonNames = selectedAddons.map(a => String(typeof a === 'string' ? a : a && a.name || '').trim()).filter(Boolean);
      return { id, qty: quantity, sizeName: String(sizeName).trim(), addonNames: [...new Set(addonNames)] };
    });
  }

  async function priceCart(db, inputLines) {
    const lines = cleanCartInput(inputLines);
    const priced = [];
    for (const line of lines) {
      const item = await db.collection('menu').findOne({ id: line.id });
      if (!item) throw Object.assign(new Error(`Menu item ${line.id} is no longer available.`), { status: 409 });
      if (item.available === false) throw Object.assign(new Error(`${item.name} is currently out of stock.`), { status: 409 });
      const sizes = Array.isArray(item.sizes) ? item.sizes : [];
      let size = null;
      if (line.sizeName) {
        size = sizes.find(option => String(option.name) === line.sizeName);
        if (!size) throw Object.assign(new Error(`The selected size for ${item.name} has changed. Refresh your menu.`), { status: 409 });
      }
      const addons = Array.isArray(item.addons) ? item.addons : [];
      const chosenAddons = line.addonNames.map(name => {
        const option = addons.find(candidate => String(candidate.name) === name);
        if (!option) throw Object.assign(new Error(`An add-on for ${item.name} has changed. Refresh your menu.`), { status: 409 });
        const price = Number(option.price);
        if (!Number.isFinite(price) || price < 0) throw Object.assign(new Error(`An add-on price for ${item.name} is invalid. Contact the restaurant.`), { status: 409 });
        return { name: String(option.name), price };
      });
      const base = size ? Number(size.price) : Number(item.offerPrice || item.mrp || 0);
      if (!Number.isFinite(base) || base < 0) throw Object.assign(new Error(`The current price for ${item.name} is invalid.`), { status: 409 });
      if (!Number.isFinite(Number(item.mrp)) || Number(item.mrp) < 0) throw Object.assign(new Error(`The listed price for ${item.name} is invalid.`), { status: 409 });
      if (size && (!Number.isFinite(Number(size.price)) || Number(size.price) < 0)) throw Object.assign(new Error(`The selected size price for ${item.name} is invalid.`), { status: 409 });
      const unitPrice = base + chosenAddons.reduce((sum, addon) => sum + addon.price, 0);
      const mrp = Number(item.mrp) || base;
      priced.push({
        id: item.id, name: item.name, category: item.category || '', image: item.image || '',
        mrp, offerPrice: unitPrice, unitPrice, qty: line.qty,
        selectedSize: size ? { name: String(size.name), price: Number(size.price) || 0 } : null,
        selectedAddons: chosenAddons,
        cartKey: `${item.id}__${line.sizeName}__${[...line.addonNames].sort().join('|')}`,
        lineTotal: unitPrice * line.qty
      });
    }
    return priced;
  }

  function calculateDiscount(promo, items, subtotal) {
    if (!promo || !promo.active) throw Object.assign(new Error('That coupon is invalid or inactive.'), { status: 400 });
    if (Number(promo.minOrderValue) > subtotal) throw Object.assign(new Error(`This coupon requires a minimum cart value of ₹${promo.minOrderValue}.`), { status: 400 });
    const value = Number(promo.discountValue ?? promo.discountPercent ?? promo.flatDiscount ?? 0);
    if (!Number.isFinite(value) || value <= 0) return 0;
    const scope = String(promo.scope || 'order').toLowerCase();
    let eligible = items;
    if (scope === 'category') eligible = items.filter(item => !promo.targetCategory || promo.targetCategory === 'All' || String(item.category).toLowerCase() === String(promo.targetCategory).toLowerCase());
    if (scope === 'item') eligible = items.filter(item => item.id === Number(promo.targetItemId));
    if (scope === 'combo') {
      const categories = Array.isArray(promo.comboCategories) && promo.comboCategories.length >= 2 ? promo.comboCategories : ['Pizza', 'Drinks'];
      const first = items.filter(item => String(item.category).toLowerCase() === String(categories[0]).toLowerCase());
      const second = items.filter(item => String(item.category).toLowerCase() === String(categories[1]).toLowerCase());
      if (!first.length || !second.length) throw Object.assign(new Error(`Add items from ${categories[0]} and ${categories[1]} to use this coupon.`), { status: 400 });
      eligible = [...first, ...second];
    }
    if (!eligible.length) throw Object.assign(new Error('Your cart does not contain items eligible for this coupon.'), { status: 400 });
    const eligibleSubtotal = eligible.reduce((sum, item) => sum + item.lineTotal, 0);
    const discountType = String(promo.discountType || (promo.flatDiscount ? 'flat' : 'percentage')).toLowerCase();
    const raw = discountType === 'percentage' ? Math.round(eligibleSubtotal * value / 100) : Math.min(value, eligibleSubtotal);
    return Math.min(subtotal, Math.max(0, Math.round(raw * 100) / 100));
  }

  async function buildQuote(db, user, body) {
    const settings = await db.collection('settings').findOne({ key: 'app_settings' }) || {};
    if (settings.storeOnline === false) throw Object.assign(new Error('Online ordering is currently paused by the restaurant.'), { status: 409 });
    const type = String(body.orderType || '').toLowerCase();
    if (!['delivery', 'pickup', 'takeaway', 'dine-in'].includes(type)) throw Object.assign(new Error('Choose delivery, takeaway, or dine-in.'), { status: 400 });
    const orderType = type === 'takeaway' ? 'pickup' : type;
    let deliveryAddress = '';
    let tableNo = '';
    if (orderType === 'delivery') {
      const address = (Array.isArray(user.addresses) ? user.addresses : []).find(a => String(a.id) === String(body.addressId || ''));
      if (!address) throw Object.assign(new Error('Choose a saved delivery address before checkout.'), { status: 400 });
      deliveryAddress = `${address.title}: ${address.fullAddress}`;
    }
    if (orderType === 'dine-in') {
      tableNo = String(body.tableNo || '').trim().slice(0, 40);
      if (!tableNo) throw Object.assign(new Error('Enter your table or seat number.'), { status: 400 });
      deliveryAddress = `Table: ${tableNo}`;
    }
    const items = await priceCart(db, body.items);
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
    const originalTotal = Math.round(items.reduce((sum, item) => sum + item.mrp * item.qty, 0) * 100) / 100;
    let coupon = null;
    let discount = 0;
    const code = String(body.couponCode || '').trim().toUpperCase();
    if (code) {
      const promo = await db.collection('promotions').findOne({ code: { $regex: `^${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
      discount = calculateDiscount(promo, items, subtotal);
      coupon = { code: promo.code, title: promo.title || '', discountAmount: discount };
    }
    const configuredDeliveryFee = settings.deliveryCharge === undefined ? 50 : Number(settings.deliveryCharge);
    const deliveryFee = orderType === 'delivery' ? (Number.isFinite(configuredDeliveryFee) ? Math.max(0, configuredDeliveryFee) : 0) : 0;
    const total = Math.max(0, Math.round((subtotal - discount + deliveryFee) * 100) / 100);
    return {
      orderType, tableNo, items, subtotal, originalTotal,
      itemSavings: Math.max(0, originalTotal - subtotal), coupon, discount,
      deliveryFee, total,
      customer: {
        userId: user.id, name: String(body.customerName || user.name || 'Customer').trim().slice(0, 100),
        phone: user.phone || '', email: user.email || '', address: deliveryAddress,
        notes: String(body.notes || '').trim().slice(0, 1000)
      }
    };
  }

  function pricingFingerprint(order) {
    const priceState = {
      orderType: order.orderType, tableNo: order.tableNo,
      items: order.items.map(item => ({ id: item.id, name: item.name, category: item.category, mrp: item.mrp, offerPrice: item.offerPrice, qty: item.qty, selectedSize: item.selectedSize, selectedAddons: item.selectedAddons })),
      subtotal: order.subtotal, coupon: order.coupon, discount: order.discount, deliveryFee: order.deliveryFee, total: order.total
    };
    return crypto.createHash('sha256').update(JSON.stringify(priceState)).digest('hex');
  }

  async function ensureCurrentQuote(db, quote, user) {
    const currentOrder = await buildQuote(db, user, quote.input);
    if (pricingFingerprint(currentOrder) !== quote.priceFingerprint) {
      await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id, status: { $in: ['quoted', 'processing'] } }, { $set: { status: 'stale', staleAt: new Date() } });
      throw Object.assign(new Error('Menu prices, availability, address, or coupon changed. Review your checkout again.'), { status: 409 });
    }
    return currentOrder;
  }

  async function nextOrderId(db) {
    if (getNextOrderId) return getNextOrderId();
    const result = await db.collection('counters').findOneAndUpdate(
      { _id: 'order_number' }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' }
    );
    const seq = result && (result.seq || (result.value && result.value.seq)) || 1;
    return `#MJ-${String(seq).padStart(4, '0')}`;
  }

  async function finalizeOrder(db, quote, method, payment) {
    const existing = await db.collection('orders').findOne({ mobileQuoteId: quote.quoteId });
    if (existing) return existing;
    const orderId = await nextOrderId(db);
    const now = new Date();
    const order = {
      ...quote.order,
      id: orderId,
      mobileQuoteId: quote.quoteId,
      type: quote.order.orderType,
      items: quote.order.items.map(({ lineTotal, unitPrice, ...item }) => item),
      coupon: quote.order.coupon ? { ...quote.order.coupon, eligible: true } : null,
      total: quote.order.total,
      status: 'pending',
      paymentStatus: (payment || method === 'promo_free') ? 'paid' : 'pending',
      paymentMethod: method,
      ...(payment && method === 'razorpay' ? { paymentDetails: payment } : {}),
      timestamp: now.toISOString(), createdAt: now, updatedAt: now
    };
    try { await db.collection('orders').insertOne(order); }
    catch (error) {
      if (error.code === 11000) {
        const replay = await db.collection('orders').findOne({ mobileQuoteId: quote.quoteId });
        if (replay) return replay;
      }
      throw error;
    }
    await db.collection('users').updateOne({ id: quote.userId }, { $set: { cart: [], cartUpdatedAt: now } });
    await db.collection('mobile_checkout_quotes').updateOne(
      { quoteId: quote.quoteId }, { $set: { status: 'completed', orderId, completedAt: now } }
    );
    return order;
  }

  app.post('/api/mobile/auth/phone-email', async (req, res) => {
    const rateKey = req.ip || req.socket.remoteAddress || 'unknown';
    if (hitLimit(`login:${rateKey}`, 8)) return res.status(429).json({ success: false, message: 'Too many sign-in attempts. Please wait a minute.' });
    try {
      const claims = verifyPhoneEmailJwt(req.body && req.body.ph_email_jwt);
      const countryCode = String(claims.country_code).trim();
      const digits = String(claims.phone_no).replace(/\D/g, '');
      if (!digits || digits.length < 7 || digits.length > 15) return res.status(400).json({ success: false, message: 'Phone.Email returned an invalid phone number.' });
      const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode.replace(/\D/g, '')}`;
      const user = await findOrCreateUser({ phone: `${cc} ${digits}`, countryCode: cc });
      const db = getDb();
      await ensureIndexes(db);
      const sessionToken = crypto.randomBytes(32).toString('base64url');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_DAYS * 86400000);
      await db.collection('mobile_sessions').insertOne({ tokenHash: crypto.createHash('sha256').update(sessionToken).digest('hex'), userId: user.id, createdAt: now, expiresAt, source: 'phone.email' });
      return res.status(201).json({ success: true, sessionToken, expiresAt, user });
    } catch (error) {
      const status = error.status || 401;
      if (status >= 500) console.error('[Mobile auth] sign-in configuration/error:', error.message);
      return res.status(status).json({ success: false, message: status >= 500 ? 'Phone.Email sign-in is temporarily unavailable.' : error.message || 'Phone.Email sign-in failed.' });
    }
  });

  app.get('/api/mobile/me', requireMobileSession, async (req, res) => res.json({ success: true, user: safeUser(req.mobileCustomer) }));
  app.post('/api/mobile/logout', requireMobileSession, async (req, res) => {
    try {
      await getDb().collection('mobile_sessions').deleteOne({ _id: req.mobileSession._id });
      return res.json({ success: true });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not close your session.' }); }
  });

  app.patch('/api/mobile/me', requireMobileSession, async (req, res) => {
    try {
      const name = String(req.body.name || '').trim().slice(0, 100);
      const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254);
      if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      await getDb().collection('users').updateOne({ id: req.mobileCustomer.id }, { $set: { name, email, updatedAt: new Date() } });
      const updated = await getDb().collection('users').findOne({ id: req.mobileCustomer.id });
      return res.json({ success: true, user: safeUser(updated) });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not update your profile.' }); }
  });

  app.post('/api/mobile/me/addresses', requireMobileSession, async (req, res) => {
    try {
      const address = cleanAddress(req.body);
      const db = getDb();
      const existing = Array.isArray(req.mobileCustomer.addresses) ? req.mobileCustomer.addresses : [];
      if (address.isDefault || existing.length === 0) existing.forEach(a => { a.isDefault = false; });
      address.isDefault = address.isDefault || existing.length === 0;
      existing.push(address);
      await db.collection('users').updateOne({ id: req.mobileCustomer.id }, { $set: { addresses: existing, updatedAt: new Date() } });
      return res.status(201).json({ success: true, addresses: existing });
    } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message || 'Could not save address.' }); }
  });

  app.put('/api/mobile/me/addresses/:addressId', requireMobileSession, async (req, res) => {
    try {
      const address = cleanAddress({ ...req.body, id: req.params.addressId });
      const list = Array.isArray(req.mobileCustomer.addresses) ? req.mobileCustomer.addresses : [];
      if (!list.some(a => String(a.id) === address.id)) return res.status(404).json({ success: false, message: 'Address not found.' });
      if (address.isDefault) list.forEach(a => { a.isDefault = false; });
      const updated = list.map(a => String(a.id) === address.id ? { ...a, ...address, isDefault: address.isDefault || Boolean(a.isDefault) } : a);
      await getDb().collection('users').updateOne({ id: req.mobileCustomer.id }, { $set: { addresses: updated, updatedAt: new Date() } });
      return res.json({ success: true, addresses: updated });
    } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message || 'Could not update address.' }); }
  });

  app.delete('/api/mobile/me/addresses/:addressId', requireMobileSession, async (req, res) => {
    try {
      const list = (Array.isArray(req.mobileCustomer.addresses) ? req.mobileCustomer.addresses : []).filter(a => String(a.id) !== String(req.params.addressId));
      if (list.length === (req.mobileCustomer.addresses || []).length) return res.status(404).json({ success: false, message: 'Address not found.' });
      if (list.length && !list.some(a => a.isDefault)) list[0].isDefault = true;
      await getDb().collection('users').updateOne({ id: req.mobileCustomer.id }, { $set: { addresses: list, updatedAt: new Date() } });
      return res.json({ success: true, addresses: list });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not remove the address.' }); }
  });

  app.get('/api/mobile/cart', requireMobileSession, async (req, res) => {
    try {
      const source = Array.isArray(req.mobileCustomer.cart) ? req.mobileCustomer.cart : [];
      if (!source.length) return res.json({ success: true, items: [] });
      const items = await priceCart(getDb(), source);
      return res.json({ success: true, items });
    } catch (error) { return res.status(error.status || 409).json({ success: false, message: error.message }); }
  });

  app.put('/api/mobile/cart', requireMobileSession, async (req, res) => {
    try {
      const db = getDb();
      const source = cleanCartInput(req.body.items);
      const items = await priceCart(db, source);
      const normalized = items.map(({ lineTotal, unitPrice, ...item }) => item);
      await db.collection('users').updateOne({ id: req.mobileCustomer.id }, { $set: { cart: normalized, cartUpdatedAt: new Date() } });
      return res.json({ success: true, items });
    } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message || 'Could not sync your cart.' }); }
  });

  app.post('/api/mobile/checkout/quote', requireMobileSession, async (req, res) => {
    const key = `quote:${req.mobileCustomer.id}`;
    if (hitLimit(key, 30)) return res.status(429).json({ success: false, message: 'Too many checkout requests. Try again shortly.' });
    try {
      const db = getDb();
      await ensureIndexes(db);
      const order = await buildQuote(db, req.mobileCustomer, req.body || {});
      const quoteId = crypto.randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + QUOTE_MINUTES * 60_000);
      const input = { orderType: req.body.orderType, items: req.body.items, addressId: req.body.addressId, tableNo: req.body.tableNo, couponCode: req.body.couponCode, customerName: req.body.customerName, notes: req.body.notes };
      await db.collection('mobile_checkout_quotes').insertOne({ quoteId, userId: req.mobileCustomer.id, order, input, priceFingerprint: pricingFingerprint(order), status: 'quoted', createdAt: now, expiresAt });
      return res.status(201).json({ success: true, quoteId, expiresAt, quote: { ...order, savings: order.itemSavings + order.discount, currency: 'INR' } });
    } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message || 'Could not calculate your checkout.' }); }
  });

  app.post('/api/mobile/checkout/payment-order', requireMobileSession, async (req, res) => {
    try {
      const db = getDb();
      await ensureIndexes(db);
      const quote = await db.collection('mobile_checkout_quotes').findOne({ quoteId: req.body.quoteId, userId: req.mobileCustomer.id, status: 'quoted', expiresAt: { $gt: new Date() } });
      if (!quote) return res.status(409).json({ success: false, message: 'Checkout quote expired. Please review your cart again.' });
      await ensureCurrentQuote(db, quote, req.mobileCustomer);
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) return res.status(503).json({ success: false, message: 'Online payment is not configured on the server.' });
      if (!quote.order.total || quote.order.total < 1) return res.status(400).json({ success: false, message: 'This order has no online payment amount. Choose an available counter payment method.' });
      if (quote.razorpayOrderId) return res.json({ success: true, orderId: quote.razorpayOrderId, amount: quote.amountPaise, currency: 'INR', keyId, quoteId: quote.quoteId, customer: { name: quote.order.customer.name, email: quote.order.customer.email, contact: quote.order.customer.phone } });
      if (quote.paymentCreating && Date.now() - new Date(quote.paymentCreatingAt || quote.paymentCreatedAt || Date.now()).getTime() < 60_000) return res.status(409).json({ success: false, message: 'Payment setup is already in progress. Please retry in a moment.' });
      const amountPaise = Math.round(quote.order.total * 100);
      if (amountPaise < 100) return res.status(400).json({ success: false, message: 'Razorpay requires an online payment of at least ₹1.' });
      const lock = await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id, status: 'quoted', razorpayOrderId: { $exists: false }, $or: [{ paymentCreating: { $ne: true } }, { paymentCreatingAt: { $lt: new Date(Date.now() - 60_000) } }] }, { $set: { paymentCreating: true, paymentCreatingAt: new Date(), amountPaise } });
      if (!lock.modifiedCount) return res.status(409).json({ success: false, message: 'Payment setup is already in progress. Please retry in a moment.' });
      const rzp = getRazorpayInstance ? getRazorpayInstance() : new (require('razorpay'))({ key_id: keyId, key_secret: keySecret });
      const providerOrder = await rzp.orders.create({ amount: amountPaise, currency: 'INR', payment_capture: 1, receipt: `MJC${quote.quoteId.replace(/-/g, '').slice(0, 20)}`, notes: { mobile_quote_id: quote.quoteId, customer_id: req.mobileCustomer.id } });
      await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id, status: 'quoted', paymentCreating: true }, { $set: { razorpayOrderId: providerOrder.id, amountPaise, paymentCreatedAt: new Date() }, $unset: { paymentCreating: '' } });
      return res.json({ success: true, orderId: providerOrder.id, amount: providerOrder.amount, currency: providerOrder.currency, keyId, quoteId: quote.quoteId, customer: { name: quote.order.customer.name, email: quote.order.customer.email, contact: quote.order.customer.phone } });
    } catch (error) {
      console.error('[Mobile checkout] Razorpay order failed:', error.message);
      if (req.body && req.body.quoteId) await getDb().collection('mobile_checkout_quotes').updateOne({ quoteId: req.body.quoteId, userId: req.mobileCustomer.id, status: 'quoted' }, { $unset: { paymentCreating: '' } }).catch(() => {});
      return res.status(error.status || 502).json({ success: false, message: error.status ? error.message : 'Could not start online payment. Please retry.' });
    }
  });

  app.post('/api/mobile/checkout/orders', requireMobileSession, async (req, res) => {
    try {
      const db = getDb();
      const quote = await db.collection('mobile_checkout_quotes').findOne({ quoteId: req.body.quoteId, userId: req.mobileCustomer.id, status: { $in: ['quoted', 'processing'] }, expiresAt: { $gt: new Date() } });
      if (!quote) return res.status(409).json({ success: false, message: 'Checkout quote expired. Please review your cart again.' });
      await ensureCurrentQuote(db, quote, req.mobileCustomer);
      const method = String(req.body.paymentMethod || '');
      if (quote.razorpayOrderId && quote.order.total > 0) return res.status(409).json({ success: false, message: 'Online payment was started for this checkout. Review a fresh quote before choosing cash.' });
      if (quote.order.total === 0) {
        if (quote.status === 'processing' && quote.paymentMethod !== 'promo_free') return res.status(409).json({ success: false, message: 'This checkout was already submitted.' });
        if (quote.status !== 'processing') {
          const freeLock = await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id, status: 'quoted' }, { $set: { status: 'processing', paymentMethod: 'promo_free' } });
          if (!freeLock.modifiedCount) return res.status(409).json({ success: false, message: 'This checkout has already been submitted.' });
        }
        const freeOrder = await finalizeOrder(db, quote, 'promo_free', null);
        return res.status(201).json({ success: true, order: freeOrder });
      }
      if (method === 'cash_on_counter' && !['pickup', 'dine-in'].includes(quote.order.orderType)) return res.status(400).json({ success: false, message: 'Cash on counter is only available for takeaway or dine-in.' });
      if (method !== 'cash_on_counter') return res.status(400).json({ success: false, message: 'Choose cash on counter for takeaway/dine-in, or pay online.' });
      if (quote.status === 'processing' && quote.paymentMethod !== method) return res.status(409).json({ success: false, message: 'This checkout was already submitted.' });
      if (quote.status !== 'processing') {
        const lock = await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id, status: 'quoted', expiresAt: { $gt: new Date() } }, { $set: { status: 'processing', paymentMethod: method } });
        if (!lock.modifiedCount) return res.status(409).json({ success: false, message: 'This checkout has already been submitted.' });
      }
      const order = await finalizeOrder(db, quote, 'Cash on Counter', null);
      return res.status(201).json({ success: true, order });
    } catch (error) { console.error('[Mobile checkout] order placement failed:', error.message); return res.status(error.status || 500).json({ success: false, message: error.message || 'Could not place your order.' }); }
  });

  app.post('/api/mobile/checkout/verify-payment', requireMobileSession, async (req, res) => {
    try {
      const { quoteId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
      if (![quoteId, orderId, paymentId, signature].every(v => typeof v === 'string' && v.length > 0)) return res.status(400).json({ success: false, message: 'Payment details are incomplete.' });
      const db = getDb();
      await ensureIndexes(db);
      const existing = await db.collection('orders').findOne({ mobileQuoteId: quoteId, 'customer.userId': req.mobileCustomer.id });
      if (existing) return res.json({ success: true, order: existing, alreadyFinalized: true });
      const quote = await db.collection('mobile_checkout_quotes').findOne({ quoteId, userId: req.mobileCustomer.id, status: { $in: ['quoted', 'processing'] }, expiresAt: { $gt: new Date() } });
      if (!quote || quote.razorpayOrderId !== orderId) return res.status(409).json({ success: false, message: 'Payment does not match an active checkout.' });
      if (quote.status === 'processing' && (quote.paymentMethod !== 'razorpay' || quote.paymentId !== paymentId)) return res.status(409).json({ success: false, message: 'This checkout was already submitted.' });
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) return res.status(503).json({ success: false, message: 'Payment verification is not configured on the server.' });
      const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
      const received = Buffer.from(signature, 'hex');
      if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
      const rzp = getRazorpayInstance ? getRazorpayInstance() : new (require('razorpay'))({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: secret });
      const [providerOrder, payment] = await Promise.all([rzp.orders.fetch(orderId), rzp.payments.fetch(paymentId)]);
      const expectedAmount = Math.round(quote.order.total * 100);
      if (providerOrder.id !== orderId || providerOrder.amount !== expectedAmount || providerOrder.currency !== 'INR' || providerOrder.status !== 'paid' || payment.order_id !== orderId || payment.amount !== expectedAmount || payment.currency !== 'INR' || payment.status !== 'captured') {
        return res.status(409).json({ success: false, message: 'Razorpay reports that this payment is not captured for the quoted amount.' });
      }
      try { await ensureCurrentQuote(db, quote, req.mobileCustomer); }
      catch (staleError) {
        let refund = null;
        try { refund = await rzp.payments.refund(paymentId, { amount: expectedAmount }); } catch (refundError) { console.error('[Mobile checkout] stale quote refund needs follow-up:', refundError.message); }
        await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id }, { $set: { status: refund ? 'refunded' : 'refund_required', paymentId, refundId: refund && refund.id, updatedAt: new Date() } });
        return res.status(409).json({ success: false, refunded: Boolean(refund), message: refund ? 'The menu changed during payment. Razorpay has been asked to refund this payment; please place the order again.' : 'The menu changed during payment. Your payment needs restaurant support; please do not pay again yet.' });
      }
      if (quote.status !== 'processing') {
        const lock = await db.collection('mobile_checkout_quotes').updateOne({ _id: quote._id, status: 'quoted', razorpayOrderId: orderId }, { $set: { status: 'processing', paymentMethod: 'razorpay', paymentId, verifiedAt: new Date() } });
        if (!lock.modifiedCount) {
          const raced = await db.collection('orders').findOne({ mobileQuoteId: quoteId });
          if (raced) return res.json({ success: true, order: raced, alreadyFinalized: true });
          return res.status(409).json({ success: false, message: 'This checkout was already submitted.' });
        }
      }
      const order = await finalizeOrder(db, quote, 'razorpay', { razorpay_order_id: orderId, razorpay_payment_id: paymentId, verifiedAt: new Date(), captured: true });
      return res.json({ success: true, order });
    } catch (error) { console.error('[Mobile checkout] payment verification failed:', error.message); return res.status(502).json({ success: false, message: 'Could not verify payment. Contact the restaurant before retrying if money was debited.' }); }
  });

  app.get('/api/mobile/orders', requireMobileSession, async (req, res) => {
    try {
      const orders = await getDb().collection('orders').find({ 'customer.userId': req.mobileCustomer.id }).sort({ createdAt: -1 }).limit(100).toArray();
      return res.json({ success: true, orders });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not load your orders.' }); }
  });

  app.get('/api/mobile/orders/:orderId', requireMobileSession, async (req, res) => {
    try {
      const order = await getDb().collection('orders').findOne({ id: req.params.orderId, 'customer.userId': req.mobileCustomer.id });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      return res.json({ success: true, order });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not load order details.' }); }
  });

  app.get('/api/mobile/orders/:orderId/invoice', requireMobileSession, async (req, res) => {
    try {
      const order = await getDb().collection('orders').findOne({ id: req.params.orderId, 'customer.userId': req.mobileCustomer.id });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      return res.json({ success: true, invoice: { restaurant: "MJ's Corner", orderId: order.id, createdAt: order.createdAt || order.timestamp, customer: order.customer, items: order.items || [], subtotal: order.subtotal, deliveryFee: order.deliveryFee || 0, coupon: order.coupon || null, total: order.total, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, status: order.status } });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not load invoice.' }); }
  });

  app.post('/api/mobile/orders/:orderId/cancel', requireMobileSession, async (req, res) => {
    try {
    const db = getDb();
    const order = await db.collection('orders').findOne({ id: req.params.orderId, 'customer.userId': req.mobileCustomer.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const createdAt = new Date(order.createdAt || order.timestamp).getTime();
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > 2 * 60_000 || order.status !== 'pending') return res.status(409).json({ success: false, message: 'This order is outside the cancellation window or has already entered preparation.' });
    const result = await db.collection('orders').updateOne({ _id: order._id, status: 'pending', createdAt: order.createdAt }, { $set: { status: 'cancelled', updatedAt: new Date(), cancelReason: String(req.body.reason || 'Customer requested cancellation').slice(0, 300) } });
    if (!result.modifiedCount) return res.status(409).json({ success: false, message: 'The order status changed. Refresh and try again.' });
    const message = order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid'
      ? 'Order cancelled. Contact the restaurant about the captured payment refund.'
      : 'Order cancelled.';
    return res.json({ success: true, message, orderId: order.id });
    } catch (error) { return res.status(500).json({ success: false, message: 'Could not cancel the order.' }); }
  });

  app.post('/api/mobile/orders/:orderId/review', requireMobileSession, async (req, res) => {
    try {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim().slice(0, 1000);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be from 1 to 5.' });
    const db = getDb();
    const order = await db.collection('orders').findOne({ id: req.params.orderId, 'customer.userId': req.mobileCustomer.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (String(order.status).toLowerCase() !== 'delivered') return res.status(409).json({ success: false, message: 'Only delivered orders can be reviewed.' });
    const update = await db.collection('orders').updateOne({ _id: order._id, reviewed: { $ne: true }, status: 'delivered' }, { $set: { reviewed: true, rating, reviewComment: comment, reviewedAt: new Date(), updatedAt: new Date() } });
    if (!update.modifiedCount) return res.status(409).json({ success: false, message: 'This order has already been reviewed or its status changed.' });
    const itemIds = [...new Set((order.items || []).map(item => Number(item.id)).filter(Number.isSafeInteger))];
    for (const itemId of itemIds) {
      await db.collection('menu').updateOne({ id: itemId }, [
        { $set: { ratingSum: { $add: [{ $ifNull: ['$ratingSum', 0] }, rating] }, ratingCount: { $add: [{ $ifNull: ['$ratingCount', 0] }, 1] } } },
        { $set: { averageRating: { $round: [{ $divide: ['$ratingSum', '$ratingCount'] }, 1] } } }
      ]);
    }
    return res.json({ success: true, orderId: order.id, rating, message: 'Review submitted.' });
    } catch (error) { console.error('[Mobile review] failed:', error.message); return res.status(500).json({ success: false, message: 'Could not save the review.' }); }
  });
};
