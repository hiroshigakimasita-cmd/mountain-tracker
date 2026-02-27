import { Polyline, Tooltip } from 'react-leaflet';
import type { GpxTrack } from '../../types/index.ts';

interface GpxTrackLayerProps {
  tracks: GpxTrack[];
}

export function GpxTrackLayer({ tracks }: GpxTrackLayerProps) {
  return (
    <>
      {tracks.map((track) => (
        <Polyline
          key={track.id}
          positions={track.coordinates}
          pathOptions={{ color: track.color, weight: 3, opacity: 0.8 }}
        >
          <Tooltip sticky>
            <strong>{track.name}</strong>
            {track.totalDistance != null && (
              <span> ({(track.totalDistance / 1000).toFixed(1)} km)</span>
            )}
            {track.elevationGain != null && (
              <span> ↑{track.elevationGain}m</span>
            )}
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
}
