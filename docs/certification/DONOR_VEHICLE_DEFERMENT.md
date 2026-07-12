# Donor Vehicle Hydration Deferment

**Status**: Active  
**Reason**: Domain inventory currently contains only `Part` listings.

---

## 1. Rationale
- The `listings` table is ready for `DONOR_VEHICLE` types.
- The Domain contract (`MarketplaceListing`) defines the `DonorVehicleListing` specialization.
- However, the `donor_vehicles` table contains no seed data, and no listing-flow exists to populate it.

## 2. Deferment Criteria
- Integration testing for `DonorVehicleListing` hydration is deferred until Phase P2 (Domain Expansion) or P5 (Production Readiness), when we perform the first harvest dismantling workflow.

**Verdict**: GATE C.55 (Part Hydration) is in progress; Donor Vehicle Hydration is formally deferred.
