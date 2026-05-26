import { useQuery } from '@tanstack/react-query';
import { fetchDoctors, fetchPolis, fetchSchedules } from '@/lib/api';

export function usePolisQuery() {
  return useQuery({
    queryKey: ['polis'],
    queryFn: fetchPolis,
    staleTime: 5 * 60_000,
  });
}

export function useDoctorsQuery() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: fetchDoctors,
    staleTime: 5 * 60_000,
  });
}

export function useSchedulesQuery() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    staleTime: 2 * 60_000,
  });
}
