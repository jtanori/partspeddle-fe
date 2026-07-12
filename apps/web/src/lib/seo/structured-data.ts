/**
 * Schema.org structured data helpers for public pages.
 */

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  image?: string[];
  description?: string;
  sku?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers?: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export function organizationSchema(baseUrl: string): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PartsPeddle',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://www.facebook.com/partspeddle',
      'https://www.instagram.com/partspeddle',
      'https://www.youtube.com/partspeddle',
    ],
  };
}

export function productSchema(params: {
  name: string;
  images?: string[];
  description?: string;
  sku?: string;
  brandName?: string;
  price?: number;
  currency?: string;
  availability?: string;
  url?: string;
  ratingValue?: number;
  reviewCount?: number;
}): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    image: params.images,
    description: params.description,
    sku: params.sku,
    brand: params.brandName
      ? {
          '@type': 'Brand',
          name: params.brandName,
        }
      : undefined,
    offers: params.price
      ? {
          '@type': 'Offer',
          price: params.price,
          priceCurrency: params.currency ?? 'USD',
          availability: params.availability ?? 'https://schema.org/InStock',
          url: params.url,
        }
      : undefined,
    aggregateRating:
      params.ratingValue !== undefined && params.reviewCount !== undefined
        ? {
            '@type': 'AggregateRating',
            ratingValue: params.ratingValue,
            reviewCount: params.reviewCount,
          }
        : undefined,
  };
}

export function breadcrumbListSchema(
  items: Array<{ name: string; href?: string }>,
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href,
    })),
  };
}
