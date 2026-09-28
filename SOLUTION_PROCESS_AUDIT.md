# FarmDirect AI — Complete Solution & System Process

**Audit scope:** source inspection of the current React frontend, Flask backend, SQLAlchemy models, SQL reference schema, deployment/configuration, seed data, and tests. This document reports what the code does, not what the product should do. A page or endpoint existing is not treated as proof that the end-to-end workflow is production-ready. No application code, database, API, UI, CSS, authentication, or route was changed for this audit.

**Evidence key:** source references are workspace-relative links. “Connected” means the frontend calls a backend route and that route performs the described database operation; it does not mean the external-world service (payment gateway, GPS, SMTP) is real. Backend tests exist, but this audit did not run them or perform authenticated production transactions. The frontend smoke checks previously performed in this workspace are limited to public routes and CSS; they do not verify every role workflow.

## 1. Project Overview

FarmDirect AI is a React single-page application with a Flask/SQLAlchemy JSON API. The intended marketplace connects independent farmers and buyers, with additional FPO, field-assistant, bulk-buyer, logistics-provider, and admin roles.

The current code implements user accounts, email verification, product listings, carts, order records, local development payment records, logistics assignments/status events, partner records, notifications, reviews, and heuristic summaries/forecasts. It is not yet a fully integrated real-world agricultural exchange: payments are simulated, route estimates are deterministic, tracking is status-event based rather than GPS-based, and some dashboard content is static/demo data.

The frontend entry is Create React App (`react-scripts`), despite README text describing Vite. Runtime services are under `frontend/src/services`; Flask blueprints are mounted under `/api` in `backend/app/__init__.py`.

## 2. Problem Being Solved

**Intended problem:** fragmented access to farmer supply, market discovery, large-buyer sourcing, order coordination, transport, and operational information.

**Current-code boundary:** the implementation offers shared account, catalogue, cart/order, and delivery records. It does not implement a verified settlement marketplace, a real map/GPS service, a complete procurement/allocation workflow, or all the governance implied by the role dashboards. The dashboards should therefore be presented as an operational prototype with working database-backed slices, not as proof that every business process is complete.

## 3. Proposed Solution

**Intended real-world solution:** farmers maintain individual accounts and product ownership; buyers discover current supply and place orders; FPOs coordinate multiple independent farmer supplies without taking ownership; facilitators assist farmers while preserving the farmer account; logistics partners execute and report delivery; verified payments and auditable settlement complete the trade.

**Current implementation:** individual user/product ownership is represented in the database. Consumer and bulk-buyer checkout share a single order/cart flow. The FPO membership and aggregation tables are separate records, not an allocation ledger. Facilitator-created farmers are separate farmer users, but have a generated `@farmdirect.local` email and random undisclosed password, so the code does not provide a practical handoff that lets the farmer log into the same account. Payment and route services are development placeholders.

## 4. Complete System Architecture

```text
Browser (React Router pages, role shells, local/session storage)
  -> fetch helpers in frontend/src/services/api.js
  -> REACT_APP_API_URL + /api path
  -> Flask blueprints in backend/app/routes
  -> jwt_required_roles for protected endpoints
  -> SQLAlchemy models / configured PostgreSQL database
  -> JSON response
  -> page updates local React state / localStorage

External SMTP: backend/app/services/mail.py via configured SMTP
Images: local backend instance/uploads, served by /uploads/<filename>
Payment gateway: absent; payment is a local development record
Maps/GPS: absent; route estimate is deterministic; tracking is event/status data
AI model: absent; summary/forecast calculations are SQL aggregates and formulas
```

The frontend uses `fetch` in [frontend/src/services/api.js](frontend/src/services/api.js); Axios and React Query are dependencies/providers but the inspected pages largely fetch in effects. `farmdirect_token` and `farmdirect_user` are stored in localStorage; email/reset flow values and intro completion use sessionStorage. API paths and the backend blueprint registrations are visible in [frontend/src/services/api.js](frontend/src/services/api.js) and [backend/app/__init__.py](backend/app/__init__.py).

## 5. User Roles

Runtime roles accepted at public registration are `consumer`, `farmer`, `fpo`, `field_assistant`, `bulk_buyer`, and `logistics_provider`. Admin is not offered by public registration; the seeded/demo data or privileged setup supplies it. A facilitator is represented technically as the `field_assistant` role, not a separate Sachivalayam/RBK account type.

A farmer's `users.id` is the farmer ID used by `products.farmer_id`, `fpo_memberships.farmer_id`, and `field_assignments.farmer_id`. The facilitator does not own assisted farmer products when using the dedicated field-assistant produce endpoint; it creates products with the selected farmer's ID.

## 6. Authentication Flow

**Registration:** `RegisterPage` submits name, email, optional phone, password, and role to `POST /api/auth/register`. The backend validates required name/email/password and allowed role, lowercases email, checks duplicate email, hashes the password with Werkzeug, creates an unverified user and a 6-digit email-verification token, then sends via SMTP. If SMTP raises, it deletes the token and user and returns 503. The route does not enforce a password minimum at registration. Phone uniqueness is not checked.

**OTP verification:** `POST /api/auth/verify-email` hashes the submitted code, checks the latest unused token and its 10-minute expiry, marks the user verified and token used. There is no attempt limit or rate limiter in the inspected code. Resend creates a new token and calls SMTP without catching mail exceptions; it does not invalidate previous unused codes or impose a resend cooldown.

**Login/protection:** `POST /api/auth/login` checks email/password and `is_verified`, then returns access and refresh JWTs. `ProtectedRoute` checks localStorage token and cached user role on the client; API authorization independently verifies JWT and current database user/role. The client route guard does not validate/refresh the token before rendering. Backend protected routes reject inactive accounts, but login itself does not check `is_active`. The frontend defines a refresh helper, but the audit found no caller/automatic refresh flow.

**Forgot password:** user submits email or phone to `/auth/forgot-password`. Backend looks up either, creates a 6-digit SHA-256-hashed token expiring in 10 minutes, but always emails `user.email`. Unknown identifiers return a generic success; known identifiers whose SMTP fails return a distinct 503, which leaks account existence. Verification checks the code; reset requires at least 8 characters and marks token used. There is no reset attempt limit/rate limit. Password change checks current password and an 8-character minimum. Existing JWTs are not revoked after password change/reset.

Evidence: [frontend/src/pages/auth/RegisterPage.jsx](frontend/src/pages/auth/RegisterPage.jsx), [frontend/src/pages/auth/VerifyEmailPage.jsx](frontend/src/pages/auth/VerifyEmailPage.jsx), [frontend/src/pages/auth/ForgotPasswordPage.jsx](frontend/src/pages/auth/ForgotPasswordPage.jsx), [frontend/src/components/common/ProtectedRoute.jsx](frontend/src/components/common/ProtectedRoute.jsx), [frontend/src/services/api.js](frontend/src/services/api.js), [backend/app/routes/auth.py](backend/app/routes/auth.py), [backend/app/services/mail.py](backend/app/services/mail.py), [backend/app/utils/auth.py](backend/app/utils/auth.py).

## 7. Farmer Flow

Evidence: [frontend/src/pages/farmer/FarmerProductsPage.jsx](frontend/src/pages/farmer/FarmerProductsPage.jsx), [frontend/src/pages/farmer/FarmerOrdersPage.jsx](frontend/src/pages/farmer/FarmerOrdersPage.jsx), [frontend/src/pages/farmer/FarmerEarningsPage.jsx](frontend/src/pages/farmer/FarmerEarningsPage.jsx), [frontend/src/pages/farmer/FarmerInsightsPage.jsx](frontend/src/pages/farmer/FarmerInsightsPage.jsx), [backend/app/routes/products.py](backend/app/routes/products.py), [backend/app/routes/orders.py](backend/app/routes/orders.py), [backend/app/routes/payments.py](backend/app/routes/payments.py), [backend/app/routes/ai.py](backend/app/routes/ai.py), [backend/app/models/product.py](backend/app/models/product.py).

### Account and profile

A farmer may use public registration and email verification, then log in to the individual farmer account. The DB primary key `users.id` serves as farmer ID; no separate human-readable farmer ID field exists. Profile updates use `PATCH /api/auth/me`: full name, phone, email, general profile fields, and farmer `farm_profile`. Address/village/mandal/district/state/language/bank details are stored in JSON `profile_data`; farm name/type/location/size/description/soil/irrigation/method/expected harvest/crops are stored in JSON `farm_profile`. There is no dedicated bank-settlement/payment account flow. Email changes are allowed without re-verification. `User.to_dict()` returns profile data including `bank_details` to any endpoint returning that user object.

### Product listing and inventory

Farmer uses `/farmer/products` or `/farmer/add-product` (`FarmerProductsPage`). It loads `GET /api/products/mine`, sends product fields to `POST /api/products/`, and edits with `PATCH /api/products/<id>`. Server verifies name, positive quantity, nonnegative price, and location; creates `Product` with `farmer_id=user.id`. Stored product fields include name, category, crop, description, quantity, unit, price, quality, location, image URL, and active flag. The code does not define a dedicated availability/harvest-date column; field-assistant listing puts harvest date/shelf life into description text, while the ordinary farmer endpoint accepts only model fields and ignores unknown fields.

Image upload is a separate multipart `POST /api/products/<id>/image`. It checks an extension (`jpg`, `jpeg`, `png`, `webp`), saves to local `instance/uploads`, stores `/uploads/<uuid>.<ext>` in `image_url`, and serves it from Flask. It does not validate file contents/size. Render configuration does not define durable object storage or persistent upload volume.

`GET /products/` exposes active products to the marketplace and includes owner `farmer_id`, price, quantity, location, and image path. It does not join/return the farmer's name or FPO identity. It uses database `ILIKE` search on name/crop/location. Farmer can edit/deactivate; delete removes unreferenced products, but deactivates products referenced by order items. Cart references are not handled before delete and can result in a database foreign-key failure.

Farmer overview calculates active listings, available stock, reserved stock, sold stock, and catalogue value. “Reserved” is the sum of cart items, not reserved inventory: carts do not reserve stock. “Sold” sums all order lines, regardless of order payment/cancellation state. At checkout, product quantity is decremented immediately when an order is created, before payment. A canceled order does not restore stock.

### Orders, payments, and earnings

`GET /api/orders/` filters farmer orders through their products. Farmer can move `PENDING` or `PAID` to `CONFIRMED` or `CANCELLED`, then `CONFIRMED` to `LOGISTICS_REQUESTED`; from that state the farmer/admin endpoint also permits `COMPLETED` directly. If multiple farmers' products occur in one order, a farmer/assistant cannot update it unless all lines belong to farmers they manage; otherwise API returns 409 for coordination.

The first order creation creates a farmer notification. Payment does not create a farmer payment notification or payout. `GET /api/payments/farmer/summary` derives revenue from order lines in selected paid-like statuses; pending amount sums each matching whole order total, which can overcount multi-farmer orders. There is no disbursement, settlement, payout schedule, or bank transfer. No refund exists. A dev payment can mark an order paid regardless of its prior status if no payment exists.

### Farmer AI and notifications

Farmer insights sum `OrderItem.quantity`; recommendation is a fixed rule based on product quantity or whether any order line exists. The queries do not exclude canceled/unpaid orders. Price/demand endpoints are aggregate formulas, not trained forecasting. Notifications are listed from the farmer's `notifications` rows and can be marked read. Current triggers include new order at checkout; delivery creates a notification for the consumer, not farmer. No implemented triggers found for payment, stock, AI alert, or farmer delivery status.

## 8. Facilitator/RBK Flow

Evidence: [frontend/src/pages/fieldAssistant/FieldAssistantPage.jsx](frontend/src/pages/fieldAssistant/FieldAssistantPage.jsx), [backend/app/routes/partners.py](backend/app/routes/partners.py), [backend/app/models/partners.py](backend/app/models/partners.py), [backend/app/models/user.py](backend/app/models/user.py).

The facilitator role is `field_assistant`, protected by role-specific API routes. Dashboard UI includes assigned farmers, assisted registration, produce, inventory, orders, sales, notifications, AI demand, profile, and settings. Some pages show fallback demo data when API responses are empty/fail, so populated cards do not always mean live records.

`POST /api/partners/field-assistant/register-farmer` creates a distinct `User` with role farmer and generated numeric DB ID, synthetic random `farmer.<random>@farmdirect.local` email, a random undisclosed password, `is_verified=True`, profile data and an `ACTIVE` `FieldAssignment` to the assistant. It sends no OTP or credentials to the farmer. This preserves database ownership but does **not** give the farmer a known login method for the same account. There is no farmer identity deduplication by phone in this route. The separate assign-existing-farmer endpoint accepts a real `farmer_id` and creates an assignment.

`POST /field-assistant/produce` validates active assignment and writes product `farmer_id=selected farmer.id`; this is the correct ownership direction. Assistant can update assigned farmer product quantity/price/quality/location/active flag, and upload image only if the farmer remains actively assigned. Assistant sales/orders queries are assignment-scoped. There is an inline assignment form in the frontend whose route branch is not reached by the current render flow (per frontend audit); rely on the dedicated page/API form, not that inline block.

Assistant sees assignments, not all farmers. Current `assigned_farmers` response serializes the full `User.to_dict()`, which includes profile JSON and bank details, so returned personal data exceeds the minimum necessary. Sales fallback values/notifications/charts are partially static. Audit logging does not record assisted registration/listing actions.

## 9. FPO Flow

Evidence: [frontend/src/pages/partners/PartnerDashboardPage.jsx](frontend/src/pages/partners/PartnerDashboardPage.jsx), [frontend/src/pages/partners/FpoSettingsPage.jsx](frontend/src/pages/partners/FpoSettingsPage.jsx), [backend/app/routes/partners.py](backend/app/routes/partners.py), [backend/app/models/partners.py](backend/app/models/partners.py).

FPO accounts are `users` rows with role `fpo`. `FPOMembership` associates one FPO user to one farmer user. Unique constraint is `(fpo_id, farmer_id)`, so one farmer can be associated with multiple FPOs; no one-FPO-per-village rule exists. An FPO user can create memberships by farmer ID; only users with role farmer are accepted. There is no member deactivation/removal route in inspected partners API.

FPO overview filters active member farmers' active products and sums their current product quantities per farmer; this preserves product-level farmer ownership. It can show a live aggregate supply total while retaining per-farmer supply records. However, `FPOAggregation` is a separate manually created row containing only `fpo_id`, crop, quantity, status. It is not calculated from member product inventory and is not linked to products/farmers/collection events. Example Ramesh 500 + Suresh 300 + Mahesh 700 = 1,500 kg is only valid as a computed member-product sum if those exact active listings exist; manually entering one 1,500 kg aggregation does not preserve per-farmer quantities and can double-count the same stock.

FPO can adjust quantity for products belonging to active members; this changes the farmer-owned `Product.quantity`. FPO analytics and overview derive order quantities/revenue from member products; pending and canceled are excluded from sales in those specific calculations, but there is no guarantee payment was actually collected. FPO bulk buyer requests are global in the route, not scoped to an FPO's relationships; any FPO can update any requirement status by ID. No FPO-to-order allocation, collection center, lot/harvest intake, quantity reservation, per-farmer allocation, settlement, or dedicated FPO checkout is implemented. FPO settings update generic profile fields.

## 10. Consumer Flow

Evidence: [frontend/src/pages/consumer/MarketplacePage.jsx](frontend/src/pages/consumer/MarketplacePage.jsx), [frontend/src/pages/consumer/ProductDetailsPage.jsx](frontend/src/pages/consumer/ProductDetailsPage.jsx), [frontend/src/pages/consumer/CartPage.jsx](frontend/src/pages/consumer/CartPage.jsx), [backend/app/routes/products.py](backend/app/routes/products.py), [backend/app/routes/orders.py](backend/app/routes/orders.py), [backend/app/routes/payments.py](backend/app/routes/payments.py).

Consumer registration/login use the common email OTP flow. Marketplace `GET /api/products/` reads active DB products. Search can use API query by product name/crop/location; categories, sorting, and many visible controls are client-side. Product details read the product catalogue. Product objects expose farmer ID, not farmer name/FPO profile; UI may show product location and image if available, but no seller identity lookup is inherent in this response. Product images are actual uploaded paths or existing seed/demo links, not guaranteed local images.

Add to Cart sends product ID/quantity; cart is one DB cart per user with unique `(cart_id, product_id)` items. Quantity is cumulative. Server checks current product quantity, but not active status, and cart is not a stock reservation. Stock is rechecked at checkout. Removing a cart item is DB-backed. Cart total is not persisted; backend computes order total as sum of quantity × stored unit price.

Checkout has no server-side delivery address, delivery fee, tax, or service-fee fields. Frontend displays calculated UI fees/totals, but `POST /orders/` sends no shipping/payment body and backend creates only merchandise subtotal. It decrements inventory, creates order/order items, deletes cart items, and creates buyer and farmer notifications in one DB commit. Then frontend calls `/payments/orders/<id>/pay`, which creates a `development` payment and sets order `PAID` immediately. There is no external gateway, payment method, server-side provider verification, webhook, refund, or failure/pending flow.

## 11. Bulk Buyer Flow

Evidence: [frontend/src/pages/partners/BulkBuyerRequirementsPage.jsx](frontend/src/pages/partners/BulkBuyerRequirementsPage.jsx), [frontend/src/pages/partners/BulkBuyerMatchingPage.jsx](frontend/src/pages/partners/BulkBuyerMatchingPage.jsx), [frontend/src/pages/partners/BulkBuyerDashboardPage.jsx](frontend/src/pages/partners/BulkBuyerDashboardPage.jsx), [backend/app/routes/partners.py](backend/app/routes/partners.py).

Bulk buyers use the same cart, checkout, order, payment, marketplace, tracking and generic profile structures as consumers. Their bulk requirements are separate records (`buyer_id`, crop, quantity, location, status). The UI displays grade, range, and notes, but create endpoint accepts only crop, quantity, location. Buyer can delete own requirement and retrieve its product matches; matches are individual products with quantity at least the requested quantity, not aggregated farmer/FPO supply. No minimum order quantities, tiered bulk pricing, recurring purchase, supplier selection-to-order conversion, allocation, quote acceptance, invoice, or settlement flow is implemented. FPO can see global requirements and set statuses, but that status change is not connected to creating or fulfilling an order.

## 12. Logistics Flow

Evidence: [frontend/src/pages/logistics/LogisticsDashboardPage.jsx](frontend/src/pages/logistics/LogisticsDashboardPage.jsx), [frontend/src/pages/logistics/LogisticsFeaturePage.jsx](frontend/src/pages/logistics/LogisticsFeaturePage.jsx), [frontend/src/pages/logistics/RouteEstimatePage.jsx](frontend/src/pages/logistics/RouteEstimatePage.jsx), [backend/app/routes/logistics.py](backend/app/routes/logistics.py), [backend/app/routes/routes.py](backend/app/routes/routes.py), [backend/app/models/logistics.py](backend/app/models/logistics.py).

A logistics provider logs in as `logistics_provider`, manages vehicles/drivers, sees available/unassigned and own deliveries, and can accept an available delivery. Order status `LOGISTICS_REQUESTED` creates one `Delivery` with pickup from the first order item's product location and literal destination `Customer delivery address`; there is no buyer address input. Provider transitions: `AVAILABLE` -> `ACCEPTED` -> `VEHICLE_ASSIGNED` -> `PICKED_UP` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED`. Vehicle/driver assignment checks availability and provider ownership, marks them unavailable, and delivery marks them available again. It does not check vehicle capacity against shipment quantity.

Each delivery status change creates a `TrackingEvent` with a status, optional note, timestamp. This is event-based status history, not coordinates or GPS. No GPS device, location stream, proof-of-delivery image/signature, stop model, multi-stop optimization, actual route engine, or accurate ETA is present. Route estimate endpoint hashes pickup/destination to deterministic distance, ETA and cost; it is explicitly a local estimate. On delivery, order status becomes `DELIVERED` and consumer gets a notification. Farmer's order endpoint has no transition from `DELIVERED` to `COMPLETED`, while review requires `COMPLETED`; only `LOGISTICS_REQUESTED -> COMPLETED` can be advanced directly by farmer/admin, even before delivery.

Authorization caveat: consumer tracking checks order ownership; farmer checks product ownership; provider checks assigned provider. Bulk buyer role is permitted in the tracking decorator but has no ownership check in the route. Logistics provider accepts any unassigned delivery ID; this can allow claiming one not returned in their list if guessed. Treat as authorization gaps.

## 13. Marketplace Flow

Evidence: [frontend/src/pages/consumer/MarketplacePage.jsx](frontend/src/pages/consumer/MarketplacePage.jsx), [frontend/src/services/api.js](frontend/src/services/api.js), [backend/app/routes/products.py](backend/app/routes/products.py), [backend/app/models/product.py](backend/app/models/product.py).

Trace: consumer/farmer opens catalogue -> React fetch `GET /api/products/` -> Flask filters active products, optionally name/crop/location `ILIKE` -> SQLAlchemy `Product` query -> JSON items/count -> React filters/sorts/searches display. Search and category filtering may be local depending on page control. Inventory and prices originate in product rows. Seller name/FPO is not returned by the product listing serializer. There is no product moderation approval workflow; active listings are immediately public.

## 14. Product & Inventory Flow

Farmer create/edit/deactivate operations are connected to Product rows. Image is a separate local upload. `quantity` is both total available listing stock and decremented at order placement; there are no distinct available/reserved/sold DB columns. Sold quantity is calculated by summing all order item records (including unpaid/cancelled). Reserved quantity is summed from carts, but is only an estimate and does not prevent another buyer from adding/checking out stock. Low-stock and out-of-stock labels are derived in UI; no automated threshold/low-stock notification route is evident.

## 15. Cart & Checkout Flow

```text
Buyer adds item -> POST /api/orders/cart/items
 -> carts + cart_items (one cart per buyer, unique product per cart)
 -> JSON cart
 -> UI refreshes cart
Buyer removes item -> DELETE /api/orders/cart/items/<item_id>
 -> ownership join to buyer cart -> delete row
Buyer checks out -> POST /api/orders/
 -> validate cart/current stock -> create PENDING Order + OrderItems
 -> decrement Product.quantity -> notify farmer and buyer -> clear CartItems -> commit
 -> JSON order
Frontend then calls development payment endpoint.
```

Potential oversell remains under concurrent checkouts: the code checks and mutates quantities without a reservation/locking scheme. Cancellation does not restore stock. If payment fails at a future gateway stage, current server has no compensating stock workflow.

## 16. Payment Flow

Evidence: [frontend/src/pages/consumer/CartPage.jsx](frontend/src/pages/consumer/CartPage.jsx), [frontend/src/services/api.js](frontend/src/services/api.js), [backend/app/routes/payments.py](backend/app/routes/payments.py), [backend/app/models/payment.py](backend/app/models/payment.py).

`POST /api/payments/orders/<id>/pay` checks buyer owns the order and that no Payment row exists, creates `Payment` with order total and `DEV-<random>` reference, default provider `development`, default status `SUCCEEDED`, sets order `PAID`, commits and returns both. It does not contact a provider or verify funds. There is no transaction initiation/redirect, provider callback/webhook, signature validation, failure state handler, refund record/route, settlement, or farmer payout. Payment list is buyer/admin; farmer summary derives amounts from order lines, not transfer records.

## 17. Order Lifecycle

Actual order status strings in route behavior: `PENDING`, `PAID`, `CONFIRMED`, `LOGISTICS_REQUESTED`, `CANCELLED`, `COMPLETED`, `DELIVERED`. The legal transitions in farmer/admin status API are: `PENDING|PAID -> CONFIRMED|CANCELLED`; `CONFIRMED -> LOGISTICS_REQUESTED|CANCELLED`; `LOGISTICS_REQUESTED -> COMPLETED`. Delivery route separately sets `DELIVERED`. There is no constrained enum or complete unified state machine. Payment may set a cancelled/advanced order to `PAID` if it has no payment. Delivery status and order status are separate fields with partial synchronization. Canceled orders retain decremented stock; no refund is triggered.

## 18. Order Tracking Flow

Creation of logistics request builds one Delivery row. Each provider transition creates an ordered TrackingEvent row with status, note, timestamp. `GET /api/logistics/tracking/<order_id>` returns delivery, assigned vehicle/driver serialization and events. UI shows status timeline and schematic route. No live GPS, lat/long, location ping, or carrier integration. Delivery addresses are placeholder strings until a real address source is implemented.

## 19. Notification Flow

Evidence: [frontend/src/pages/consumer/NotificationsPage.jsx](frontend/src/pages/consumer/NotificationsPage.jsx), [backend/app/routes/notifications.py](backend/app/routes/notifications.py), [backend/app/models/notification.py](backend/app/models/notification.py), [backend/app/routes/orders.py](backend/app/routes/orders.py), [backend/app/routes/logistics.py](backend/app/routes/logistics.py).

`Notification` rows contain user ID, title, message, read flag, timestamp. Authenticated `GET /api/notifications/` returns only current user's rows and unread count. `POST /<id>/read` is recipient-scoped and updates `is_read`.

Implemented triggers verified: at order creation, each product owner receives “New order received” and buyer gets “Order placed”; when delivery reaches `DELIVERED`, buyer gets “Order delivered”. Email OTP/reset messages are SMTP emails, not database notifications. No confirmed notification trigger for payment, farmer acceptance/cancellation, pickup/in-transit, FPO member/aggregation, bulk status, stock threshold, or AI demand. Some frontend notifications are demo fallback rows when data is empty/error.

## 20. AI Demand Forecasting Flow

Evidence: [frontend/src/pages/farmer/FarmerInsightsPage.jsx](frontend/src/pages/farmer/FarmerInsightsPage.jsx), [frontend/src/pages/fieldAssistant/FieldAssistantPage.jsx](frontend/src/pages/fieldAssistant/FieldAssistantPage.jsx), [backend/app/routes/ai.py](backend/app/routes/ai.py).

No model training, inference framework, scheduled pipeline, seasonality preprocessing, or saved forecast/recommendation table is present. Price prediction averages current product listing prices filtered by crop/location; confidence is a hand-written function of listing count and whether any order-line quantity exists. Sales quantity includes order lines without reliable paid/completed filtering. Demand forecast sums all matching order line quantity and count, then sets HIGH at >=100, MODERATE at >=25, else LOW; 7-day estimate = observed ×0.35 and 30-day = observed ×1.2. It has no date-window, seasonality, price, location, or trained model. If no order lines it returns “insufficient historical data.” Results are computed per request and not stored. Farmer insights are rules based on product quantity/order existence. Frontend charts can add synthesized/static data, especially field-assistant screen.

## 21. Logistics & Route Flow

Vehicles, drivers, deliveries, and tracking events are DB-backed. Route endpoint is a SHA-256-derived deterministic estimate rather than mapping API. Environment template has map key placeholder, but inspected runtime route code does not consume it. No actual GPS. Pickup is product location of first order line; destination is placeholder. Vehicle capacity is stored but not compared to order quantity. No proof of delivery or customer confirmation.

## 22. Database Data Flow

Evidence: [database/schema.sql](database/schema.sql), [backend/app/models](backend/app/models), [backend/app/__init__.py](backend/app/__init__.py), [backend/migrations/README.md](backend/migrations/README.md).

| Data path | Current tables / behavior |
|---|---|
| Account -> role/profile | `users` row; `role`, `is_verified`, `is_active`; `profile_data` and `farm_profile` JSON in ORM |
| Farmer -> catalogue | `products.farmer_id -> users.id`; image path stored in `products.image_url`; files on local disk |
| Buyer -> cart | `carts.customer_id -> users.id`; `cart_items` joins cart and product; not a reservation |
| Checkout -> order | `orders.customer_id`; `order_items` snapshot quantity/unit price; `products.quantity` decremented |
| Order -> payment | `payments.order_id`, customer, amount, provider/status/reference; development-only success |
| Order -> transport | one `deliveries.order_id`; provider/vehicle/driver IDs; status event history in `tracking_events` |
| Recipient -> notice | `notifications.user_id`, `is_read`, text and time |
| FPO -> member/supply | `fpo_memberships`; active member products remain owned by farmer; separate manual `fpo_aggregations` has no member/product links |
| Assistant -> farmer | `field_assignments`; assisted product still has farmer's `farmer_id` |
| Bulk buyer -> demand | `bulk_requirements.buyer_id`, crop, quantity, location, status; not an order |
| Reviews | `reviews` connects product, buyer, completed order; uniqueness per product/customer/order |
| Auth tokens | `email_verification_tokens`, `password_reset_tokens`; used timestamp and 10-minute expiry |
| Audit | `audit_logs`; currently narrow admin status changes only |
| Wishlist | ORM `wishlist_items`; absent from SQL reference schema |

ORM models define 21 tables; `database/schema.sql` declares 19 and does not match ORM metadata. Schema omissions include email-verification tokens, wishlist, and `users.profile_data`. SQL has additional CHECK constraints and nullability differences from ORM. Runtime Render command runs `db.create_all()` plus a small PostgreSQL compatibility DDL helper, not versioned migrations; migrations folder contains a README but no migration revisions. Treat ORM/runtime metadata as the application implementation, SQL file as an inconsistent reference, not a safely reconciled production migration.

## 23. Role-Based Access Control

Evidence: [frontend/src/App.jsx](frontend/src/App.jsx), [frontend/src/components/common/ProtectedRoute.jsx](frontend/src/components/common/ProtectedRoute.jsx), [frontend/src/components/layout/DashboardShell.jsx](frontend/src/components/layout/DashboardShell.jsx), [frontend/src/components/layout/BulkBuyerSidebar.jsx](frontend/src/components/layout/BulkBuyerSidebar.jsx), [backend/app/utils/auth.py](backend/app/utils/auth.py), [backend/app/routes](backend/app/routes).

Client visibility is from routes, `ProtectedRoute`, and role shells; API decorator checks are the effective server gate. Rows marked “partial” can render but the feature may be static or incomplete.

| Role | Dashboard/profile | Product/inventory | Orders/payments | Logistics/AI/other |
|---|---|---|---|---|
| Farmer | Protected dashboard/profile/farm/settings | Own CRUD/overview/image; assigned ownership enforced | Own product-related orders; payment summary derived | tracking; heuristic insights; notifications |
| FPO | Protected partner dashboard/profile/settings | Active-member products; quantity update; member association | analytics from member product order lines; no settlement flow | global bulk request view/status; manual aggregation; logistics/notifications |
| Consumer | Protected dashboard/profile | Public active catalogue; cart/wishlist | own orders, dev payments, review submission | tracking, notifications |
| Bulk buyer | Protected dedicated shell/profile | same public catalogue/cart | own orders, dev payments, requirements/matches | logistics view, notifications; tracking ownership gap in API |
| Field assistant | Protected dashboard/profile | assigned farmer produce create/update/upload | assigned farmer orders/sales summary | notifications, rule/aggregate demand; no audit of assisted actions |
| Logistics provider | Protected logistics shell/profile/settings | vehicle/driver CRUD | no payment/order checkout | accept/advance own deliveries, status tracking, deterministic route estimate |

Admin exists in protected routes/APIs, although not in the six primary marketplace roles; public registration rejects admin. Role state is cached client-side but API uses DB role. Audit logs have a page/endpoint with no admin sidebar link (frontend review).

## 24. Frontend → Backend → Database Traces

Evidence: [frontend/src/services/api.js](frontend/src/services/api.js), [backend/app/routes/auth.py](backend/app/routes/auth.py), [backend/app/routes/products.py](backend/app/routes/products.py), [backend/app/routes/orders.py](backend/app/routes/orders.py), [backend/app/routes/payments.py](backend/app/routes/payments.py), [backend/app/routes/partners.py](backend/app/routes/partners.py), [backend/app/routes/logistics.py](backend/app/routes/logistics.py), [backend/app/routes/notifications.py](backend/app/routes/notifications.py), [backend/app/routes/ai.py](backend/app/routes/ai.py).

1. **Registration:** register form -> `register()` -> `POST /auth/register` -> `auth.register` -> `users` insert + hashed password + verification token -> SMTP email -> JSON verification-required -> frontend stores email in sessionStorage and navigates to verify. SMTP failure deletes new rows.
2. **Login:** login form -> `login()` -> `POST /auth/login` -> lookup `users`, verify password/email flag -> create access/refresh JWT -> JSON -> frontend localStorage and role redirect.
3. **OTP:** verify form -> `verifyEmail()` -> `POST /auth/verify-email` -> hashed token lookup/expiry -> `users.is_verified=true`, token.used_at -> JSON -> frontend login. Resend route may throw if SMTP fails.
4. **Forgot password:** forgot page -> `requestPasswordReset()` -> `/auth/forgot-password` -> identifier lookup, reset token row and SMTP email -> generic success or SMTP 503 -> frontend stores identifier. Phone lookup still emails account email.
5. **Farmer adds product:** farmer form -> `createProduct()` -> `POST /products/` -> role decorator -> validate/name/qty/price/location -> `products` row with authenticated farmer ID -> product JSON -> page reloads own list. Image then goes separately to `/products/<id>/image` -> local file + DB image path.
6. **Farmer edits product:** edit form -> `updateProduct()` -> `PATCH /products/<id>` -> ownership/admin check -> accepted columns and numeric validation -> update `products` -> updated JSON -> frontend replaces/reloads row.
7. **Consumer searches:** marketplace input -> API helper `getProducts` (optional `?search=`) -> `GET /products/` -> active products + optional name/crop/location SQL search -> product JSON -> React displays/filter/sorts. Seller display name is not part of product serializer.
8. **Consumer adds cart:** add button -> `addToCart(id, qty)` -> `POST /orders/cart/items` -> validate positive qty/current stock -> create/find cart and upsert cumulative cart item -> commit -> cart JSON -> UI refresh. No stock hold.
9. **Consumer checkout:** checkout button -> `checkout()` -> `POST /orders/` -> check cart/current stock -> subtotal -> Order PENDING, OrderItems, decrement product quantity, notify farmer/buyer, clear cart, commit -> order JSON -> UI proceeds to pay. No address/fees submitted.
10. **Payment:** frontend `payForOrder(id)` -> `POST /payments/orders/<id>/pay` -> owner/no existing payment check -> create DEV reference Payment (default SUCCEEDED), order PAID -> commit -> JSON. No provider verification.
11. **Order creation:** same checkout request -> `orders` and `order_items` rows; notifications; cart emptied. Next buyer action is dev pay; farmer action is confirm/cancel.
12. **Farmer receives order:** checkout creates farmer notification row -> `GET /notifications/` and `GET /orders/` -> farmer sees notification/owned order -> status PATCH to CONFIRMED/LOGISTICS_REQUESTED -> delivery row created only at logistics request. No separate accept/reject decision model; CANCELLED transition exists.
13. **FPO collection:** FPO membership POST inserts `fpo_memberships`; aggregation POST inserts independent crop/quantity `fpo_aggregations`. There is no chain from aggregation to specific products, collected lots, allocation, orders, or settlement.
14. **Logistics pickup:** farmer advances order to LOGISTICS_REQUESTED -> creates `deliveries` + initial AVAILABLE tracking event -> provider GET deliveries -> accept POST -> provider ID/status/event -> later PATCH transitions with vehicle/driver -> events. No actual dispatch provider/GPS.
15. **Delivery:** provider PATCH through statuses -> `tracking_events`; DELIVERED updates `delivery.status`, `order.status=DELIVERED`, frees vehicle/driver, creates consumer notification -> JSON -> logistics/consumer UI. No proof-of-delivery payload.
16. **Consumer tracking:** tracking page calls `GET /logistics/tracking/<order>` -> delivery/events serialization -> React timeline/schematic map. GPS not used; bulk-buyer authorization is not ownership scoped.
17. **Notifications:** page calls `GET /notifications/` -> rows filtered to current user -> list/unread count. Mark read POST -> recipient-scoped `is_read=true` -> response and local UI update.
18. **Farmer earnings:** page calls `GET /payments/farmer/summary` -> aggregates order lines by farmer and selected order statuses -> no transfer/payout rows involved -> frontend shows computed revenue/pending figures. Pending whole-order sum may overstate multi-farmer order amounts.
19. **AI forecast:** farmer/assistant screen calls public `/ai/demand-forecast?crop=...` (assistant produce endpoint is separately protected) -> SQL sum of all matching OrderItem quantities/count -> threshold label and fixed 7-/30-day multipliers -> no DB persistence -> chart UI. Results are heuristics, not trained forecasts.
20. **Facilitator assisted farmer/listing:** field assistant form -> `POST /partners/field-assistant/register-farmer` -> creates `users` farmer with synthetic email, random password, verified flag, profile JSON and `field_assignments`; farmer receives no credentials. Listing form -> `/partners/field-assistant/produce` -> server verifies active assignment -> Product with farmer's `farmer_id` -> optional image endpoint checks assignment -> product appears in public catalogue.

## 25. Complete End-to-End Example

Evidence: [backend/app/routes/orders.py](backend/app/routes/orders.py), [backend/app/routes/payments.py](backend/app/routes/payments.py), [backend/app/routes/logistics.py](backend/app/routes/logistics.py), [backend/app/routes/partners.py](backend/app/routes/partners.py), [backend/app/models/product.py](backend/app/models/product.py).

**Illustrative example: Ramesh lists 500 kg tomatoes at ₹30/kg; consumer orders 10 kg.**

1. If Ramesh has a farmer account and verified login, product form writes a `Product` row owned by `users.id` for Ramesh, quantity 500, price 30, location/crop and optional image path. Active product becomes available to public catalogue. No harvest date/grade standards or approval workflow beyond string fields are enforced.
2. Consumer sees an active listing and can add 10 kg to own cart. Adding does not reserve the 10 kg.
3. Checkout checks quantity, makes order total ₹300, decrements product quantity from 500 to 490, writes order and order item, empties cart, and creates buyer/farmer notifications. This happens before payment.
4. Frontend then requests payment. Backend writes a local successful `development` payment with ₹300 and marks order `PAID` immediately. No gateway transfer occurs; the farmer receives no actual ₹300.
5. Farmer confirms and requests logistics. System creates a delivery with pickup location from product and destination literal `Customer delivery address`.
6. Logistics provider accepts, assigns vehicle/driver, and records event statuses. Route estimates are synthetic; no GPS or proof records location/delivery. On DELIVERED, order becomes DELIVERED and buyer receives notification.
7. There is no normal delivery-to-COMPLETED transition, and farmer earnings are calculated from order lines/statuses, not money transferred.

**Actual outcome:** database listing/order/payment/delivery status records can be produced, but the real-world chain “consumer receives goods and farmer receives payment” is not completed by this code. Cancellation also does not restock the 10 kg or refund a payment.

**Facilitator version:** helper can create a distinct farmer user and listing under that farmer's ID, but cannot currently hand the farmer a known email/password/OTP login. The farmer must be given a credential provisioning/reset route outside this implementation to later use the same account.

**FPO version:** overview can sum active products from several member farmer accounts while retaining each farmer product row. Manual aggregation is independent and can duplicate quantity. Buyer requirements are not allocated into an order; FPO status changes alone do not reserve or purchase supply.

**Bulk buyer version:** a buyer can store crop/quantity/location requirement and see individual matching product rows. Match does not select a supplier or turn requirement into a bulk order; regular cart/order flow could place individual listings but no aggregation or pricing tier is implemented.

**Logistics version:** provider can claim and advance the synthetic delivery through status events, but cannot report live GPS or delivery proof. Payment/settlement remains disconnected.

## 26. Button & Functionality Audit

Status vocabulary: **Connected** = request and persistence path exists; **Partial** = some behavior/API exists but important business stage is missing; **UI/demo** = local/static behavior, no equivalent backend effect; **Gap** = absent or incorrectly wired.

| Action | Current behavior / API | Status |
|---|---|---|
| Register / verify / resend | Auth endpoints + users/token rows + SMTP; resend SMTP errors uncaught | Partial: rate limiting and robust delivery absent |
| Login / logout | JWT response; localStorage; logout clears client state | Connected with limitations: inactive login check missing, no automatic refresh |
| Forgot/reset/change password | reset token/email and password hash update | Partial: no throttling/revoke; phone reset still emails; SMTP config required |
| Add product | farmer API inserts owner-linked product | Connected |
| Upload product image | multipart endpoint writes local file and DB path | Partial: no durable object storage/content or size validation |
| Edit/deactivate/delete product | ownership-check update; referenced product deactivated | Connected with delete/cart FK edge risk |
| Marketplace search/filter/sort | DB active list/search; some filters/sort local | Partial; seller identity not returned |
| Add/remove cart | cart endpoints persist buyer cart/items | Connected; not reservation, inactive listings may be added |
| Checkout/place order | stock check, decrement, order lines, notices, clear cart | Partial: address/tax/delivery fees absent, race/cancel stock issues |
| Pay | creates development record and marks PAID | UI action connected, real payment not implemented |
| Farmer confirm/cancel/request logistics | order status endpoint and delivery creation | Partial: state machine inconsistent; no restock/refund |
| Reject order | no dedicated reject semantic; farmer can set CANCELLED via status endpoint if UI offers cancel action | Partial/gap: cancellation not compensating |
| Track order | delivery event API/timeline | Partial: no GPS; bulk authorization gap |
| Accept logistics / assign vehicle/driver / update status | DB-backed endpoints with transition validation | Connected partial: no capacity/GPS/POD, assignment/list scoping concerns |
| Notifications/read | recipient-filtered persistent rows and read update | Connected for rows that are actually created; few event triggers |
| Profile update | PATCH `/auth/me`, JSON profile data | Connected; email re-verification/bank payout absent |
| Settings/password | profile PATCH and password endpoint; some preferences localStorage | Partial: local preferences not server-shared |
| AI forecast | SQL aggregates/fixed formulas | Partial heuristic, not ML forecast |
| FPO collect/aggregate | manual FPO aggregation row | UI/API exists, but disconnected from farmer lots/order allocation |
| FPO add member | creates membership row | Connected, but no membership removal/deactivation |
| Facilitator register farmer | creates individual farmer and assignment | Partial: ownership correct; farmer credentials undisclosed/unusable |
| Facilitator add product | assigned farmer ID is checked and product owner set correctly | Connected |
| Bulk request/match | requirement CRUD and product match query | Partial: no supplier acceptance to order; UI fields omitted at submit |
| Export/filter/search decoration | several visible controls have no action handler (frontend audit) | UI only where noted |

## 27. Sidebar & Navigation Audit

- **Farmer:** dashboard, farm/profile, products/add/inventory, orders, earnings, insights, tracking, notifications/settings. Main routes are protected by farmer role; common dashboard shell controls sidebar. APIs enforce farmer ownership for products and order scope.
- **FPO:** dashboard, members/farmers, inventory, aggregations, marketplace, bulk buyers, logistics, analytics, notifications, settings/profile. FPO routes are protected. Bulk-buyer requirement routes have noted cross-FPO scoping issue; status is not linked to fulfillment.
- **Consumer:** dashboard, marketplace, product details, cart, orders, tracking, notifications, payments, wishlist/review/profile. Protected routes generally allow consumer; catalogue itself is public API data. Payments are local dev records.
- **Bulk buyer:** dedicated shell includes dashboard, requirements, matching, orders, logistics, payments, analytics, notifications, profile/settings; shared marketplace/cart/order paths. Protected client paths and role decorators apply, except tracking API lacks buyer ownership check.
- **Facilitator:** dashboard, farmers, registration, add produce, inventory, orders, sales, demand, notifications, profile/settings. Support sidebar target has no matching route and reaches Not Found. Data fallback makes empty/error state look populated.
- **Logistics:** dashboard, deliveries/available and assigned, vehicles, drivers, tracking, route estimate, earnings, notifications, profile/settings. Route and delivery functions are status/local-estimate based; earnings are static per frontend audit.
- **Admin (additional role):** dashboard/users/products/orders/audit logs. Audit page is route/API-backed but not linked in admin sidebar according to frontend audit. Admin UI is not publicly registrable.

`DashboardShell` search behavior is role-dependent and does nothing on several role shells according to the frontend audit. Some dashboard cards and charts are static even on protected routes. Client role guard is not a substitute for backend authorization.

## 28. Responsive Audit

CSS includes numerous viewport rules and separate responsive rules in each extracted role/page stylesheet. A 390px public forgot-password route and form were browser-smoke-checked with no horizontal overflow; public routes rendered. The stylesheet refactor retained the same winning compiled declarations as the captured pre-refactor CSS.

This audit did **not** exercise every authenticated dashboard at desktop/laptop/tablet/mobile, every sidebar open/close state, chart/table scroll, upload control, or modal. Do not claim all role flows are mobile-verified. Frontend audit identifies horizontally scrollable logistics/field-assistant tables by design; those require device testing. No Three.js/WebGL implementation was found in the inspected frontend; the intro uses CSS transforms, and schematic route visuals are DOM/CSS.

## 29. Implemented Features

- React SPA, public/auth pages, role layouts, protected route checks.
- Flask JSON API mounted at `/api`, PostgreSQL runtime requirement, SQLAlchemy models.
- Password hashing, email OTP verification/reset token flow via configured SMTP.
- User profile/farm profile JSON updates.
- Farmer-owned product create/edit/deactivate, database catalogue/search, separate image upload path.
- Persistent buyer cart, server subtotal order creation, stock decrement, selected order status operations.
- Development payment record creation.
- Notification storage/list/read; order-created and delivery-completed notification triggers.
- FPO membership association, member-product overview, independent aggregation records, bulk requirement visibility/status APIs.
- Field assistant registration/assignment and farmer-owned assisted listings.
- Logistics vehicles/drivers, provider acceptance, delivery transitions, tracking status events.
- Review and wishlist ORM/API support.
- Admin overview/management and narrow audit write path.
- SQL aggregate/rule-based insights and forecasts.

## 30. Partially Implemented Features

- Facilitator-assisted account lifecycle: farmer owner row correct, but credentials and email identity are synthetic/uncommunicated.
- Product image storage: locally written and publicly served; deployment durability not configured.
- Inventory: quantity changes persist, but carts do not reserve, sold/reserved are derived inconsistently, cancellation does not restore stock.
- Checkout: merchandise subtotal and order persist, but address, taxes, fee breakdown and concurrency safety absent.
- Payment: DB record exists, external payment absent.
- Orders: farmer and delivery transitions exist but no coherent unified state machine or compensation.
- Notifications: mechanism persists/read-tracks; event coverage narrow.
- FPO: member supply is aggregatable; manual aggregation is disconnected from actual supply lots and orders.
- Bulk purchasing: requirement and matching endpoints exist; no quote/order allocation conversion.
- Logistics: provider and status history exist; no live route/location, capacity enforcement, delivery proof.
- AI: real DB inputs are used, but calculations are simple heuristic aggregates with questionable status/date filtering.
- Role-based access: backend decorators exist; several resource ownership checks are missing/inconsistent.
- Responsive UI: broad CSS coverage, but not every authenticated role/device combination was tested in this audit.

## 31. Missing Features

- Real payment provider integration, verification/webhooks, failure/refund, seller settlement/payout.
- Durable image/object storage and lifecycle/security controls.
- Buyer address/delivery quote and saved address model.
- Live GPS, map/routing provider, ETA and proof of delivery.
- Unified order/delivery state machine, customer confirmation, complete/refund/cancel compensation.
- Stock reservation, concurrency-safe checkout, inventory ledger and restocking on cancel.
- FPO collection center/intake/lot records, traceable farmer allocations, aggregate purchase order and settlement.
- Bulk quote negotiation, supplier selection, aggregation into a purchasable order, tier/minimum pricing, recurring orders/invoices.
- Practical facilitator-to-farmer credential invitation/OTP setup and account deduplication.
- Dedicated farmer profile/identity ID separate from database key if required by business/regulation.
- AI training/inference, time-windowed historical dataset, seasonality/location/price features, forecast persistence/explanation/evaluation.
- Broad audit events, OTP throttling, password-reset attempt protections and token revocation.
- ORM/schema migration parity and versioned database migrations.

## 32. Mock/Static/Demo Features

- Payment provider is named `development`, reference is `DEV-*`, success is immediately stored.
- Route estimate uses hash-derived synthetic distance/ETA/cost.
- Route maps/timelines are schematic status presentations; no GPS points.
- Field-assistant empty/error fallback farmer/product/notification/chart/summary content is static/demo; dashboard metrics include fixed values.
- FPO dashboard has static summary/settlement/seller/route decorations per frontend inspection; not every card is API data.
- Bulk buyer dashboard/analytics include static metrics/charts; match score percentages and some supplier analysis are hard-coded/client-generated.
- Logistics earnings chart/amounts are static in frontend audit.
- Consumer-visible delivery/tax values are frontend calculations; server order total ignores them.
- Seed script creates demo users, products, order, development payment, reviews, partner data, notifications, requirement and tracking events. Demo data must not be mistaken for live transactions.

## 33. Security Audit

**Implemented controls:** Werkzeug password hashes; JWT access/refresh; protected API decorators check current DB user and role and reject inactive accounts; SQLAlchemy parameterized queries/ORM; product/order ownership checks in many routes; recipient-scoped notification read; SMTP codes have 10-minute expiry and SHA-256 hash; CORS configured from `FRONTEND_URL` plus localhost origins.

**Gaps observed in source:**
- No rate limiting/attempt lockout for login, OTP, resend, reset, or registration; no resend cooldown.
- Reset endpoint returns distinct 503 on email failure for known account while unknown identifier returns generic success; identifier enumeration signal.
- Six-digit OTP entropy is limited; SHA-256 token storage has no keyed salt/pepper; no attempt limit.
- `login` does not reject inactive users although protected APIs do. Profile update can change verified email without re-verification.
- `User.to_dict()` exposes bank/profile JSON and assigned farmer API returns it to assistant.
- Bulk buyer tracking API permits role but fails to verify matching `customer_id`; FPO requirement status update is not FPO-scoped; delivery acceptance can claim an unassigned ID not necessarily in returned list.
- `/uploads/<filename>` is unauthenticated; extension-only validation, no file content/size validation, local storage, old replaced files retained.
- Payment has no provider verification, and order status can be paid after cancellation/other transition if no payment exists.
- No CSRF issue is central to bearer-token API, but JWT revocation/refresh lifecycle and logout revocation are absent; client logout only removes local tokens.
- Audit log is narrow: admin user status changes only. Important assisted, product, order, payment and delivery changes are not recorded.
- DB runtime schema mutation and migrations are not versioned; schema/model mismatch risks deployment drift.
- `.env.example` contains credential-like values in this repository state and both `.env` and `.env.example` were previously found tracked; values are deliberately not reproduced here. Treat exposed values as compromised, rotate if real, and never include them in this document. `render.yaml` uses manual environment values for DB/mail and generated JWT secret.

This is a code inspection, not a penetration test or deployment security certification.

## 34. Real-World Readiness Assessment

**Demonstrable prototype:** user/role page flows, farmer-owned listing rows, DB catalogue/cart/order, immediate stock deduction, notification rows for selected events, local payment record, partner relationships, provider delivery state history.

**Not ready to claim complete real-world transaction:** no verified money movement, no buyer delivery address, no live transport tracking/proof, no seller payout, no cancellation compensation, incomplete order state reconciliation, and incomplete facilitator credentials. FPO collection/aggregation and bulk requirements are not transaction allocation. AI is heuristic and does not constitute predictive model output.

For a demo, label development payment and synthetic map outputs clearly. For production, prioritize transaction correctness/stock, actual payment and settlement, identity/assisted account handoff, schema migrations, authorization/privacy, durable media, and complete delivery/order lifecycle before claiming end-to-end fulfillment.

## 35. Exact Recommendations / Next Changes Required

Priority order (recommendations only; no changes made):

1. **Money and order integrity:** integrate a payment provider with server-side verification/webhook idempotency; record failures/refunds; restore stock on cancellation/refund; prevent paying canceled orders; make checkout atomic/concurrency-safe; reconcile order and delivery terminal statuses.
2. **Fulfillment details:** persist buyer address and quote/fee breakdown; replace placeholder destination; integrate a real route/map service if required; add GPS/proof-of-delivery only with actual device/provider data; validate vehicle capacity.
3. **Identity/ownership:** establish a farmer invitation/credential setup flow for assisted registration; retain the farmer as account/product owner; deduplicate or explicitly reconcile phone identity; minimize assistant-returned profile/bank fields.
4. **FPO and bulk procurement:** connect collections/lots to individual products/farmers and quantity movements; implement allocation and purchase-order conversion; scope FPO decisions; make bulk matching selections actionable and preserve per-farmer ownership.
5. **Authorization and audit:** enforce buyer ownership in every tracking/requirement/payment endpoint; scope FPO records; review delivery claims; add audit records for assisted actions and high-impact product/order/payment/delivery mutations.
6. **Security/operations:** rate-limit auth/OTP/reset, constrain attempts, improve generic reset errors, enforce account activation on login, reverify changed email, establish token revocation strategy, secure uploads, use persistent object storage, rotate any committed secrets.
7. **Data and forecasting:** reconcile ORM and SQL schema, add versioned migrations, define operational status enums/transitions, use paid/completed/time-bounded sales data for metrics, and only call a forecast AI when a validated model/pipeline exists.
8. **Frontend truthfulness:** remove or label demo fallback numbers; wire or remove dead controls/support link; surface actual order fee calculation server-side; test all role pages at multiple viewports with authorized accounts.

**Answer to the central transaction question:** if a farmer adds 500 kg of tomatoes, the application can create and expose an active farmer-owned product row. A buyer can order 10 kg, after which the backend reduces stock to 490 kg and creates order/notification rows; the frontend then invokes a development payment endpoint that records success without moving money. Delivery can advance through timestamped statuses, but destination is a placeholder and there is no GPS or proof-of-delivery. The farmer receives no actual payout from this code. Therefore the current system can demonstrate the database/status path, but cannot truthfully claim the complete real-world chain through consumer receipt and farmer payment.

### Implemented / Missing Feature Matrix

| Feature | Role | Frontend | Backend | Database | Real/Mock | Status | Evidence |
|---|---|---|---|---|---|---|---|
| Farmer public registration | Farmer | Register/verify pages | Register + email verify | `users`, email token | SMTP real if configured | Partial | `RegisterPage.jsx`; `auth.py`; `email_verification.py` |
| Facilitator farmer registration | Field assistant | Multi-step form | Register farmer + assignment | `users`, `field_assignments` | DB-backed, synthetic identity | Partial; farmer credentials undisclosed | `FieldAssistantPage.jsx`; `partners.py` |
| Login/JWT | All registered roles | Login, localStorage | Login/refresh, role decorators | `users` | Real application JWT | Partial security lifecycle | `LoginPage.jsx`; `auth.py`; `utils/auth.py` |
| OTP verification/reset | User | Verify/reset forms | SMTP + hashed expiring token | email/reset token tables | Real SMTP dependency | Partial; no throttle/attempt limit | `auth.py`; `mail.py` |
| Add/edit product | Farmer/assistant | Product editor | Owner/assignment checks | `products` | DB-backed | Connected with limitations | `FarmerProductsPage.jsx`; `partners.py`; `products.py` |
| Product image | Farmer/assistant | File input | Multipart save and URL | Product image path + local disk | Real local file, not durable cloud | Partial | `api.js`; `products.py`; `__init__.py` |
| Inventory | Farmer/FPO/assistant | Inventory views/actions | Quantity and active flag updates | `products.quantity/is_active` | DB-backed | Partial; no ledger/reservation/cancel restore | `products.py`; `partners.py`; `orders.py` |
| Search/catalogue | Consumer/bulk | Marketplace/details | Active products + search | `products` | DB-backed | Partial; seller details absent | `products.py`; `Product.to_dict` |
| Cart | Consumer/bulk | Cart controls | Cart CRUD | `carts`, `cart_items` | DB-backed | Connected but no reservation | `CartPage.jsx`; `orders.py` |
| Checkout/order | Consumer/bulk | Checkout | Subtotal, order, stock decrease | `orders`, `order_items`, products | DB-backed | Partial; address/fees/atomic lock absent | `CartPage.jsx`; `orders.py` |
| Payment | Consumer/bulk | Pay action/pages | Development success record | `payments`, order status | Mock/development | Not real payment | `payments.py`; `Payment` |
| Farmer order notifications | Farmer | Notification page | Trigger at checkout | `notifications` | DB-backed | Partial trigger coverage | `orders.py`; `notifications.py` |
| FPO memberships | FPO/farmer | FPO member screens | Add/list membership | `fpo_memberships` | DB-backed | Partial; no removal | `partners.py`; `FPOMembership` |
| FPO aggregation | FPO | Aggregation form/list | Manual crop/quantity row | `fpo_aggregations` | DB-backed manual record | Disconnected from product lots/orders | `partners.py`; `FPOAggregation` |
| Bulk requirement | Bulk buyer/FPO | Requirement/match UI | Requirement CRUD/matches/status | `bulk_requirements` | DB-backed | Partial; no conversion to order | `BulkBuyerRequirementsPage.jsx`; `partners.py` |
| Logistics delivery | Logistics | Dashboard/status controls | Accept/assign/status events | `deliveries`, vehicles, drivers, events | DB-backed status, no GPS | Partial | `LogisticsDashboardPage.jsx`; `logistics.py` |
| Route estimate | Logistics | Estimate screen | Hash-derived values | None | Deterministic mock | Not actual routing | `RouteEstimatePage.jsx`; `routes.py` |
| Consumer tracking | Consumer/bulk/farmer/provider | Timeline/map | Return delivery/events | deliveries/events | Status history only | Partial; GPS absent; bulk authorization gap | `TrackingPage.jsx`; `logistics.py` |
| Notifications | All authenticated roles | List/read page | Current-user list/read | `notifications` | DB-backed | Partial event triggers | `notifications.py`; `Notification` |
| Farmer earnings | Farmer | Earnings dashboard | Derive order line sums | Orders/items/payment records not payout | Derived, no settlement | Partial | `payments.py` |
| AI demand/price | Public/farmer/assistant | Forecast/insights pages | SQL sums/averages/formulas | Products/order items | Heuristic | Not trained AI | `ai.py` |
| Reviews | Consumer/bulk | Review form | Completed order validation | `reviews` | DB-backed | Partial; normal delivery never sets completed | `ReviewPage.jsx`; `reviews.py`; `logistics.py` |
| Profile/settings | Roles | Profile/settings forms | `/auth/me`, password | `users` JSON/profile | DB-backed plus local prefs | Partial; email reverify/payout info absent | `auth.py`; role pages |
| Admin audit | Admin | Page exists | List; writes user status changes | `audit_logs` | DB-backed, narrow | Partial; sidebar omitted per frontend audit | `admin.py`; `AdminAuditLogsPage.jsx` |
| Persistent uploaded assets | Farmer/assistant | Upload input | Local filesystem route | Path only in DB | Local disk | Not production-durable by config | `products.py`; `render.yaml` |

