# FarmDirect AI

FarmDirect AI is a full-stack digital agricultural ecosystem combining farm management, marketplace operations, logistics coordination, secure authentication, and AI-powered insight for farmers, FPOs, bulk buyers, consumers, and administrators.

## Overview

The current implementation includes a working database-backed vertical slice:

- React + JavaScript + Vite frontend
- Flask + SQLAlchemy backend
- PostgreSQL-only data model and runtime configuration
- JWT authentication and role-based access control for admin, farmer, and consumer flows
- Product marketplace with search and farmer-owned product CRUD
- Persistent carts, server-calculated checkout totals, order items, and transactional inventory deduction
- Development payment records, order notifications, reviews, logistics providers, vehicles, drivers, delivery tracking, and status transitions
- Database-derived price prediction, demand forecast, and supplier matching endpoints with explicit empty-data responses
- Logistics tracking and vehicles
- AI prediction and demand forecast modules
- Responsive, future-ready design system

## Tech Stack

### Frontend
- React
- JavaScript and JSX
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- shadcn-inspired UI primitives
- Framer Motion
- Recharts

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- PostgreSQL-compatible SQLAlchemy models
- Flask-CORS
- Werkzeug security

## Folder Structure

- frontend/src/pages -> application pages
- frontend/src/components -> reusable UI
- frontend/src/services -> API integration
- backend/app -> Flask application modules
- backend/migrations -> migration files
- backend/tests -> backend tests

## Local Setup

1. Create a Python virtual environment.
2. Install backend dependencies:
   `python -m pip install -r backend/requirements.txt`
3. Install frontend dependencies:
   `npm install --prefix frontend`
4. Copy `.env.example` to `.env`, set a random `JWT_SECRET_KEY` of at least 32 characters, and configure PostgreSQL plus SMTP values:
   `DATABASE_URL=postgresql+psycopg2://farmdirect:farmdirect@localhost:5432/farmdirect_ai`
   `MAIL_SERVER=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_USE_TLS=true`, `MAIL_USERNAME=...`, `MAIL_PASSWORD=...`
5. Start PostgreSQL with `docker compose up -d postgres`.
6. Load the database-only presentation scenario:
   `python backend/seed.py`

The seeded scenario is documented in [DEMO_DATA_EXPLANATION.txt](DEMO_DATA_EXPLANATION.txt). It includes all application roles, live marketplace products, a completed order, payment, review, notifications, FPO records, field-assistant assignment, bulk requirement, logistics tracking, and an audit event. The frontend reads these records through the API; no demo records are hardcoded in React.

## Run App

Backend:
`backend/.venv/Scripts/python.exe backend/run.py`

Frontend:
`npm run dev --prefix frontend`

## Demo Accounts

- Admin: admin@farmdirect.ai / admin123
- Farmer: farmer@farmdirect.ai / farmer123
- Consumer: consumer@farmdirect.ai / consumer123
- Full presentation dataset: all accounts use `demo12345` after running `backend/seed.py`.

## Workflow Guide

The application is seeded with demo data for each role. Use these accounts to test the app end-to-end after running `python backend/seed.py`.

### Demo accounts

- Admin: `admin@farmdirect.ai` / `demo12345`
- Farmer: `farmer@farmdirect.ai` / `demo12345`
- Second farmer: `farmer2@farmdirect.ai` / `demo12345`
- Consumer: `consumer@farmdirect.ai` / `demo12345`
- FPO: `fpo@farmdirect.ai` / `demo12345`
- Field assistant: `assistant@farmdirect.ai` / `demo12345`
- Bulk buyer: `buyer@farmdirect.ai` / `demo12345`
- Logistics provider: `logistics@farmdirect.ai` / `demo12345`

### Login flow

1. Open the app and go to the login page.
2. Enter one of the demo emails and the password `demo12345`.
3. The backend normalizes and validates the email before login.
4. On success, the JWT token is stored locally and the role-based dashboard loads automatically.

### Consumer flow

1. Log in as `consumer@farmdirect.ai`.
2. Open the marketplace and browse available products.
3. Add items to the cart.
4. Proceed through checkout and place the order.
5. The backend calculates the full order amount and reduces inventory after checkout.
6. Complete the payment flow and review the order in the order history.

### Farmer flow

1. Log in as `farmer@farmdirect.ai`.
2. Review orders assigned to the farmer.
3. Confirm the order once payment is complete.
4. Trigger the logistics handoff when dispatch is ready.
5. Track delivery and order progression through the logistics lifecycle.

### Bulk buyer flow

1. Log in as `buyer@farmdirect.ai`.
2. Open the bulk buyer dashboard.
3. Create or review bulk requirements.
4. Use supplier matching and marketplace data to identify supply opportunities.
5. Place bulk requirements through the procurement workflow.
6. Continue using the same product, order, and payment logic used across the platform.

### FPO flow

1. Log in as `fpo@farmdirect.ai`.
2. Review collective supply records and member farms.
3. Inspect aggregation information and supplier activity.
4. Track member participation and group supply coordination.

### Logistics flow

1. Log in as `logistics@farmdirect.ai`.
2. Open the logistics dashboard and view the delivery queue.
3. Accept an assigned delivery.
4. Move the delivery through vehicle and driver assignment and status updates.
5. Use route estimation and tracking screens to monitor the shipment until completion.

### Admin flow

1. Log in as `admin@farmdirect.ai`.
2. Open the admin dashboard to review users, orders, revenue, and system health.
3. Inspect products, order state, and audit logs.
4. Manage platform and user-level settings from the admin workspace.

### End-to-end validation

The project has been validated with the frontend production build, backend test suite, and live role-based smoke tests against the seeded demo credentials.

Verified flows include:

- Login for all demo roles
- Marketplace browsing and cart creation
- Order submission and payment completion
- Farmer confirmation and logistics handoff
- Logistics delivery acceptance and tracking
- Admin overview and management access

Status: all core functionality is working correctly with the current project state.

## API Documentation

Implemented endpoints include `/api/auth`, `/api/products`, `/api/orders`, `/api/payments`, `/api/notifications`, `/api/reviews`, `/api/logistics`, `/api/admin/overview`, and `/api/ai`. The API returns JSON errors and protects mutations with JWT role checks.

## Notes

The development implementation uses a local payment provider and deterministic route estimates when external credentials or map services are unavailable. Registration and password recovery send six-digit OTPs through the configured SMTP server. Production deployment should configure a real payment provider, PostgreSQL migrations, object storage, and a live map service.
