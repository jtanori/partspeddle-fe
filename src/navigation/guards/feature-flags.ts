import { BuiltRoute } from '../types';

export function isFeatureEnabled(route: BuiltRoute, flags: Record<string, boolean>): boolean {
  if (!route.featureFlag) return true;
  return flags[route.featureFlag] === true;
}
