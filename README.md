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

## API Documentation

Implemented endpoints include `/api/auth`, `/api/products`, `/api/orders`, `/api/payments`, `/api/notifications`, `/api/reviews`, `/api/logistics`, `/api/admin/overview`, and `/api/ai`. The API returns JSON errors and protects mutations with JWT role checks.

## Notes

The development implementation uses a local payment provider and deterministic route estimates when external credentials or map services are unavailable. Registration and password recovery send six-digit OTPs through the configured SMTP server. Production deployment should configure a real payment provider, PostgreSQL migrations, object storage, and a live map service.
