# SCHEMA_ALIGNMENT_AUDIT.md

| Contract | Table | Status | Notes |
| :--- | :--- | :--- | :--- |
| **MarketplaceListing** | `listings` | ✅ | Includes `currency`, `price`, `listing_type` |
| **ListingSpecification**| `listing_specifications` | ✅ | Canonical EAV store |
| **CatalogCategory** | `catalog_categories` | ✅ | Includes template metadata |
| **SpecificationDefinition**| `catalog_spec_definitions` | ✅ | Includes governance flags |
| **PartListing** | `parts` | ✅ | Links to `listings` |
| **DonorVehicleListing** | `donor_vehicles` | ⚪ | Placeholder pending P4 |

---
**Verdict**: All canonical contracts mapped to schema.
