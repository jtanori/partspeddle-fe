# platform/ci

Continuous integration configuration for the PartsPeddle platform.

## Layout

- `.github/workflows/` at the repository root remains the active workflow location. GitHub only discovers workflows under that path.
- `platform/ci/` holds reusable scripts, composite actions, and helpers that the root workflows invoke.
- Workflows in `.github/workflows/` are thin orchestrators; complex logic lives here so it can be tested locally.

## Current contents

- `README.md` — this file.

## Future additions

- `helpers/` — shell or TypeScript scripts for steps that are reused across workflows.
- `composites/` — GitHub Actions composite actions if the project outgrows inline steps.

## Notes

- Do not move `.github/workflows/ci.yml` or `.github/workflows/nightly-operational-validation.yml` out of `.github/workflows/`; GitHub will stop running them.
- Update paths in `.github/workflows/` whenever a referenced script moves under `platform/`.
