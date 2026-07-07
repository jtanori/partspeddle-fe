import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container, Content, MainGrid, Section, Stack } from '@/components/layout/design-system';
import { Card, CardSecondary, CardFloating } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';

describe('P5.0 layout primitives', () => {
  it('Container renders with the design-system max width', () => {
    render(<Container data-testid="container">content</Container>);
    const el = screen.getByTestId('container');
    expect(el.className).toContain('max-w-[var(--container-max)]');
    expect(el.className).toContain('mx-auto');
  });

  it('Content renders with the content max width', () => {
    render(<Content data-testid="content">content</Content>);
    const el = screen.getByTestId('content');
    expect(el.className).toContain('max-w-[var(--content-max)]');
  });

  it('MainGrid renders a 12-column grid with gutter', () => {
    render(<MainGrid data-testid="grid">content</MainGrid>);
    const el = screen.getByTestId('grid');
    expect(el.className).toContain('lg:grid-cols-12');
    expect(el.className).toContain('gap-[var(--grid-gutter)]');
  });

  it('Section applies spacing sizes', () => {
    render(
      <Section data-testid="section" spacing="lg">
        content
      </Section>,
    );
    const el = screen.getByTestId('section');
    expect(el.tagName).toBe('SECTION');
    expect(el.className).toContain('py-8');
  });

  it('Stack renders a vertical flex with gap', () => {
    render(
      <Stack data-testid="stack" gap="5">
        content
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    expect(el.className).toContain('flex-col');
    expect(el.className).toContain('gap-5');
  });
});

describe('P5.0 card primitives', () => {
  it('Card renders with primary card styling', () => {
    render(<Card data-testid="card">content</Card>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('bg-surface-primary');
    expect(el.className).toContain('rounded-xl');
    expect(el.className).toContain('border-stroke-subtle');
    expect(el.className).toContain('shadow-card');
    expect(el.className).toContain('p-5');
  });

  it('CardSecondary renders with secondary styling', () => {
    render(<CardSecondary data-testid="card">content</CardSecondary>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('bg-surface-secondary');
    expect(el.className).not.toContain('shadow-card');
  });

  it('CardFloating renders with elevated shadow', () => {
    render(<CardFloating data-testid="card">content</CardFloating>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('shadow-floating');
  });
});

describe('P5.0 button', () => {
  it('primary variant uses brand color', () => {
    render(<Button data-testid="btn">Primary</Button>);
    const el = screen.getByTestId('btn');
    expect(el.className).toContain('bg-primary');
    expect(el.className).toContain('text-primary-foreground');
  });
});

describe('P5.0 badge', () => {
  it('renders default variant with token classes', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const el = screen.getByTestId('badge');
    expect(el.className).toContain('bg-surface-secondary');
    expect(el.className).toContain('text-foreground-secondary');
    expect(el.className).toContain('rounded-md');
    expect(el.className).toContain('text-xs');
  });

  it('renders primary variant', () => {
    render(
      <Badge data-testid="badge" variant="primary">
        Primary
      </Badge>,
    );
    const el = screen.getByTestId('badge');
    expect(el.className).toContain('bg-brand-primary');
    expect(el.className).toContain('text-foreground-inverse');
  });
});
