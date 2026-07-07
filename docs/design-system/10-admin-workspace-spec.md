# PPDS Admin Workspace Specification

Admin is the third consumer of PPDS, using the same workspace layout as the seller workspace but with admin-specific navigation and denser tables.

## Layout

Same workspace shell as seller workspace.

## Density

Dense for data tables; compact elsewhere.

## Information architecture

```text
Admin Workspace
├── Dashboard
├── SCGS
├── Moderation
├── Users
├── Sellers
├── Transactions
├── System
└── Settings
```

## Key differences from seller workspace

- Navigation is task-oriented around administration and moderation.
- Tables are denser and include batch actions.
- Inspector panels surface audit trails and system metadata.
- Actions are destructive or global; require confirmation patterns.

## Components

Reuses all workspace components; adds admin-specific composites as needed.
