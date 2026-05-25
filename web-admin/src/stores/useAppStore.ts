import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  selectedPoliId: number | null;
  setSelectedPoli: (id: number) => void;
  clearSelectedPoli: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedPoliId: null,
      setSelectedPoli: (id) => set({ selectedPoliId: id }),
      clearSelectedPoli: () => set({ selectedPoliId: null }),
    }),
    { name: 'puskesmas.admin.poli' },
  ),
);
