export function injectGroupDrift(signature: any) {
  return {
    ...signature,
    groups: [...signature.groups].reverse(),
  };
}

export function injectFacetDrift(signature: any) {
  const facets = { ...signature.facets };
  delete facets[Object.keys(facets)[0]];
  return { ...signature, facets };
}
