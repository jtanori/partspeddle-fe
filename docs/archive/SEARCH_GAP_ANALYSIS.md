# Search Gap Analysis

| Requirement     | Present | Missing | Resolution |
| --------------- | ------- | ------- | ---------- |
| Make            | Partial | Yes     | Flatten |
| Model           | Partial | Yes     | Flatten |
| Year            | Partial | Yes     | Flatten |
| Category        | Partial | Yes     | Flatten |
| Part Type       | Partial | Yes     | Flatten |
| Condition       | No      | Yes     | Add to index |
| Seller Rating   | No      | Yes     | Add to index |
| Seller Verified | No      | Yes     | Add to index |
| Location        | Partial | Yes     | Flatten |

## Structural Gaps
- **Flattening**: Current schema uses nested objects which are difficult to facet and filter in Algolia.
- **Data Source Inconsistency**: We need to deprecate one of the two sync paths (`parts` table or `listings` table) to establish a single Source of Truth.
