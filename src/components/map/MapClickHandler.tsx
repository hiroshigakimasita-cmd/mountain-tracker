import { useMapEvents } from 'react-leaflet';
import type { MapMode } from '../../types/index.ts';

interface MapClickHandlerProps {
  mode: MapMode;
  onMapClick: (lat: number, lng: number) => void;
}

export function MapClickHandler({ mode, onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (mode === 'addMountain') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}
