import { BuiltRoute, BreadcrumbItem } from '../types';

export function buildBreadcrumbs(
  route: BuiltRoute,
  registry: Record<string, BuiltRoute>,
): BreadcrumbItem[] {
  if (route.breadcrumbs && route.breadcrumbs.length > 0) {
    return route.breadcrumbs;
  }

  const items: BreadcrumbItem[] = [{ label: route.name }];
  let current = route.parent;

  while (current) {
    const parent = registry[current];
    if (!parent) break;
    items.unshift({
      label: parent.name,
      href: (parent.href as () => string)(),
    });
    current = parent.parent;
  }

  items.unshift({ label: 'Home', href: '/' });
  return items;
}
