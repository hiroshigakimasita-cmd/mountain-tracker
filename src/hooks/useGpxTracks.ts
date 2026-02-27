import { useLocalStorage } from './useLocalStorage.ts';
import { useFirestoreSync } from './useFirestoreSync.ts';
import type { GpxTrack } from '../types/index.ts';
import type { User } from 'firebase/auth';
import type { SyncStatus } from '../components/sidebar/AuthButton.tsx';

const STORAGE_KEY = 'mountain-tracker-gpx-tracks';

const TRACK_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#34495e',
  '#16a085',
  '#c0392b',
];

export function useGpxTracks(user: User | null = null) {
  const [tracks, setTracks] = useLocalStorage<GpxTrack[]>(STORAGE_KEY, []);

  const { syncStatus, syncWrite, syncDelete, syncBatchWrite } = useFirestoreSync<GpxTrack>({
    user,
    collectionName: 'gpxTracks',
    localData: tracks,
    setLocalData: setTracks,
    getUpdatedAt: (t) => t.createdAt,
  });

  const addTrack = (
    parsed: {
      name: string;
      fileName: string;
      coordinates: [number, number][];
      totalDistance: number | null;
      elevationGain: number | null;
      trackDate: string | null;
    },
    rawGpx: string,
    mountainId?: string,
  ): GpxTrack => {
    const track: GpxTrack = {
      id: crypto.randomUUID(),
      name: parsed.name,
      fileName: parsed.fileName,
      coordinates: parsed.coordinates,
      totalDistance: parsed.totalDistance,
      elevationGain: parsed.elevationGain,
      trackDate: parsed.trackDate,
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      rawGpx,
      mountainId: mountainId ?? null,
      createdAt: new Date().toISOString(),
    };
    setTracks((prev) => [...prev, track]);
    syncWrite(track);
    return track;
  };

  const deleteTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    syncDelete(id);
  };

  const importTracks = (imported: GpxTrack[]) => {
    setTracks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newTracks = imported.filter((t) => !existingIds.has(t.id));
      if (newTracks.length > 0) {
        syncBatchWrite(newTracks);
      }
      return [...prev, ...newTracks];
    });
  };

  return { tracks, addTrack, deleteTrack, importTracks, setTracks, syncStatus: syncStatus as SyncStatus };
}
