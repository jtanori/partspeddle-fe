# PDP Spec Rendering Architecture

**Goal**: Zero-hardcoding specification rendering.

---

## 1. Data Consumption Strategy
- **ViewModel**: `PartViewModel` contains `specifications: SpecItem[]`.
- **Builder**: `PartViewModelBuilder` joins `part_specifications` with `catalog_spec_definitions` and `catalog_category_specs`.

## 2. Rendering Flow
1. **Fetch**: PDP fetches `PartViewModel`.
2. **Sort**: UI sorts `specifications` by `display_order` defined in `catalog_category_specs`.
3. **Group**: UI clusters items based on `group_name` defined in `catalog_category_specs`.
4. **Render**: Component iterates through groups and renders labels/values.

---

## 3. Example Render Logic

```ts
viewModel.specifications.reduce((groups, spec) => {
  if (!groups[spec.group]) groups[spec.group] = [];
  groups[spec.group].push(spec);
  return groups;
}, {});
```
