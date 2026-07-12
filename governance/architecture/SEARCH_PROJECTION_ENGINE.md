# Search Projection Engine Architecture

**Goal**: Define deterministic EAV-to-Search transformation logic.

---

## 1. Transformation Logic
The projection engine must follow a stateless transformation flow:
1. **Fetch Listing**: Retrieve `listings` and `parts` (Universal Attributes).
2. **Fetch Specs**: Retrieve all associated `listing_specifications` (EAV).
3. **Filter Specs**: Iterate through specs and include only those where `catalog_spec_definitions.searchable = true`.
4. **Flatten**: Map EAV records to the `facets` object in `MarketplaceSearchDocument`.
5. **Serialize**: Push to Algolia.

## 2. Stateless Mapping (Logic Example)
```ts
function projectToSearch(listing, specs, definitions): MarketplaceSearchDocument {
  const facets = specs.reduce((acc, spec) => {
    const def = definitions.find(d => d.id === spec.spec_definition_id);
    if (def?.searchable) {
       acc[def.key] = spec.value_number ?? spec.value_text;
    }
    return acc;
  }, {});

  return { ...listing, facets };
}
```
*Note: No `if(category === 'alternator')` logic exists in this projection engine.*
