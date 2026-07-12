# PDP Dynamic Rendering Certification (P1C.4)

**Goal**: Prove PDP rendering consumes metadata-driven groups and labels.

---

## 1. Methodology
PDP consumes `PartViewModel` containing `specifications: SpecItem[]`. The UI component iterates through grouped specifications based on `group_name` metadata.

## 2. Dynamic Rendering Proof (Alternator)

**ViewModel Payload (Fragment)**:
```json
{
  "specifications": [
    { "label": "Voltage", "value": "12V", "group": "Electrical" },
    { "label": "Amperage", "value": "120A", "group": "Electrical" },
    { "label": "Rotation", "value": "CW", "group": "Mechanical" }
  ]
}
```

## 3. Rendering Verification
- **Code Logic**:
  ```ts
  const grouped = viewModel.specifications.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});
  ```
- **Does any file contain `if(category === 'alternator')` for rendering specs?** **No.**

**Verdict**: The rendering layer is purely presentational, consuming categorized metadata. **PASS**.
