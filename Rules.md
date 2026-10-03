# Engineering Rules and Standards

## 1. Project Principles

- Prefer clarity over cleverness.
- Keep responsibility boundaries explicit.
- Use role-aware access control on every protected action.
- Validate data at the API boundary before persisting or returning it.
- Keep core business logic server-side rather than in UI code.

## 2. Backend Rules

### Python and Flask
- Keep Flask route handlers thin and focused on request processing.
- Put domain logic in services or model-aware helpers when logic becomes non-trivial.
- Use SQLAlchemy models consistently and avoid hidden side effects.
- Ensure database operations are transactional when required.

### Authentication and Authorization
- Require valid JWT tokens for protected endpoints.
- Enforce role checks before updates or privileged reads.
- Never trust frontend-provided role state alone.
- Normalize and validate email inputs before authentication logic.

### Error Handling
- Return structured JSON responses for API errors.
- Keep messages actionable and non-sensitive.
- Handle empty or missing data explicitly in AI and forecast endpoints.

## 3. Frontend Rules

- Keep UI state aligned with backend data rather than independent local truths.
- Use routes and protected guards to enforce role boundaries in the client.
- Prefer reusable component patterns over repeated, ad hoc UI logic.
- Avoid storing security-critical state in insecure or unvalidated locations.

## 4. Data Rules

- Treat database models as the source of truth for persisted domain state.
- Use deterministic demo data when modeling the seeded workflow.
- Track operational events through audit patterns for accountability.
- Maintain consistent naming for inventory, orders, payments, vehicles, and notifications.

## 5. Testing Rules

- Test user-visible workflows, not just helper functions.
- Prefer real behavior tests over mock-heavy assertions.
- Cover login, product purchase, logistics transitions, and authorization boundaries across supported roles.
- Add regression tests when fixing bugs or changing business rules.

## 6. Security Rules

- Never expose raw secrets in frontend code or logs.
- Use environment variables for configuration values.
- Keep JWT secret configuration separate from source-controlled defaults.
- Ensure sensitive endpoint mutations are protected by authorization checks.

## 7. Configuration Rules

- Keep environment configuration explicit and documented.
- Separate local demo configuration from production values.
- Use a PostgreSQL-compatible configuration for backend data access.
- Make optional services such as email delivery and map integrations configurable rather than hardcoded.

## 8. Maintainability Rules

- Prefer modular route files and domain separation.
- Keep API entries and business logic aligned with the user workflows they support.
- Document assumptions and state transitions in project documentation.
- Avoid introducing hidden coupling across unrelated modules.

## 9. Delivery Rules

- Break work into feature slices with clear validation criteria.
- Validate end-to-end flows before calling a task complete.
- Keep demo scenarios reproducible for QA and stakeholder walkthroughs.
- Favor continuous verification over untested assumptions.

## 10. Definition of Done

A feature is done when:

- the behavior works for the intended role
- the API contract is valid
- the UI reflects the correct state
- the change is covered by tests or validated workflow evidence
- no security or authorization regressions are introduced

## 11. Summary

These rules are intended to keep FarmDirect AI reliable, secure, and easy to evolve. The platform should remain role-aware, data-driven, and grounded in real operating workflows rather than prototype-only assumptions.
