# Marketplace Inventory Architecture (v1)

**Status**: Master System of Record (Foundational)  
**Scope**: Platform-Wide Catalog & Inventory Management

---

## 1. Executive Objective
Transition the platform from a "Part-centric" model to a **Marketplace Listing** abstraction. This allows the system to treat both standalone parts and harvested donor vehicles as first-class inventory assets, enabling intelligent dismantling workflows, unified search, and consistent PDP/VDP (Vehicle Detail Page) experiences.

---

## 2. Core Listing Hierarchy

```ts
// Root Abstraction
interface MarketplaceListing {
  id: UUID;
  seller_id: UUID;
  listing_type: 'PART' | 'DONOR_VEHICLE';
  status: ListingStatus;
  price: number;
  created_at: Timestamp;
}

// Specialization 1
interface PartListing extends MarketplaceListing {
  part_id: UUID; // Foreign key to 'parts' catalog
  donor_vehicle_id?: UUID; // Links to donor source if harvested
}

// Specialization 2
interface DonorVehicleListing extends MarketplaceListing {
  vehicle_id: UUID; // Foreign key to 'donor_vehicles'
  dismantle_status: 'INTACT' | 'DISMANTLING' | 'SCRAPPED';
}
```

---

## 3. Donor Vehicle as First-Class Catalog Entity

A `DonorVehicle` is not just a link, it is a rich data entity:
- **Vehicle Profile**: VIN, Year, Make, Model, Trim.
- **Dismantle Context**: Mileage, Title Status, Damage Summary.
- **Inventory Link**: Primary key relationship to harvested `PartListing` assets.

---

## 4. Operational Strategy

1.  **AI Wizard**: Must support two entry points: `Create Part` or `Register Donor Vehicle`.
2.  **Listing Wizard (AI)**:
    - Donor Flow: Decodes VIN → Generates Profile → Suggests Harvestable Parts → Bulk Inventory Creation.
    - Part Flow: Independent listing creation.
3.  **Search & Discovery**:
    - Search results now return `MarketplaceListing` objects.
    - Filters can toggle between `Part` or `Donor Vehicle`.
4.  **PDP/VDP Synchronization**:
    - The PDP for harvested parts will show: *"This part is from Donor Vehicle #123"*.
    - The VDP (Vehicle Detail Page) for Donor Vehicles will show: *"Available Parts from this Donor"*.

---

## 5. Architectural Implementation Roadmap

| Phase | Goal | Deliverable |
| :--- | :--- | :--- |
| **P0.5** | **Inventory Abstraction** | `MARKETPLACE_INVENTORY_ARCHITECTURE.md` |
| **P1.1** | **Schema Evolution** | Update `parts` table; add `listings` & `donor_vehicles` tables. |
| **P2.1** | **Domain Model Expansion** | Define `Listing`, `PartListing`, `DonorVehicle` entities. |
| **P3.1** | **ViewModel Fusion** | Update PDP/VDP contracts for shared listing attributes. |

---

## 6. Success Definition
- **Data Parity**: Standalone parts and parts harvested from donor vehicles share the same listing and search metadata.
- **Integration**: Search, PDP/VDP, and AI Wizard recognize the `Listing` root type.
- **Operational Scalability**: Adding a new asset type (e.g., 'Core' or 'Equipment') requires 0 schema changes to core listing infrastructure.
