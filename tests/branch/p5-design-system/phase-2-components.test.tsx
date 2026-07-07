import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Skeleton,
  Chip,
  FilterChip,
  Rating,
  Price,
  InventoryCount,
  SellerSummary,
  SpecificationTable,
  VehicleLineage,
  PartCard,
  SellerCard,
  Breadcrumb,
  Tabs,
  Accordion,
  SearchInput,
  FilterGroup,
  Pagination,
  Toast,
  Tooltip,
} from '@/components/design-system';

const samplePart = {
  id: 'p1',
  title: 'OEM Alternator',
  subtitle: 'Fits Honda Civic 2016-2021',
  price: 129.99,
  compareAtPrice: 199.99,
  imageUrl: '/img.jpg',
  condition: 'Used - Good',
  system: 'Electrical',
  quantity: 3,
  isAvailable: true,
  sellerName: 'Test Yard',
  sellerRating: 4.5,
  sellerReviewCount: 128,
};

const sampleSeller = {
  id: 's1',
  name: 'Test Yard',
  businessName: 'Test Auto Parts',
  rating: 4.8,
  reviewCount: 420,
  location: 'Austin, TX',
  specialty: 'Honda / Acura',
};

describe('P5.0 Phase 2 foundation components', () => {
  it('Skeleton renders a pulsing placeholder', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('bg-surface-muted');
    expect(el.className).toContain('animate-pulse');
  });

  it('Skeleton.PartCard matches card dimensions', () => {
    render(<Skeleton.PartCard data-testid="skeleton-card" />);
    const el = screen.getByTestId('skeleton-card');
    expect(el.className).toContain('bg-surface-primary');
    expect(el.className).toContain('rounded-xl');
  });

  it('Chip renders a tag', () => {
    render(<Chip label="OEM" data-testid="chip" />);
    expect(screen.getByTestId('chip').textContent).toBe('OEM');
  });

  it('FilterChip supports remove action', () => {
    const onRemove = vi.fn();
    render(<FilterChip label="Honda" onRemove={onRemove} data-testid="chip" />);
    const btn = screen.getByLabelText('Remove Honda filter');
    fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('Rating renders stars and count', () => {
    render(<Rating value={4.2} count={99} data-testid="rating" />);
    const el = screen.getByTestId('rating');
    expect(el.textContent).toContain('4.2');
    expect(el.textContent).toContain('(99)');
  });

  it('Price formats currency and shows compare-at', () => {
    render(<Price amount={129.99} compareAtAmount={199.99} data-testid="price" />);
    const el = screen.getByTestId('price');
    expect(el.textContent).toContain('$129.99');
    expect(el.textContent).toContain('$199.99');
  });

  it('InventoryCount shows low stock warning', () => {
    render(<InventoryCount quantity={2} lowStockThreshold={5} data-testid="stock" />);
    expect(screen.getByTestId('stock').textContent).toBe('Only 2 left');
  });
});

describe('P5.0 Phase 2 domain components', () => {
  it('SellerSummary renders compact variant', () => {
    render(
      <SellerSummary
        name="Test Yard"
        rating={4.5}
        reviewCount={100}
        location="Austin, TX"
        data-testid="seller"
      />,
    );
    const el = screen.getByTestId('seller');
    expect(el.textContent).toContain('Test Yard');
    expect(el.textContent).toContain('Austin, TX');
  });

  it('SpecificationTable renders label/value rows', () => {
    render(
      <SpecificationTable
        specs={[{ label: 'Material', value: 'Aluminum', unit: 'alloy' }]}
        data-testid="specs"
      />,
    );
    expect(screen.getByText('Material')).toBeDefined();
    expect(screen.getByText('Aluminum')).toBeDefined();
  });

  it('VehicleLineage lists compatible vehicles', () => {
    render(
      <VehicleLineage
        vehicles={[{ year: 2020, make: 'Honda', model: 'Civic' }]}
        totalCount={12}
        data-testid="fitment"
      />,
    );
    expect(screen.getByText(/2020 Honda Civic/)).toBeDefined();
  });
});

describe('P5.0 Phase 2 composite cards', () => {
  it('PartCard grid variant renders part data', () => {
    render(<PartCard part={samplePart} data-testid="part-card" />);
    const el = screen.getByTestId('part-card');
    expect(el.textContent).toContain('OEM Alternator');
    expect(el.textContent).toContain('$129.99');
    expect(el.className).toContain('bg-surface-primary');
  });

  it('PartCard list variant renders horizontally', () => {
    render(<PartCard part={samplePart} variant="list" data-testid="part-card" />);
    const el = screen.getByTestId('part-card');
    expect(el.className).toContain('flex-row');
  });

  it('SellerCard renders seller data', () => {
    render(<SellerCard seller={sampleSeller} data-testid="seller-card" />);
    const el = screen.getByTestId('seller-card');
    expect(el.textContent).toContain('Test Auto Parts');
    expect(el.textContent).toContain('Austin, TX');
  });
});

describe('P5.0 Phase 2 generic UI patterns', () => {
  it('Breadcrumb uses nav role and current page', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Search' }, { label: 'Part' }]}
        data-testid="breadcrumb"
      />,
    );
    const nav = screen.getByLabelText('Breadcrumb');
    expect(nav.tagName).toBe('NAV');
    expect(screen.getByText('Part')).toHaveAttribute('aria-current', 'page');
  });

  it('Tabs renders tablist and panels', () => {
    render(
      <Tabs
        tabs={[
          { id: 'a', label: 'Tab A', content: 'Content A' },
          { id: 'b', label: 'Tab B', content: 'Content B' },
        ]}
        data-testid="tabs"
      />,
    );
    expect(screen.getByRole('tablist')).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Tab A' })).toBeDefined();
  });

  it('Accordion renders collapsible sections', () => {
    render(
      <Accordion
        items={[{ id: 'a', title: 'Section A', content: 'Details A' }]}
        data-testid="accordion"
      />,
    );
    expect(screen.getByText('Section A')).toBeDefined();
  });

  it('SearchInput calls onSubmit with value', () => {
    const onSubmit = vi.fn();
    render(<SearchInput onSubmit={onSubmit} data-testid="search" />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'alternator' } });
    fireEvent.submit(input.closest('form')!);
    expect(onSubmit).toHaveBeenCalledWith('alternator');
  });

  it('FilterGroup calls onChange', () => {
    const onChange = vi.fn();
    render(
      <FilterGroup
        title="Make"
        options={[{ value: 'honda', label: 'Honda', checked: false }]}
        onChange={onChange}
        data-testid="filters"
      />,
    );
    fireEvent.click(screen.getByLabelText('Honda'));
    expect(onChange).toHaveBeenCalledWith('honda', true);
  });

  it('Pagination renders page buttons', () => {
    const onChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onChange={onChange} data-testid="pagination" />,
    );
    expect(screen.getByRole('navigation')).toBeDefined();
    fireEvent.click(screen.getByText('3'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('Toast renders message', () => {
    render(<Toast message="Saved" variant="success" data-testid="toast" />);
    expect(screen.getByRole('status').textContent).toContain('Saved');
  });

  it('Tooltip renders trigger', () => {
    render(
      <Tooltip content="Help text">
        <span data-testid="tip-trigger">?</span>
      </Tooltip>,
    );
    expect(screen.getByTestId('tip-trigger')).toBeDefined();
  });
});
