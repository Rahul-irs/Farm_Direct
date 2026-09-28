# Memory and Working Notes

## Project Context

FarmDirect AI is an agricultural commerce and operations platform connecting farmers, FPOs, bulk buyers, consumers, logistics providers, and administrators in a single system.

## Key Project Facts

- Frontend: React + Vite + Tailwind
- Backend: Flask + SQLAlchemy
- Database: PostgreSQL-compatible schema
- Authentication: JWT and role-aware access control
- Core workflows: marketplace, orders, payments, logistics, admin operations, AI forecasting

## Important Operating Notes

- Demo users are seeded via backend data setup scripts.
- Local development requires backend dependencies and frontend dependencies to be installed separately.
- The seeded dataset is the primary demonstration environment for validating flows.
- AI and recommendation endpoints should return explicit empty-data responses when insufficient data is available.

## Design and Product Direction

- Favor trustworthy, operational, and role-aware user experience design.
- Keep user journeys direct and measurable.
- Design around visible status progression for orders and deliveries.
- Support business transparency across supply, fulfillment, and administration.

## Delivery Priorities

1. Security and access control quality
2. Critical workflow validation and regression safety
3. Operational completeness for each role
4. AI and analytics enhancement
5. Production readiness and deployment hardening

## Working Principles

- Prefer server-side business logic and validation.
- Maintain modular boundaries between routes, services, and persistence.
- Keep the product grounded in real agricultural workflows and not in isolated mock flows.
- Validate changes with the most relevant workflow-based checks available.

## Session Summary

This project already contains a working vertical slice. The next value is in hardening the platform, expanding workflow validation, and preparing the documented architecture for production-scale growth.
