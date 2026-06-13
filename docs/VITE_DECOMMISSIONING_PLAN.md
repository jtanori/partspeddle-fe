# Vite Decommissioning Roadmap

## Objective
Gradually reduce and eventually eliminate dependency on Vite by migrating tooling to Next.js/Native ecosystem standards.

## Phased Roadmap

| Phase | Task | Risk | Goal |
| :--- | :--- | :--- | :--- |
| **I** | **Tailwind Native** | Low | Move from `@tailwindcss/vite` to native PostCSS configuration. |
| **II** | **Test Migration** | Medium | Migrate unit tests from `vitest` to `jest` or `playwright`. |
| **III** | **Config Cleanup** | Low | Delete `vite.config.ts`, update `tsconfig`. |
| **IV** | **Dependency Removal**| Low | Remove `vite` packages from `package.json`. |

---

## Execution Principles
- **Isolation**: Each phase must be completed and verified before starting the next.
- **Parallelism**: Tailwind/Test suites should remain green throughout the transition.
- **Priority**: Modernization features (like PDP) take precedence. Vite decommissioning is a background infrastructure task to be performed during cleanup periods.
