# PPDS Seller Workspace Specification

The seller workspace is a productivity surface built from the same PPDS foundations as the marketplace, composed into a workspace layout.

## Layout

```text
Sidebar │ Top Navigation
        │ Page Header
        │ Toolbar
        │ Content
        │ Optional Inspector
```

## Density

Compact default; dense for large tables.

## Information architecture

```text
Seller Workspace
├── Dashboard
├── Inventory
├── Listings
├── Orders
├── Customers
├── Messages
├── Analytics
├── Financial
└── Settings
```

## Sidebar structure

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

## Toolbar examples

Inventory:

```text
Filter · Sort · Search · Bulk Actions · Export · New Listing
```

Orders:

```text
Status · Shipping · Assign · Search · Export
```

## Page header

```text
Title
Subtitle          [Primary Action] [Secondary Action]
```

## Inspector examples

Listing inspector:

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

Inventory inspector:

```text
Selected Item
Warehouse
Reservations
Sales
Profit
Activity
```

## Responsive

- Desktop: full sidebar.
- Tablet: collapsed sidebar.
- Mobile: bottom navigation.
