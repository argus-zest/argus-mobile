/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BandChip, MockBadge, ProvenanceChip } from './chips';

describe('ProvenanceChip (SPEC colours)', () => {
  it('renders sourced as green', () => {
    const { container } = render(<ProvenanceChip value="sourced" />);
    expect(screen.getByText('sourced')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('text-emerald-800');
  });

  it('renders illustrative as amber', () => {
    const { container } = render(<ProvenanceChip value="illustrative" />);
    expect(container.firstChild).toHaveClass('text-amber-800');
  });

  it('renders simulated as grey (never green)', () => {
    const { container } = render(<ProvenanceChip value="simulated" />);
    expect(container.firstChild).toHaveClass('text-slate-600');
    expect(container.firstChild).not.toHaveClass('text-emerald-800');
  });

  it('renders nothing for null provenance', () => {
    const { container } = render(<ProvenanceChip value={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('BandChip', () => {
  it('shows the band label', () => {
    render(<BandChip band="severe" />);
    expect(screen.getByText('severe')).toBeInTheDocument();
  });
});

describe('MockBadge', () => {
  it('labels mock data explicitly', () => {
    render(<MockBadge />);
    expect(screen.getByText('MOCK DATA')).toBeInTheDocument();
  });
});
