import { CompiledSpecificationSet } from '../apps/web/src/domain/services/specification.compiler';

export const driftSimulator = {
  swapGroupOrder: (compiled: CompiledSpecificationSet): CompiledSpecificationSet => ({
    ...compiled,
    grouped: [...compiled.grouped].reverse()
  }),
  removeFacet: (compiled: CompiledSpecificationSet, key: string): CompiledSpecificationSet => {
    const newFacets = { ...compiled.facets };
    delete newFacets[key];
    return { ...compiled, facets: newFacets };
  },
  mutateValueType: (compiled: CompiledSpecificationSet): CompiledSpecificationSet => ({
    ...compiled,
    flat: compiled.flat.map(s => ({ ...s, value: s.value.toString() }))
  })
};
