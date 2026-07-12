# Phase 9 — Toast Trigger Reference

Captured during implementation of the unified notification center.

## Direct `addToast` calls

| File | Line | Trigger | Message | Variant |
|------|------|---------|---------|---------|
| `src/hooks/useListingDraft.ts` | 86 | Autosave fails | `Failed to autosave draft. Changes may be lost.` | error |
| `src/hooks/useListingDraft.ts` | 161 | Publish succeeds | `Listing published successfully.` | success |
| `src/hooks/useListingDraft.ts` | 174 | Discard succeeds | `Draft discarded.` | info |
| `src/components/search/SearchPageClient.tsx` | 75 | Search fetch fails | `<searchError>` (e.g. `Search failed`) | error |

## `showToast` wrapper calls in the navbar

All routed through `useNavbarState.ts` and `Navbar.tsx` to `addToast` with `variant: 'info'`, `duration: 4500`.

| File | Line | User action | Message |
|------|------|-------------|---------|
| `src/components/navbar/shared/UserMenuContent.tsx` | 73 | Click watchlist | `Watchlist functionality.` |
| `src/components/navbar/shared/UserRolePanel.tsx` | 38 | Switch role | `Switched account profile context to Salvage Operator.` / `Switched account profile context to Buyer.` |
| `src/components/navbar/BottomTabBar.tsx` | 47 | Create listing while logged out | `Please log in or register to create a parts listing.` |
| `src/components/navbar/BottomTabBar.tsx` | 88 | Snap-to-list action | `Initializing AI vision modules...` |
| `src/components/navbar/shared/UserActions.tsx` | 34 | Direct messages | `Direct Messages: No new salvage communications.` |
| `src/components/navbar/shared/UserActions.tsx` | 47 | Cart while logged out | `Please log in or register to utilize the parts cart.` |
| `src/components/navbar/shared/CTAButton.tsx` | 24 | Seller onboarding CTA | `Sign up with your yard specs to list mechanical units instantly.` |
| `src/components/navbar/shared/CTAButton.tsx` | 34 | Seller onboarding CTA | `Salvage Yard Onboarding: Initializing Snap-to-List.` |
| `src/components/navbar/shared/CTAButton.tsx` | 45 | Settings/registry action | `Redirecting to registry settings terminal.` |
| `src/components/navbar/shared/CTAButton.tsx` | 54 | Create listing action | `Specify core part details to post new salvage matching listing.` |

## Notes for review

- Navbar messages are placeholder/info-only. Consider making them actionable or removing if they add no value.
- Only draft lifecycle toasts use non-info variants (success/error).
- Search error toast duplicates the inline `ErrorState` message; decide whether to keep both or consolidate.
