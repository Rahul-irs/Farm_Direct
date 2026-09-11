# FarmDirect AI Database

This folder is a learning and database-reference area for FarmDirect AI.

The running application uses SQLAlchemy models in `backend/app/models/`. The database folder explains the same design in plain language and PostgreSQL SQL. It is intentionally separate from the frontend: React never owns application records.

## Database flow

```text
React page
  -> Flask API route
  -> SQLAlchemy model/query
  -> PostgreSQL or local SQLite
  -> JSON response
  -> React UI
```

## Local and production databases

Local development defaults to:

```text
backend/instance/farmdirect_ai.db
```

Production or Docker uses PostgreSQL through `DATABASE_URL`:

```text
postgresql+psycopg2://farmdirect:farmdirect@localhost:5432/farmdirect_ai
```

Set the URL in `.env`. Do not put database passwords in React or commit a real production password.

## Main tables

| Table | Purpose |
| --- | --- |
| `users` | Login accounts and roles |
| `products` | Farmer marketplace listings and inventory |
| `carts`, `cart_items` | A buyer's persistent shopping cart |
| `orders`, `order_items` | Purchases and server-calculated line items |
| `payments` | Development or real payment transactions |
| `notifications` | User-facing operational messages |
| `reviews` | Ratings attached to completed purchases |
| `vehicles`, `drivers` | Logistics fleet records |
| `deliveries`, `tracking_events` | Delivery ownership and status history |
| `fpo_memberships`, `fpo_aggregations` | FPO farmer membership and supply aggregation |
| `field_assignments` | Field-assistant to farmer ownership boundary |
| `bulk_requirements` | Bulk-buyer procurement requirements |
| `password_reset_tokens` | Hashed, expiring reset codes |
| `audit_logs` | Administrative activity history |

## Important relationships

```text
User 1 --- many Product
User 1 --- many Order as customer
Order 1 --- many OrderItem
Product 1 --- many OrderItem
User 1 --- 1 Cart
Cart 1 --- many CartItem
Order 1 --- 1 Payment
Order 1 --- 1 Delivery
Delivery 1 --- many TrackingEvent
Logistics User 1 --- many Vehicle and Driver
FPO User 1 --- many FPOMembership and FPOAggregation
Field Assistant User 1 --- many FieldAssignment
Bulk Buyer User 1 --- many BulkRequirement
```

## Create the demo database

Run from the repository root after installing backend requirements:

```powershell
python backend/seed.py
```

The demo records are described in [../DEMO_DATA_EXPLANATION.txt](../DEMO_DATA_EXPLANATION.txt). They are inserted into the database, not into frontend arrays.

## Migrations

Use Flask-Migrate for schema changes:

```powershell
$env:FLASK_APP = "backend.run:app"
flask db migrate -m "describe change"
flask db upgrade
```

More migration notes are in [../backend/migrations/README.md](../backend/migrations/README.md).

## SQL reference

[schema.sql](schema.sql) is a readable PostgreSQL reference for the core tables. In normal application operation, Flask-Migrate should own schema changes instead of manually applying this file to an existing database.
