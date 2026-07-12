import type { Meta, StoryObj } from '@storybook/react';
import PDPRoot from './PDPRoot';
import type { PartViewModel } from '@/domain/types/pdp.types';

const meta: Meta<typeof PDPRoot> = {
  title: 'PDP/PDPRoot',
  component: PDPRoot,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof PDPRoot>;

const baseViewModel: PartViewModel = {
  id: 'pdp-demo-001',
  title: 'OEM Alternator - 2015 Ford F-150 5.0L',
  subtitle: 'Alternators & Starters',
  price: 189.99,
  condition: 'USED_GOOD',
  header: {
    title: 'OEM Alternator - 2015 Ford F-150 5.0L',
    subtitle: 'Alternators & Starters',
    rating: 4.7,
    ratingCount: 124,
    sku: 'PP-FRD-ALT-15050',
  },
  images: [
    'https://placehold.co/800x600/e2e4e9/475569?text=Alternator+Front',
    'https://placehold.co/800x600/e2e4e9/475569?text=Alternator+Back',
    'https://placehold.co/800x600/e2e4e9/475569?text=Connector',
  ],
  pricing: {
    partPrice: 189.99,
    coreCharge: 25.0,
    isCoreRefundable: true,
    shippingEstimate: '$12.50',
    totalEstimated: 227.49,
  },
  inventory: {
    quantity: 3,
    status: 'IN_STOCK',
    isInStock: true,
  },
  seller: {
    id: 'seller-demo-001',
    displayName: 'Carolina Auto Recyclers',
    rating: 4.9,
    location: 'Charlotte, NC',
    responseTime: '< 2 hrs',
  },
  fitment: {
    confidence: 'high',
    fitmentScore: 98,
    vehicles: [
      { year: 2015, make: 'Ford', model: 'F-150', engine: '5.0L V8' },
      { year: 2016, make: 'Ford', model: 'F-150', engine: '5.0L V8' },
    ],
  },
  badges: {
    isOEM: true,
    isTested: true,
    warrantyIncluded: true,
    isGoodFit: true,
  },
  shipping: {
    isFree: false,
    eta: '3–5 business days',
  },
  description:
    'Genuine OEM alternator removed from a running 2015 Ford F-150 5.0L. Tested and guaranteed to work. Includes a 90-day warranty. Pulley and connector intact.',
  crossSell: [
    {
      id: 'pdp-demo-002',
      title: 'OEM Starter Motor - 2015 Ford F-150 5.0L',
      price: 149.99,
      imageUrl: 'https://placehold.co/300x300/e2e4e9/475569?text=Starter',
    },
    {
      id: 'pdp-demo-003',
      title: 'Serpentine Belt - Ford F-150 5.0L',
      price: 34.99,
      imageUrl: 'https://placehold.co/300x300/e2e4e9/475569?text=Belt',
    },
  ],
  tabs: [
    {
      id: 'specifications',
      label: 'Specifications',
      content: 'Spec content placeholder',
    },
    {
      id: 'shipping',
      label: 'Shipping',
      content: 'Shipping content placeholder',
    },
    {
      id: 'returns',
      label: 'Returns',
      content: 'Returns content placeholder',
    },
  ],
  specifications: [
    {
      name: 'Electrical',
      displayOrder: 1,
      specifications: [
        { key: 'amperage', label: 'Amperage', value: 220, unit: 'A', displayOrder: 1 },
        { key: 'voltage', label: 'Voltage', value: 12, unit: 'V', displayOrder: 2 },
      ],
    },
  ],
};

export const Default: Story = {
  args: {
    viewModel: baseViewModel,
  },
};

export const OutOfStock: Story = {
  args: {
    viewModel: {
      ...baseViewModel,
      inventory: { quantity: 0, status: 'OUT_OF_STOCK', isInStock: false },
      pricing: { ...baseViewModel.pricing, partPrice: 0 },
    },
  },
};

export const LowConfidenceFitment: Story = {
  args: {
    viewModel: {
      ...baseViewModel,
      fitment: { ...baseViewModel.fitment, confidence: 'low' },
    },
  },
};
