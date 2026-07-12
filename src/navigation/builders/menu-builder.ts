import { BuiltRoute, MenuItem } from '../types';

type MenuPosition = 'main' | 'footer' | 'sidebar';

export function buildMenu(
  registry: Record<string, BuiltRoute>,
  position: MenuPosition,
  options?: { section?: string; visibility?: string[] },
): MenuItem[] {
  const items: MenuItem[] = [];

  for (const route of Object.values(registry)) {
    if (!route.navPosition.includes(position)) continue;
    if (options?.section && route.section !== options.section) continue;
    if (options?.visibility && !options.visibility.includes(route.visibility)) continue;

    items.push({
      id: route.id,
      label: route.name,
      href: (route.href as () => string)(),
      section: route.section,
    });
  }

  return items;
}
