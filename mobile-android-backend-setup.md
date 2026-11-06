# MJ's Corner mobile API add-on

This module adds authenticated customer routes under `/api/mobile/*` to the existing Express server. It uses the existing MongoDB database, `users`, `menu`, `promotions`, `settings`, `orders`, and `counters` collections. It does not replace, rename, or wrap website endpoints. The local main clone has been updated: the module is in `mobile-auth-addon.js` and `server.js` passes two existing helpers into its mount call. No website page or existing route was changed.

## Mount the module

If applying these changes to another backend checkout, copy `mobile-auth-addon.js` beside `server.js`. After the `findOrCreateUser` helper and before existing API route declarations, use this mount call:

```js
const mountMobileApi = require('./mobile-auth-addon');
mountMobileApi(app, { getDb, findOrCreateUser, getNextOrderId, getRazorpayInstance });
```

The existing server already has JSON request parsing before its route declarations. No extra database, collection migration, or npm package is required; the backend already uses MongoDB and Razorpay. The module creates TTL/indexes on its own supporting collections when the first request arrives.

## Render environment

The app already reads public `PHONE_EMAIL_CLIENT_ID` from `/api/config`. You said the Phone.Email API key is in Render; the backend reads it from the exact secret variable name `PHONE_EMAIL_API_KEY`. Do not put it in the Android project, Git, a public config response, or chat. Razorpay checkout uses the existing `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` server variables. Never copy those secrets to Android.

## Routes added

| Method and path | Purpose |
|---|---|
| `POST /api/mobile/auth/phone-email` | Verifies Phone.Email HS256 JWT and finds/creates the MongoDB customer through the existing helper; returns an opaque session. |
| `GET /api/mobile/me`, `PATCH /api/mobile/me` | Read/update the signed-in customer's name and email. Phone is provider-verified and not client-editable. |
| `POST /api/mobile/me/addresses`, `PUT/DELETE /api/mobile/me/addresses/:addressId` | Customer-owned embedded address create, edit, delete. |
| `GET/PUT /api/mobile/cart` | Read/reprice and synchronize cart data on the customer's existing user document. |
| `POST /api/mobile/checkout/quote` | Validates live availability, sizes/add-ons, saved delivery address/table, store status and coupon; returns a 10-minute server quote. |
| `POST /api/mobile/checkout/payment-order` | Creates a Razorpay order only from a server-stored quote and returns the public key ID. |
| `POST /api/mobile/checkout/verify-payment` | Validates the signature and fetches order/payment from Razorpay; finalizes one matching quote into the shared `orders` collection. |
| `POST /api/mobile/checkout/orders` | Creates takeaway/dine-in cash-on-counter or fully-discounted orders from a server quote. Delivery requires Razorpay online payment. |
| `GET /api/mobile/orders`, `GET /api/mobile/orders/:orderId` | Read only the authenticated customer's orders. |
| `POST /api/mobile/orders/:orderId/cancel` | Cancels the customer's own pending order within the website's existing two-minute window. |
| `POST /api/mobile/orders/:orderId/review` | Accepts one 1–5 star review only for that customer's delivered order; updates existing menu rating aggregates. |
| `GET /api/mobile/orders/:orderId/invoice` | Returns customer-scoped invoice data for the app to display. |
| `POST /api/mobile/logout` | Revokes the session. |

Sessions store only a SHA-256 token hash in `mobile_sessions`; app tokens expire after 30 days and are encrypted locally by Android Keystore. Checkout quotes and their status are stored in `mobile_checkout_quotes`; a unique quote reference on mobile orders supports safe replay of successful payment callbacks. Cart/order totals are rebuilt from MongoDB menu and promotion records; client-provided amounts are ignored.

## Deploy safely

1. Review the local clone diff. It should contain only the mobile API implementation and the helper arguments on its existing mobile mount call.
2. Deploy the backend code to a Render preview/staging service first, using Razorpay test credentials if available. Adding the environment variable by itself does not install or deploy the new routes.
3. Test Phone.Email login, address CRUD, cart sync, coupon quote, payment signature verification, cash-on-counter order, order list, cancellation, review, and invoice. Confirm new orders appear in the existing admin dashboard.
4. After staging checks pass, deploy the same backend update to production. This restarts the service but leaves existing web routes and pages unchanged.

The included offline smoke test can be run from the project root with `node --test backend-integration/mobile-auth-addon.test.js`. It uses synthetic JWTs, a mock Mongo store, and a mock Razorpay client; it does not contact Render, Atlas, Phone.Email, or Razorpay.

## Scope and assumptions

- Coupon behavior follows existing `promotions` fields and the website's order/category/item/combo rules. The repository has no coupon usage limits/redemption schema, so this module does not invent one.
- Delivery is limited to the user's saved addresses; the profile endpoints add a new address before checkout.
- COD is not supported in the Android app or mobile API. Delivery uses Razorpay online payment; cash on counter is limited to takeaway/dine-in.
- Invoices are returned as structured data for the Android app to display. The current backend has no PDF invoice generator.
- Checkout pricing matches the current website logic: selected menu offer/base price plus configured sizes/add-ons, delivery fee for delivery, then coupon discount. The existing browser does not include packaging/GST in its displayed total, so the mobile quote does not add those charges unexpectedly.
- TTL cleanup is asynchronous as provided by MongoDB. The application also checks expiry on every session/quote request.
- Phone.Email JWTs must include numeric `exp` and use `HS256`; this is checked server-side against the merchant API key.
- The local source is prepared. Adding the Render variable alone does not deploy these routes; Render must receive a backend code deployment containing the updated add-on and mount call.
