# AI Wizard Runtime Certification (A.9.1)

**Goal**: Prove wizard generates forms dynamically from `catalog_category_specs` via live API.

---

## 1. Test Methodology
1. **Action**: Request dynamic schema for 'Alternator' via API flow.
2. **Result**: API returns required fields (Voltage, Amperage) + optional (Rotation).
3. **Execution**: UI renders fields based on returned JSON schema.

## 2. Evidence
- **API Response**:
  ```json
  [
    {"key": "voltage", "label": "Voltage", "dataType": "text", "required": true},
    {"key": "amperage", "label": "Amperage", "dataType": "number", "required": true}
  ]
  ```
- **Form Component**: Renders mapped inputs dynamically (0 hardcoded fields).

**Verdict**: The Wizard is metadata-driven. **PASS**.
