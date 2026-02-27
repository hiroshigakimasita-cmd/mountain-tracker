import { useState } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import { MapClickHandler } from './MapClickHandler.tsx';
import { MountainMarkers } from './MountainMarkers.tsx';
import { GpxTrackLayer } from './GpxTrackLayer.tsx';
import { FlyToHandler } from './FlyToHandler.tsx';
import type { MapMode, Mountain, GpxTrack } from '../../types/index.ts';

const JAPAN_CENTER: [number, number] = [36.5, 138.0];
const DEFAULT_ZOOM = 6;

interface MapViewProps {
  mountains: Mountain[];
  gpxTracks: GpxTrack[];
  mapMode: MapMode;
  onMapClick: (lat: number, lng: number) => void;
  onEditMountain: (mountain: Mountain) => void;
  onToggleClimbed: (id: string) => void;
  onSelectMountain: (id: string) => void;
  flyToTarget: { lat: number; lng: number } | null;
}

export function MapView({
  mountains,
  gpxTracks,
  mapMode,
  onMapClick,
  onEditMountain,
  onToggleClimbed,
  onSelectMountain,
  flyToTarget,
}: MapViewProps) {
  const [cursorPos, setCursorPos] = useState<string>('');

  return (
    <div className={`map-wrapper ${mapMode === 'addMountain' ? 'map-add-mode' : ''}`}>
      {mapMode === 'addMountain' && (
        <div className="map-mode-banner">
          地図をクリックして山の位置を選択してください
          {cursorPos && <span className="map-cursor-pos">{cursorPos}</span>}
        </div>
      )}
      <MapContainer
        center={JAPAN_CENTER}
        zoom={DEFAULT_ZOOM}
        className="map-container"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="地形図 (OpenTopoMap)">
            <TileLayer
              attribution='Map data: &copy; OpenStreetMap, SRTM | Style: &copy; OpenTopoMap'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapClickHandler
          mode={mapMode}
          onMapClick={(lat, lng) => {
            setCursorPos(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            onMapClick(lat, lng);
          }}
        />
        <MountainMarkers
          mountains={mountains}
          onEdit={onEditMountain}
          onToggleClimbed={onToggleClimbed}
          onSelect={onSelectMountain}
        />
        <GpxTrackLayer tracks={gpxTracks} />
        <FlyToHandler target={flyToTarget} />
      </MapContainer>
    </div>
  );
}
