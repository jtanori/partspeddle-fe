import { RouteDefinition, BuiltRoute, BreadcrumbItem } from '../types';

function buildHref(path: string) {
  const segments = path.match(/:(\w+)/g) ?? [];
  if (segments.length === 0) {
    return (() => path) as unknown as BuiltRoute['href'];
  }

  return ((params: Record<string, string>) => {
    return segments.reduce((result, segment) => {
      const key = segment.slice(1);
      const value = params[key];
      if (value === undefined) {
        throw new Error(`Missing route parameter "${key}" for path "${path}"`);
      }
      return result.replace(segment, encodeURIComponent(value));
    }, path);
  }) as unknown as BuiltRoute['href'];
}

function buildBreadcrumbs(
  route: RouteDefinition,
  registry: Record<string, BuiltRoute>,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: route.name }];

  let current = route.parent;
  while (current) {
    const parent = registry[current];
    if (!parent) break;
    items.unshift({ label: parent.name, href: (parent.href as () => string)() });
    current = parent.parent;
  }

  items.unshift({ label: 'Home', href: '/' });
  return route.breadcrumbs ?? items;
}

export function buildRoute<TParams extends Record<string, string> = Record<string, string>>(
  definition: RouteDefinition<TParams>,
  registry: Record<string, BuiltRoute> = {},
): BuiltRoute<TParams> {
  const built = {
    id: definition.id,
    name: definition.name,
    href: buildHref(definition.path),
    title: definition.title,
    description: definition.description,
    section: definition.section,
    visibility: definition.visibility,
    layout: definition.layout,
    parent: definition.parent,
    breadcrumbs: buildBreadcrumbs(definition as RouteDefinition, registry),
    featureFlag: definition.featureFlag,
    permissions: definition.permissions,
    searchable: definition.searchable ?? false,
    sitemap: definition.sitemap ?? definition.visibility === 'public',
    navPosition: definition.navPosition ?? ['none'],
  } as BuiltRoute<TParams>;

  return built;
}

export function buildRegistry<T extends Record<string, RouteDefinition>>(
  definitions: T,
): { [K in keyof T]: BuiltRoute } {
  const registry = {} as { [K in keyof T]: BuiltRoute };

  // First pass: build routes without breadcrumbs so registry is populated.
  for (const key of Object.keys(definitions) as (keyof T)[]) {
    registry[key] = buildRoute(definitions[key], registry);
  }

  // Second pass: rebuild breadcrumbs now that parents exist.
  for (const key of Object.keys(definitions) as (keyof T)[]) {
    registry[key] = buildRoute(definitions[key], registry);
  }

  return registry;
}
