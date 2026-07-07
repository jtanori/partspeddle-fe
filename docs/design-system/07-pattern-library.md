# PPDS Pattern Library

## Loading

Always use skeletons that match the final layout dimensions. Never use spinners for initial page loads.

Lifecycle:

```text
Loading → Skeleton → Interactive → Saving → Saved → Error → Recovered
```

## Autosave

Every edit:

```text
local state → optimistic update → server sync → success indicator
```

Users rarely press Save.

## Search

The top search bar is a global command palette.

Supports:

- Inventory
- Listings
- Orders
- Vehicles
- VIN
- Part numbers
- Customers
- Messages
- Commands

## Notifications

One unified notification center:

- Messages
- Orders
- AI Suggestions
- Warnings
- System
- Shipments

## Draft model

Listings, orders, and other complex entities are drafts until explicitly published/submitted.

Draft UI shows:

- Completion percentage
- Modules completed
- Modules needing attention
- Publish/submit action

## Inspector pattern

Every workspace page has an optional right inspector panel that surfaces context, recommendations, and actions for the current selection.
