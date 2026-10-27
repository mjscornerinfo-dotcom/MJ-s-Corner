/* ============================================
   MJ's Corner — Authentication & User State
   ============================================ */

var MJAuth = (function () {
  'use strict';

  const STORAGE_KEY_USER = 'mj_currentUser';
  const STORAGE_KEY_USERS = 'mj_registeredUsers';

  // Default demo accounts with distinct saved addresses
  const DEFAULT_USERS = [
    {
      id: 'usr_demo_1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '+91 98765 43210',
      password: 'password123',
      role: 'customer',
      addresses: [
        {
          id: 'addr_alex_1',
          title: 'Home',
          fullAddress: 'Apartment 4B, Hill View Residency, Park Avenue',
          isDefault: true
        },
        {
          id: 'addr_alex_2',
          title: 'Office',
          fullAddress: 'Tech Hub Tower B, 6th Floor, Silicon Valley Road',
          isDefault: false
        }
      ]
    },
    {
      id: 'usr_demo_2',
      name: 'Sarah Parker',
      email: 'sarah@example.com',
      phone: '+91 91234 56789',
      password: 'password123',
      role: 'customer',
      addresses: [
        {
          id: 'addr_sarah_1',
          title: 'Penthouse',
          fullAddress: '12 Emerald Heights, Lakeview Boulevard',
          isDefault: true
        }
      ]
    },
    {
      id: 'adm_demo_1',
      name: 'Restaurant Admin',
      email: 'admin@mjscorner.com',
      phone: '+91 99999 88888',
      password: 'admin123',
      role: 'admin',
      addresses: []
    }
  ];

  function initUsers() {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    } catch (e) {
      users = [];
    }

    if (!Array.isArray(users) || users.length === 0) {
      users = [...DEFAULT_USERS];
    } else {
      // Ensure admin exists
      const hasAdmin = users.some(u => u.role === 'admin' || (u.email && u.email.toLowerCase() === 'admin@mjscorner.com'));
      if (!hasAdmin) {
        users.push({
          id: 'adm_demo_1',
          name: 'Restaurant Admin',
          email: 'admin@mjscorner.com',
          phone: '+91 99999 88888',
          password: 'admin123',
          role: 'admin',
          addresses: []
        });
      }
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  function getUsers() {
    initUsers();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS));
      return Array.isArray(data) && data.length > 0 ? data : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER);
      if (!data) return null;
      const sessionUser = JSON.parse(data);
      if (sessionUser.email && sessionUser.email.toLowerCase() === 'admin@mjscorner.com') {
        sessionUser.role = 'admin';
      }
      const users = getUsers();
      const fresh = users.find(u => u.id === sessionUser.id || (u.email && sessionUser.email && u.email.toLowerCase() === sessionUser.email.toLowerCase()));
      if (fresh) {
        return {
          id: fresh.id,
          name: fresh.name,
          email: fresh.email,
          phone: fresh.phone || '',
          role: fresh.role || sessionUser.role,
          addresses: fresh.addresses || []
        };
      }
      return sessionUser;
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
      if (user.email && user.email.toLowerCase() === 'admin@mjscorner.com') {
        user.role = 'admin';
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    window.dispatchEvent(new Event('mj_auth_changed'));
  }

  function login(email, password, expectedRole = null) {
    initUsers();
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (expectedRole && user.role !== expectedRole) {
      return { 
        success: false, 
        message: expectedRole === 'admin' 
          ? 'Access denied. This account does not have admin privileges.' 
          : 'Please log in via the customer portal.' 
      };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      addresses: user.addresses || []
    };

    setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  }

  function register(data) {
    initUsers();
    const users = getUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const initialAddresses = [];
    if (data.address && data.address.trim()) {
      initialAddresses.push({
        id: 'addr_' + Date.now(),
        title: 'Home',
        fullAddress: data.address.trim(),
        isDefault: true
      });
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone ? data.phone.trim() : '',
      addresses: initialAddresses,
      password: data.password,
      role: 'customer'
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      addresses: newUser.addresses
    };

    setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  }

  function logout() {
    setCurrentUser(null);
  }

  function demoLoginCustomer() {
    const demo = getUsers().find(u => u.email === 'alex@example.com') || DEFAULT_USERS[0];
    const sessionUser = {
      id: demo.id,
      name: demo.name,
      email: demo.email,
      phone: demo.phone,
      role: demo.role,
      addresses: demo.addresses || []
    };
    setCurrentUser(sessionUser);
    return sessionUser;
  }

  function demoLoginAdmin() {
    initUsers();
    const admin = getUsers().find(u => u.role === 'admin' || (u.email && u.email.toLowerCase() === 'admin@mjscorner.com')) || {
      id: 'adm_demo_1',
      name: 'Restaurant Admin',
      email: 'admin@mjscorner.com',
      phone: '+91 99999 88888',
      role: 'admin',
      addresses: []
    };
    const sessionUser = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone || '',
      role: 'admin',
      addresses: []
    };
    setCurrentUser(sessionUser);
    return sessionUser;
  }

  // ========== ADDRESS MANAGEMENT (PER USER ACCOUNT) ==========
  function getUserAddresses(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    return user && Array.isArray(user.addresses) ? user.addresses : [];
  }

  function addUserAddress(userId, { title, fullAddress, isDefault }) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    const newAddr = {
      id: 'addr_' + Date.now(),
      title: title || 'Home',
      fullAddress: fullAddress.trim(),
      isDefault: isDefault || user.addresses.length === 0
    };

    user.addresses.push(newAddr);
    saveUsers(users);

    // Refresh current user session
    const cur = getCurrentUser();
    if (cur && cur.id === userId) {
      cur.addresses = user.addresses;
      setCurrentUser(cur);
    }

    return newAddr;
  }

  function deleteUserAddress(userId, addressId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || !Array.isArray(user.addresses)) return;

    user.addresses = user.addresses.filter(a => a.id !== addressId);
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    saveUsers(users);

    const cur = getCurrentUser();
    if (cur && cur.id === userId) {
      cur.addresses = user.addresses;
      setCurrentUser(cur);
    }
  }

  function updateUserProfile(userId, { name, phone }) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    saveUsers(users);

    const cur = getCurrentUser();
    if (cur && cur.id === userId) {
      cur.name = user.name;
      cur.phone = user.phone;
      setCurrentUser(cur);
    }
    return true;
  }

  initUsers();

  return {
    getCurrentUser,
    setCurrentUser,
    isAdmin,
    login,
    register,
    logout,
    demoLoginCustomer,
    demoLoginAdmin,
    getUsers,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress,
    updateUserProfile
  };
})();

window.MJAuth = MJAuth;
