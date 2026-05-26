import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callQueue, fetchQueues, updateBookingStatus } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';

export const queueKeys = {
  all: ['queues'] as const,
  byPoli: (poliId: number | null) => ['queues', poliId] as const,
};

export function useQueuesQuery(poliId: number | null) {
  return useQuery({
    queryKey: queueKeys.byPoli(poliId),
    queryFn: async () => {
      const all = await fetchQueues();
      if (poliId == null) return all;
      return all.filter((b) => b.schedule?.poli_id === poliId);
    },
    enabled: poliId != null,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function useCallQueueMutation(poliId: number | null) {
  const qc = useQueryClient();
  return useMutation<Booking, Error, number, { previous?: Booking[] }>({
    mutationFn: (id: number) => callQueue(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queueKeys.byPoli(poliId) });
      const previous = qc.getQueryData<Booking[]>(queueKeys.byPoli(poliId));
      if (previous) {
        qc.setQueryData<Booking[]>(
          queueKeys.byPoli(poliId),
          previous.map((b) => (b.id === id ? { ...b, status: 'calling' } : b)),
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queueKeys.byPoli(poliId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queueKeys.byPoli(poliId) });
    },
  });
}

export function useUpdateStatusMutation(poliId: number | null) {
  const qc = useQueryClient();
  return useMutation<
    Booking,
    Error,
    { id: number; status: BookingStatus },
    { previous?: Booking[] }
  >({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queueKeys.byPoli(poliId) });
      const previous = qc.getQueryData<Booking[]>(queueKeys.byPoli(poliId));
      if (previous) {
        qc.setQueryData<Booking[]>(
          queueKeys.byPoli(poliId),
          previous.map((b) => (b.id === id ? { ...b, status } : b)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queueKeys.byPoli(poliId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queueKeys.byPoli(poliId) });
    },
  });
}
