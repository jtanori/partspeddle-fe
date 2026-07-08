# PartsPeddle Product Design System (PPDS)

This directory documents the PartsPeddle Product Design System (PPDS). It is the single source of truth for foundations, components, patterns, and surface-specific conventions used across the marketplace, seller workspace, buyer workspace, admin, support, and mobile experiences.

## File index

| File | Topic |
| ---- | ----- |
| [00-philosophy.md](./00-philosophy.md) | Ecosystem principles, marketplace vs. workspace, design principles |
| [01-design-tokens.md](./01-design-tokens.md) | Color, typography, spacing, radius, shadow, motion, and layout tokens |
| [02-layout-system.md](./02-layout-system.md) | Marketplace layout, workspace layout, regions, and density modes |
| [03-typography.md](./03-typography.md) | Type scale, fonts, usage rules, and iconography |
| [04-color-system.md](./04-color-system.md) | Semantic color roles and usage rules |
| [05-elevation-motion.md](./05-elevation-motion.md) | Shadows, z-index, and motion conventions |
| [06-component-library.md](./06-component-library.md) | Primitives, composites, workspace components, and sections |
| [07-pattern-library.md](./07-pattern-library.md) | Reusable interaction and data patterns |
| [08-marketplace-spec.md](./08-marketplace-spec.md) | Marketplace-specific conventions |
| [09-seller-workspace-spec.md](./09-seller-workspace-spec.md) | Seller workspace-specific conventions |
| [10-admin-workspace-spec.md](./10-admin-workspace-spec.md) | Admin workspace-specific conventions |
| [11-responsive-system.md](./11-responsive-system.md) | Breakpoints and responsive behavior |
| [12-accessibility.md](./12-accessibility.md) | Accessibility requirements and checks |
| [13-animation.md](./13-animation.md) | Animation principles and reduced-motion support |
| [14-content-guidelines.md](./14-content-guidelines.md) | Voice, tone, and content rules |
| [figma-mapping.md](./figma-mapping.md) | Mapping between Figma libraries and code tokens/components |

## Keeping this documentation current

- Update the relevant file when a token, component, pattern, or surface convention changes.
- Add new files to the index above with a one-line summary.
- When a component is added to Storybook, ensure it is listed in [06-component-library.md](./06-component-library.md).
- When a new token is added to `src/index.css`, mirror it in [01-design-tokens.md](./01-design-tokens.md) and any related role documentation.
