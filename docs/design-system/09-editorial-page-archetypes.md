# Editorial Page Archetypes

Public editorial pages on PartsPeddle share a common visual language but serve different content
purposes. To keep future pages consistent without copy-pasting layout code, we use canonical
**Editorial Page Archetypes**.

Each archetype is implemented as a layout component in
`src/components/information-pages/archetypes.tsx`.

---

## Archetypes

| Archetype                     | Component                  | Best for                                                     |
| ----------------------------- | -------------------------- | ------------------------------------------------------------ |
| A — Simple Editorial          | `SimpleEditorialLayout`    | About, Careers, Shipping, Returns, Blog Articles             |
| B — Documentation             | `DocumentationLayout`      | Terms, Privacy, Seller Policies, API Docs                    |
| C — Support Center            | `SupportCenterLayout`      | Contact, Help Center, Customer Service                       |
| D — Feature Explanation       | `FeatureExplanationLayout` | Trust Verification, Buyer Protection, Escrow, Authentication |
| E — Program / Network Landing | `ProgramLandingLayout`     | Salvage Network, Seller Program, Fleet Program               |
| F — FAQ / Knowledge Base      | `KnowledgeBaseLayout`      | Help Center, Buyer Guide, Seller Guide                       |
| G — Comparison / Trust        | `ComparisonTrustLayout`    | Buyer confidence pages                                       |

---

## Layout selection matrix

| Page                 | Archetype |
| -------------------- | --------- |
| About                | A         |
| Contact              | C         |
| Terms                | B         |
| Privacy              | B         |
| Trust & Verification | D         |
| Salvage Network      | E         |

---

## Shared shell

All archetypes render through `EditorialPageShell`, which provides:

1. Breadcrumb navigation.
2. `InformationPageHeader` with eyebrow, title, and description.
3. A `Section` with `bg-surface-secondary` for the page body.
4. An optional CTA; defaults to `EditorialCTA`.

---

## Adding a new editorial page

1. Choose the archetype that matches the page purpose.
2. Import the layout from `@/components/information-pages`.
3. Provide the required props (`eyebrow`, `title`, `breadcrumb`, plus archetype-specific content).
4. Export metadata via `publicInfoMetadata` from `@/components/layout/PublicInfoPage`.
5. Add a branch test in `tests/branch/p7-4-editorial-archetypes/`.

---

## Missing helper components

Three helpers are available for archetypes that need them:

- `ComparisonTable` — rows × columns comparison (e.g., PartsPeddle vs. marketplaces).
- `FAQSearch` — search input wired to filter FAQ items.
- `KnowledgeBaseGrid` — category cards for help-center landing pages.
