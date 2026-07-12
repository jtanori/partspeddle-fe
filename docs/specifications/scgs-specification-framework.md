# SCGS Specification Framework

## Scope

Defines the canonical vocabulary SCGS uses to declare, group, and assign values
to specifications. The framework bridges raw catalog/listing data and the SCGS
compiler.

## Core types

### `SpecificationDefinition`

A single measurable or categorical characteristic.

```ts
interface SpecificationDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'enum';
  unit?: string;
  validation: SpecificationValidationRule;
  searchable: boolean;
  facetable: boolean;
}
```

A definition explains what a specification means. It never stores a value.

### `SpecificationGroup`

A named collection of definitions used for presentation and compilation.

```ts
interface SpecificationGroup {
  name: string;
  order: number;
  definitions: SpecificationDefinition[];
}
```

### `CategoryTemplate`

The specification blueprint for a taxonomy category.

```ts
interface CategoryTemplate {
  categoryId: string;
  groups: SpecificationGroup[];
  inheritedDefinitions: SpecificationDefinition[];
}
```

- `groups` are category-specific groupings.
- `inheritedDefinitions` are definitions that apply to the category but are not
  assigned to a specific group.

### `SpecificationValue`

A value assigned to a definition for a specific listing.

```ts
interface SpecificationValue {
  definition: SpecificationDefinition;
  rawValue: unknown;
  resolvedValue: string | number | boolean;
}
```

The `resolvedValue` is coerced according to the definition's `type`.

## Value coercion

| Source type | Target type | Rule                                     |
| ----------- | ----------- | ---------------------------------------- |
| string      | number      | `parseFloat`                             |
| string      | boolean     | `true`/`yes`/`1` → true; otherwise false |
| string      | enum/text   | kept as string                           |
| number      | boolean     | non-zero → true                          |
| any         | text        | stringified if not primitive             |

## Repository port

```ts
interface SpecificationFrameworkRepository {
  getCategoryTemplate(categoryId: string): Promise<CategoryTemplate>;
  getValuesForListing(listingId: string): Promise<SpecificationValue[]>;
}
```

Implementations bridge the port to the persistence layer. The reference
implementation is `CatalogSpecificationFrameworkRepository`, which uses the
existing catalog and specification repositories.

## Compiler integration

`SpecificationCompilerImpl` consumes `CategoryTemplate` and `SpecificationValue[]`:

1. Resolve each value against its definition.
2. Group resolved specs by `SpecificationGroup`.
3. Extract facets from facetable definitions.
4. Continue with ranking, trust, compatibility, and fitment compilation.

## Migration path

The current database schema already contains the de facto framework:

- `catalog_spec_definitions` → `SpecificationDefinition`
- `catalog_category_specs` → `SpecificationGroup`
- `catalog_spec_options` → enum validation rules
- `listing_specifications` / `part_specifications` → `SpecificationValue`

`CatalogSpecificationFrameworkRepository` and `specification-framework-mapper.ts`
map these tables to the canonical SCGS types without changing the schema.

## Verification

- `apps/web/src/backend/modules/scgs/tests/contract/specification-framework.contract.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/specification-framework-mapper.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/specification-compiler.test.ts`
