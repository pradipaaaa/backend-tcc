# Deploy Backend Laravel ke Cloud Run

Panduan ini untuk folder `projek_TCC/backend`.

## Rekomendasi

Pakai Cloud Run untuk backend Laravel, lalu Cloud SQL for MySQL untuk database. Untuk proyek praktikum, ini paling rapi karena backend berjalan sebagai container, URL backend stabil untuk mobile dan web, dan database tidak ikut hilang ketika container restart.

## 1. Set variabel lokal

Ganti nilai sesuai project GCP kamu.

```bash
PROJECT_ID="isi-project-id-gcp"
REGION="asia-southeast2"
SERVICE="backend-antrean"
DB_INSTANCE="antrean-db"
DB_NAME="antrean"
DB_USER="laravel"
DB_PASS="ganti-password-kuat"
```

## 2. Aktifkan API

```bash
gcloud config set project "$PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com
```

## 3. Buat Cloud SQL MySQL

```bash
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region="$REGION"

gcloud sql databases create "$DB_NAME" \
  --instance="$DB_INSTANCE"

gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE" \
  --password="$DB_PASS"
```

Ambil connection name:

```bash
INSTANCE_CONNECTION_NAME="$(gcloud sql instances describe "$DB_INSTANCE" --format='value(connectionName)')"
echo "$INSTANCE_CONNECTION_NAME"
```

## 4. Generate APP_KEY Laravel

Kalau belum punya APP_KEY production:

```bash
php artisan key:generate --show
```

Simpan output `base64:...` untuk dipakai di langkah deploy.

```bash
APP_KEY="base64:hasil-generate-key"
```

## 5. Deploy backend ke Cloud Run

Jalankan dari folder `projek_TCC/backend`.

```bash
gcloud run deploy "$SERVICE" \
  --source . \
  --region="$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="APP_NAME=AntreanPuskesmas,APP_ENV=production,APP_KEY=$APP_KEY,APP_DEBUG=false,APP_URL=https://TEMP_URL,LOG_CHANNEL=stderr,LOG_LEVEL=info,DB_CONNECTION=mysql,DB_HOST=localhost,DB_PORT=3306,DB_DATABASE=$DB_NAME,DB_USERNAME=$DB_USER,DB_PASSWORD=$DB_PASS,DB_SOCKET=/cloudsql/$INSTANCE_CONNECTION_NAME,SESSION_DRIVER=database,CACHE_STORE=database,QUEUE_CONNECTION=database"
```

Setelah deploy selesai, Cloud Run akan memberi URL service. Salin URL itu, lalu update `APP_URL`:

```bash
BACKEND_URL="https://url-cloud-run-kamu"

gcloud run services update "$SERVICE" \
  --region="$REGION" \
  --update-env-vars="APP_URL=$BACKEND_URL"
```

## 6. Jalankan migration

Cara paling sederhana untuk praktikum: buka Cloud Run service, tab Revisions, lalu gunakan shell/job sementara bila tersedia. Cara CLI yang lebih rapi adalah membuat Cloud Run Job dari image service yang sama.

Ambil image revision terbaru:

```bash
IMAGE="$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.latestReadyRevisionName)' | xargs -I{} gcloud run revisions describe {} --region="$REGION" --format='value(status.imageDigest)')"
```

Buat dan jalankan job migrasi:

```bash
gcloud run jobs create "${SERVICE}-migrate" \
  --image="$IMAGE" \
  --region="$REGION" \
  --set-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="APP_NAME=AntreanPuskesmas,APP_ENV=production,APP_KEY=$APP_KEY,APP_DEBUG=false,APP_URL=$BACKEND_URL,LOG_CHANNEL=stderr,LOG_LEVEL=info,DB_CONNECTION=mysql,DB_HOST=localhost,DB_PORT=3306,DB_DATABASE=$DB_NAME,DB_USERNAME=$DB_USER,DB_PASSWORD=$DB_PASS,DB_SOCKET=/cloudsql/$INSTANCE_CONNECTION_NAME,SESSION_DRIVER=database,CACHE_STORE=database,QUEUE_CONNECTION=database" \
  --command=php \
  --args=artisan,migrate,--force

gcloud run jobs execute "${SERVICE}-migrate" \
  --region="$REGION" \
  --wait
```

Kalau job sudah pernah dibuat, pakai:

```bash
gcloud run jobs execute "${SERVICE}-migrate" \
  --region="$REGION" \
  --wait
```

## 7. Test API

```bash
curl "$BACKEND_URL/api/polis"
curl "$BACKEND_URL/api/doctors"
curl "$BACKEND_URL/api/queues"
```

## 8. Hubungkan mobile Flutter

Ubah `mobile_tcc/lib/data/repositories/api_service.dart`:

```dart
static const String baseUrl = 'https://url-cloud-run-kamu/api';
```

## 9. Hubungkan web-admin

Buat file `.env.production` di `projek_TCC/web-admin`:

```env
VITE_API_BASE_URL=https://url-cloud-run-kamu/api
```

Lalu build/deploy web-admin seperti biasa.

## Catatan penting

- Jangan pakai SQLite untuk deploy Cloud Run karena filesystem container tidak permanen.
- Jangan commit `.env`, password database, atau Firebase service account.
- Untuk produksi beneran, pindahkan `DB_PASSWORD` dan credential Firebase ke Secret Manager.
- Kalau Firebase Admin dipakai dari backend, upload credential sebagai secret lalu set `FIREBASE_CREDENTIALS` ke path secret yang dimount.
