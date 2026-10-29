/* ============================================
   MJ's Corner — Authentication & User State
   Mobile OTP + Phone.Email + MongoDB Roles
   ============================================ */

var MJAuth = (function () {
  'use strict';

  const STORAGE_KEY_USER = 'mj_currentUser';
  const STORAGE_KEY_USERS = 'mj_registeredUsers';

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER);
      if (!data) return null;
      const user = JSON.parse(data);
      return user;
    } catch (e) {
      return null;
    }
  }

  function isAdmin(user = getCurrentUser()) {
    if (!user) return false;
    return user.role === 'admin' || (user.email && user.email.toLowerCase() === 'admin@mjscorner.com');
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    window.dispatchEvent(new Event('mj_auth_changed'));
  }

  // Refresh user role & data from MongoDB Atlas in background
  async function refreshCurrentUserRoleFromDb() {
    const cur = getCurrentUser();
    if (!cur || (!cur.phone && !cur.email && !cur.id)) return cur;

    try {
      const identifier = cur.phone || cur.email || cur.id;
      const res = await fetch(`/api/auth/user/${encodeURIComponent(identifier)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const updated = {
            ...cur,
            role: data.user.role || cur.role,
            name: data.user.name || cur.name,
            phone: data.user.phone || cur.phone || '',
            email: data.user.email || cur.email || '',
            addresses: data.user.addresses || cur.addresses || []
          };
          setCurrentUser(updated);
          return updated;
        }
      }
    } catch (e) {
      console.warn('Could not refresh user from DB:', e);
    }
    return cur;
  }

  // Login via Phone.Email (user_json_url received from Phone.Email callback)
  async function loginWithPhoneEmail({ name, user_json_url, phone }) {
    try {
      const res = await fetch('/api/auth/verify-phone-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, user_json_url, phone })
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'Phone.Email verification failed' };
      }

      setCurrentUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server communication error: ' + err.message };
    }
  }

  function logout() {
    setCurrentUser(null);
  }

  // ========== ADDRESS MANAGEMENT (PER USER ACCOUNT) ==========
  function getUserAddresses(userId) {
    const cur = getCurrentUser();
    if (cur && (cur.id === userId || !userId) && Array.isArray(cur.addresses)) {
      return cur.addresses;
    }
    return [];
  }

  async function syncUserToDb(user) {
    if (!user || (!user.phone && !user.email && !user.id)) return;
    try {
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone || '',
          email: user.email || '',
          userId: user.id || '',
          addresses: user.addresses,
          name: user.name
        })
      });
    } catch (e) {
      console.warn('Sync to MongoDB failed:', e);
    }
  }

  function addUserAddress(userId, { title, fullAddress, isDefault }) {
    const cur = getCurrentUser();
    if (!cur) return null;

    if (!Array.isArray(cur.addresses)) {
      cur.addresses = [];
    }

    if (isDefault) {
      cur.addresses.forEach(a => a.isDefault = false);
    }

    const newAddr = {
      id: 'addr_' + Date.now(),
      title: title || 'Home',
      fullAddress: fullAddress.trim(),
      isDefault: isDefault || cur.addresses.length === 0
    };

    cur.addresses.push(newAddr);
    setCurrentUser(cur);
    syncUserToDb(cur);

    return newAddr;
  }

  function deleteUserAddress(userId, addressId) {
    const cur = getCurrentUser();
    if (!cur || !Array.isArray(cur.addresses)) return;

    cur.addresses = cur.addresses.filter(a => a.id !== addressId);
    if (cur.addresses.length > 0 && !cur.addresses.some(a => a.isDefault)) {
      cur.addresses[0].isDefault = true;
    }
    setCurrentUser(cur);
    syncUserToDb(cur);
  }

  function updateUserProfile(userId, { name, phone, email }) {
    const cur = getCurrentUser();
    if (!cur) return false;

    if (name) cur.name = name.trim();
    if (phone !== undefined) cur.phone = phone.trim();
    if (email !== undefined) cur.email = email.trim().toLowerCase();
    setCurrentUser(cur);
    syncUserToDb(cur);
    return true;
  }

  return {
    getCurrentUser,
    setCurrentUser,
    isAdmin,
    loginWithPhoneEmail,
    refreshCurrentUserRoleFromDb,
    logout,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress,
    updateUserProfile
  };
})();

window.MJAuth = MJAuth;
