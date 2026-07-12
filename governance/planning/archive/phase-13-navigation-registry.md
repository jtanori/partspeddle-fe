# Phase 13 — PPDS Navigation Registry (PNR)

**Date:** 2026-07-09
**Branch:** `feat/phase-13-navigation-registry`
**Base:** `develop`
**Goal:** Replace scattered route strings with a governed Navigation Registry that generates URLs, menus, breadcrumbs, sitemaps, and metadata.

---

## Problem

PartsPeddle currently hardcodes paths across components:

```tsx
<Link href="/contact" />;
router.push('/dashboard/orders');
redirect('/seller/listings');
```

This causes:

- Duplicated paths
- Broken links after refactors
- Inconsistent breadcrumbs
- Dead pages
- Route permissions spread everywhere
- Manual sitemap maintenance

Surfaces affected:

- Marketplace
- Workspace
- Auth
- Editorial pages
- Seller flows
- Buyer flows
- Admin
- Future Help Center / API docs / Wizard flows

---

## Concept

Instead of route constants, build a **Navigation Registry** where every page is a typed route object:

```ts
EditorialRoutes.contact = {
  id: 'contact',
  path: '/contact',
  title: 'Contact',
  section: 'company',
  visibility: 'public',
  layout: 'editorial',
};
```

Usage:

```tsx
<Link href={routes.editorial.contact.href()}>
```

---

## Route Object Schema

```ts
RouteDefinition {
  id
  name
  path
  title
  description
  visibility        // public | authenticated | seller | admin
  layout
  breadcrumbs
  parent
  featureFlag
  permissions
  searchable
  sitemap
}
```

---

## Dynamic Routes

```ts
Parts.Detail.href({ partId: '123' }); // → /parts/123
Seller.Listing.Media.href({ listingId: '456' }); // → /seller/listings/456/photos
```

Typed parameters prevent missing path segments at compile time.

---

## Proposed Directory Structure

```
src/navigation/
  registry/
    marketplace.ts
    workspace.ts
    editorial.ts
    support.ts
    auth.ts
    admin.ts
  builders/
    route-builder.ts
    breadcrumb-builder.ts
    menu-builder.ts
    sitemap-builder.ts
    metadata-builder.ts
  guards/
    permissions.ts
    feature-flags.ts
  generated/
    sitemap.xml
    routes.ts
    metadata.ts
  components/
    Breadcrumbs.tsx
    NavigationMenu.tsx
    SidebarMenu.tsx
    FooterNavigation.tsx
  hooks/
    useBreadcrumbs()
    useNavigation()
    useRoute()
  index.ts
```

---

## Semantic Navigation Graph

Model navigation as a graph, not a tree. A page can belong to multiple sections:

- Trust Verification → Company / Trust & Safety
- Trust Verification → Seller Resources
- Trust Verification → Buyer Resources
- Trust Verification → Support
- Trust Verification → Footer → Company

Edges carry semantics: `NAVIGATION`, `RELATED`, `PARENT`, `NEXT`, `CTA`.

---

## Consumers

| Consumer         | Registry Output                 |
| ---------------- | ------------------------------- |
| Navbar           | `navigation.main()`             |
| Footer           | `navigation.footer()`           |
| Sidebar          | `navigation.workspace()`        |
| Breadcrumbs      | `navigation.breadcrumbs(route)` |
| Sitemap          | `navigation.sitemap()`          |
| robots.txt       | `navigation.robots()`           |
| SEO metadata     | `navigation.metadata(route)`    |
| Algolia indexing | `navigation.searchable()`       |
| Support chatbot  | `navigation.resolve(query)`     |
| Analytics        | route IDs                       |

---

## Integration with Existing Systems

- **Capability Registry:** capabilities declare which routes they expose.
- **SCGS:** generated sitemap and metadata feed into governance checks.
- **Product Constitution:** navigation rules live next to capability rules.

---

## Work Items

1. Define `RouteDefinition` and `RouteBuilder<T>` types.
2. Create registry files for marketplace, workspace, editorial, support, auth, admin.
3. Build `href()` generators with typed parameters.
4. Implement breadcrumb builder from route hierarchy.
5. Implement menu builders for navbar, footer, sidebar.
6. Implement sitemap and robots generators.
7. Implement metadata builder.
8. Add permission and feature-flag guards.
9. Replace hardcoded paths in existing components incrementally.
10. Add tests for route generation, breadcrumbs, and guards.

---

## Acceptance Criteria

- [ ] No new hardcoded paths introduced.
- [ ] All existing public pages are in the registry.
- [ ] Breadcrumbs are generated automatically.
- [ ] `sitemap.xml` is generated from the registry.
- [ ] TypeScript enforces required dynamic parameters.
- [ ] Feature flags and permissions hide routes consistently.
- [ ] Tests cover route generation, guards, and builders.
