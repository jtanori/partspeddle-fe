# PPDS Animation

## Principles

- Animation clarifies, never decorates.
- Prefer opacity and transform.
- Respect reduced motion.

## Durations

- Fast: 150ms — hover, focus, toggles.
- Normal: 200ms — open/close, expand.
- Slow: 300ms — page transitions.

## Easing

`--ease-default: cubic-bezier(0.4, 0, 0.2, 1)`

## Common patterns

- Fade in: opacity 0 → 1.
- Slide in: translateX/Y offset → 0.
- Scale press: scale 1 → 0.98 on active.
- Skeleton pulse: opacity/shimmer animation.

## Reduced motion

When `prefers-reduced-motion: reduce` is active, disable transitions and animations except for essential feedback.
