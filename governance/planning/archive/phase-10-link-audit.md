# Phase 10 — Link Audit & Update Plan

Status: In progress. Findings are added as each surface is reviewed; changes are planned after all reviews are complete.

---

## 1. Footer

### Current links

| Link / Action        | Current target         | Real page?    | Notes                                 |
| -------------------- | ---------------------- | ------------- | ------------------------------------- |
| Logo                 | `/` (home)             | ✅ Yes        | Valid                                 |
| Facebook icon        | `#facebook`            | ❌ No         | Should be `https://www.facebook.com`  |
| Instagram icon       | `#instagram`           | ❌ No         | Should be `https://www.instagram.com` |
| YouTube icon         | `#youtube`             | ❌ No         | Should be `https://www.youtube.com`   |
| Browse Parts         | `/listing`             | ❌ No         | Should be `/search`                   |
| All Categories       | `/` (home)             | ⚠️ Misleading | Remove                                |
| Search Parts Index   | `/listing`             | ❌ No         | Remove                                |
| New Listings         | `/listing`             | ❌ No         | Remove                                |
| About PartsPeddle    | info modal (`about`)   | ✅ Yes        | Should be `/about` page               |
| Salvage Network      | info modal (`about`)   | ✅ Yes        | Should be `/salvage-network` page     |
| Trust & Verification | info modal (`about`)   | ✅ Yes        | Should be `/trust-verification` page  |
| Contact Support      | info modal (`contact`) | ✅ Yes        | Should be `/contact` page             |
| Terms of Service     | info modal (`terms`)   | ✅ Yes        | Should be `/terms` page               |
| Privacy Policy       | info modal (`privacy`) | ✅ Yes        | Should be `/privacy` page             |
| Contact Us           | info modal (`contact`) | ✅ Yes        | Remove                                |

### Observations / user notes

- Social icons: Facebook → `https://www.facebook.com`, Instagram → `https://www.instagram.com`, YouTube → `https://www.youtube.com`.
- Browse Parts → `/search`.
- Remove: All Categories, Search Parts Index, New Listings, Contact Us.
- About PartsPeddle → `/about`.
- Salvage Network → `/salvage-network`.
- Trust & Verification → `/trust-verification`.
- Contact Support → `/contact`.
- Terms of Service → `/terms`.
- Privacy Policy → `/privacy`.
- All new pages must adhere to PPDS.

### Planned changes (footer)

- Update `src/components/Footer.tsx`:
  - Replace hash social links with the exact platform URLs above.
  - Remove "All Categories", "Search Parts Index", "New Listings", and "Contact Us" links.
  - Change "Browse Parts" target to `/search`.
  - Replace modal triggers for about/salvage/trust/contact/terms/privacy with Next.js links to new pages.
- Create new PPDS pages under `src/app/(public)/`:
  - `about/page.tsx`
  - `salvage-network/page.tsx`
  - `trust-verification/page.tsx`
  - `contact/page.tsx`
  - `terms/page.tsx`
  - `privacy/page.tsx`

---

## 2. Navbar

### Current navigation targets

| Component          | Action                  | Current target (`onChangeView`) | Resolved path           | Real page? | Notes                                                                    |
| ------------------ | ----------------------- | ------------------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------ |
| `NavLeft` / `Logo` | Click logo              | `home`                          | `/`                     | ✅ Yes     | Valid                                                                    |
| `UserActions`      | Messages icon           | n/a                             | n/a                     | n/a        | Should show messages popover; mark as TODO                               |
| `UserActions`      | Cart (logged out)       | `auth`                          | `/login` or `/register` | ✅ Yes     | AuthActions handles                                                      |
| `CTAButton`        | SELL PARTS (logged out) | `auth`                          | `/login` or `/register` | ✅ Yes     | Via AuthActions                                                          |
| `CTAButton`        | SELL PARTS (buyer)      | `listings`                      | `/listings`             | ❌ No      | Should be `/seller/create`                                               |
| `CTAButton`        | COMPLETE PROFILE        | `listings`                      | `/listings`             | ❌ No      | Remove                                                                   |
| `CTAButton`        | ADD LISTING             | `listings`                      | `/listings`             | ❌ No      | Remove                                                                   |
| `UserMenuContent`  | My Profile              | `settings`                      | `/settings`             | ❌ No      | Should be `/seller/settings`                                             |
| `UserMenuContent`  | Watchlist               | n/a                             | n/a                     | n/a        | Should take to user's watchlist route; create if it does not exist       |
| `UserMenuContent`  | My Orders               | `orders`                        | `/orders`               | ❌ No      | Should be `/seller/orders`                                               |
| `UserMenuContent`  | Support Center          | modal                           | n/a                     | ✅ Yes     | Opens support modal                                                      |
| `UserMenuContent`  | How It Works / Tour     | tour                            | n/a                     | ✅ Yes     | Opens guided tour                                                        |
| `UserMenuContent`  | Dashboard               | `listings`                      | `/listings`             | ❌ No      | Should be `/seller`                                                      |
| `UserMenuContent`  | Manage Listings         | `listings`                      | `/listings`             | ❌ No      | Should be `/seller/listings`                                             |
| `UserMenuContent`  | Manage Offers           | `listings`                      | `/listings`             | ❌ No      | Should be `/seller/listings`                                             |
| `UserMenuContent`  | Seller Settings         | `settings`                      | `/settings`             | ❌ No      | Should be `/seller/settings`                                             |
| `UserMenuContent`  | Log Out                 | logout                          | n/a                     | ✅ Yes     | Handled by auth store                                                    |
| `MobileNavbar`     | Logo                    | `home`                          | `/`                     | ✅ Yes     | Valid                                                                    |
| `MobileNavbar`     | Browse                  | `listing`                       | `/listing`              | ❌ No      | Should be `/search`                                                      |
| `MobileNavbar`     | Search icon             | modal                           | n/a                     | ✅ Yes     | Opens search modal                                                       |
| `BottomTabBar`     | Feed                    | `home`                          | `/`                     | ✅ Yes     | Valid; text should be "Home"                                             |
| `BottomTabBar`     | Search                  | `listing`                       | `/listing`              | ❌ No      | Should be `/search`                                                      |
| `BottomTabBar`     | Orders                  | `orders`                        | `/orders`               | ❌ No      | Should be `/seller/orders`                                               |
| `BottomTabBar`     | Garage                  | `profile`                       | `/profile`              | ❌ No      | No profile page exists; add user profile route; text should be "Profile" |
| `BottomTabBar`     | Sell action (manual)    | `/dashboard`                    | `/dashboard`            | ✅ Yes     | Valid dashboard route                                                    |
| `BottomTabBar`     | Sell action (snap)      | `/dashboard`                    | `/dashboard`            | ✅ Yes     | Valid dashboard route                                                    |
| `MobileNavDrawer`  | Log In                  | `auth` → `/login`               | `/login`                | ✅ Yes     | Valid                                                                    |
| `MobileNavDrawer`  | Sign Up                 | `auth` → `/register`            | `/register`             | ✅ Yes     | Valid                                                                    |
| `MobileNavDrawer`  | How It Works            | tour                            | n/a                     | ✅ Yes     | Opens guided tour                                                        |
| `MobileNavDrawer`  | Support                 | modal                           | n/a                     | ✅ Yes     | Opens support modal                                                      |
| `NavbarSearch`     | Search submit           | `/search`                       | `/search`               | ✅ Yes     | Valid                                                                    |

### Observations

- Many seller-facing menu items route to `listings` which resolves to `/listings` (no page). They should route into the `(seller)` route group (`/seller/...`).
- `settings` resolves to `/settings` instead of `/seller/settings`.
- `orders` resolves to `/orders` instead of `/seller/orders`.
- `profile` resolves to `/profile` which does not exist; a user profile route should be created.
- Mobile "Browse" and "Search" bottom tabs both point to `/listing`.
- All internal navigation must use Next.js `Link` and `useRouter` per [Next.js linking and navigating standards](https://nextjs.org/docs/app/getting-started/linking-and-navigating).

### Planned changes (navbar)

- `src/components/navbar/shared/CTAButton.tsx`:
  - buyer "SELL PARTS" → `/seller/create`
  - Remove "COMPLETE PROFILE"
  - Remove "ADD LISTING"
- `src/components/navbar/shared/UserMenuContent.tsx`:
  - My Profile → `/seller/settings`
  - Watchlist → user's watchlist route/page (create if needed)
  - My Orders → `/seller/orders`
  - Dashboard → `/seller`
  - Manage Listings → `/seller/listings`
  - Manage Offers → `/seller/listings`
  - Seller Settings → `/seller/settings`
  - Messages icon → messages popover (TODO)
- `src/components/navbar/shared/MobileNavbar.tsx`:
  - Browse → `/search`
- `src/components/navbar/BottomTabBar.tsx`:
  - Feed tab label → "Home"
  - Search tab → `/search`
  - Orders tab → `/seller/orders`
  - Garage tab label → "Profile"; route to new user profile route/page
- Create new public user profile route/page for the Garage/Profile tab.
- Replace any `window.location` or raw `<a>` internal navigation with Next.js `Link` / `useRouter`.

---

## 3. Homepage

### Current links

| Component          | Action                      | Target                  | Real page? | Notes                                                |
| ------------------ | --------------------------- | ----------------------- | ---------- | ---------------------------------------------------- |
| `ListingsGrid`     | View All                    | `/search`               | ✅ Yes     | Should be `/search` with relevant filter arguments   |
| `ListingsGrid`     | Empty state action          | `/search`               | ✅ Yes     | Should be `/search` with relevant filter arguments   |
| `FeaturedSellers`  | View Inventory (per seller) | `/search`               | ✅ Yes     | Should be public seller profile route/page           |
| `FeaturedSellers`  | Empty state action          | `/register?role=seller` | ✅ Yes     | Valid                                                |
| `FinalCTA`         | Start Searching             | `/search`               | ✅ Yes     | Valid                                                |
| `FinalCTA`         | Yard Registry Signup        | `/register?role=seller` | ✅ Yes     | Valid                                                |
| `HighFidelityHero` | SEARCH INVENTORY            | `/search`               | ✅ Yes     | Valid                                                |
| `HighFidelityHero` | SELL PARTS (logged in)      | `/dashboard`            | ✅ Yes     | Should be new listing route (e.g., `/seller/create`) |
| `HighFidelityHero` | SELL PARTS (logged out)     | `/register?role=seller` | ✅ Yes     | Valid                                                |

### Observations

- `ListingsGrid` "View All" and empty-state action should carry relevant filter arguments when navigating to `/search`.
- `FeaturedSellers` "View All" should be removed because there is no sellers listing page.
- `FeaturedSellers` "View Inventory" should navigate to the seller's public profile route/page.
- `HighFidelityHero` "SELL PARTS" (logged in) should route to the new-listing route (e.g., `/seller/create`), not `/dashboard`.
- All internal navigation must use Next.js `Link` and `useRouter` standards.

### Planned changes (homepage)

- `src/components/home/ListingsGrid.tsx`:
  - Pass relevant filter arguments when navigating to `/search`.
- `src/components/home/FeaturedSellers.tsx`:
  - Remove the "View All" link/action.
  - Change "View Inventory" to the public seller profile route/page.
- `src/components/home/HighFidelityHero.tsx`:
  - Change logged-in "SELL PARTS" target from `/dashboard` to `/seller/create`.

---

## 4. Search Page

### Current links

| Component          | Action          | Target            | Real page? | Notes                                                        |
| ------------------ | --------------- | ----------------- | ---------- | ------------------------------------------------------------ |
| `GridResultsView`  | Part card click | `/listing/${id}`  | ✅ Yes     | Valid                                                        |
| `ListResultsView`  | Part card click | `/listing/${id}`  | ✅ Yes     | Valid                                                        |
| `SearchNoResults`  | Clear Search    | reloads `/search` | ✅ Yes     | Valid                                                        |
| `SearchPageClient` | Pagination      | `/search?page=N`  | ✅ Yes     | Valid                                                        |
| `SellerGridCard`   | View Inventory  | caller-defined    | ⚠️ Pending | Should link to seller public profile route; currently unused |

### Observations

- Part cards route to valid PDP routes and pagination stays on `/search`.
- `SellerGridCard` "View Inventory" should navigate to the seller's public profile route/page.

### Planned changes (search page)

- `src/components/search/SellerGridCard.tsx`:
  - Wire "View Inventory" to the public seller profile route/page.
- Create public seller profile route/page if it does not exist (also required by PDP `SellerSupportCard`).

---

## 5. Live Search

### Current links

| Suggestion type              | Command target            | Real page? | Notes                               |
| ---------------------------- | ------------------------- | ---------- | ----------------------------------- |
| `product`                    | `/listing/${id}`          | ✅ Yes     | Valid                               |
| `vehicle`                    | `/search?${metadata}`     | ✅ Yes     | Valid if metadata is a query string |
| `system`                     | `/search?system=...`      | ✅ Yes     | Valid                               |
| `part_type`                  | `/search?partType=...`    | ✅ Yes     | Valid                               |
| `manufacturer`               | `/search?fitmentMake=...` | ✅ Yes     | Valid                               |
| `vin`                        | `/decode-vin?vin=...`     | ❌ No      | `/decode-vin` page does not exist   |
| `part_number`                | `/search?q=...`           | ✅ Yes     | Valid                               |
| "Search anyway" / "View all" | `/search?q=...`           | ✅ Yes     | Valid                               |

### Observations

Only the VIN decode route is broken. The rest route to valid search or PDP pages.

### Planned changes (live search)

- `src/components/search/utils/search-command-registry.ts`:
  - Either create `/decode-vin` page, or route VIN suggestions to `/search?q=<vin>` until a decoder exists.

---

## 6. PDP

### Components reviewed

| Component                                                     | Link / Action                   | Current target | Real page? | Notes                                                           |
| ------------------------------------------------------------- | ------------------------------- | -------------- | ---------- | --------------------------------------------------------------- |
| `PDPRoot`                                                     | Breadcrumb: Home                | `/`            | ✅ Yes     | Valid                                                           |
| `PDPRoot`                                                     | Breadcrumb: Search results      | `/search`      | ✅ Yes     | Valid                                                           |
| `PDPRoot`                                                     | Breadcrumb: Category (subtitle) | `#`            | ❌ No      | Hash placeholder; should link to `/search` with category filter |
| `PDPRoot`                                                     | Breadcrumb: Part title          | n/a            | n/a        | Current page, no link needed                                    |
| `DescriptionFitmentPanel`                                     | "View all compatible vehicles"  | n/a            | ❌ No      | Button with no action; create dedicated route/page              |
| `CompatibleParts`                                             | "View more compatible parts"    | n/a            | ❌ No      | Button with no action; create dedicated route/page              |
| `RecentlyViewed`                                              | "View all recently viewed"      | n/a            | ❌ No      | Button with no action; create dedicated route/page              |
| `NeedHelp`                                                    | Live Chat                       | n/a            | ❌ No      | Button with no action; create chat route/page                   |
| `NeedHelp`                                                    | Call Us                         | n/a            | ❌ No      | Button with no action; should trigger `tel:` action             |
| `NeedHelp`                                                    | Email Us                        | n/a            | ❌ No      | Button with no action; should trigger `mailto:` action          |
| `SellerSupportCard`                                           | Seller name / avatar            | n/a            | ❌ No      | Not clickable; create public seller profile route/page          |
| `PriceBlock`                                                  | Add to Cart                     | cart store     | ✅ Yes     | Valid (local state)                                             |
| `ProductGallery`                                              | Thumbnail click                 | local state    | ✅ Yes     | Valid (local state)                                             |
| `ProductHeader`, `TrustBar`, `TrustSummaryStrip`, `TabSystem` | —                               | —              | ✅ Yes     | No links                                                        |

### Observations

- The category breadcrumb uses a `#` placeholder. It should link to `/search` with the part category as a query parameter.
- Several sidebar/secondary actions are buttons without `onClick` handlers. Each needs a real route/page or action:
  - Compatible vehicles page
  - Compatible parts page
  - Recently viewed page
  - Live chat page or modal
  - Call Us → `tel:` action
  - Email Us → `mailto:` action
- The seller card in `SellerSupportCard` is not clickable. A public seller profile route/page should be created and the seller name/avatar should link to it.

### Planned changes (PDP)

- `src/components/pdp-modern/PDPRoot.tsx`:
  - Replace category breadcrumb `#` with `/search?category=<category>` using the part category from the view model.
- `src/components/pdp-modern/DescriptionFitmentPanel.tsx`:
  - Wire "View all compatible vehicles" to a new compatible-vehicles route/page.
- `src/components/pdp-modern/CompatibleParts.tsx`:
  - Make each part row a link to `/listing/${part.id}`.
  - Wire "View more compatible parts" to a new compatible-parts route/page.
- `src/components/pdp-modern/RecentlyViewed.tsx`:
  - Make each part row a link to `/listing/${part.id}`.
  - Wire "View all recently viewed" to a new recently-viewed route/page.
- `src/components/pdp-modern/NeedHelp.tsx`:
  - Wire Live Chat to a new chat route/page or support modal.
  - Convert Call Us to `tel:+18005550199`.
  - Convert Email Us to `mailto:support@partspeddle.com`.
- `src/components/pdp-modern/SellerSupportCard.tsx`:
  - Make seller name/avatar a link to a new public seller profile route/page.
- Create new public routes/pages as needed:
  - Seller profile page
  - Compatible vehicles page
  - Compatible parts page
  - Recently viewed page
  - Live chat page

---

## 7. Auth Pages

### Components reviewed

| Component       | Link / Action                | Current target          | Real page? | Notes                                               |
| --------------- | ---------------------------- | ----------------------- | ---------- | --------------------------------------------------- |
| `AuthPageShell` | BrandStoryColumn logo click  | `/`                     | ✅ Yes     | Valid                                               |
| `AuthPageShell` | Mobile header logo           | `/`                     | ✅ Yes     | Valid                                               |
| `AuthPageShell` | "RETURN TO HOME"             | `/`                     | ✅ Yes     | Valid                                               |
| `AuthPageShell` | `AuthFooter` (rendered)      | footer links            | mixed      | See `AuthFooter` below                              |
| `AuthFooter`    | Terms of Use                 | `/terms`                | ✅ Yes     | Will navigate to `/terms` page once created         |
| `AuthFooter`    | Privacy Policy               | `/privacy`              | ✅ Yes     | Will navigate to `/privacy` page once created       |
| `AuthFooter`    | Support Desk                 | `/contact`              | ✅ Yes     | Will navigate to `/contact` page once created       |
| `LoginPage`     | "Join Now →"                 | `/register`             | ✅ Yes     | Valid                                               |
| `LoginPage`     | Post-login redirect (seller) | `/seller`               | ✅ Yes     | Valid if seller dashboard exists                    |
| `LoginPage`     | Post-login redirect (buyer)  | `/dashboard`            | ✅ Yes     | Valid                                               |
| `RegisterPage`  | "Sign In →"                  | `/login`                | ✅ Yes     | Valid                                               |
| `RegisterPage`  | Terms of Service link        | `/terms`                | ✅ Yes     | Will navigate to `/terms` page once created         |
| `RegisterPage`  | Privacy Policy link          | `/privacy`              | ✅ Yes     | Will navigate to `/privacy` page once created       |
| `RegisterPage`  | Post-register redirect       | `/login`                | ✅ Yes     | Valid                                               |
| `SocialButtons` | Google / Facebook / Apple    | `onSocialClick` handler | ✅ Yes     | OAuth handler; same behavior as footer social links |

### Observations

- `AuthFooter` "Back to Store" should be removed.
- `AuthFooter` Terms of Use and Privacy Policy should navigate to the new `/terms` and `/privacy` pages once created.
- `AuthFooter` Support Desk should navigate to the new `/contact` page once created.
- `RegisterPage` Terms of Service and Privacy Policy links should navigate to the new `/terms` and `/privacy` pages once created.
- `SocialButtons` behavior matches the regular footer social links (OAuth / external platform URLs handled by caller).
- No other broken auth links.

### Planned changes (auth pages)

- `src/components/auth/AuthFooter.tsx`:
  - Remove "Back to Store" link.
  - Keep Terms of Use → `/terms`.
  - Keep Privacy Policy → `/privacy`.
  - Change Support Desk target from `/support` to `/contact`.
- `src/app/(auth)/register/page.tsx`:
  - Links to `/terms` and `/privacy` will resolve once the new pages are created.

---

## 8. Consolidated Implementation Plan

### Goal

Fix every broken, misleading, or placeholder link identified above, create the missing public pages, and keep all changes scoped to Phase 10.

### Cross-cutting standard

All navigation must follow [Next.js linking and navigating standards](https://nextjs.org/docs/app/getting-started/linking-and-navigating). Choose the strategy based on the link type:

| Link type                       | Recommended strategy                                                 | Notes                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Internal route (declarative)    | `<Link href="...">` from `next/link`                                 | Enables prefetching and client-side transitions. Use for nav items, cards, breadcrumbs, footer links, etc.   |
| Internal route (programmatic)   | `useRouter` from `next/navigation` (`router.push`, `router.replace`) | Use for form redirects, auth redirects, logout, or button-driven navigation.                                 |
| URL-only update (no navigation) | `window.history.pushState` / `replaceState`                          | Use for filters, sorting, tabs, or locale switches where the page should not reload.                         |
| External URL                    | Native `<a href="..." target="_blank" rel="noopener noreferrer">`    | Use for social media links, external support sites, etc.                                                     |
| Telephone / email               | Native `<a href="tel:...">` / `<a href="mailto:...">`                | Use for Call Us and Email Us buttons.                                                                        |
| Dynamic routes                  | Add `loading.tsx` for partial prefetching and streaming              | Recommended for seller profile, compatible vehicles/parts, and other dynamic routes.                         |
| Large lists of links            | `<Link prefetch={false}>` or hover-prefetch                          | Avoid prefetching every item in long lists (e.g., search results grid). Prefetch on hover where appropriate. |

Avoid `window.location` and raw `<a href>` for internal routes.

### Recommended order of work

1. **Create missing public pages** (so every new link has a destination)
   - `src/app/(public)/about/page.tsx`
   - `src/app/(public)/salvage-network/page.tsx`
   - `src/app/(public)/trust-verification/page.tsx`
   - `src/app/(public)/contact/page.tsx`
   - `src/app/(public)/terms/page.tsx`
   - `src/app/(public)/privacy/page.tsx`
   - Public user profile route/page (e.g., `src/app/(public)/profile/page.tsx` or `/user/profile`)
   - Public seller profile route/page (e.g., `src/app/(public)/seller/[id]/page.tsx`)
   - PDP-related routes/pages:
     - Compatible vehicles page
     - Compatible parts page
     - Recently viewed page
     - Live chat page
   - Watchlist route/page
   - All pages must follow PPDS (use existing public-page shell, typography, spacing, and color tokens).

2. **Homepage**
   - `src/components/home/ListingsGrid.tsx`: pass relevant filter arguments to `/search`.
   - `src/components/home/FeaturedSellers.tsx`:
     - Remove "View All".
     - "View Inventory" → public seller profile route/page.
   - `src/components/home/HighFidelityHero.tsx`: logged-in "SELL PARTS" → `/seller/create`.

3. **Footer** — `src/components/Footer.tsx`
   - Replace `#facebook` → `https://www.facebook.com`.
   - Replace `#instagram` → `https://www.instagram.com`.
   - Replace `#youtube` → `https://www.youtube.com`.
   - Remove: "All Categories", "Search Parts Index", "New Listings", "Contact Us".
   - "Browse Parts" → `/search`.
   - Replace modal triggers with Next.js links to the new public pages.

4. **Navbar**
   - `src/components/navbar/shared/CTAButton.tsx`:
     - buyer "SELL PARTS" → `/seller/create`
     - Remove "COMPLETE PROFILE"
     - Remove "ADD LISTING"
   - `src/components/navbar/shared/UserMenuContent.tsx`:
     - My Profile → `/seller/settings`
     - Watchlist → watchlist route/page
     - My Orders → `/seller/orders`
     - Dashboard → `/seller`
     - Manage Listings → `/seller/listings`
     - Manage Offers → `/seller/listings`
     - Seller Settings → `/seller/settings`
     - Messages icon → messages popover (TODO)
   - `src/components/navbar/shared/MobileNavbar.tsx`:
     - Browse → `/search`
   - `src/components/navbar/BottomTabBar.tsx`:
     - Feed tab label → "Home"
     - Search tab → `/search`
     - Orders tab → `/seller/orders`
     - Garage tab label → "Profile"; route to new user profile route/page
   - Replace any `window.location` or raw `<a>` internal navigation with Next.js `Link` / `useRouter`.

5. **Live Search** — VIN route
   - `src/components/search/utils/search-command-registry.ts`
   - Route VIN suggestions to `/search?q=<vin>` until `/decode-vin` exists.

6. **PDP** — breadcrumb, action wiring, and new routes
   - `src/components/pdp-modern/PDPRoot.tsx`: category breadcrumb → `/search?category=<category>`.
   - `src/components/pdp-modern/DescriptionFitmentPanel.tsx`: "View all compatible vehicles" → compatible-vehicles route/page.
   - `src/components/pdp-modern/CompatibleParts.tsx`:
     - Part rows → `/listing/${part.id}`.
     - "View more compatible parts" → compatible-parts route/page.
   - `src/components/pdp-modern/RecentlyViewed.tsx`:
     - Part rows → `/listing/${part.id}`.
     - "View all recently viewed" → recently-viewed route/page.
   - `src/components/pdp-modern/NeedHelp.tsx`:
     - Live Chat → chat route/page or support modal.
     - Call Us → `tel:+18005550199`.
     - Email Us → `mailto:support@partspeddle.com`.
   - `src/components/pdp-modern/SellerSupportCard.tsx`: seller name/avatar → public seller profile route/page.

7. **Search Page**
   - `src/components/search/SellerGridCard.tsx`: "View Inventory" → public seller profile route/page.

8. **Auth footer**
   - `src/components/auth/AuthFooter.tsx`:
     - Remove "Back to Store".
     - Change `/support` to `/contact`.
     - Keep `/terms` and `/privacy` links.
   - `src/app/(auth)/register/page.tsx`: `/terms` and `/privacy` links will resolve once the new pages are created.

### Verification approach

- The operator will run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck` after implementation.
- I will not run those commands unless explicitly asked.
- After verification passes, I will stage, commit, push, and open a PR.

### Scope exclusions

- Seller-scoped search (`/search?sellerId=<id>`) remains optional.
- `/decode-vin` page creation is deferred.
- No changes to OAuth handlers, cart logic, or guided tour.
