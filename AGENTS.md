# Agent Operating Rules

## Development Methodology

1. **Agent does all coding.** The agent is responsible for writing, editing, and refactoring code to fulfill the requested task.

2. **Agent does NOT run verification commands.** The agent must NOT run:
   - `pnpm test` / `vitest` / `jest`
   - `pnpm build`
   - `pnpm lint`
   - `pnpm typecheck`
     These are left to the operator or another verifying agent.

3. **No git mutations until verification is confirmed.** The agent must NOT stage, commit, push, or open pull requests until the operator or another agent has explicitly confirmed that tests, build, lint, and typecheck pass.

4. **After verification, agent handles git workflow.** Once verification is confirmed, the agent may proceed with staging, committing, pushing the branch, and creating/merging the pull request as requested.
