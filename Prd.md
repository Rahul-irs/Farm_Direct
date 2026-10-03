# Product Requirements Document (PRD)

## 1. Product Overview

FarmDirect AI is a digital agricultural commerce and operations platform designed to connect farmers, FPOs, bulk buyers, consumers, field assistants, and logistics partners in a single ecosystem. The platform supports direct farm-to-market commerce, supply coordination, order fulfillment, and forecasting. There is no admin role in the supported product.

The system aims to reduce friction across the agricultural value chain while ensuring traceability, transparent pricing, and reliable logistics.

## 2. Product Vision

Provide a resilient and role-aware marketplace that helps stakeholders:

- Farmers list and manage produce inventory
- FPOs coordinate aggregation and group supply
- Bulk buyers source large volumes efficiently
- Consumers discover and buy fresh produce reliably
- Logistics providers manage delivery execution
- Platform events are recorded to support traceability

## 3. Target Users

### Farmers
- Manage produce listings and pricing
- Receive and confirm customer orders
- Coordinate handoff to logistics partners
- View performance and sales trends

### FPOs / Aggregators
- Coordinate member farms and collective supply
- Monitor aggregated demand and supply activities
- Manage group operations and farmer participation

### Bulk Buyers
- Place large-volume requirements
- Match supply with offers and marketplace inventory
- Manage procurement operations at scale

### Consumers
- Browse products
- Add to cart and complete checkout
- Track order status and receive updates

### Logistics Providers
- Accept assigned deliveries
- Manage vehicles, drivers, and route-related status transitions
- Track shipment progress

## 4. Core Functional Requirements

### 4.1 Authentication and Access Control
- Secure login for all user roles
- JWT-based authenticated sessions
- Role-based authorization for farmer, consumer, bulk buyer, logistics, FPO, and field assistant use cases
- Email validation and normalized login flows
- Password reset and OTP-based verification workflow

### 4.2 Marketplace and Commerce
- Product catalog with search and listing support
- Farmer-owned product management
- Cart functionality with persistent state
- Checkout flow with total calculation and payment status management
- Order history and fulfillment tracking
- Inventory deduction and order confirmation logic

### 4.3 Logistics and Fulfillment
- Delivery assignment and acceptance workflow
- Vehicle and driver management
- Shipment status progression
- Route estimation and tracking support
- Logistics dashboard for operations

### 4.4 AI and Forecasting
- Demand forecasting for supply planning
- Price prediction based on available data
- Supplier matching and demand-driven recommendations
- Empty-data handling with explicit responses when forecasting is not possible

### 4.5 Notifications and Communication
- System notifications for orders, status changes, and updates
- Email-based verification and password reset flows
- Audit trail for key actions

## 5. Business Goals

- Increase trust in agricultural transactions
- Reduce fulfillment delays and operational friction
- Support data-driven sourcing and demand planning
- Improve direct market access for farmers
- Create a scalable digital infrastructure for agricultural value chains

## 6. Non-Functional Requirements

### Performance
- Fast response times for marketplace and dashboard interactions
- Efficient retrieval of product, order, and logistics data

### Security
- JWT-based access control
- Role-based mutation restrictions
- Secure handling of user credentials and tokens
- Protection against unauthorized role-specific or supplier actions

### Reliability
- Database-backed persistence for orders, payments, reviews, and logistics
- Deterministic behavior for local demo and seeded scenarios
- Graceful empty-state handling for AI/forecasting modules

### Scalability
- Modular backend services for products, payments, logistics, and AI
- Frontend role-based dashboards for future expansion
- Extensible data model for new roles and workflows

## 7. Key User Flows

### Consumer Flow
1. Sign in
2. Browse marketplace
3. Add items to cart
4. Proceed to checkout
5. Complete payment
6. Track order progress

### Farmer Flow
1. Sign in
2. Review assigned orders
3. Confirm order readiness
4. Hand off logistics
5. Track fulfillment outcomes

### Logistics Flow
1. Receive/accept assigned delivery
2. Assign vehicle and driver
3. Update shipment status
4. Track progress to completion

## 8. Assumptions and Constraints

- The solution is designed around a PostgreSQL-compatible SQLAlchemy backend.
- Authentication is role-aware and JWT-based.
- The current implementation emphasizes a working vertical slice with seeded demo scenarios.
- Production use should include enterprise-grade payment, storage, and map integrations.

## 9. Success Criteria

The product is successful when:

- All demo roles can log in and access their dashboards
- Products can be listed, browsed, and purchased
- Orders flow from checkout to payment to fulfillment
- Buyers, farmers, and logistics partners can collaborate without manual coordination gaps
- Important platform events are recorded for traceability
- Forecasting and recommendation modules provide useful output with explicit empty-data handling

## 10. Release Readiness

The current project is a validated demo-grade implementation with essential commerce, identity, and logistics workflows. Admin-named source remnants are not part of the supported product. It is ready for further enhancement, hardening, and production deployment planning.
