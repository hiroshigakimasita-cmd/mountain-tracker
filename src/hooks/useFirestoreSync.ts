import { useEffect, useRef, useCallback, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import type { User } from 'firebase/auth';
import type { SyncStatus } from '../components/sidebar/AuthButton.tsx';

interface SyncOptions<T extends { id: string }> {
  user: User | null;
  collectionName: string;
  localData: T[];
  setLocalData: (value: T[] | ((prev: T[]) => T[])) => void;
  getUpdatedAt: (item: T) => string;
}

export function useFirestoreSync<T extends { id: string }>({
  user,
  collectionName,
  localData,
  setLocalData,
  getUpdatedAt,
}: SyncOptions<T>) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const unsubRef = useRef<Unsubscribe | null>(null);
  const initialSyncDoneRef = useRef(false);
  const skipNextSnapshotRef = useRef(false);

  // Get Firestore collection reference for current user
  const getColRef = useCallback(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, collectionName);
  }, [user, collectionName]);

  // Upload local data to Firestore (initial sync)
  const uploadLocalData = useCallback(
    async (items: T[]) => {
      if (!db || !user || items.length === 0) return;
      const colRef = collection(db, 'users', user.uid, collectionName);
      const batch = writeBatch(db);
      for (const item of items) {
        batch.set(doc(colRef, item.id), item);
      }
      await batch.commit();
    },
    [user, collectionName],
  );

  // Start listening and do initial sync
  useEffect(() => {
    if (!user || !db) {
      // Clean up when user logs out
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      initialSyncDoneRef.current = false;
      setSyncStatus('idle');
      return;
    }

    const colRef = getColRef();
    if (!colRef) return;

    setSyncStatus('syncing');

    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (skipNextSnapshotRef.current) {
          skipNextSnapshotRef.current = false;
          setSyncStatus('synced');
          return;
        }

        const remoteItems = new Map<string, T>();
        snapshot.docs.forEach((d) => {
          remoteItems.set(d.id, d.data() as T);
        });

        if (!initialSyncDoneRef.current) {
          // Initial sync: merge local and remote, dedup by name+coordinates
          initialSyncDoneRef.current = true;
          const merged = mergeData(localData, remoteItems, getUpdatedAt);

          // Deduplicate: if multiple items share the same name, keep the one with newest updatedAt
          const { deduped, removedIds } = deduplicateByName(merged, getUpdatedAt);
          setLocalData(deduped);

          // Remove duplicate docs from Firestore
          if (removedIds.length > 0) {
            const colRef2 = collection(db!, 'users', user!.uid, collectionName);
            const batch2 = writeBatch(db!);
            for (const rid of removedIds) {
              batch2.delete(doc(colRef2, rid));
            }
            skipNextSnapshotRef.current = true;
            batch2.commit().catch(console.error);
          }

          // Upload any local-only items to Firestore
          const remoteIds = new Set(remoteItems.keys());
          const localOnly = deduped.filter((item) => !remoteIds.has(item.id));
          if (localOnly.length > 0) {
            skipNextSnapshotRef.current = true;
            uploadLocalData(localOnly).catch(console.error);
          }
        } else {
          // Subsequent snapshots: remote changes from other devices
          setLocalData((prev) => mergeData(prev, remoteItems, getUpdatedAt));
        }

        setSyncStatus('synced');
      },
      (error) => {
        console.error(`Firestore sync error (${collectionName}):`, error);
        setSyncStatus('error');
      },
    );

    unsubRef.current = unsub;

    return () => {
      unsub();
      unsubRef.current = null;
      initialSyncDoneRef.current = false;
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Write a single document to Firestore
  const syncWrite = useCallback(
    async (item: T) => {
      const colRef = getColRef();
      if (!colRef) return;
      setSyncStatus('syncing');
      try {
        skipNextSnapshotRef.current = true;
        await setDoc(doc(colRef, item.id), item);
        setSyncStatus('synced');
      } catch (e) {
        console.error('Firestore write error:', e);
        setSyncStatus('error');
      }
    },
    [getColRef],
  );

  // Delete a document from Firestore
  const syncDelete = useCallback(
    async (id: string) => {
      const colRef = getColRef();
      if (!colRef) return;
      setSyncStatus('syncing');
      try {
        skipNextSnapshotRef.current = true;
        await deleteDoc(doc(colRef, id));
        setSyncStatus('synced');
      } catch (e) {
        console.error('Firestore delete error:', e);
        setSyncStatus('error');
      }
    },
    [getColRef],
  );

  // Batch write (for preset data load)
  const syncBatchWrite = useCallback(
    async (items: T[]) => {
      if (!db || !user || items.length === 0) return;
      setSyncStatus('syncing');
      try {
        skipNextSnapshotRef.current = true;
        await uploadLocalData(items);
        setSyncStatus('synced');
      } catch (e) {
        console.error('Firestore batch write error:', e);
        setSyncStatus('error');
      }
    },
    [user, uploadLocalData],
  );

  return { syncStatus, syncWrite, syncDelete, syncBatchWrite };
}

/** 同じ name+座標 を持つアイテムが複数あれば、updatedAt が最新のものだけ残す */
function deduplicateByName<T extends { id: string }>(
  items: T[],
  getUpdatedAt: (item: T) => string,
): { deduped: T[]; removedIds: string[] } {
  if (items.length === 0 || !('name' in items[0])) {
    return { deduped: items, removedIds: [] };
  }

  // name + 座標(丸め) をキーにしてグループ化
  // 同じ名前でも座標が大きく異なる場合は別の山として扱う
  const byKey = new Map<string, T[]>();
  for (const item of items) {
    const m = item as T & { name: string; lat?: number; lng?: number };
    const lat = m.lat != null ? m.lat.toFixed(2) : '0';
    const lng = m.lng != null ? m.lng.toFixed(2) : '0';
    const key = `${m.name}|${lat}|${lng}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(item);
  }

  const deduped: T[] = [];
  const removedIds: string[] = [];

  for (const group of byKey.values()) {
    if (group.length === 1) {
      deduped.push(group[0]);
    } else {
      // Keep the one with the newest updatedAt
      group.sort((a, b) => getUpdatedAt(b).localeCompare(getUpdatedAt(a)));
      deduped.push(group[0]);
      for (let i = 1; i < group.length; i++) {
        removedIds.push(group[i].id);
      }
    }
  }

  return { deduped, removedIds };
}

function mergeData<T extends { id: string }>(
  local: T[],
  remote: Map<string, T>,
  getUpdatedAt: (item: T) => string,
): T[] {
  const merged = new Map<string, T>();

  // Start with local data
  for (const item of local) {
    merged.set(item.id, item);
  }

  // Merge remote: use whichever has newer updatedAt
  for (const [id, remoteItem] of remote) {
    const localItem = merged.get(id);
    if (!localItem) {
      merged.set(id, remoteItem);
    } else {
      const localTime = getUpdatedAt(localItem);
      const remoteTime = getUpdatedAt(remoteItem);
      if (remoteTime > localTime) {
        merged.set(id, remoteItem);
      }
    }
  }

  return Array.from(merged.values());
}
