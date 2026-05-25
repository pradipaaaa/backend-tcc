# Antrean Puskesmas Cerdas

Sistem antrean digital Puskesmas dengan tiga komponen utama:

- **Web Admin Poli** (`/web-admin`) — frontend React + Vite + TypeScript untuk petugas memanggil antrean.
- **Backend API** (`/backend`) — Laravel 11 + SQLite (REST API untuk pasien, poli, dokter, jadwal, booking, panggilan antrean).
- **Spec dokumen** (`/.kiro/specs/puskesmas-admin-web/`) — `design.md` referensi UI, sistem, dan API.

## Arsitektur

```
┌─────────────────┐   REST    ┌──────────────────┐
│ Mobile Pasien   │──────────►│  Laravel API     │──┐
└─────────────────┘           │  (SQLite local)  │  │
                              └────────┬─────────┘  │
┌─────────────────┐   REST            │            │
│ Web Admin (Web) │──────────► /api/* │            │
└─────────────────┘                   │            │
        │                             ▼            │
        │ onSnapshot           ┌──────────────────┐│
        └─────────────────────►│ Firebase Firestore│◄─┘
                               │  active_queues   │
┌─────────────────┐   onSnap   └──────────────────┘
│ Display Board   │────────────────────►
└─────────────────┘
```

## Quickstart Development

### 1. Backend (Laravel)

```bash
cd backend
# Pakai PHP >= 8.3. Kalau pakai PHP portable di .php83/, set PATH dulu.
php composer.phar install
cp .env.example .env  # atau pakai .env yang sudah disiapkan
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Backend listening di `http://127.0.0.1:8000/api/*`.

### 2. Frontend (Web Admin)

```bash
cd web-admin
npm install
cp .env.example .env  # isi VITE_API_BASE_URL dan VITE_FIREBASE_*
npm run dev
```

Frontend listening di `http://localhost:5173`.

## Demo Mode

Frontend punya **Demo Mode** (toggle di halaman Pilih Poli). Ketika aktif, semua data dummy di-load dari memori, tidak butuh backend. Cocok untuk presentasi tanpa setup penuh.

## Backend Gaps yang sudah dilengkapi di repo ini

Berbeda dari repo backend asli ([RasyidTriS/backend_tcc_rasyid](https://github.com/RasyidTriS/backend_tcc_rasyid)), folder `backend/` sini menambahkan:

| Endpoint                          | Tujuan                                            |
| --------------------------------- | ------------------------------------------------- |
| `PATCH /api/booking/{id}`         | Mark Selesai / Lewati setelah dipanggil           |
| `GET /api/queues?poli_id={id}`    | Filter per poli (server-side)                     |
| Eager-load relations konsisten    | response selalu include `patient` dan `schedule`  |
| Skip Firestore saat dev           | tidak crash kalau `FIREBASE_PROJECT_ID` kosong    |
| Seeder lengkap                    | 6 poli, 6 dokter, 60 pasien, 72 booking dummy     |
| CORS terbuka untuk localhost:5173 | -                                                 |

## Folder

```
projek tcc/
├── .kiro/specs/puskesmas-admin-web/   # design.md (Stitch reference + spec)
├── backend/                            # Laravel API
├── web-admin/                          # Frontend React
└── README.md                           # this file
```
