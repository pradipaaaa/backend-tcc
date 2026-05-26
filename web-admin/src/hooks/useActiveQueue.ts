import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { ActiveQueue } from '@/types';
import { useQueuesQuery } from './useQueues';

export interface UseActiveQueueResult {
  data: ActiveQueue | null;
  error: Error | null;
  ready: boolean;
  configured: boolean;
}

/**
 * Realtime listener Firestore: active_queues/{poliId}.
 *
 * - Firebase configured: subscribe onSnapshot.
 * - Firebase not configured: derive dari useQueuesQuery (polling fallback).
 */
export function useActiveQueue(poliId: number | null): UseActiveQueueResult {
  const { data: queues } = useQueuesQuery(poliId);

  const [fsData, setFsData] = useState<ActiveQueue | null>(null);
  const [fsError, setFsError] = useState<Error | null>(null);
  const [fsReady, setFsReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || poliId == null) {
      setFsData(null);
      setFsError(null);
      setFsReady(false);
      return;
    }

    const ref = doc(db, 'active_queues', String(poliId));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setFsData(snap.exists() ? (snap.data() as ActiveQueue) : null);
        setFsReady(true);
        setFsError(null);
      },
      (err) => setFsError(err as Error),
    );
    return () => unsub();
  }, [poliId]);

  const fallback = useMemo<ActiveQueue | null>(() => {
    const calling = queues?.find((b) => b.status === 'calling');
    if (!calling) return null;
    return {
      poli_id: calling.schedule?.poli_id ?? poliId ?? 0,
      poli_name: calling.schedule?.poli?.nama_poli ?? '',
      current_queue_number: calling.nomor_antrean,
      booking_id: calling.id,
      patient_name: calling.patient?.nama ?? '',
      status: calling.status,
      called_at: calling.updated_at ?? new Date().toISOString(),
      updated_at: calling.updated_at ?? new Date().toISOString(),
    };
  }, [queues, poliId]);

  if (!isFirebaseConfigured) {
    return { data: fallback, error: null, ready: true, configured: false };
  }
  return { data: fsData, error: fsError, ready: fsReady, configured: true };
}
