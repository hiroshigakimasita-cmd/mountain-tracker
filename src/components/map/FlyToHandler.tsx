import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface FlyToHandlerProps {
  target: { lat: number; lng: number } | null;
}

export function FlyToHandler({ target }: FlyToHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 13, { duration: 1 });
    }
  }, [target, map]);

  return null;
}
