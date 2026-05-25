import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { CurrentNumberDisplay } from '@/components/CurrentNumberDisplay';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useAppStore } from '@/stores/useAppStore';
import { usePolisQuery } from '@/hooks/useReferenceData';
import { useCallQueueMutation, useQueuesQuery } from '@/hooks/useQueues';
import { useActiveQueue } from '@/hooks/useActiveQueue';
import { formatTime } from '@/lib/utils';

export default function Dashboard() {
  const { selectedPoliId } = useAppStore();
  const { data: polis } = usePolisQuery();
  const poli = polis?.find((p) => p.id === selectedPoliId);

  const {
    data: queues,
    isLoading,
    isError,
    refetch,
  } = useQueuesQuery(selectedPoliId);

  const callMutation = useCallQueueMutation(selectedPoliId);
  const { data: active } = useActiveQueue(selectedPoliId);

  const stats = useMemo(() => {
    const list = queues ?? [];
    return {
      total: list.length,
      waiting: list.filter((b) => b.status === 'waiting').length,
      calling: list.filter((b) => b.status === 'calling').length,
      done: list.filter((b) => b.status === 'done').length,
    };
  }, [queues]);

  const currentCalling = useMemo(() => {
    return queues?.find((b) => b.status === 'calling');
  }, [queues]);

  const recent = useMemo(() => {
    return [...(queues ?? [])]
      .sort((a, b) =>
        (b.updated_at ?? b.created_at ?? '').localeCompare(
          a.updated_at ?? a.created_at ?? '',
        ),
      )
      .slice(0, 5);
  }, [queues]);

  const handleCallNext = () => {
    const next = (queues ?? [])
      .filter((b) => b.status === 'waiting')
      .sort((a, b) => a.nomor_antrean.localeCompare(b.nomor_antrean))[0];
    if (!next) {
      toast.info('Tidak ada antrean menunggu');
      return;
    }
    callMutation.mutate(next.id, {
      onSuccess: () =>
        toast.success(`Antrean ${next.nomor_antrean} dipanggil`),
      onError: (err) => toast.error(err.message ?? 'Gagal memanggil antrean'),
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KpiTile label="Total Antrean" value={stats.total} accent="ink" />
          <KpiTile label="Menunggu" value={stats.waiting} accent="waiting" />
          <KpiTile label="Memanggil" value={stats.calling} accent="calling" />
          <KpiTile label="Selesai" value={stats.done} accent="done" />
        </div>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-line shadow-elevated p-8 relative overflow-hidden min-h-[320px] flex flex-col items-center justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
            <CurrentNumberDisplay
              mode="compact"
              nomor={
                active?.current_queue_number ??
                currentCalling?.nomor_antrean ??
                null
              }
              patient_name={
                active?.patient_name ??
                currentCalling?.patient?.nama ??
                null
              }
              poli_name={poli?.nama_poli ?? '—'}
            />
            <button
              type="button"
              onClick={handleCallNext}
              disabled={callMutation.isPending || stats.waiting === 0}
              className="mt-8 w-full max-w-md h-16 inline-flex items-center justify-center gap-3 rounded-md bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-card hover:shadow-elevated transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Megaphone size={22} aria-hidden />
              Panggil Antrean Berikutnya
            </button>
          </div>

          {/* Up next */}
          <div className="bg-white rounded-lg border border-line shadow-card flex flex-col">
            <div className="p-4 border-b border-line bg-chip rounded-t-lg">
              <h3 className="font-bold text-ink">Antrean Berikutnya</h3>
            </div>
            <div className="p-4 flex-1 space-y-3 max-h-[320px] overflow-y-auto">
              {isLoading && (
                <>
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </>
              )}
              {!isLoading &&
                queues &&
                queues
                  .filter((b) => b.status === 'waiting')
                  .slice(0, 5)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 rounded-md bg-bg border border-line/60"
                    >
                      <div>
                        <div className="text-base font-bold text-ink">
                          {b.nomor_antrean}
                        </div>
                        <div className="text-sm text-muted">
                          {b.patient?.nama ?? '—'}
                        </div>
                      </div>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                  ))}
              {!isLoading &&
                queues &&
                queues.filter((b) => b.status === 'waiting').length === 0 && (
                  <div className="text-center text-muted text-sm py-8">
                    Tidak ada antrean menunggu.
                  </div>
                )}
            </div>
            <div className="p-3 border-t border-line text-center">
              <Link
                to="/antrean"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Lihat Semua Daftar
              </Link>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg border border-line shadow-card overflow-hidden">
          <div className="p-4 border-b border-line bg-chip">
            <h3 className="text-lg font-semibold text-ink">
              Aktivitas Terkini
            </h3>
          </div>

          {isError ? (
            <ErrorState
              title="Gagal memuat antrean"
              description="Periksa koneksi ke backend Laravel."
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              title="Belum ada aktivitas"
              description="Antrean hari ini akan tampil di sini begitu pasien mulai datang."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-bg">
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-24">
                      Waktu
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-32">
                      No. Antrean
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Nama Pasien
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-44">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {recent.map((b) => (
                    <tr key={b.id} className="hover:bg-callingTint/40">
                      <td className="py-3 px-4 text-sm text-muted">
                        {formatTime(b.updated_at ?? b.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-ink">
                        {b.nomor_antrean}
                      </td>
                      <td className="py-3 px-4 text-sm text-ink">
                        {b.patient?.nama ?? '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function KpiTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'ink' | 'waiting' | 'calling' | 'done';
}) {
  const accentMap = {
    ink: { border: 'border-l-line', text: 'text-ink' },
    waiting: { border: 'border-l-waiting', text: 'text-waiting' },
    calling: { border: 'border-l-primary', text: 'text-primary' },
    done: { border: 'border-l-done', text: 'text-done' },
  } as const;
  const a = accentMap[accent];
  return (
    <div
      className={`bg-white rounded-lg p-5 border border-line shadow-card flex flex-col justify-between h-28 border-l-4 ${a.border}`}
    >
      <span className="text-sm font-semibold text-muted">{label}</span>
      <span className={`text-3xl font-bold ${a.text}`}>{value}</span>
    </div>
  );
}
