# Architecture Overview

## 1. System Summary

FarmDirect AI is a modular full-stack application that separates responsibilities between frontend interfaces, backend API services, data persistence, and operational logic. The architecture is built around a role-aware application model and a shared database layer that supports both commerce and logistics workflows.

## 2. High-Level Components

### Frontend
- React + JavaScript application
- Vite-based development environment
- Tailwind CSS for styling
- Role-specific pages and dashboards
- API-driven data access via service modules

### Backend
- Flask-based REST API
- SQLAlchemy models and database sessions
- JWT-based authentication and role checks
- Route modules for auth, products, orders, notifications, logistics, payments, admin, reviews, and AI

### Data Layer
- PostgreSQL-compatible SQLAlchemy models
- Seeded demo data for presentation and validation scenarios
- Persistence for users, products, carts, orders, logistics, notifications, and audit records

## 3. Core Architectural Pattern

The system follows a layered architecture:

1. Presentation layer: React pages and UI components
2. API layer: Flask route handlers and controller logic
3. Service/data layer: model access and domain business rules
4. Persistence layer: PostgreSQL-backed SQLAlchemy models
5. Operational services: notifications, logistics, AI forecast, and audit tracking

## 4. Role-Based Access Model

The system defines multiple user roles, each mapped to dedicated workflows and dashboard surfaces:

- Admin
- Farmer
- Consumer
- Bulk buyer
- FPO
- Field assistant
- Logistics provider

Authorization is enforced at the route/service level to prevent unauthorized mutation or access.

## 5. Domain Modules

### Authentication
Responsible for:
- login and logout
- email normalization and validation
- password reset and OTP messaging
- JWT token issuance and validation

### Products and Marketplace
Responsible for:
- product listing
- CRUD for farmer-owned inventory
- marketplace browsing and search
- inventory tracking

### Orders and Payments
Responsible for:
- cart to order conversion
- transaction records
- total calculation
- payment status updates
- order history and fulfillment state

### Logistics
Responsible for:
- delivery assignment
- vehicle/driver management
- shipment lifecycle updates
- route and tracking operations

### AI and Forecasting
Responsible for:
- supplier matching
- demand forecast generation
- price prediction calculations
- empty-state and fallback behavior when no data exists

### Admin and Audit
Responsible for:
- KPI dashboards
- user inspection
- audit event retention
- platform administrative workflows

## 6. Data Model Principles

The schema is designed to support transactional commerce and operational traceability:

- Users own identity and roles
- Products belong to farms and/or FPO relationships
- Carts and orders model buyer activity
- Order items capture detailed product purchases
- Payments track monetary outcomes
- Notifications support status communication
- Reviews provide post-purchase feedback
- Logistics entities track delivery execution
- Audit models capture platform-level actions

## 7. Request Flow

Typical flow for a purchase request:

1. User logs in and receives a JWT
2. Frontend calls API endpoints using the active session
3. Backend validates token and user role
4. Route handler executes business logic
5. SQLAlchemy loads or updates database records
6. Response is returned to the frontend in JSON format
7. UI rerenders based on updated state

## 8. Frontend Architecture

The frontend uses a route-driven structure with role-aware screen layouts:

- Public/auth pages
- Consumer pages
- Farmer pages
- Logistics pages
- Admin pages
- Shared layout and route guards

Protected route logic ensures users do not reach unauthorized screens.

## 9. Backend Architecture

The backend is organized by feature and responsibility:

- app/__init__.py initializes the Flask app and extensions
- models/ defines persistence entities
- routes/ contains endpoint handlers by domain
- services/ hosts operational helpers such as email delivery
- utils/ contains shared helpers, including auth utilities

## 10. Security Architecture

Key security patterns include:

- JWT-based authentication
- role-informed endpoint restrictions
- normalized email validation before credential checks
- explicit checks before mutating sensitive data
- server-side control over calculations and state transitions

## 11. Operational Characteristics

The application is designed for demo-driven validation and iterative delivery. It emphasizes:

- a complete vertical slice across multiple domains
- seeded dataset reproducibility
- clear, role-based functionality
- maintainability with modular routes and models

## 12. Extension Strategy

The service boundaries allow for incremental expansion into:

- external payment gateways
- cloud object storage
- production mail systems
- map and routing services
- deeper AI orchestration and recommendation pipelines

## 13. Architectural Risks and Considerations

- Tight coupling between route logic and domain logic may grow over time if not abstracted
- AI endpoints require explicit empty-data handling to avoid brittle client assumptions
- Production deployment requires stronger operational controls, migrations, and monitoring
- External integrations should remain behind service boundaries for testability

## 14. Summary

The architecture balances usability, clarity, and modularity. It supports role-centric workflows while keeping the data model and API surface sufficiently general to grow into a robust agricultural commerce platform.
