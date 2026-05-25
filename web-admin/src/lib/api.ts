import axios from 'axios';
import type {
  ApiEnvelope,
  Booking,
  BookingStatus,
  Doctor,
  Poli,
  Schedule,
} from '@/types';

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL,
  timeout: 12_000,
  headers: { Accept: 'application/json' },
});

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in (payload as Record<string, unknown>) &&
    !Array.isArray(payload)
  ) {
    const inner = (payload as ApiEnvelope<T>).data;
    if (inner !== undefined) return inner;
  }
  return payload as T;
}

export async function fetchPolis(): Promise<Poli[]> {
  const { data } = await api.get<Poli[] | ApiEnvelope<Poli[]>>('/polis');
  return unwrap(data);
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const { data } = await api.get<Doctor[] | ApiEnvelope<Doctor[]>>('/doctors');
  return unwrap(data);
}

export async function fetchSchedules(): Promise<Schedule[]> {
  const { data } = await api.get<Schedule[] | ApiEnvelope<Schedule[]>>(
    '/schedules',
  );
  return unwrap(data);
}

export async function fetchQueues(): Promise<Booking[]> {
  const { data } = await api.get<Booking[] | ApiEnvelope<Booking[]>>('/queues');
  return unwrap(data);
}

export async function getBooking(id: number): Promise<Booking> {
  const { data } = await api.get<Booking | ApiEnvelope<Booking>>(
    `/booking/${id}`,
  );
  return unwrap(data);
}

export async function callQueue(id: number): Promise<Booking> {
  const { data } = await api.post<Booking | ApiEnvelope<Booking>>(
    `/call-queue/${id}`,
  );
  return unwrap(data);
}

/**
 * ⚠️ Backend Gap: endpoint PATCH /api/booking/{id} belum tersedia.
 * Fungsi ini sudah disiapkan; akan jalan begitu backend menambahkan endpoint.
 */
export async function updateBookingStatus(
  id: number,
  status: BookingStatus,
): Promise<Booking> {
  const { data } = await api.patch<Booking | ApiEnvelope<Booking>>(
    `/booking/${id}`,
    { status },
  );
  return unwrap(data);
}
