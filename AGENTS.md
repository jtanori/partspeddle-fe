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

## Planning Artifacts

All session plans, checkpoints, and planning documents must be saved in the `governance/planning/` directory at the project root.
