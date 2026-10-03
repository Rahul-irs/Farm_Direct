# FarmDirect AI

FarmDirect AI is a marketplace and operations platform for agricultural supply chains, built for farmers, FPOs, consumers, bulk buyers, facilitators, and logistics partners. It helps connect listing, order intake, stock validation, fulfillment coordination, and settlement visibility across the farm-to-consumer pathway.

## Table of Contents

- [Project Title & Short Description](#project-title--short-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Complete Workflow](#complete-workflow)
- [Project Structure](#project-structure)
- [Prerequisites & Requirements](#prerequisites--requirements)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing Guidelines](#contributing-guidelines)
- [Troubleshooting](#troubleshooting)

## Project Title & Short Description

FarmDirect AI is an agricultural marketplace and fulfillment platform connecting farmers, FPOs, buyers, and delivery partners in a single workflow. It is designed for fresh-produce commerce, stock-aware checkout, and operational coordination across the supply chain.

## Features

- Role-based authentication and protected API access for consumers, farmers, FPOs, bulk buyers, field assistants, and logistics providers
- Product catalogue management with search, filtering, and farmer-owned inventory tracking
- Cart and checkout logic that validates stock before order creation and calculates totals on the server
- Order creation with multiple supplier allocations represented as order items and traceable allocation records
- Inventory reduction on purchase and restoration when an unprocessed order is cancelled
- FPO membership and aggregation metadata alongside farmer product ownership
- Logistics delivery assignment, status progression, and tracking records
- Notifications for order updates, fulfillment, and system events
- Payment records that use a development-safe payment flow without claiming live card processing
- AI demand/price forecast endpoints that use historical product data when present and explicit fallback logic when data is insufficient

## Technologies Used

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Create React App (react-scripts)
- React Router
- Framer Motion
- Recharts
- Axios
- Lucide React

### Backend
- Python 3.10+
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS
- Flask-Migrate
- Werkzeug
- SQLAlchemy
- PostgreSQL-compatible database support
- Neon PostgreSQL compatibility via SQLAlchemy connection strings

### Infrastructure / Related services
- PostgreSQL via Docker Compose or Neon
- SMTP-based email OTP delivery
- Render deployment configuration in render.yaml

## System Architecture

React frontend
  ↓
Flask REST API
  ↓
PostgreSQL / Neon database
  ↓
Role-aware business logic and notifications

The current implementation is a working vertical slice of the farm-to-consumer workflow. It does not use a production payment gateway, does not provide live GPS telemetry, and does not claim full real-time route tracking unless a provider is configured.

## User Roles

The supported application roles are farmer, FPO, consumer, bulk buyer, facilitator/field assistant, and logistics partner. Admin is not a supported application role; any admin-named seed data or source remnants are legacy and outside the documented workflows.

### Farmer
- Owns product listings and inventory
- Views assigned orders and fulfillment information
- Manages product stock and product images
- Receives order notifications and can act on pending fulfillment options

### FPO
- Maintains membership relationships with farmers
- Reviews collective inventory and aggregation information
- Accesses group-level operational summaries

### Consumer
- Browses products and adds items to cart
- Creates and tracks orders
- Verifies payment records and receives order updates

### Bulk Buyer
- Creates bulk requirements and checks aggregated supply availability
- Uses the same server-side order and stock checks as individual buyers

### Facilitator / RBK
- Assists with farmer onboarding and product registration
- Works with farmer accounts without creating duplicate user records
- Is auditable through actor-based actions

### Logistics Partner
- Accepts deliveries and manages vehicles and drivers
- Updates delivery status through the fulfillment lifecycle
- Tracks pickup and delivery records for assigned orders

## Complete Workflow

The implemented workflow follows the verified vertical slice of the marketplace:

1. Consumer searches the marketplace and adds products to the cart.
2. Server-side stock checks validate availability before checkout.
3. Order creation creates a buyer order and supplier allocations per product line.
4. Payment is captured as a development payment record and order status moves through the server-side flow.
5. Farmer receives fulfillment and can act on assigned orders.
6. Logistics partner accepts the delivery and progresses the transport lifecycle.
7. Consumer receives order status updates and delivery notifications.
8. Unprocessed cancellations restore inventory quantity.

This project supports direct-farmer fulfillment and multi-farmer order allocation where a single consumer order can include multiple suppliers. It also includes FPO membership and aggregation metadata, although the current implementation emphasizes traceability and workflow integrity rather than a full external aggregator purchasing engine.

## Project Structure

- backend/
  - app/
    - __init__.py
    - models/
    - routes/
    - services/
    - utils/
  - tests/
  - run.py
  - seed.py
  - validate_backend.py
- frontend/
  - src/
  - public/
  - package.json
- database/
  - schema.sql
- docker-compose.yml
- render.yaml
- README.md
- Architecture.md
- Design.md
- Prd.md
- Tasks.md
- Rules.md

## Prerequisites & Requirements

- Node.js: 18+ recommended; npm 9+
- Python: 3.10+
- PostgreSQL: PostgreSQL-compatible database or Neon Postgres
- Git
- Browser: modern Chrome, Edge, Firefox, or Safari
- SMTP access for OTP delivery if email verification is enabled

## Installation & Setup

1. Clone the repository.
2. Create a Python virtual environment.
3. Install backend dependencies:
   `python3 -m pip install -r backend/requirements.txt`
4. Install frontend dependencies:
   `npm install --prefix frontend`
5. Create a local `.env` file in the project root with the required environment variables.
6. Start PostgreSQL locally with Docker or connect to Neon.
7. Run the app using the commands in the section below.

## Environment Variables

Set the following values before running the backend:

- DATABASE_URL=postgresql+psycopg2://farmdirect:farmdirect@localhost:5432/farmdirect_ai
- JWT_SECRET_KEY=change-this-to-a-secure-random-value
- FRONTEND_URL=http://localhost:3000
- MAIL_SERVER=smtp.gmail.com
- MAIL_PORT=587
- MAIL_USE_TLS=true
- MAIL_USERNAME=your-smtp-user@example.com
- MAIL_PASSWORD=your-smtp-password
- MAIL_DEFAULT_SENDER=your-smtp-user@example.com

Do not commit real credentials into source control. Use local environment variables or a secure deployment secret store.

## Database Setup

The backend expects a PostgreSQL-compatible database. For local development:

1. Start the database container:
   `docker compose up -d postgres`
2. Configure `DATABASE_URL` to point to the local PostgreSQL instance.
3. Create the schema with the Flask app initialization and SQLAlchemy model metadata.
4. Seed the demo dataset with:
   `python3 backend/seed.py`

The project includes a Neon-friendly PostgreSQL connection pattern and the SQLAlchemy schema definitions in the model files.

## Running the Project

### Backend

```bash
export DATABASE_URL=postgresql+psycopg2://farmdirect:farmdirect@localhost:5432/farmdirect_ai
export JWT_SECRET_KEY=replace-with-a-secret
python3 backend/run.py
```

### Frontend

```bash
npm run dev --prefix frontend
```

## Testing

Run the backend suite with:

```bash
pytest -q
```

Run the frontend production build with:

```bash
npm run build --prefix frontend
```

The current project has a passing backend regression suite and a successful frontend production build in the repository state used for this update.

## Deployment

This repository includes a Render deployment configuration in [render.yaml](render.yaml). The current deployment setup is:

- Render web service for the Flask API
- Render static web service for the frontend build
- Neon PostgreSQL as the database target

The deployment configuration expects environment variables to be supplied securely through the platform environment, not committed in code.

## Security

Important security and integrity safeguards included in the current implementation:

- Password hashing via Werkzeug
- JWT-based authentication and role checks on protected routes
- Server-side validation for stock and pricing in checkout flow
- Restriction of sensitive actions to the correct user roles
- SMTP OTP delivery for registration and password reset
- File upload checks on allowed image types before saving product images
- No hardcoded credentials or production secrets in the source tree
- No fake GPS data or fake payment authorization claims are presented as live production services

## Contributing Guidelines

### Fork / Clone

- Fork the repository and create a local clone.
- Create a feature branch before making changes.

### Development flow

1. Install dependencies.
2. Create the required environment variables.
3. Run the backend and frontend locally.
4. Make small, focused changes.
5. Update tests when behavior changes.
6. Run `pytest -q` and `npm run build --prefix frontend` before submitting.
7. Commit the change and open a pull request.

### Bug Reports

When reporting a bug, include:

- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser or environment details
- Relevant logs or screenshots

### Feature Requests

Use the issue tracker to propose product and workflow improvements. Describe the business problem, the expected behavior, and any role or workflow constraints.

### Pull Requests

- Keep changes focused and easy to review.
- Do not introduce TypeScript.
- Preserve the existing project architecture.
- Add or update tests for behavioral changes.
- Update the README when functionality changes.
- Never commit secrets or private credentials.

## Troubleshooting

### Backend fails to start

- Confirm that `DATABASE_URL` is set and points to a valid PostgreSQL connection.
- Confirm the Python environment has the dependencies installed from `backend/requirements.txt`.
- Ensure the configured JWT secret is set.

### Registration / OTP failures

- Check the `MAIL_*` environment variables.
- Confirm SMTP credentials and sender configuration are valid.
- If SMTP is not configured, registration will fail with a clear 503-style response instead of a fake success.

### Frontend build errors

- Reinstall dependencies: `npm install --prefix frontend`
- Clear the build cache if necessary.
- Confirm `react-scripts` is installed and the environment is compatible with the project.

### Inventory problems

- Recheck product stock values in the database.
- Verify that the order route and cart route are running against the same backend instance.
- Ensure cancellation is replayed only for unprocessed orders if you are testing restoration behavior.

### Database connection issues

- Confirm the database is running and reachable.
- Check the Postgres port and authentication values.
- For local setup, use `docker compose up -d postgres`.

### Live GPS or live payment claims

- The project does not present synthetic GPS as real-time tracking.
- The payment flow is a development-safe record system, not a live card processor.
