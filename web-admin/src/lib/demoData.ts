import type {
  ActiveQueue,
  Booking,
  BookingStatus,
  Doctor,
  Poli,
  Schedule,
} from '@/types';
import { todayISO } from './utils';

export const demoPolis: Poli[] = [
  { id: 1, nama_poli: 'Poli Umum', kode_poli: 'U' },
  { id: 2, nama_poli: 'Poli Gigi & Mulut', kode_poli: 'G' },
  { id: 3, nama_poli: 'Poli KIA / KB', kode_poli: 'K' },
  { id: 4, nama_poli: 'Poli Anak', kode_poli: 'A' },
  { id: 5, nama_poli: 'Poli Lansia', kode_poli: 'L' },
  { id: 6, nama_poli: 'Laboratorium', kode_poli: 'B' },
];

export const demoDoctors: Doctor[] = [
  { id: 1, nama: 'dr. Andi Pratama', spesialis: 'Dokter Umum', no_hp: '081200001111' },
  { id: 2, nama: 'drg. Sari Hapsari', spesialis: 'Dokter Gigi', no_hp: '081200002222' },
  { id: 3, nama: 'dr. Maya Sari, Sp.OG', spesialis: 'Obstetri & Ginekologi', no_hp: '081200003333' },
  { id: 4, nama: 'dr. Rio Wibowo, Sp.A', spesialis: 'Dokter Anak', no_hp: '081200004444' },
  { id: 5, nama: 'dr. Hendra Gunawan', spesialis: 'Geriatri', no_hp: '081200005555' },
  { id: 6, nama: 'Lab. Tim Patologi', spesialis: 'Patologi Klinik', no_hp: '081200006666' },
];

export const demoSchedules: Schedule[] = demoDoctors.map((d, idx) => ({
  id: idx + 1,
  doctor_id: d.id,
  poli_id: idx + 1,
  hari: 'Senin-Jumat',
  jam_mulai: '08:00:00',
  jam_selesai: '14:00:00',
  doctor: d,
  poli: demoPolis[idx],
}));

const FIRST_NAMES = [
  'Budi', 'Siti', 'Ahmad', 'Dewi', 'Hendra', 'Nita', 'Rina', 'Joko',
  'Lina', 'Bambang', 'Maya', 'Iwan', 'Putri', 'Yuni', 'Eko', 'Diana',
  'Fajar', 'Citra',
];
const LAST_NAMES = [
  'Santoso', 'Aminah', 'Yani', 'Lestari', 'Wijaya', 'Permata', 'Melati',
  'Saputra', 'Marwan', 'Pertiwi', 'Setyawan', 'Cahyani', 'Hidayat',
  'Rahmawati', 'Pratama', 'Anggraini', 'Nugroho', 'Maharani',
];

function pickStatus(idx: number): BookingStatus {
  if (idx === 5) return 'calling';
  if (idx < 5) return 'done';
  if (idx === 6) return 'skipped';
  return 'waiting';
}

function buildBookings(poli: Poli, scheduleId: number): Booking[] {
  const today = todayISO();
  return Array.from({ length: 12 }).map((_, i) => {
    const num = String(i + 1).padStart(3, '0');
    const status = pickStatus(i);
    const firstName = FIRST_NAMES[(i + poli.id) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 2 + poli.id) % LAST_NAMES.length];
    const updated = new Date();
    updated.setHours(8, 30 + i * 5, 0, 0);

    return {
      id: poli.id * 100 + i + 1,
      patient_id: poli.id * 100 + i + 1,
      schedule_id: scheduleId,
      nomor_antrean: `${poli.kode_poli}${num}`,
      tanggal: today,
      status,
      keluhan: null,
      patient: {
        id: poli.id * 100 + i + 1,
        nama: `${firstName} ${lastName}`,
        nik: `327${String(poli.id).padStart(2, '0')}${String(i).padStart(7, '0')}`,
        no_hp: '0812-3456-' + String(1000 + i).padStart(4, '0'),
      },
      schedule: demoSchedules.find((s) => s.id === scheduleId),
      created_at: updated.toISOString(),
      updated_at: updated.toISOString(),
    };
  });
}

export function buildDemoBookings(): Booking[] {
  return demoPolis.flatMap((p) => {
    const sched = demoSchedules.find((s) => s.poli_id === p.id);
    if (!sched) return [];
    return buildBookings(p, sched.id);
  });
}

export function buildDemoActiveQueue(poliId: number): ActiveQueue | null {
  const bookings = buildDemoBookings().filter(
    (b) => b.schedule?.poli_id === poliId && b.status === 'calling',
  );
  const calling = bookings[0];
  if (!calling) return null;
  const poli = demoPolis.find((p) => p.id === poliId)!;
  return {
    poli_id: poliId,
    poli_name: poli.nama_poli,
    current_queue_number: calling.nomor_antrean,
    booking_id: calling.id,
    patient_name: calling.patient?.nama ?? '—',
    status: calling.status,
    called_at: calling.updated_at ?? new Date().toISOString(),
    updated_at: calling.updated_at ?? new Date().toISOString(),
  };
}
