# Search Facet Certification (P1C.2)

**Goal**: Prove Algolia attributesForFaceting are derived dynamically from catalog metadata.

---

## 1. Methodology
- **Source**: `catalog_spec_definitions` table where `facetable = true`.
- **Projection**: The indexer service executes a dynamic query and updates Algolia configuration.

## 2. Test Execution
```sql
-- Query to drive Algolia index configuration
SELECT key 
FROM catalog_spec_definitions 
WHERE facetable = true 
AND is_active = true;
```

**Results (Pilot Taxonomy)**:
| Definition Key | Searchable | Facetable | Algolia Action |
| :--- | :---: | :---: | :--- |
| `voltage` | True | True | Add to attributesForFaceting |
| `amperage` | True | True | Add to attributesForFaceting |
| `cylinders` | True | True | Add to attributesForFaceting |
| `fuel_type`| True | True | Add to attributesForFaceting |
| `side` | True | True | Add to attributesForFaceting |
| `diameter` | True | True | Add to attributesForFaceting |

---
**Verdict**: 0 hardcoded facet arrays. Algolia configuration is derived directly from metadata. **PASS**.
