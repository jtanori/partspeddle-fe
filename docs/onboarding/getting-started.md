# Getting Started

Welcome to PartsPeddle / VinTrack. This document points you to the right places.

## What is this project?

PartsPeddle is an AI-native commerce platform for automotive parts. The repository is evolving from a single Next.js application into a platform repository with clear boundaries between application code, shared packages, backend modules, governance, and operations tooling.

## Repository map

- [`apps/web/`](../../apps/web/) — Next.js 16 + App Router application.
- [`packages/`](../../packages/) — Shared configuration and utilities.
- [`backend/`](../../backend/) — Modular monolith backend (search, listing, seller, catalog, AI, ...).
- [`platform/`](../../platform/) — CI, deployment, scripts, and tooling.
- [`governance/`](../../governance/) — Planning, certification, architecture decisions, and SCGS.
- [`docs/`](../../docs/) — Knowledge base (you are here).
- [`tests/`](../../tests/) — Test suites.
- [`artifacts/`](../../artifacts/) — Generated reports and deployment records.

## How to run locally

1. Copy `.env.example` to `.env.local` and fill in required variables.
2. `pnpm install`
3. `pnpm dev` (from `apps/web/` or root, depending on current workspace setup)

See root [`README.md`](../../README.md) for prerequisites and quick start.

## Where to find things

| I want to...                 | Go to                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| Understand the architecture  | [`ARCHITECTURE.md`](../../ARCHITECTURE.md)                   |
| Understand governance        | [`GOVERNANCE.md`](../../GOVERNANCE.md)                       |
| Deploy or operate the system | [`docs/operations/`](../operations/)                         |
| Understand security          | [`docs/engineering/security.md`](../engineering/security.md) |
| Add a feature                | [`CONTRIBUTING.md`](../../CONTRIBUTING.md)                   |
| Write tests                  | [`TESTING.md`](../../TESTING.md)                             |
| Read about search            | [`docs/reference/search/`](../reference/search/)             |

## Agent-assisted work

If you are working with an AI agent, read [`AGENTS.md`](../../AGENTS.md) for operating rules.
