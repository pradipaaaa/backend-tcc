import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callQueue, fetchQueues, updateBookingStatus } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';
import { useDemoStore } from '@/stores/useDemoStore';

export const queueKeys = {
  all: ['queues'] as const,
  byPoli: (poliId: number | null, demo = false) =>
    ['queues', poliId, demo ? 'demo' : 'live'] as const,
};

export function useQueuesQuery(poliId: number | null) {
  const demo = useDemoStore((s) => s.enabled);
  const demoBookings = useDemoStore((s) => s.bookings);

  return useQuery({
    queryKey: queueKeys.byPoli(poliId, demo),
    queryFn: async () => {
      if (demo) {
        if (poliId == null) return demoBookings;
        return demoBookings.filter((b) => b.schedule?.poli_id === poliId);
      }
      const all = await fetchQueues();
      if (poliId == null) return all;
      return all.filter((b) => b.schedule?.poli_id === poliId);
    },
    enabled: poliId != null,
    staleTime: 15_000,
    refetchInterval: demo ? false : 15_000,
  });
}

export function useCallQueueMutation(poliId: number | null) {
  const qc = useQueryClient();
  const demo = useDemoStore((s) => s.enabled);
  const demoCall = useDemoStore((s) => s.callQueue);

  return useMutation<Booking, Error, number, { previous?: Booking[] }>({
    mutationFn: async (id: number) => {
      if (demo) {
        const b = demoCall(id);
        if (!b) throw new Error('Booking tidak ditemukan');
        return b;
      }
      return callQueue(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queueKeys.byPoli(poliId, demo) });
      const previous = qc.getQueryData<Booking[]>(
        queueKeys.byPoli(poliId, demo),
      );
      if (previous) {
        qc.setQueryData<Booking[]>(
          queueKeys.byPoli(poliId, demo),
          previous.map((b) => (b.id === id ? { ...b, status: 'calling' } : b)),
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queueKeys.byPoli(poliId, demo), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queueKeys.byPoli(poliId, demo) });
    },
  });
}

export function useUpdateStatusMutation(poliId: number | null) {
  const qc = useQueryClient();
  const demo = useDemoStore((s) => s.enabled);
  const demoUpdate = useDemoStore((s) => s.updateStatus);

  return useMutation<
    Booking,
    Error,
    { id: number; status: BookingStatus },
    { previous?: Booking[] }
  >({
    mutationFn: async ({ id, status }) => {
      if (demo) {
        const b = demoUpdate(id, status);
        if (!b) throw new Error('Booking tidak ditemukan');
        return b;
      }
      return updateBookingStatus(id, status);
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queueKeys.byPoli(poliId, demo) });
      const previous = qc.getQueryData<Booking[]>(
        queueKeys.byPoli(poliId, demo),
      );
      if (previous) {
        qc.setQueryData<Booking[]>(
          queueKeys.byPoli(poliId, demo),
          previous.map((b) => (b.id === id ? { ...b, status } : b)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queueKeys.byPoli(poliId, demo), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queueKeys.byPoli(poliId, demo) });
    },
  });
}
