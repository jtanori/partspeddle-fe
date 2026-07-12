# Agent Operating Rules

## Development Methodology

1. **Agent does all coding.** The agent is responsible for writing, editing, and refactoring code to fulfill the requested task.

2. **Agent does NOT run verification commands by default.** The agent must NOT run the following unless the operator explicitly asks for them:
   - `pnpm test` / `vitest` / `jest`
   - `pnpm build`
   - `pnpm lint`
   - `pnpm typecheck`
     When the operator explicitly requests verification, the agent runs the requested command(s), reports the results, and uses the outcome to decide whether the current change is ready to commit, push, or PR.

3. **No git mutations until verification is confirmed.** The agent must NOT stage, commit, push, or open pull requests until tests, build, lint, and typecheck pass, either through the operator's own run or through an explicit verification run requested from the agent.

4. **After verification, agent handles git workflow.** Once verification passes, the agent may proceed with staging, committing, pushing the branch, and creating/merging the pull request as requested.

## Shell Optimization

Shell commands are RTK-optimized. See `.agents/rtk.md` for mappings.

## Canonical Architecture Rule

All new backend capabilities and bounded contexts must be implemented as canonical backend modules under `apps/web/src/backend/modules/<name>/` whenever they fit the modular monolith pattern. The canonical structure is defined by `docs/engineering/backend-modules.md` and the reference module `apps/web/src/backend/modules/search/`:

```text
backend/modules/<name>/
├── application/          # Use cases, factories, public barrels
├── domain/               # Ports and domain types
├── infrastructure/       # Adapters (repositories, external clients)
├── tests/
│   ├── contract/
│   ├── integration/
│   ├── performance/
│   └── resilience/
├── contract/             # Operational contracts
└── README.md
```

This rule applies to all new features starting now. Agents must not add new backend logic to `src/services/`, `src/repositories/`, or `src/domain/services/` when a module is the appropriate home. Legacy paths may receive backward-compatible shims during migration, but new capabilities belong in modules.

## Planning Artifacts

All session plans, checkpoints, and planning documents must be saved in the `governance/planning/` directory at the project root.
