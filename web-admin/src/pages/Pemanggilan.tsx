import { useMemo } from 'react';
import { toast } from 'sonner';
import { Check, Megaphone, SkipForward } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { CurrentNumberDisplay } from '@/components/CurrentNumberDisplay';
import { QueueCard } from '@/components/QueueCard';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useAppStore } from '@/stores/useAppStore';
import { usePolisQuery } from '@/hooks/useReferenceData';
import {
  useCallQueueMutation,
  useQueuesQuery,
  useUpdateStatusMutation,
} from '@/hooks/useQueues';
import { useActiveQueue } from '@/hooks/useActiveQueue';

export default function Pemanggilan() {
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
  const updateMutation = useUpdateStatusMutation(selectedPoliId);
  const { data: active } = useActiveQueue(selectedPoliId);

  const calling = useMemo(
    () => queues?.find((b) => b.status === 'calling'),
    [queues],
  );
  const waiting = useMemo(
    () =>
      [...(queues ?? [])]
        .filter((b) => b.status === 'waiting')
        .sort((a, b) => a.nomor_antrean.localeCompare(b.nomor_antrean)),
    [queues],
  );

  const handleCallNext = () => {
    const next = waiting[0];
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

  const handleDone = () => {
    if (!calling) return;
    updateMutation.mutate(
      { id: calling.id, status: 'done' },
      {
        onSuccess: () => toast.success('Pasien selesai dilayani'),
        onError: (err) =>
          toast.error(
            err.message ??
              'Endpoint PATCH /booking belum tersedia. Hubungi backend dev.',
          ),
      },
    );
  };

  const handleSkip = () => {
    if (!calling) return;
    updateMutation.mutate(
      { id: calling.id, status: 'skipped' },
      {
        onSuccess: () => toast.success('Antrean dilewati'),
        onError: (err) =>
          toast.error(
            err.message ??
              'Endpoint PATCH /booking belum tersedia. Hubungi backend dev.',
          ),
      },
    );
  };

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {/* Left panel */}
        <section className="lg:col-span-3 bg-white rounded-lg border border-line shadow-card p-8 flex flex-col items-center justify-between min-h-[520px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <CurrentNumberDisplay
            mode="panel"
            nomor={
              active?.current_queue_number ?? calling?.nomor_antrean ?? null
            }
            patient_name={
              active?.patient_name ?? calling?.patient?.nama ?? null
            }
            poli_name={poli?.nama_poli ?? '—'}
            pulse={Boolean(calling)}
          />

          <div className="w-full mt-8 space-y-3">
            <button
              type="button"
              onClick={handleCallNext}
              disabled={callMutation.isPending || waiting.length === 0}
              className="w-full h-[88px] inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold text-2xl shadow-elevated hover:scale-[1.01] transition-transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Megaphone size={28} aria-hidden />
              Panggil Berikutnya
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDone}
                disabled={!calling || updateMutation.isPending}
                className="h-16 rounded-md border-2 border-done text-done bg-white font-semibold text-lg hover:bg-done hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <Check size={20} aria-hidden /> Selesai
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={!calling || updateMutation.isPending}
                className="h-16 rounded-md border-2 border-skipped text-muted bg-white font-semibold text-lg hover:bg-skipped hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <SkipForward size={20} aria-hidden /> Lewati
              </button>
            </div>
          </div>
        </section>

        {/* Right panel: waiting list */}
        <aside className="lg:col-span-2 bg-white rounded-lg border border-line shadow-card flex flex-col min-h-[520px]">
          <div className="p-4 border-b border-line bg-chip flex items-center justify-between">
            <h3 className="font-semibold text-ink">Antrean Menunggu</h3>
            <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-primary text-white text-xs font-bold">
              {waiting.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : isLoading ? (
              <>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </>
            ) : waiting.length === 0 ? (
              <EmptyState
                title="Tidak ada antrean menunggu"
                description="Semua pasien sudah selesai dilayani."
              />
            ) : (
              waiting.map((b, idx) => (
                <QueueCard
                  key={b.id}
                  nomor_antrean={b.nomor_antrean}
                  patient_name={b.patient?.nama ?? '—'}
                  status={b.status}
                  highlighted={idx === 0}
                  onCall={
                    idx === 0
                      ? () =>
                          callMutation.mutate(b.id, {
                            onSuccess: () =>
                              toast.success(
                                `Antrean ${b.nomor_antrean} dipanggil`,
                              ),
                            onError: (err) =>
                              toast.error(err.message ?? 'Gagal memanggil'),
                          })
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
