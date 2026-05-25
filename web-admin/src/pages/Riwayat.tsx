import { History } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function Riwayat() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-lg border border-line shadow-card p-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-callingTint flex items-center justify-center text-primary mb-6">
            <History size={56} />
          </div>
          <h1 className="text-2xl font-semibold text-ink">
            Riwayat Pasien Belum Tersedia
          </h1>
          <p className="mt-3 text-base text-muted leading-relaxed max-w-prose mx-auto">
            Fitur ini menunggu endpoint backend{' '}
            <code className="px-1.5 py-0.5 rounded bg-bg text-primary text-sm font-mono">
              GET /api/patients/&#123;id&#125;/bookings
            </code>{' '}
            untuk mengambil riwayat kunjungan per pasien.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warningTint text-warningInk text-xs font-bold">
            ⚠️ Backend Gap
          </div>
          <div className="mt-8">
            <button
              type="button"
              disabled
              title="Akan aktif setelah endpoint tersedia"
              className="inline-flex items-center px-5 h-12 rounded-md bg-line text-subtle font-semibold cursor-not-allowed"
            >
              Hubungi Backend Dev
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
