# Catalog Producer Integration Matrix (P1.6)

**Goal**: Verify that all PDP-required fields can be produced by every system input flow.

---

## 1. Producer Matrix

| Field | Manual Listing | AI Listing Wizard | Bulk Import | VIN Decode |
| :--- | :---: | :---: | :---: | :---: |
| **Brand** | ✓ | ✓ | ✓ | ✓ |
| **Voltage** | ✓ | ✓ | ✓ | ✗ |
| **Amperage** | ✓ | ✓ | ✓ | ✗ |
| **Cylinders** | ✓ | ✓ | ✓ | ✓ |
| **Rotation** | ✓ | ✓ | ✓ | ✗ |
| **Warranty Months**| ✓ | ✓ | ✓ | ✗ |
| **Price** | ✓ | ✗ | ✓ | ✗ |

## 2. Certification Strategy
- **Manual Listing**: Base producer.
- **AI Listing Wizard**: Must achieve parity with Manual Listing for Tier 1 Categories.
- **Bulk Import**: Must validate spec structure against `SPEC_DICTIONARY` before injection.
- **VIN Decode**: Only for Vehicle-specific context; fields not supported must be flagged for manual seller entry.

*Rule: Any field marked '✗' for the AI Wizard requires a UI fallback flow.*
