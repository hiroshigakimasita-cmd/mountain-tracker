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
          // Initial sync: merge local and remote
          initialSyncDoneRef.current = true;
          const merged = mergeData(localData, remoteItems, getUpdatedAt);
          setLocalData(merged);

          // Upload any local-only items to Firestore
          const remoteIds = new Set(remoteItems.keys());
          const localOnly = localData.filter((item) => !remoteIds.has(item.id));
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
