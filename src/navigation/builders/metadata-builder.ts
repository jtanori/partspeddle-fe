import { BuiltRoute } from '../types';

export interface PageMetadata {
  title: string;
  description: string;
}

export function buildMetadata(route: BuiltRoute): PageMetadata {
  return {
    title: route.title,
    description: route.description ?? `${route.title} on PartsPeddle.`,
  };
}
