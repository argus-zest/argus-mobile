/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CorridorCard } from './CorridorCard';
import { MOCK_MOBILE_HOTSPOTS, getMockRisk } from '../mocks/data';

const scores = getMockRisk(40, 30, 30).scores;
const scoreFor = (id: string) => scores.find((s) => s.hotspot_id === id);

describe('CorridorCard', () => {
  it('renders hotspot name, road, and risk percentage', () => {
    render(
      <CorridorCard
        hotspot={MOCK_MOBILE_HOTSPOTS[0]}
        risk={scoreFor('minto_bridge')}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
    expect(screen.getByText(/Minto Road/)).toBeInTheDocument();
    expect(screen.getByText(scoreFor('minto_bridge')!.band)).toBeInTheDocument();
  });

  it('shows warranty days when in warranty', () => {
    render(
      <CorridorCard
        hotspot={MOCK_MOBILE_HOTSPOTS[0]}
        risk={scoreFor('minto_bridge')}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText(/d warranty/)).toBeInTheDocument();
  });

  it('shows expired and unknown warranty states distinctly', () => {
    const { rerender } = render(
      <CorridorCard
        hotspot={MOCK_MOBILE_HOTSPOTS[4]}
        risk={scoreFor('loni_road_golchakkar')}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('Warranty expired')).toBeInTheDocument();
    rerender(
      <CorridorCard
        hotspot={MOCK_MOBILE_HOTSPOTS[6]}
        risk={scoreFor('karala_kanjhawala')}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('Warranty unknown')).toBeInTheDocument();
  });

  it('labels the value as HUW in hazard mode', () => {
    render(
      <CorridorCard
        hotspot={MOCK_MOBILE_HOTSPOTS[0]}
        risk={scoreFor('minto_bridge')}
        hazardMode
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText(/HUW/)).toBeInTheDocument();
  });

  it('calls onSelect with the hotspot on tap', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <CorridorCard
        hotspot={MOCK_MOBILE_HOTSPOTS[0]}
        risk={scoreFor('minto_bridge')}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith(MOCK_MOBILE_HOTSPOTS[0]);
  });
});
