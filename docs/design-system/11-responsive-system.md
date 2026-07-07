# PPDS Responsive System

## Breakpoints

Use Tailwind defaults:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Marketplace behavior

- Single column on mobile.
- 2-column grids on tablet.
- 3–4-column grids on desktop.
- Hero text scales down on mobile.

## Workspace behavior

- Desktop: full sidebar + inspector.
- Tablet: collapsed sidebar, inspector as drawer.
- Mobile: bottom navigation, no persistent sidebar or inspector.

## Touch targets

Minimum 44×44px for interactive elements.

## Rules

- Same components across breakpoints.
- Layout changes; components do not.
- Test every new component at `sm`, `md`, `lg`.
