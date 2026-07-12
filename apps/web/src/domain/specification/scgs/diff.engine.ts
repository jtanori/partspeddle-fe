import { CompiledSpecificationSet } from '../../services/specification.compiler';
import { GroupDiff, FacetDiff } from './types';

// Simple deep equal for production use
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const recordA = a as Record<string, unknown>;
  const recordB = b as Record<string, unknown>;
  const keysA = Object.keys(recordA);
  const keysB = Object.keys(recordB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(recordA[key], recordB[key])) return false;
  }
  return true;
}

export function diffGroups(
  prev: CompiledSpecificationSet["grouped"],
  next: CompiledSpecificationSet["grouped"]
): GroupDiff[] {
  const prevMap = new Map(prev.map(g => [g.name, g]));
  const nextMap = new Map(next.map(g => [g.name, g]));
  const diffs: GroupDiff[] = [];

  for (const [name, prevGroup] of prevMap) {
    const nextGroup = nextMap.get(name);
    if (!nextGroup) {
      diffs.push({ groupName: name, changeType: "REMOVED", before: prevGroup });
      continue;
    }
    if (prevGroup.order !== nextGroup.order) {
      diffs.push({ groupName: name, changeType: "ORDER_CHANGED", before: prevGroup, after: nextGroup });
    } else if (!deepEqual(prevGroup.items, nextGroup.items)) {
      diffs.push({ groupName: name, changeType: "MODIFIED", before: prevGroup, after: nextGroup });
    }
  }

  for (const [name, nextGroup] of nextMap) {
    if (!prevMap.has(name)) {
      diffs.push({ groupName: name, changeType: "ADDED", after: nextGroup });
    }
  }
  return diffs;
}

export function diffFacets(
  prev: Record<string, string | number | boolean>,
  next: Record<string, string | number | boolean>,
): FacetDiff[] {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const diffs: FacetDiff[] = [];
  for (const key of keys) {
    const a = prev[key];
    const b = next[key];
    if (!(key in prev)) diffs.push({ key, type: "ADDED", after: b });
    else if (!(key in next)) diffs.push({ key, type: "REMOVED", before: a });
    else if (!Object.is(a, b)) diffs.push({ key, type: "MODIFIED", before: a, after: b });
  }
  return diffs;
}

export function scoreDiff(groupDiffs: GroupDiff[], facetDiffs: FacetDiff[]) {
  return {
    severity:
      groupDiffs.some(d => d.changeType === "REMOVED") || facetDiffs.some(d => d.type === "REMOVED") ? "BREAKING"
      : groupDiffs.length + facetDiffs.length > 0 ? "NON_BREAKING"
      : "NONE"
  } as const;
}
