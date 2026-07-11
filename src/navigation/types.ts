export type RouteVisibility = 'public' | 'authenticated' | 'seller' | 'admin';
export type RouteLayout = 'public' | 'workspace' | 'editorial' | 'auth' | 'admin';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface RouteDefinition<TParams extends Record<string, string> = Record<string, string>> {
  id: string;
  name: string;
  path: string;
  title: string;
  description?: string;
  section?: string;
  visibility: RouteVisibility;
  layout: RouteLayout;
  parent?: string;
  breadcrumbs?: BreadcrumbItem[];
  featureFlag?: string;
  permissions?: string[];
  searchable?: boolean;
  sitemap?: boolean;
  navPosition?: ('main' | 'footer' | 'sidebar' | 'none')[];
}

export type RouteHref<TParams extends Record<string, string>> = keyof TParams extends never
  ? () => string
  : (params: TParams) => string;

export interface BuiltRoute<TParams extends Record<string, string> = Record<string, string>> {
  id: string;
  name: string;
  href: RouteHref<TParams>;
  title: string;
  description?: string;
  section?: string;
  visibility: RouteVisibility;
  layout: RouteLayout;
  parent?: string;
  breadcrumbs: BreadcrumbItem[];
  featureFlag?: string;
  permissions?: string[];
  searchable: boolean;
  sitemap: boolean;
  navPosition: ('main' | 'footer' | 'sidebar' | 'none')[];
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  section?: string;
}

export interface SitemapEntry {
  loc: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}
