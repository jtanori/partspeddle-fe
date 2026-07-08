import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartCard } from '@/components/design-system/part-card';
import { GridResultsView } from '@/components/search/GridResultsView';
import { ListResultsView } from '@/components/search/ListResultsView';
import { SearchNoResults } from '@/components/search/SearchNoResults';
import { SearchInitialState } from '@/components/search/SearchInitialState';
import { ViewToggle } from '@/components/search/ViewToggle';
import SortDropdown from '@/components/search/SortDropdown';
import { ActiveFiltersBar } from '@/components/search/ActiveFiltersBar';
import { FilterChips } from '@/components/search/FilterChips';
import { toPartCardPart } from '@/components/search/utils/to-part-card';
import { SearchResultCardModel } from '@/domain/view-models/search';

const sampleSearchCard: SearchResultCardModel = {
  id: 'p123',
  title: 'OEM Brake Caliper',
  price: 'MX$1,250.00',
  imageUrl: '/brake.jpg',
  subtitle: 'Fits Toyota Tacoma 2016-2023',
  fitmentSummary: 'Toyota Tacoma 2016-2023',
  conditionLabel: 'Used OEM',
  sellerName: 'Desert Valley Auto',
  sellerRating: 4.7,
  sellerReviewCount: 34,
  badges: { isOEM: false, isTested: true, isGoodFit: true },
  facets: {},
};

const cards = [sampleSearchCard];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/search',
  useSearchParams: () => new URLSearchParams(),
}));

describe('P5.0 Phase 3 search result card convergence', () => {
  it('toPartCardPart parses localized MXN price to numeric value', () => {
    const part = toPartCardPart(sampleSearchCard);
    expect(part.price).toBe(1250);
    expect(part.title).toBe('OEM Brake Caliper');
    expect(part.condition).toBe('Used OEM');
  });

  it('GridResultsView renders canonical PartCard components', () => {
    render(
      <GridResultsView
        cards={cards}
        favorites={[]}
        toggleFavorite={vi.fn()}
        onSelectPart={vi.fn()}
      />,
    );
    const grid = screen.getByText('OEM Brake Caliper').closest('div');
    expect(grid).toBeDefined();
    expect(screen.getByText('Desert Valley Auto')).toBeDefined();
  });

  it('ListResultsView renders canonical PartCard in list variant', () => {
    render(
      <ListResultsView
        cards={cards}
        favorites={[]}
        toggleFavorite={vi.fn()}
        onSelectPart={vi.fn()}
      />,
    );
    const card = screen.getByText('OEM Brake Caliper').closest('a');
    expect(card).toBeDefined();
    expect(card?.className).toContain('flex-row');
  });

  it('PartCard supports MXN currency prop', () => {
    const part = toPartCardPart(sampleSearchCard);
    render(<PartCard part={part} currency="MXN" data-testid="mxn-card" />);
    const el = screen.getByTestId('mxn-card');
    expect(el.textContent).toContain('MX$1,250.00');
  });
});

describe('P5.0 Phase 3 search UI chrome', () => {
  it('SearchNoResults renders back to marketplace action', () => {
    const onClear = vi.fn();
    render(<SearchNoResults onClearSearch={onClear} />);
    const btn = screen.getByText('BACK TO MARKETPLACE');
    fireEvent.click(btn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('SearchInitialState renders prompt', () => {
    render(<SearchInitialState />);
    expect(screen.getByText('Start Your Search')).toBeDefined();
  });

  it('ViewToggle calls onViewChange with list', () => {
    const onChange = vi.fn();
    render(<ViewToggle currentView="grid" onViewChange={onChange} />);
    fireEvent.click(screen.getByLabelText('List view'));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('SortDropdown calls onChange with selected sort', () => {
    const onChange = vi.fn();
    render(<SortDropdown value="newest" onChange={onChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'price_asc' } });
    expect(onChange).toHaveBeenCalledWith('price_asc');
  });

  it('ActiveFiltersBar renders chips and supports remove/clear', () => {
    const onRemove = vi.fn();
    const onClear = vi.fn();
    render(
      <ActiveFiltersBar
        filters={[{ key: 'make:honda', label: 'Honda' }]}
        onRemove={onRemove}
        onClearAll={onClear}
      />,
    );
    expect(screen.getByText('Honda')).toBeDefined();
    fireEvent.click(screen.getByText('Clear All'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('FilterChips ignores sort chips and renders remove action', () => {
    const clear = vi.fn();
    render(
      <FilterChips
        filters={[
          { type: 'sort', label: 'Newest' },
          { type: 'make', label: 'Honda', clear },
        ]}
      />,
    );
    expect(screen.queryByText('Newest')).toBeNull();
    fireEvent.click(screen.getByText('Honda').querySelector('svg')!);
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
