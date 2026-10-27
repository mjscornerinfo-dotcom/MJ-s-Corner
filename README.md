# 🔥 MJ's Corner — Food Ordering & Restaurant Management Platform

A modern, responsive food ordering web application with a customer storefront and an administrative portal, featuring dual themes (Signature Red & White and Sleek Dark Mode).

## 🚀 Features

### 🍽️ Customer Portal (`index.html`)
- **Direct Menu Browsing**: Instant access to categorized items (Burgers, Pizza, Pasta, Sides, Salads, Drinks, Desserts).
- **Dynamic Pricing & Discounts**: Real-time display of original MRP, discounted prices, and badge tags (Bestseller, Spicy, Chef's Pick).
- **Cart & Quick Checkout**:
  - Interactive cart drawer and floating checkout bar.
  - Multi-order types: Dine-In, Express Counter Pickup, and Doorstep Delivery.
  - Account-based address book (saved addresses per account).
  - Promo code / coupon system with real-time discounts.
- **Account & Profile Management**:
  - Personal profile details.
  - Saved delivery addresses management.
  - Past order history with live status tracking.

### 👑 Admin Dashboard (`admin.html`)
- **Live Overview**: Key metrics including total orders, revenue, pending orders, and active menu items.
- **Order Management**: Real-time order pipeline with status updates (`pending`, `confirmed`, `ready`, `completed`, `cancelled`).
- **Menu & Pricing Editor**:
  - Add new items with local device photo uploads.
  - Edit offer discounts, MRP, category, badges, and toggle item availability.
- **Promotions Management**:
  - Create and configure promotional coupon codes (percentage or flat discount).
  - Toggle marketing popups on or off.

### 🔐 Authentication System (`login.html`)
- Unified customer and admin authentication.
- Seamless role-based redirection and session persistence.
- One-click demo customer & admin logins for rapid testing.

---

## 🛠️ Technology Stack
- **HTML5 & Vanilla CSS3**: Custom design system with CSS variables, smooth transitions, and responsive flex/grid layouts.
- **Vanilla JavaScript (ES6+)**: Modular application logic with shared state synchronization (`data.js` & `auth.js`) via `localStorage`.

---

## 💻 Local Setup & Development

To run locally using any static web server:

```bash
# Using npx serve
npx --yes serve -l 3000 .

# Using Python HTTP server
python -m http.server 3000
```

Open `http://localhost:3000/login.html` in your browser.
