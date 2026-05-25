import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, BookingStatus } from '@/types';
import { buildDemoBookings } from '@/lib/demoData';

interface DemoState {
  enabled: boolean;
  bookings: Booking[];
  toggle: () => void;
  setEnabled: (v: boolean) => void;
  reset: () => void;
  callQueue: (id: number) => Booking | null;
  updateStatus: (id: number, status: BookingStatus) => Booking | null;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      enabled: false,
      bookings: buildDemoBookings(),
      toggle: () => set({ enabled: !get().enabled }),
      setEnabled: (v) => set({ enabled: v }),
      reset: () => set({ bookings: buildDemoBookings() }),
      callQueue: (id) => {
        const list = get().bookings;
        // Demote any currently-calling for the same poli, then mark target as calling.
        const target = list.find((b) => b.id === id);
        if (!target) return null;
        const poliId = target.schedule?.poli_id;
        const next = list.map((b) => {
          if (b.id === id) return { ...b, status: 'calling' as const };
          if (b.status === 'calling' && b.schedule?.poli_id === poliId)
            return { ...b, status: 'done' as const };
          return b;
        });
        set({ bookings: next });
        return next.find((b) => b.id === id) ?? null;
      },
      updateStatus: (id, status) => {
        const next = get().bookings.map((b) =>
          b.id === id ? { ...b, status } : b,
        );
        set({ bookings: next });
        return next.find((b) => b.id === id) ?? null;
      },
    }),
    { name: 'puskesmas.admin.demo' },
  ),
);
