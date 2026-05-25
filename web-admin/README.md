# Web Admin — Antrean Puskesmas Cerdas

Frontend Web Admin Poli untuk sistem **Antrean Puskesmas Cerdas**. Petugas memilih poli, melihat antrean hari ini, memanggil pasien berikutnya, dan menampilkan papan ruang tunggu (Display Board) yang sinkron realtime via Firebase Firestore.

## Stack

- React 18 + Vite + TypeScript
- TailwindCSS (custom design tokens dari `design.md`)
- TanStack Query (server state) + Zustand (UI state, persist localStorage)
- Firebase JS SDK (Firestore listener)
- React Router v6
- sonner (toast), lucide-react (ikon)

## Persiapan

### 1. Pasang dependency

```bash
cd web-admin
npm install
```

### 2. Konfigurasi environment

Salin `.env.example` ke `.env` lalu isi:

```env
# Backend Laravel
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Firebase web config (opsional — kalau kosong, Display Board akan pakai polling fallback)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Nilai Firebase diambil dari Firebase Console → Project Settings → Your apps → Web SDK config. Pastikan project ID sama dengan yang dipakai backend di `FIREBASE_PROJECT_ID`.

### 3. Jalankan backend Laravel

Backend ada di repo terpisah: <https://github.com/RasyidTriS/backend_tcc_rasyid>.
Pastikan `php artisan serve` berjalan di `http://127.0.0.1:8000` (atau update `VITE_API_BASE_URL`).

### 4. Jalankan dev server

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Struktur Folder

```
src/
├── app/            # RequirePoli guard, providers
├── components/     # AppShell, StatusBadge, QueueCard, CurrentNumberDisplay, ...
├── hooks/          # useActiveQueue (Firestore), useQueues, useReferenceData
├── lib/            # api.ts (axios), firebase.ts, utils
├── pages/          # PilihPoli, Dashboard, AntreanHariIni, Pemanggilan, DisplayBoard, MasterData, Riwayat
├── stores/         # useAppStore (Zustand + persist)
└── types/          # Patient, Poli, Doctor, Schedule, Booking, ActiveQueue
```

## Routes

| Rute            | Halaman             | Keterangan                          |
| --------------- | ------------------- | ----------------------------------- |
| `/pilih-poli`   | Pilih Poli          | Gerbang awal, persisten localStorage |
| `/`             | Dashboard           | KPI + tombol Panggil Berikutnya     |
| `/antrean`      | Antrean Hari Ini    | Tabel + filter + search              |
| `/pemanggilan`  | Pemanggilan         | Console kerja petugas                |
| `/board`        | Display Board       | Fullscreen TV (tanpa AppShell)       |
| `/master`       | Master Data         | Read-only Polis/Dokter/Jadwal        |
| `/riwayat`      | Riwayat Pasien      | Placeholder (menunggu backend)       |

## Backend Gaps yang harus diminta ke backend dev

1. **`PATCH /api/booking/{id}` body `{ status }`** — agar tombol Selesai/Lewati berfungsi. **P0**
2. **`GET /api/queues?poli_id=...`** — efisiensi & filter server-side. **P1**
3. **Auth admin per poli** (Sanctum/JWT). **P2**

Detail lengkap ada di `.kiro/specs/puskesmas-admin-web/design.md` (Lampiran C).
