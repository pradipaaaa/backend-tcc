<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Poli;
use App\Models\Schedule;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === Polis ===
        $polis = collect([
            ['nama_poli' => 'Poli Umum', 'kode_poli' => 'U'],
            ['nama_poli' => 'Poli Gigi & Mulut', 'kode_poli' => 'G'],
            ['nama_poli' => 'Poli KIA / KB', 'kode_poli' => 'K'],
            ['nama_poli' => 'Poli Anak', 'kode_poli' => 'A'],
            ['nama_poli' => 'Poli Lansia', 'kode_poli' => 'L'],
            ['nama_poli' => 'Laboratorium', 'kode_poli' => 'B'],
        ])->map(fn ($p) => Poli::create($p));

        // === Doctors ===
        $doctors = collect([
            ['nama' => 'dr. Andi Pratama', 'spesialis' => 'Dokter Umum', 'no_hp' => '081200001111'],
            ['nama' => 'drg. Sari Hapsari', 'spesialis' => 'Dokter Gigi', 'no_hp' => '081200002222'],
            ['nama' => 'dr. Maya Sari, Sp.OG', 'spesialis' => 'Obstetri & Ginekologi', 'no_hp' => '081200003333'],
            ['nama' => 'dr. Rio Wibowo, Sp.A', 'spesialis' => 'Dokter Anak', 'no_hp' => '081200004444'],
            ['nama' => 'dr. Hendra Gunawan', 'spesialis' => 'Geriatri', 'no_hp' => '081200005555'],
            ['nama' => 'Lab. Tim Patologi', 'spesialis' => 'Patologi Klinik', 'no_hp' => '081200006666'],
        ])->map(fn ($d) => Doctor::create($d));

        // === Schedules: 1 schedule per poli (senin-jumat 08:00-14:00) ===
        $schedules = $polis->map(fn ($poli, $i) => Schedule::create([
            'doctor_id'   => $doctors[$i]->id,
            'poli_id'     => $poli->id,
            'hari'        => 'Senin-Jumat',
            'jam_mulai'   => '08:00:00',
            'jam_selesai' => '14:00:00',
        ]));

        // === Patients (60 fake) ===
        $firstNames = ['Budi', 'Siti', 'Ahmad', 'Dewi', 'Hendra', 'Nita', 'Rina', 'Joko',
            'Lina', 'Bambang', 'Maya', 'Iwan', 'Putri', 'Yuni', 'Eko', 'Diana',
            'Fajar', 'Citra', 'Galih', 'Indah'];
        $lastNames = ['Santoso', 'Aminah', 'Yani', 'Lestari', 'Wijaya', 'Permata', 'Melati',
            'Saputra', 'Marwan', 'Pertiwi', 'Setyawan', 'Cahyani', 'Hidayat',
            'Rahmawati', 'Pratama', 'Anggraini', 'Nugroho', 'Maharani'];

        $patients = collect();
        for ($p = 0; $p < 60; $p++) {
            $patients->push(Patient::create([
                'nama'   => $firstNames[$p % count($firstNames)] . ' ' . $lastNames[$p % count($lastNames)],
                'nik'    => '32' . str_pad((string) $p, 14, '0', STR_PAD_LEFT),
                'no_hp'  => '0812-3456-' . str_pad((string) (1000 + $p), 4, '0', STR_PAD_LEFT),
                'alamat' => 'Jl. Contoh No. ' . ($p + 1),
            ]));
        }

        // === Bookings hari ini: 12 per poli, mix status ===
        $today = now()->toDateString();
        $patientIdx = 0;
        $polis->each(function ($poli) use ($schedules, $patients, $today, &$patientIdx) {
            $schedule = $schedules->firstWhere('poli_id', $poli->id);
            for ($i = 1; $i <= 12; $i++) {
                $status = match (true) {
                    $i <= 5  => 'done',
                    $i === 6 => 'calling',
                    $i === 7 => 'skipped',
                    default  => 'waiting',
                };
                Booking::create([
                    'patient_id'    => $patients[$patientIdx % $patients->count()]->id,
                    'schedule_id'   => $schedule->id,
                    'nomor_antrean' => $poli->kode_poli . str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                    'tanggal'       => $today,
                    'status'        => $status,
                ]);
                $patientIdx++;
            }
        });
    }
}
