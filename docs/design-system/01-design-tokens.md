# PPDS Design Tokens

All visual values are defined as tokens in `src/index.css` and exposed through Tailwind CSS v4.

## Color

### Brand

| Token                         | Value     | Usage                          |
| ----------------------------- | --------- | ------------------------------ |
| `--color-brand-primary`       | `#b87333` | Primary actions, links, accent |
| `--color-brand-primary-hover` | `#a35d1f` | Hover states                   |
| `--color-brand-cream`         | `#f5f0eb` | Soft backgrounds               |

### Surface

| Token                       | Value     | Usage               |
| --------------------------- | --------- | ------------------- |
| `--color-surface-primary`   | `#ffffff` | Cards, panels       |
| `--color-surface-secondary` | `#f5f0eb` | Page backgrounds    |
| `--color-surface-muted`     | `#f0ebe5` | Skeletons, disabled |

### Foreground

| Token                          | Value     | Usage               |
| ------------------------------ | --------- | ------------------- |
| `--color-foreground-primary`   | `#1e1e1e` | Headings, body text |
| `--color-foreground-secondary` | `#4a4a4a` | Secondary text      |
| `--color-foreground-muted`     | `#8a8a8a` | Placeholders, meta  |
| `--color-foreground-inverse`   | `#ffffff` | Text on dark/brand  |

### Stroke

| Token                    | Value     | Usage                 |
| ------------------------ | --------- | --------------------- |
| `--color-stroke-subtle`  | `#e5e0da` | Card borders          |
| `--color-stroke-default` | `#d4cfc8` | Inputs, dividers      |
| `--color-stroke-strong`  | `#b8b3ad` | Focus, strong borders |

### Status

| Token                         | Value                   | Usage               |
| ----------------------------- | ----------------------- | ------------------- |
| `--color-status-success`      | `#22c55e`               | Success             |
| `--color-status-success-soft` | `rgba(34,197,94,0.12)`  | Success backgrounds |
| `--color-status-warning`      | `#f59e0b`               | Warning             |
| `--color-status-warning-soft` | `rgba(245,158,11,0.12)` | Warning backgrounds |
| `--color-status-danger`       | `#ef4444`               | Danger / error      |
| `--color-status-danger-soft`  | `rgba(239,68,68,0.12)`  | Danger backgrounds  |
| `--color-status-info`         | `#3b82f6`               | Information         |
| `--color-status-info-soft`    | `rgba(59,130,246,0.12)` | Info backgrounds    |

## Typography

| Token               | Size | Usage                      |
| ------------------- | ---- | -------------------------- |
| `--text-display`    | 48px | Hero headlines             |
| `--text-display-l`  | 40px | Large page titles          |
| `--text-display-m`  | 32px | Medium display headlines   |
| `--text-hero`       | 36px | Page titles                |
| `--text-section`    | 28px | Section titles             |
| `--text-card-title` | 22px | Card titles                |
| `--text-body`       | 16px | Body text                  |
| `--text-caption`    | 14px | Captions, labels           |
| `--text-meta`       | 12px | Meta, badges, small labels |

## Spacing

| Token         | Value |
| ------------- | ----- |
| `--spacing-1` | 4px   |
| `--spacing-2` | 8px   |
| `--spacing-3` | 12px  |
| `--spacing-4` | 16px  |
| `--spacing-5` | 24px  |
| `--spacing-6` | 32px  |
| `--spacing-7` | 48px  |
| `--spacing-8` | 64px  |
| `--spacing-9` | 96px  |

## Radius

| Token           | Value |
| --------------- | ----- |
| `--radius-xs`   | 4px   |
| `--radius-sm`   | 8px   |
| `--radius-md`   | 12px  |
| `--radius-lg`   | 16px  |
| `--radius-xl`   | 24px  |
| `--radius-full` | 999px |

## Shadows

| Token                 | Value                         | Usage             |
| --------------------- | ----------------------------- | ----------------- |
| `--shadow-card`       | `0 1px 3px rgba(0,0,0,0.08)`  | Cards             |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.12)` | Card hover        |
| `--shadow-floating`   | `0 8px 24px rgba(0,0,0,0.14)` | Popovers, drawers |

## Motion

| Token            | Value                       |
| ---------------- | --------------------------- |
| `--ease-default` | `cubic-bezier(0.4,0,0.2,1)` |

Durations:

- Fast: 150ms
- Normal: 200ms
- Slow: 300ms

## Layout

| Token             | Value  |
| ----------------- | ------ |
| `--container-max` | 1440px |
| `--content-max`   | 1280px |
| `--grid-gutter`   | 24px   |

## Rules

- Never redefine these values inside components.
- Use Tailwind token classes (`bg-surface-primary`, `text-body`, `rounded-xl`, etc.).
- Legacy `pp-*` aliases in `tailwind.config.ts` are transitional and will be removed in the final cleanup round.
