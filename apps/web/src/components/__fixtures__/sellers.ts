import type { SellerCardSeller } from '@/components/design-system/seller-card';

export const sampleSeller: SellerCardSeller = {
  id: 's-1',
  name: 'Desert Valley Auto',
  businessName: 'Desert Valley Auto Parts',
  rating: 4.8,
  reviewCount: 420,
  location: 'Phoenix, AZ',
  specialty: 'Honda / Acura',
  logoUrl: '/brake.jpg',
};

export const sampleSellerNoLogo: SellerCardSeller = {
  id: 's-2',
  name: 'Austin Imports',
  businessName: 'Austin Imports & Salvage',
  rating: 4.2,
  reviewCount: 56,
  location: 'Austin, TX',
  specialty: 'European',
};
