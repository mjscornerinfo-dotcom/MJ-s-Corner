'use strict';

/**
 * Additive Phone.Email -> MongoDB customer session routes for the existing Express app.
 * Mount with: mountMobileAuth(app, { getDb, findOrCreateUser }).
 * This module does not alter or wrap any existing website route.
 */
module.exports = function mountMobileAuth(app, { getDb, findOrCreateUser }) {
  const crypto = require('crypto');
  const windows = new Map();
  let indexesReady;
  const SESSION_DAYS = 30;

  function hitLimit(key) {
    const now = Date.now();
    const window = windows.get(key);
    if (!window || now - window.start >= 60_000) {
      windows.set(key, { start: now, count: 1 });
      return false;
    }
    window.count += 1;
    return window.count > 8;
  }

  function verifyPhoneEmailJwt(token) {
    const secret = process.env.PHONE_EMAIL_API_KEY;
    if (!secret) throw new Error('Phone.Email server API key is not configured.');
    if (typeof token !== 'string' || token.length < 32 || token.length > 8192) {
      throw new Error('Phone.Email verification token is invalid.');
    }
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Phone.Email verification token is invalid.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (header.alg !== 'HS256') throw new Error('Phone.Email token algorithm is not allowed.');
    const expected = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
    const actual = Buffer.from(parts[2], 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      throw new Error('Phone.Email signature verification failed.');
    }
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.exp !== 'number' || claims.exp <= now) throw new Error('Phone.Email token has expired.');
    if (typeof claims.iat === 'number' && claims.iat > now + 60) throw new Error('Phone.Email token is not yet valid.');
    if (!claims.country_code || !claims.phone_no) throw new Error('Phone.Email token has no verified phone number.');
    return claims;
  }

  async function ensureIndexes(db) {
    if (!indexesReady) {
      indexesReady = Promise.all([
        db.collection('mobile_sessions').createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection('mobile_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection('mobile_sessions').createIndex({ userId: 1 })
      ]);
    }
    return indexesReady;
  }

  function safeUser(user) {
    return {
      id: user.id || String(user._id),
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'customer',
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
      console.error('[Mobile auth] session lookup failed:', error.message);
      res.status(500).json({ success: false, message: 'Could not validate customer session.' });
    }
  }

  app.post('/api/mobile/auth/phone-email', async (req, res) => {
    const rateKey = req.ip || req.socket.remoteAddress || 'unknown';
    if (hitLimit(rateKey)) return res.status(429).json({ success: false, message: 'Too many sign-in attempts. Please wait a minute.' });
    try {
      const claims = verifyPhoneEmailJwt(req.body && req.body.ph_email_jwt);
      const countryCode = String(claims.country_code).trim();
      const digits = String(claims.phone_no).replace(/\D/g, '');
      if (!digits || digits.length < 7 || digits.length > 15) {
        return res.status(400).json({ success: false, message: 'Phone.Email returned an invalid phone number.' });
      }
      const phone = `${countryCode.startsWith('+') ? countryCode : `+${countryCode.replace(/\D/g, '')}`} ${digits}`;
      const user = await findOrCreateUser({ phone, countryCode: countryCode.startsWith('+') ? countryCode : `+${countryCode.replace(/\D/g, '')}` });
      const db = getDb();
      await ensureIndexes(db);
      const sessionToken = crypto.randomBytes(32).toString('base64url');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
      await db.collection('mobile_sessions').insertOne({
        tokenHash: crypto.createHash('sha256').update(sessionToken).digest('hex'),
        userId: user.id,
        createdAt: now,
        expiresAt,
        source: 'phone.email'
      });
      return res.status(201).json({ success: true, sessionToken, expiresAt, user });
    } catch (error) {
      const message = error.message || 'Phone.Email sign-in failed.';
      const isConfig = message.includes('not configured');
      if (!isConfig) console.warn('[Mobile auth] sign-in rejected:', message);
      return res.status(isConfig ? 503 : 401).json({ success: false, message: isConfig ? 'Phone.Email server verification is not configured.' : message });
    }
  });

  app.get('/api/mobile/me', requireMobileSession, async (req, res) => {
    return res.json({ success: true, user: safeUser(req.mobileCustomer) });
  });

  app.post('/api/mobile/logout', requireMobileSession, async (req, res) => {
    try {
      const db = getDb();
      await db.collection('mobile_sessions').deleteOne({ _id: req.mobileSession._id });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Could not close customer session.' });
    }
  });
};
