import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { GroundAsset, Hotspot, RiskScore } from '../api/types';
import { getBandColor, getHazardColor } from '../api/utils';
import { Eye, EyeOff, MapPin } from 'lucide-react';

interface MapScreenProps {
  hotspots: Hotspot[];
  scores: RiskScore[];
  assets: GroundAsset[];
  selectedId: string | null;
  onSelectHotspot: (h: Hotspot) => void;
  rain3h: number;
  picking: boolean;
  onPickLocation: (lat: number, lng: number) => void;
  isDemo: boolean;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  hotspots,
  scores,
  assets,
  selectedId,
  onSelectHotspot,
  rain3h,
  picking,
  onPickLocation,
  isDemo,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animFrameIdRef = useRef(0);
  const pulseRadiusRef = useRef(14);
  const pulseGrowingRef = useRef(true);
  const [showAssets, setShowAssets] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const selectRef = useRef(onSelectHotspot);
  selectRef.current = onSelectHotspot;
  const pickRef = useRef({ picking, onPickLocation });
  pickRef.current = { picking, onPickLocation };
  const dataRef = useRef({ hotspots, scores, assets });
  dataRef.current = { hotspots, scores, assets };

  const buildHotspotFeatures = (hsList: Hotspot[], sList: RiskScore[]): GeoJSON.Feature[] => {
    const sMap = new Map(sList.map((s) => [s.hotspot_id, s]));
    return hsList.map((hs) => {
      const s = sMap.get(hs.hotspot_id);
      const band = s?.band || 'low';
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [hs.lng, hs.lat] },
        properties: {
          hotspot_id: hs.hotspot_id,
          name: hs.name,
          band,
          color: getBandColor(band),
          probability: s?.probability ?? 0,
        },
      };
    });
  };

  const buildAssetFeatures = (astList: GroundAsset[]): GeoJSON.Feature[] => {
    return astList.map((a) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
      properties: {
        asset_id: a.asset_id,
        type: a.type,
        label: a.type.replace(/_/g, ' '),
        color: getHazardColor(a.type),
        severity: a.severity,
      },
    }));
  };

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    const apiKey = import.meta.env.VITE_LOCATION_API_KEY;

    const osmStyle = {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
          paint: { 'raster-saturation': -0.55 },
        },
      ],
    };

    let styleConfig: unknown = osmStyle;
    let fallback = true;
    if (apiKey) {
      styleConfig = `https://maps.geo.${region}.amazonaws.com/v2/styles/Standard/descriptor?key=${apiKey}&color-scheme=Light`;
      fallback = false;
    }
    setIsFallback(fallback);

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleConfig as never,
        center: [77.209, 28.6139],
        zoom: isDemo ? 11 : 10.6,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('error', () => {
        if (!fallback) {
          setIsFallback(true);
          try {
            map.setStyle(osmStyle as never);
          } catch {
            setMapFailed(true);
          }
        }
      });

      map.on('load', () => {
        const { hotspots: hs, scores: sc, assets: as } = dataRef.current;
        map.addSource('hotspots-src', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: buildHotspotFeatures(hs, sc) },
        });
        map.addLayer({
          id: 'hotspots-pulse',
          type: 'circle',
          source: 'hotspots-src',
          filter: ['==', ['get', 'band'], 'severe'],
          paint: { 'circle-radius': 16, 'circle-color': '#ef4444', 'circle-opacity': 0.35, 'circle-stroke-width': 0 },
        });
        map.addLayer({
          id: 'hotspots-circle',
          type: 'circle',
          source: 'hotspots-src',
          paint: {
            'circle-radius': 11,
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2.5,
          },
        });
        map.addLayer({
          id: 'hotspots-label',
          type: 'symbol',
          source: 'hotspots-src',
          layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.2], 'text-anchor': 'top' },
          paint: { 'text-color': '#0f172a', 'text-halo-color': '#ffffff', 'text-halo-width': 2 },
        });
        map.addSource('assets-src', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: buildAssetFeatures(as) },
        });
        map.addLayer({
          id: 'assets-circle',
          type: 'circle',
          source: 'assets-src',
          minzoom: 11,
          paint: {
            'circle-radius': 6,
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
          },
        });
        map.addLayer({
          id: 'assets-label',
          type: 'symbol',
          source: 'assets-src',
          minzoom: 12.5,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 10,
            'text-offset': [0, 1],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#475569',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });
        map.on('mouseenter', 'hotspots-circle', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'hotspots-circle', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('click', 'hotspots-circle', (e) => {
          const f = e.features?.[0];
          const id = (f?.properties as { hotspot_id?: string } | undefined)?.hotspot_id;
          if (id) {
            const found = dataRef.current.hotspots.find((h) => h.hotspot_id === id);
            if (found) selectRef.current(found);
          }
        });
        map.on('click', (e) => {
          const { picking: pk, onPickLocation: pick } = pickRef.current;
          if (pk) pick(e.lngLat.lat, e.lngLat.lng);
        });
      });

      mapRef.current = map;
    } catch {
      setMapFailed(true);
    }

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync hotspot data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('hotspots-src') as maplibregl.GeoJSONSource | undefined;
    src?.setData({ type: 'FeatureCollection', features: buildHotspotFeatures(hotspots, scores) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots, scores]);

  // Sync assets
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('assets-src') as maplibregl.GeoJSONSource | undefined;
    src?.setData({ type: 'FeatureCollection', features: buildAssetFeatures(assets) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  // Asset visibility + selection fly-to
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('assets-circle')) {
      map.setLayoutProperty('assets-circle', 'visibility', showAssets ? 'visible' : 'none');
    }
    if (map.getLayer('assets-label')) {
      map.setLayoutProperty('assets-label', 'visibility', showAssets ? 'visible' : 'none');
    }
    if (map.getLayer('hotspots-circle')) {
      map.setPaintProperty('hotspots-circle', 'circle-radius', [
        'case',
        ['==', ['get', 'hotspot_id'], selectedId || ''],
        15,
        11,
      ]);
    }
    if (selectedId) {
      const hs = hotspots.find((h) => h.hotspot_id === selectedId);
      if (hs) {
        try {
          map.flyTo({ center: [hs.lng, hs.lat], zoom: Math.max(map.getZoom(), 12), essential: true, duration: 900 });
        } catch {
          /* noop */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, showAssets]);

  // Pulse animation for severe hotspots (radius 14 -> 26 with opacity fade).
  // Static halo when the user prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animatePulse = () => {
      const map = mapRef.current;
      if (map && map.isStyleLoaded() && map.getLayer('hotspots-pulse')) {
        if (pulseGrowingRef.current) {
          pulseRadiusRef.current += 0.25;
          if (pulseRadiusRef.current >= 26) pulseGrowingRef.current = false;
        } else {
          pulseRadiusRef.current -= 0.25;
          if (pulseRadiusRef.current <= 14) pulseGrowingRef.current = true;
        }

        const opacity = Math.max(0.1, 0.45 - (pulseRadiusRef.current - 14) / 30);

        map.setPaintProperty('hotspots-pulse', 'circle-radius', pulseRadiusRef.current);
        map.setPaintProperty('hotspots-pulse', 'circle-opacity', opacity);
      }

      animFrameIdRef.current = requestAnimationFrame(animatePulse);
    };

    animFrameIdRef.current = requestAnimationFrame(animatePulse);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Rain overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    const onResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    const count = Math.floor((rain3h / 100) * 140);
    const drops = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      l: Math.random() * 16 + 10,
      v: Math.random() * 12 + 16,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (count > 0) {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const d of drops) {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.l * 0.35, d.y + d.l);
          d.y += d.v;
          d.x -= d.v * 0.35;
          if (d.y > height) {
            d.y = -10;
            d.x = Math.random() * (width + 100);
          }
        }
        ctx.stroke();
      }
      animId = requestAnimationFrame(draw);
    };
    // Static single frame when the user prefers reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.clearRect(0, 0, width, height);
      if (count > 0) {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const d of drops) {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.l * 0.35, d.y + d.l);
        }
        ctx.stroke();
      }
      return () => {
        window.removeEventListener('resize', onResize);
      };
    }
    if (count > 0) animId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', onResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [rain3h]);

  return (
    <div className="pb-24">
      <div className="relative h-72 w-full overflow-hidden bg-slate-200">
        {mapFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-bold text-slate-700">Map unavailable on this device</p>
            <p className="text-[11px] text-slate-500 mt-1">Use the pinned hotspot list below.</p>
          </div>
        ) : (
          <>
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
              <button
                onClick={() => setShowAssets((v) => !v)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white/95 text-slate-800 border border-slate-300 shadow-xs"
              >
                {showAssets ? <Eye className="w-3.5 h-3.5 text-sky-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showAssets ? 'Hazards visible' : 'Hazards hidden'}</span>
              </button>
              {isFallback && (
                <span className="text-[10px] font-medium bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded-xl">
                  Fallback basemap (Amazon Location unavailable)
                </span>
              )}
              {picking && (
                <span className="text-[11px] font-bold bg-[#0c192c] text-white px-3 py-2 rounded-xl animate-pulse">
                  Tap the map to set hazard location
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pinned hotspots quick select (preserved boilerplate pattern) */}
      <div className="p-4 space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Pinned Hotspots
        </div>
        {hotspots.map((h) => {
          const risk = scores.find((s) => s.hotspot_id === h.hotspot_id);
          const color = getBandColor(risk?.band || 'low');
          return (
            <button
              key={h.hotspot_id}
              onClick={() => onSelectHotspot(h)}
              className={`w-full bg-white p-3 rounded-xl border shadow-2xs flex items-center justify-between text-left transition ${
                selectedId === h.hotspot_id ? 'border-sky-500' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4" style={{ color }} />
                <div>
                  <div className="text-xs font-bold text-slate-800">{h.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</div>
                </div>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}55` }}
              >
                {risk?.band || 'low'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
