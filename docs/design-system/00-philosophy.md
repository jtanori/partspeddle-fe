# PPDS Philosophy

PartsPeddle Product Design System (PPDS) is the single operating system for every product surface.

## One ecosystem

The product is not a sequence of disconnected pages. It is one ecosystem with multiple consumers:

```text
PartsPeddle
├── Marketplace
├── Seller Workspace
├── Buyer Workspace
├── Admin
├── Support
└── Mobile
```

Everything shares the same foundations:

- colors
- typography
- spacing
- elevation
- motion
- interaction patterns
- information architecture

Only density and composition change between surfaces.

## Marketplace vs. Workspace

| Concern    | Marketplace         | Workspace         |
| ---------- | ------------------- | ----------------- |
| Density    | Comfortable         | Compact           |
| Layout     | Centered, editorial | Sidebar + grid    |
| Goal       | Discovery, trust    | Productivity      |
| Navigation | Header + footer     | Sidebar + top bar |
| Panels     | Sticky action card  | Inspector panel   |

## Design principles

1. **Tokens first.** No hardcoded colors, spacing, radii, or shadows inside pages.
2. **Components, not pages.** Build primitives, composites, and sections; pages are compositions.
3. **Density, not duplication.** One component supports comfortable, compact, and dense modes.
4. **Progressive disclosure.** Inspector panels and toolbars keep the workspace focused.
5. **AI-assisted, human-approved.** AI suggests; users confirm.
6. **Accessible by default.** Keyboard, focus, ARIA, reduced motion, high contrast.

## Status

PPDS is being established in P5.0. Foundations and the core component library are in place; marketplace convergence, workspace layout, and the listing draft are the remaining phases.
