# PPDS Layout System

PPDS provides two layout families that share the same spacing tokens.

## Marketplace layout

Centered, editorial, wide margins.

```text
Header
Hero
Content
Footer
```

Primitives:

- `Container` — max 1440px, centered.
- `Content` — max 1280px, centered, responsive padding.
- `MainGrid` — 12-column grid with 24px gutters.
- `Section` — vertical section padding.
- `Stack` — vertical flex with token gaps.

## Workspace layout

Productivity-oriented, persistent chrome.

```text
Sidebar │ Top Navigation
        │ Page Header
        │ Toolbar
        │ Content
        │ Optional Inspector
```

Components:

- `WorkspaceLayout` — sidebar + top nav + content + optional inspector.
- `Sidebar` — task-oriented navigation.
- `TopNavigation` — global search, notifications, messages, tasks, profile.
- `PageHeader` — title + subtitle + primary/secondary actions.
- `Toolbar` — page-specific filters and actions.
- `InspectorPanel` — contextual right panel.

## Workspace regions

### Sidebar

Task-oriented, not a generic menu.

```text
Logo
Search
────────────
Dashboard
Inventory
Listings
Orders
Messages
Analytics
────────────
Tools
Imports
Exports
Pricing
────────────
Settings
Help
Account
```

### Top navigation

Global elements only. No page-specific controls.

- Search
- Notifications
- Messages
- Tasks
- Profile
- Quick Actions

### Toolbar

Page-specific actions and filters.

Example for Inventory:

```text
Filter · Sort · Search · Bulk Actions · Export · New Listing
```

### Page header

```text
Title
Subtitle          [Primary Action] [Secondary Action]
```

### Inspector panel

Contextual information for the current selection or page.

Example for Listing:

```text
Completion
Publishing Status
Market Value
Suggested Price
Inventory
Shipping Estimate
Compatibility
SEO Score
```

## Density modes

Every workspace component supports three densities via a `DensityProvider`:

| Mode        | Use case                  |
| ----------- | ------------------------- |
| Comfortable | Marketplace, empty states |
| Compact     | Dashboard default         |
| Dense       | Large tables, data grids  |

Density changes padding, gap, and font size through token overrides; components do not change structure.
