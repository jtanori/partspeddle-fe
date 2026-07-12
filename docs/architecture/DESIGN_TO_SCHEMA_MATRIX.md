# Design-to-Schema Coverage Matrix (P1.1)

**Phase**: P1 Schema & Catalog Architecture  
**Status**: Draft (Gaps Identified)

---

## 1. Product Attribute Mapping

| Design Requirement | Data Field (Current) | DB Table | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Brand** | ✗ None | `parts` | ❌ **Missing** | Add `brand` (text) |
| **Condition** | `condition` | `parts` | ⚠️ Incomplete | Map enums to UI labels |
| **Mileage** | ✗ None | `parts` | ❌ **Missing** | Add `mileage` (integer) |
| **Voltage** | ✗ None | `parts` | ❌ **Missing** | Add `voltage` (text) |
| **Amperage** | ✗ None | `parts` | ❌ **Missing** | Add `amperage` (text) |
| **Pulley Type** | ✗ None | `parts` | ❌ **Missing** | Add `pulley_type` (text) |
| **Rotation** | ✗ None | `parts` | ❌ **Missing** | Add `rotation` (text) |
| **Warranty** | ✗ None | `parts` | ❌ **Missing** | Add `warranty_months` (int) |

---

## 2. Seller Trust & Performance Mapping

| Design Requirement | Data Field (Current) | DB Table | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Seller Rating** | ✗ None (derived) | `seller_reviews`| ✅ Supported | Aggregate from reviews |
| **Review Count** | ✗ None (derived) | `seller_reviews`| ✅ Supported | Aggregate from reviews |
| **Trust Score** | `seller_trust_score` | `seller_profiles`| ✅ Supported | Use for Badge logic |
| **Feedback %** | ✗ None | `seller_profiles`| ❌ **Missing** | Add `feedback_percentage` |
| **Badge Level** | ✗ None (logic only) | N/A | ❌ **Missing** | Derived from Trust Score |

---

## 3. Logistics & Shipping Mapping

| Design Requirement | Data Field (Current) | DB Table | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Ships From** | `location` | `seller_profiles`| ✅ Supported | Bind to UI |
| **Delivery ETA** | ✗ None | `seller_profiles`| ❌ **Missing** | Add `ships_within_days` |
| **Return Window** | ✗ None | `seller_profiles`| ❌ **Missing** | Add `return_window_days` |
| **Shipping Policy** | ✗ None | `seller_profiles`| ❌ **Missing** | Add `shipping_policy` |

---

## 4. Gap Summary
The schema currently supports only **~30% of the data points** required to drive the high-fidelity PDP. Every "Specification" currently shown in the designs is unsupported by the base `parts` table.

---
**Action Item**: Execute P1.2 (Missing Product Attributes) and P1.3 (Seller Trust Data) migrations.
