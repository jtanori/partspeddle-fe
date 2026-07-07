# PPDS Accessibility

Every component must support:

- Keyboard navigation
- Focus management
- ARIA labels and roles
- Reduced motion (`prefers-reduced-motion`)
- High contrast / forced colors mode
- Touch targets ≥ 44×44px
- Logical heading hierarchy

## Requirements

- One `h1` per page.
- Logical `h2`/`h3` order.
- All interactive elements keyboard reachable.
- Focus indicators visible.
- Color not the sole means of conveying information.
- Form inputs have associated labels.
- Images have alt text.

## Testing

- Automated: axe-core via branch tests.
- Manual: keyboard-only navigation check for new pages.
