/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CorridorsScreen } from './CorridorsScreen';
import { MOCK_MOBILE_HOTSPOTS, getMockRisk } from '../mocks/data';

function renderScreen(overrides: Record<string, unknown> = {}) {
  const props = {
    hotspots: MOCK_MOBILE_HOTSPOTS,
    scores: getMockRisk(40, 30, 30).scores,
    mode: 'whatif' as const,
    onModeChange: vi.fn(),
    rain3h: 40,
    rain24h: 30,
    traffic: 30,
    onRain3hChange: vi.fn(),
    onRain24hChange: vi.fn(),
    onTrafficChange: vi.fn(),
    onPreset: vi.fn(),
    hazardMode: false,
    onToggleHazard: vi.fn(),
    isLoadingRisk: false,
    liveError: null,
    coreError: null,
    offlineNotice: null,
    onRetry: vi.fn(),
    isMock: true,
    onSelectHotspot: vi.fn(),
    ...overrides,
  };
  return { ...render(<CorridorsScreen {...props} />), props };
}

describe('CorridorsScreen', () => {
  it('lists corridors with the honesty banner', () => {
    renderScreen();
    expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
    expect(screen.getByText(/relative ranking from an/)).toBeInTheDocument();
  });

  it('filters by search text', () => {
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/Search underpasses/), {
      target: { value: 'minto' },
    });
    expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
    expect(screen.queryByText('Moolchand underpass')).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', () => {
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText(/Search underpasses/), {
      target: { value: 'zzz-no-such-road' },
    });
    expect(screen.getByText('No corridors match')).toBeInTheDocument();
  });

  it('critical filter keeps only high/severe corridors', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Critical / High Risk'));
    expect(screen.queryByText('Karala–Kanjhawala Road')).not.toBeInTheDocument();
  });

  it('warranty filter keeps only in-warranty corridors', () => {
    renderScreen();
    fireEvent.click(screen.getByText('In Warranty'));
    expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
    expect(screen.queryByText('Loni Road Golchakkar')).not.toBeInTheDocument();
  });

  it('preset buttons invoke onPreset with documented values', () => {
    const { props } = renderScreen();
    fireEvent.click(screen.getByText('Extreme'));
    expect(props.onPreset).toHaveBeenCalledWith(80, 60, 60);
  });

  it('mode switch invokes onModeChange', () => {
    const { props } = renderScreen();
    fireEvent.click(screen.getByText('Live (hourly)'));
    expect(props.onModeChange).toHaveBeenCalledWith('live');
  });

  it('shows live errors inline without clearing the list', () => {
    renderScreen({ liveError: 'Live scores not available yet' });
    expect(screen.getByText('Live scores unavailable')).toBeInTheDocument();
    expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
  });

  it('shows the offline notice with a retry action', () => {
    const { props } = renderScreen({ offlineNotice: 'connection refused' });
    expect(screen.getByText(/Backend unreachable/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry'));
    expect(props.onRetry).toHaveBeenCalled();
  });

  it('shows a blocking error with retry when no hotspots loaded', () => {
    const { props } = renderScreen({ hotspots: [], scores: [], coreError: 'boom' });
    expect(screen.getByText('Backend Connection Required')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry Connection'));
    expect(props.onRetry).toHaveBeenCalled();
  });

  it('toggles hazard-under-water ranking', () => {
    const { props } = renderScreen();
    fireEvent.click(screen.getByText('Hazard under water'));
    expect(props.onToggleHazard).toHaveBeenCalled();
  });
});
