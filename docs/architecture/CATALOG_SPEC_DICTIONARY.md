# Catalog Specification Dictionary (P1A.2)

**Goal**: Establish the metadata governing all marketplace attributes.

---

## 1. Governance & Metadata Strategy
- **`required`**: Defined in the bridge table (`catalog_category_specs`), allowing a spec to be required for one category but optional for another.
- **`searchable/filterable/facetable`**: Explicit flags to drive Search Indexing (Algolia) without guessing logic.
- **`group_name`**: UI metadata to cluster specifications (e.g., "Electrical", "Mechanical").

## 2. Specification Definitions (Pilot Subset)

| Key | Label | Data Type | Unit | Searchable | Filterable | Facetable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `voltage` | Voltage | text | V | True | True | True |
| `amperage` | Amperage | number | A | True | True | True |
| `rotation` | Rotation | enum | - | True | True | False |
| `pulley_type`| Pulley Type | enum | - | False | False | False |
| `cylinders` | Cylinder Count| number | - | True | True | True |
| `fuel_type` | Fuel Type | enum | - | True | True | True |
| `side` | Side | enum | - | True | True | True |
| `diameter` | Diameter | number | in | True | True | True |
| `bolt_pattern`| Bolt Pattern| text | - | True | True | True |
