# P5.10 — Add Storybook for Design-System Documentation

**Branch:** `feat/p5-10-storybook-design-system`  
**Base:** `develop`  
**Goal:** Make Storybook a reliable, CI-gated visual reference for the PartsPeddle Product Design System (PPDS) and close the remaining documentation gaps.

---

## Current State

- Storybook is installed and configured for Next.js 16 + React 19 + Tailwind CSS v4.
- `.storybook/main.ts` uses `@storybook/react-vite` and aliases `next/image` and `next/link` to mocks.
- `@storybook/addon-essentials` and `@storybook/addon-a11y` are enabled.
- Stories already exist for:
  - UI primitives (`Button`, `Card`, `Badge`, `Chip`, `Tabs`, `Accordion`, etc.)
  - Design-system composites (`PartCard`, `SellerCard`, `Price`, `Rating`, `ImageGallery`, etc.)
  - Information Page System components (`InformationPageHeader`, `ContactForm`, etc.)
  - Workspace shell components (`WorkspaceLayout`, `Sidebar`, `TopNavigation`, etc.)
- CI does **not** run `storybook:build`, so Storybook can break silently.
- There is **no canonical part-page story** for `PDPRoot`.
- There are no branch tests asserting Storybook builds or that key stories exist.
- `docs/design-system/README.md` does not link to Storybook.

---

## Gaps

1. No CI gate for `storybook:build`.
2. Missing canonical page stories (PDP, home hero, search results).
3. No design-system documentation pages inside Storybook.
4. No branch tests for Storybook build or story coverage.
5. Storybook is not discoverable from `docs/design-system/`.
6. No documented conventions for writing stories (naming, mock data, decorators).

---

## Work Items

### 1. Add Storybook build to CI

In `.github/workflows/ci.yml`, add a `storybook` job after the test job:

```yaml
storybook:
  name: Storybook Build
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
    - run: corepack enable
    - run: pnpm install
    - run: pnpm storybook:build
```

This ensures dependency or type changes that break Storybook are caught before merge.

### 2. Add canonical page stories

Create stories that represent full pages/compositions so designers and engineers can review states in isolation:

- `src/components/pdp-modern/PDPRoot.stories.tsx`
  - Use a representative `PDPViewModel` built from mock part + seller + specification data.
  - Stories: Default, No Images, Long Description, Mobile Viewport.
- `src/components/homepage/HighFidelityHero.stories.tsx`
  - Hero with and without search state.
- `src/components/search/SearchResultCard.stories.tsx` (or equivalent)
  - Result card states: default, sale, low stock, trusted seller.

### 3. Add design-system documentation inside Storybook

Create `.storybook/DocTemplate.mdx` or `src/stories/ppds/*.mdx` that mirror `docs/design-system/`:

- `PPDS-Philosophy.mdx`
- `PPDS-Tokens.mdx`
- `PPDS-Layout.mdx`
- `PPDS-Components.mdx`

Use Storybook’s `mdx` support so the design system is browsable alongside components.

### 4. Configure Storybook addons

- Ensure `@storybook/addon-viewport` is configured (included in essentials) with breakpoints from the PPDS responsive system.
- Add `@storybook/addon-backgrounds` (also in essentials) with surface colors from the design tokens.
- Add a global decorator that wraps stories in the root layout/theme providers so components render with the correct CSS variables.

### 5. Add Storybook conventions and mock-data helpers

Create `src/stories/README.md` and helper files:

- `src/stories/mocks/parts.ts` — mock part objects.
- `src/stories/mocks/sellers.ts` — mock seller profiles.
- `src/stories/decorators/Providers.tsx` — shared providers decorator.
- Document naming: `ComponentName.stories.tsx`, title format `Surface/ComponentName`.

### 6. Add branch tests

Under `tests/branch/p5-10-storybook-design-system/`:

- `storybook-build.test.ts` — runs `pnpm storybook:build` as a subprocess and asserts exit code 0.
- `story-coverage.test.ts` — asserts key story files exist (PDPRoot, Button, PartCard, InformationPageHeader, WorkspaceLayout).
- `design-system-docs.test.ts` — asserts the MDX doc files exist.

### 7. Link Storybook from design-system docs

Update `docs/design-system/README.md`:

- Add a "Storybook" section with the local start command and a link to the deployed Storybook URL if available.
- Mention that Storybook is the interactive companion to the markdown docs.

### 8. Verify and clean up

- Run `pnpm storybook:build` locally (or via CI) and fix any type/build errors.
- Remove any stale stories that no longer match component APIs.
- Confirm the `next/image` and `next/link` mocks still work after upgrades.

---

## Acceptance Criteria

- [ ] CI runs `pnpm storybook:build` and fails if it does not succeed.
- [ ] `PDPRoot` has a Storybook story with representative mock data.
- [ ] At least one homepage and one search-result story exist.
- [ ] Storybook includes PPDS documentation MDX pages.
- [ ] Viewport and background addons are configured for PPDS tokens.
- [ ] Branch tests assert Storybook build success and story coverage.
- [ ] `docs/design-system/README.md` links to Storybook.
- [ ] `pnpm storybook:build`, `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P5.0 Phase 2 (core component library stable), P5.1 (route groups and page structure stable).
- **Unblocks:** P5.8 (security certification can reference Storybook for visual regression), general design-system adoption.

---

## Risks

- Storybook’s Vite builder can be sensitive to Tailwind v4 / Next.js 16 changes; build failures may require config tweaks.
- Mocking `next/image` and `next/link` may hide real component issues; keep mocks minimal and update them when Next.js APIs change.
- Adding Storybook build to CI increases pipeline duration; consider caching `.cache/storybook`.
