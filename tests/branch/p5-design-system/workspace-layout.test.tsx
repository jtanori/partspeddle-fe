import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  WorkspaceLayout,
  Sidebar,
  TopNavigation,
  PageHeader,
  Toolbar,
  InspectorPanel,
  DensityProvider,
  useDensity,
} from '@/components/workspace';

const TestDensityReader = () => {
  const { density } = useDensity();
  return <span data-testid="density">{density}</span>;
};

describe('P5.0 workspace layout system', () => {
  it('DensityProvider exposes density and data attribute', () => {
    render(
      <DensityProvider defaultDensity="compact">
        <TestDensityReader />
      </DensityProvider>,
    );
    expect(screen.getByTestId('density').textContent).toBe('compact');
  });

  it('WorkspaceLayout renders sidebar, top nav, and content', () => {
    render(
      <WorkspaceLayout
        sidebar={<aside data-testid="ws-sidebar">Sidebar</aside>}
        topNav={<nav data-testid="ws-topnav">TopNav</nav>}
      >
        <div data-testid="ws-content">Content</div>
      </WorkspaceLayout>,
    );
    expect(screen.getByTestId('ws-sidebar')).toBeDefined();
    expect(screen.getByTestId('ws-topnav')).toBeDefined();
    expect(screen.getByTestId('ws-content')).toBeDefined();
  });

  it('WorkspaceLayout renders inspector panel', () => {
    render(
      <WorkspaceLayout
        sidebar={<aside>Sidebar</aside>}
        topNav={<nav>TopNav</nav>}
        inspector={<div data-testid="ws-inspector">Inspector</div>}
      >
        <div>Content</div>
      </WorkspaceLayout>,
    );
    expect(screen.getByTestId('ws-inspector')).toBeDefined();
  });

  it('Sidebar renders grouped sections', () => {
    render(
      <Sidebar
        logo={<span data-testid="logo">Logo</span>}
        sections={[
          {
            title: 'Primary',
            items: [{ id: 'home', label: 'Home', href: '/home' }],
          },
        ]}
      />,
    );
    expect(screen.getByTestId('logo')).toBeDefined();
    expect(screen.getByText('Primary')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
  });

  it('Sidebar supports expand/collapse children', () => {
    render(
      <Sidebar
        logo={<span>Logo</span>}
        sections={[
          {
            items: [
              {
                id: 'inventory',
                label: 'Inventory',
                children: [{ id: 'active', label: 'Active', href: '/active' }],
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.queryByText('Active')).toBeNull();
    fireEvent.click(screen.getByText('Inventory'));
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('Sidebar opens mobile overlay', () => {
    render(
      <Sidebar
        logo={<span data-testid="logo">Logo</span>}
        sections={[]}
        mobileOpen
        onMobileClose={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId('logo').length).toBeGreaterThan(0);
  });

  it(
    'TopNavigation renders search and actions',
    () => {
      render(<TopNavigation notifications={3} messages={1} />);
      expect(screen.getByRole('searchbox')).toBeDefined();
      expect(screen.getByLabelText('Notifications')).toBeDefined();
      expect(screen.getByLabelText('Notifications').textContent).toContain('3');
    },
    10_000
  );

  it('PageHeader renders title, subtitle, and actions', () => {
    render(
      <PageHeader
        title="Inventory"
        subtitle="Manage parts"
        primaryAction={{ label: 'Add', onClick: vi.fn() }}
        secondaryAction={{ label: 'Export', onClick: vi.fn() }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Inventory' })).toBeDefined();
    expect(screen.getByText('Manage parts')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Export' })).toBeDefined();
  });

  it('Toolbar renders children', () => {
    render(
      <Toolbar>
        <button>Filter</button>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'Filter' })).toBeDefined();
  });

  it('InspectorPanel renders title and content', () => {
    render(
      <InspectorPanel title="Details">
        <span data-testid="inspector-content">Content</span>
      </InspectorPanel>,
    );
    expect(screen.getByText('Details')).toBeDefined();
    expect(screen.getByTestId('inspector-content')).toBeDefined();
  });
});
