# P5.0 Phase 9 — UX Polish

**Goal:** Remove remaining spinner loading states, add sticky action/filter panels, standardize empty/error/responsive states, and wire a unified notification center.

**Estimated scope:** 0.5–1 sprint.

---

## 1. Replace spinners with skeletons

Current spinner usage:

| File                                                 | Current                  | Replacement                                                                            |
| ---------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| `src/app/(public)/loading.tsx`                       | `MainLoadingIndicator`   | Marketplace shell skeleton (header placeholder + hero skeleton + grid skeletons)       |
| `src/app/(public)/search/loading.tsx`                | `InlineLoadingIndicator` | `Skeleton.SearchResult` list + filter sidebar skeleton                                 |
| `src/components/providers/AuthProvider.tsx`          | `MainLoadingIndicator`   | Minimal centered skeleton or fade-in (avoid full page spinner)                         |
| `src/components/ProductSidebar.tsx`                  | `InlineLoadingIndicator` | Filter card skeleton using `Skeleton.Text` and `Skeleton` blocks                       |
| `src/components/catalog/detail/NegotiationModal.tsx` | `InlineLoadingIndicator` | Keep spinner for transient modal action, OR replace with inline skeleton in modal body |

**Decisions needed:**

- Keep `Loader2` for button loading states and inline actions (skeletons are for content, not actions).
- Delete `InlineLoadingIndicator.tsx` and `MainLoadingIndicator.tsx` once no longer imported.

---

## 2. Add sticky action/filter panels

**Search page (`src/components/search/SearchPageClient.tsx`):**

- Make the results header (count, sort, view toggle) sticky on scroll.
- Keep filter sidebar naturally sticky or make it `sticky top-0` within its column.

**Seller pages:**

- `src/app/(seller)/seller/inventory/page.tsx` — make the toolbar/filter bar sticky.
- `src/app/(seller)/seller/create/page.tsx` — make the publish/back toolbar sticky on mobile.

**Pattern:** introduce a reusable `StickyPanel` wrapper in `src/components/workspace/` or use `sticky top-[top-nav-height]` classes consistently.

---

## 3. Improve empty/error/responsive states

**Empty states:**

- Replace one-off empty markup with the existing `EmptyState` component where appropriate.
- Update `EmptyState` to use the canonical `Button` component instead of a raw `<button>`.
- Add empty states for:
  - `InventoryTable` when no parts
  - Seller listings page when no listings
  - Search results (replace/extend `SearchNoResults`)

**Error states:**

- Add a reusable `ErrorState` component in `src/components/common/ErrorState.tsx`.
- Use it in:
  - `SearchPageClient` when `searchError` is set
  - `useListingDraft` save error UI
  - Seller inventory fetch failures

**Responsive states:**

- Audit `SearchPageClient` for mobile layout gaps.
- Ensure seller workspace pages collapse correctly on tablet/mobile.

---

## 4. Implement unified notification center

**Current state:**

- `src/components/ui/toast.tsx` has a `Toast` component but `ToastProvider` is a no-op.
- `src/components/navbar/Navbar.tsx` has its own local `showToast` used only in navbar actions.

**Plan:**

1. Implement a real `ToastProvider` in `src/components/ui/toast.tsx`:
   - In-memory toast queue.
   - `useToast()` hook to add/dismiss toasts.
   - Render toasts in a fixed bottom-right (desktop) / bottom (mobile) container.
2. Replace navbar's local toast with the global hook.
3. Add toast calls for high-value events:
   - Draft saved / published / discarded in `useListingDraft`
   - Search error in `SearchPageClient`
   - Copy-to-clipboard, wishlist, cart actions in navbar

---

## Files touched

- `src/app/(public)/loading.tsx`
- `src/app/(public)/search/loading.tsx`
- `src/components/providers/AuthProvider.tsx`
- `src/components/ProductSidebar.tsx`
- `src/components/catalog/detail/NegotiationModal.tsx`
- `src/components/common/InlineLoadingIndicator.tsx` (delete)
- `src/components/common/MainLoadingIndicator.tsx` (delete)
- `src/components/common/EmptyState.tsx`
- `src/components/common/ErrorState.tsx` (new)
- `src/components/search/SearchPageClient.tsx`
- `src/components/search/SearchNoResults.tsx`
- `src/components/seller-dashboard/InventoryTable.tsx`
- `src/app/(seller)/seller/inventory/page.tsx`
- `src/app/(seller)/seller/create/page.tsx`
- `src/app/(seller)/seller/listings/page.tsx`
- `src/components/workspace/` (possible `StickyPanel` addition)
- `src/components/ui/toast.tsx`
- `src/components/navbar/Navbar.tsx`
- `src/hooks/useNavbarState.ts`
- `src/app/layout.tsx` (wrap with `ToastProvider`)

## Testing strategy

Create `tests/branch/p5-ux-polish/ux-polish.test.tsx` covering:

- `loading.tsx` files no longer import `MainLoadingIndicator` / `InlineLoadingIndicator`.
- `AuthProvider` no longer renders `MainLoadingIndicator`.
- `EmptyState` uses `Button` from `@/components/ui/button`.
- `ErrorState` component exists and renders title/description/action.
- `ToastProvider` is rendered in `src/app/layout.tsx`.
- `useToast()` hook exists and can queue/dismiss toasts.
- At least one seller page uses a sticky header/panel class.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

---

# P5.0 Phase 10 — Link updates across surfaces

**Goal:** Audit and update links in footer, navigation, homepage, search page, live search, PDP page, and auth pages.

**Status:** Reserved for the next phase; detailed plan will be created once Phase 9 is complete.

**Surfaces to review:**

- Footer
- Navigation (navbar / sidebar / mobile nav)
- Homepage
- Search page
- Live search / command palette
- PDP (product detail page)
- Auth pages (login / register / password reset)
