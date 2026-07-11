# PPDS Elevation & Motion

## Elevation

Elevation is expressed through shadow tokens, not z-index alone.

| Token                 | Usage                     |
| --------------------- | ------------------------- |
| `--shadow-card`       | Cards, tiles              |
| `--shadow-card-hover` | Hover state on cards      |
| `--shadow-floating`   | Popovers, drawers, toasts |

## Motion

Three durations and one easing curve.

| Duration | Value | Use case              |
| -------- | ----- | --------------------- |
| Fast     | 150ms | Hover, focus, toggles |
| Normal   | 200ms | Open/close, expand    |
| Slow     | 300ms | Page transitions      |

Easing: `--ease-default: cubic-bezier(0.4, 0, 0.2, 1)`.

## Rules

- Prefer opacity and transform animations for performance.
- Respect `prefers-reduced-motion`.
- Use the same duration for the same interaction type across surfaces.
