import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Check, Megaphone, Search, SkipForward } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useAppStore } from '@/stores/useAppStore';
import {
  useCallQueueMutation,
  useQueuesQuery,
  useUpdateStatusMutation,
} from '@/hooks/useQueues';
import { formatTime, cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const FILTERS: { key: 'all' | BookingStatus; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'waiting', label: 'Menunggu' },
  { key: 'calling', label: 'Dipanggil' },
  { key: 'done', label: 'Selesai' },
  { key: 'skipped', label: 'Dilewati' },
];

export default function AntreanHariIni() {
  const { selectedPoliId } = useAppStore();
  const { data, isLoading, isError, refetch } = useQueuesQuery(selectedPoliId);
  const callMutation = useCallQueueMutation(selectedPoliId);
  const updateMutation = useUpdateStatusMutation(selectedPoliId);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  const visible = useMemo(() => {
    let list = data ?? [];
    if (filter !== 'all') list = list.filter((b) => b.status === filter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.nomor_antrean.toLowerCase().includes(s) ||
          b.patient?.nama?.toLowerCase().includes(s),
      );
    }
    return [...list].sort((a, b) =>
      a.nomor_antrean.localeCompare(b.nomor_antrean),
    );
  }, [data, filter, search]);

  const handleCall = (id: number) => {
    callMutation.mutate(id, {
      onSuccess: () => toast.success('Antrean dipanggil'),
      onError: (err) => toast.error(err.message ?? 'Gagal memanggil antrean'),
    });
  };

  const handleUpdate = (id: number, status: BookingStatus) => {
    updateMutation.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(
            status === 'done' ? 'Pasien selesai dilayani' : 'Antrean dilewati',
          ),
        onError: (err) =>
          toast.error(
            err.message ??
              'Endpoint PATCH /booking belum tersedia di backend.',
          ),
      },
    );
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">Antrean Hari Ini</h1>
            <p className="text-sm text-muted">
              Daftar lengkap antrean yang sedang berjalan di poli Anda.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor atau nama pasien..."
              className="w-full pl-10 pr-4 py-3 rounded-md bg-white border border-line focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none text-sm"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'h-8 px-4 rounded-full text-sm font-semibold transition-colors',
                filter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-line text-muted hover:bg-line/70',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-line shadow-card overflow-hidden">
          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title="Belum ada antrean"
              description={
                filter === 'all'
                  ? 'Belum ada pasien yang booking untuk poli ini hari ini.'
                  : 'Tidak ada antrean yang cocok dengan filter.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-chip sticky top-0">
                  <tr className="border-b border-line">
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-32">
                      No. Antrean
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Dokter
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-44">
                      Status
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-24">
                      Waktu
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-36 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {visible.map((b) => (
                    <tr
                      key={b.id}
                      className={cn(
                        'transition-colors',
                        b.status === 'calling'
                          ? 'bg-callingTint border-l-4 border-l-primary'
                          : 'hover:bg-callingTint/30',
                      )}
                    >
                      <td className="py-3 px-4 font-bold text-ink">
                        {b.nomor_antrean}
                      </td>
                      <td className="py-3 px-4 text-sm text-ink">
                        <div className="font-medium">
                          {b.patient?.nama ?? '—'}
                        </div>
                        <div className="text-xs text-subtle">
                          {b.patient?.nik}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted">
                        {b.schedule?.doctor?.nama ?? '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-sm text-muted">
                        {formatTime(b.updated_at ?? b.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {b.status === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => handleCall(b.id)}
                              title="Panggil"
                              className="p-2 rounded-md text-primary hover:bg-callingTint transition-colors"
                            >
                              <Megaphone size={16} />
                            </button>
                          )}
                          {b.status === 'calling' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdate(b.id, 'done')}
                                title="Selesai"
                                className="p-2 rounded-md text-done hover:bg-successTint transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdate(b.id, 'skipped')}
                                title="Lewati"
                                className="p-2 rounded-md text-muted hover:bg-line transition-colors"
                              >
                                <SkipForward size={16} />
                              </button>
                            </>
                          )}
                        </div>
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
