import { useQuery } from '@tanstack/react-query';
import { fetchDoctors, fetchPolis, fetchSchedules } from '@/lib/api';
import { useDemoStore } from '@/stores/useDemoStore';
import { demoDoctors, demoPolis, demoSchedules } from '@/lib/demoData';

export function usePolisQuery() {
  const demo = useDemoStore((s) => s.enabled);
  return useQuery({
    queryKey: ['polis', demo ? 'demo' : 'live'],
    queryFn: async () => {
      if (demo) return demoPolis;
      return fetchPolis();
    },
    staleTime: 5 * 60_000,
  });
}

export function useDoctorsQuery() {
  const demo = useDemoStore((s) => s.enabled);
  return useQuery({
    queryKey: ['doctors', demo ? 'demo' : 'live'],
    queryFn: async () => {
      if (demo) return demoDoctors;
      return fetchDoctors();
    },
    staleTime: 5 * 60_000,
  });
}

export function useSchedulesQuery() {
  const demo = useDemoStore((s) => s.enabled);
  return useQuery({
    queryKey: ['schedules', demo ? 'demo' : 'live'],
    queryFn: async () => {
      if (demo) return demoSchedules;
      return fetchSchedules();
    },
    staleTime: 2 * 60_000,
  });
}
