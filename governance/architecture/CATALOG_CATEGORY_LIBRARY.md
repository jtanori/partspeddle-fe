# Catalog Category Library (Pilot)

**Goal**: Define the hierarchy and specification grouping for the four pilot categories.

---

## 1. Pilot Categories (Taxonomy)

| ID | Slug | Name | Parent |
| :--- | :--- | :--- | :--- |
| `cat_1` | `electrical` | Electrical | None |
| `cat_2` | `alternator` | Alternator | `cat_1` |
| `cat_3` | `engine` | Engine | None |
| `cat_4` | `body` | Body | None |
| `cat_5` | `door` | Door | `cat_4` |
| `cat_6` | `wheels` | Wheels | None |

---

## 2. Category Specification Mapping (with Groups)

| Category | Spec Key | Required | Group | Display Order |
| :--- | :--- | :--- | :--- | :--- |
| **Alternator** | `voltage` | True | Electrical | 1 |
| **Alternator** | `amperage` | True | Electrical | 2 |
| **Alternator** | `rotation` | False | Mechanical | 1 |
| **Alternator** | `pulley_type`| False | Mechanical | 2 |
| **Engine** | `cylinders` | True | Mechanical | 1 |
| **Engine** | `fuel_type` | True | Mechanical | 2 |
| **Door** | `side` | True | Dimensions | 1 |
| **Wheel** | `diameter` | True | Dimensions | 1 |
| **Wheel** | `bolt_pattern`| True | Dimensions | 2 |
