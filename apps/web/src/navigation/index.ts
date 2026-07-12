import { buildRegistry } from './builders/route-builder';
import { buildBreadcrumbs } from './builders/breadcrumb-builder';
import { buildMenu } from './builders/menu-builder';
import { buildSitemap, generateSitemapXml } from './builders/sitemap-builder';
import { buildMetadata } from './builders/metadata-builder';
import { hasPermission } from './guards/permissions';
import { isFeatureEnabled } from './guards/feature-flags';
import { marketplaceRoutes } from './registry/marketplace';
import { workspaceRoutes } from './registry/workspace';
import { editorialRoutes } from './registry/editorial';
import { supportRoutes } from './registry/support';
import { authRoutes } from './registry/auth';

export * from './types';
export { buildRegistry } from './builders/route-builder';
export { buildBreadcrumbs } from './builders/breadcrumb-builder';
export { buildMenu } from './builders/menu-builder';
export { buildSitemap, generateSitemapXml } from './builders/sitemap-builder';
export { buildMetadata } from './builders/metadata-builder';
export { hasPermission } from './guards/permissions';
export { isFeatureEnabled } from './guards/feature-flags';

export const registry = {
  ...buildRegistry(marketplaceRoutes),
  ...buildRegistry(workspaceRoutes),
  ...buildRegistry(editorialRoutes),
  ...buildRegistry(supportRoutes),
  ...buildRegistry(authRoutes),
};

export const navigation = {
  registry,
  mainMenu: buildMenu(registry, 'main'),
  footerMenu: buildMenu(registry, 'footer'),
  sidebarMenu: buildMenu(registry, 'sidebar'),
  breadcrumbs: (routeId: keyof typeof registry) => buildBreadcrumbs(registry[routeId], registry),
  sitemap: (baseUrl?: string) => buildSitemap(registry, baseUrl),
  sitemapXml: (baseUrl?: string) => generateSitemapXml(registry, baseUrl),
  metadata: (routeId: keyof typeof registry) => buildMetadata(registry[routeId]),
  route: (routeId: keyof typeof registry) => registry[routeId],
};
