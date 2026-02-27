import { useMemo, useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.ts';
import { useFirestoreSync } from './useFirestoreSync.ts';
import { PRESET_MOUNTAINS } from '../data/preset-mountains.ts';
import type { Mountain, MountainFilter, MountainFormData } from '../types/index.ts';
import type { User } from 'firebase/auth';
import type { SyncStatus } from '../components/sidebar/AuthButton.tsx';

const STORAGE_KEY = 'mountain-tracker-mountains';

export function useMountains(user: User | null = null) {
  const [mountains, setMountains] = useLocalStorage<Mountain[]>(STORAGE_KEY, []);
  const [filter, setFilter] = useState<MountainFilter>({
    searchText: '',
    categories: [],
    climbedStatus: 'all',
  });

  const { syncStatus, syncWrite, syncDelete, syncBatchWrite } = useFirestoreSync<Mountain>({
    user,
    collectionName: 'mountains',
    localData: mountains,
    setLocalData: setMountains,
    getUpdatedAt: (m) => m.updatedAt,
  });

  const addMountain = (formData: MountainFormData) => {
    const now = new Date().toISOString();
    const mountain: Mountain = {
      id: crypto.randomUUID(),
      name: formData.name,
      elevation: Number(formData.elevation),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      category: formData.category,
      isClimbed: formData.isClimbed,
      climbDate: formData.isClimbed && formData.climbDate ? formData.climbDate : null,
      notes: formData.notes,
      gpxTrackIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setMountains((prev) => [...prev, mountain]);
    syncWrite(mountain);
    return mountain;
  };

  const updateMountain = (id: string, formData: MountainFormData) => {
    setMountains((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = {
          ...m,
          name: formData.name,
          elevation: Number(formData.elevation),
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          category: formData.category,
          isClimbed: formData.isClimbed,
          climbDate: formData.isClimbed && formData.climbDate ? formData.climbDate : null,
          notes: formData.notes,
          updatedAt: new Date().toISOString(),
        };
        syncWrite(updated);
        return updated;
      }),
    );
  };

  const deleteMountain = (id: string) => {
    setMountains((prev) => prev.filter((m) => m.id !== id));
    syncDelete(id);
  };

  const toggleClimbed = (id: string) => {
    setMountains((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = {
          ...m,
          isClimbed: !m.isClimbed,
          climbDate: !m.isClimbed ? new Date().toISOString().split('T')[0] : null,
          updatedAt: new Date().toISOString(),
        };
        syncWrite(updated);
        return updated;
      }),
    );
  };

  const linkGpxTrack = (mountainId: string, trackId: string) => {
    setMountains((prev) =>
      prev.map((m) => {
        if (m.id !== mountainId) return m;
        const updated = { ...m, gpxTrackIds: [...m.gpxTrackIds, trackId], updatedAt: new Date().toISOString() };
        syncWrite(updated);
        return updated;
      }),
    );
  };

  const importMountains = (imported: Mountain[]) => {
    setMountains((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newMountains = imported.filter((m) => !existingIds.has(m.id));
      if (newMountains.length > 0) {
        syncBatchWrite(newMountains);
      }
      return [...prev, ...newMountains];
    });
  };

  const loadPresetData = useCallback(() => {
    const now = new Date().toISOString();
    const presetAsMountains: Mountain[] = PRESET_MOUNTAINS.map((p) => ({
      ...p,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));
    setMountains(presetAsMountains);
    syncBatchWrite(presetAsMountains);
    return presetAsMountains.length;
  }, [setMountains, syncBatchWrite]);

  const filteredMountains = useMemo(() => {
    return mountains.filter((m) => {
      if (filter.searchText && !m.name.includes(filter.searchText)) {
        return false;
      }
      if (filter.categories.length > 0 && !filter.categories.includes(m.category)) {
        return false;
      }
      if (filter.climbedStatus === 'climbed' && !m.isClimbed) return false;
      if (filter.climbedStatus === 'unclimbed' && m.isClimbed) return false;
      return true;
    });
  }, [mountains, filter]);

  return {
    mountains,
    filteredMountains,
    filter,
    setFilter,
    addMountain,
    updateMountain,
    deleteMountain,
    toggleClimbed,
    linkGpxTrack,
    importMountains,
    loadPresetData,
    setMountains,
    syncStatus: syncStatus as SyncStatus,
  };
}
