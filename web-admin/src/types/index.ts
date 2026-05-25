export type BookingStatus = 'waiting' | 'calling' | 'done' | 'skipped';

export interface Patient {
  id: number;
  nama: string;
  nik: string;
  no_hp?: string | null;
  alamat?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Poli {
  id: number;
  nama_poli: string;
  kode_poli: string;
  created_at?: string;
  updated_at?: string;
}

export interface Doctor {
  id: number;
  nama: string;
  spesialis: string;
  no_hp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: number;
  doctor_id: number;
  poli_id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  doctor?: Doctor;
  poli?: Poli;
}

export interface Booking {
  id: number;
  patient_id: number;
  schedule_id: number;
  nomor_antrean: string;
  tanggal: string;
  status: BookingStatus;
  keluhan?: string | null;
  patient?: Patient;
  schedule?: Schedule;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveQueue {
  poli_id: number;
  poli_name: string;
  current_queue_number: string;
  booking_id: number;
  patient_name: string;
  status: BookingStatus;
  called_at: string;
  updated_at: string;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}
