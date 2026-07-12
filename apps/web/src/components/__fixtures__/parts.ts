import type { PartCardPart } from '@/components/design-system/part-card';

export const samplePart: PartCardPart = {
  id: 'pp-1001',
  title: 'OEM Alternator 90A',
  subtitle: 'Fits Honda Civic 2016-2021 1.5L / 2.0L',
  price: 129.99,
  compareAtPrice: 199.99,
  imageUrl: '/brake.jpg',
  condition: 'Used OEM',
  system: 'Electrical',
  quantity: 3,
  isAvailable: true,
  sellerName: 'Desert Valley Auto',
  sellerRating: 4.7,
  sellerReviewCount: 34,
};

export const samplePartNoImage: PartCardPart = {
  id: 'pp-1002',
  title: 'Front Brake Caliper - Driver Side',
  subtitle: 'Toyota Tacoma 2016-2023',
  price: 89.5,
  condition: 'Excellent',
  system: 'Brake System',
  isAvailable: true,
  sellerName: 'Austin Imports',
  sellerRating: 4.2,
  sellerReviewCount: 12,
};
