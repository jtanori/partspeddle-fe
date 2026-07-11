# PPDS Color System

PPDS uses a semantic color model: tokens describe role, not appearance.

## Roles

### Brand

Primary action, links, accent.

- `--color-brand-primary`
- `--color-brand-primary-hover`

### Surface

Backgrounds and panels.

- `--color-surface-primary` — cards, panels, modals.
- `--color-surface-secondary` — page backgrounds.
- `--color-surface-muted` — skeletons, disabled states.

### Foreground

Text and icons.

- `--color-foreground-primary` — primary text.
- `--color-foreground-secondary` — secondary text.
- `--color-foreground-muted` — placeholders, disabled, meta.
- `--color-foreground-inverse` — text on brand or dark surfaces.

### Stroke

Borders, dividers, input outlines.

- `--color-stroke-subtle`
- `--color-stroke-default`
- `--color-stroke-strong`

### Status

Success, warning, danger, info.

Each status has a base color and a soft background for badges, alerts, and toasts.

## Usage rules

- Never use raw hex values in components.
- Never redefine status colors for specific pages.
- Use `bg-*`, `text-*`, `border-*` Tailwind token classes.
- Maintain WCAG AA contrast (4.5:1 for normal text, 3:1 for large text).
