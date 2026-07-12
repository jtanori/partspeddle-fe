# Integration Tests

Tests for API routes, repositories, backend modules, middleware, database migrations, and UI component wiring.

- May use mocked external services (Algolia, Supabase) unless the goal is to verify the integration contract.
- Avoid testing presentation details that belong in unit tests or end-to-end tests.
