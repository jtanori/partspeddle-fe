import { BuiltRoute } from '../types';

export function hasPermission(route: BuiltRoute, userPermissions: string[]): boolean {
  if (!route.permissions || route.permissions.length === 0) return true;
  return route.permissions.every((permission) => userPermissions.includes(permission));
}
