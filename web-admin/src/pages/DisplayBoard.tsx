import { useEffect, useMemo, useState } from 'react';
import { CurrentNumberDisplay } from '@/components/CurrentNumberDisplay';
import { useAppStore } from '@/stores/useAppStore';
import { usePolisQuery } from '@/hooks/useReferenceData';
import { useQueuesQuery } from '@/hooks/useQueues';
import { useActiveQueue } from '@/hooks/useActiveQueue';

export default function DisplayBoard() {
  const { selectedPoliId } = useAppStore();
  const { data: polis } = usePolisQuery();
  const poli = polis?.find((p) => p.id === selectedPoliId);

  const { data: active, configured } = useActiveQueue(selectedPoliId);
  const { data: queues } = useQueuesQuery(selectedPoliId);

  // Live clock
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fallback bila Firestore belum ready: ambil dari queues
  const fallbackCalling = useMemo(
    () => queues?.find((b) => b.status === 'calling'),
    [queues],
  );

  const nomor =
    active?.current_queue_number ?? fallbackCalling?.nomor_antrean ?? null;
  const patient =
    active?.patient_name ?? fallbackCalling?.patient?.nama ?? null;
  const isCalling = Boolean(nomor);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-16 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0E7C7B 0%, #3DA5D9 100%)',
      }}
    >
      {/* Poli badge */}
      <div className="absolute top-10 left-10">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-xl">
          <span className="material-symbols-outlined" aria-hidden>
            local_hospital
          </span>
          {poli ? `${poli.kode_poli} — ${poli.nama_poli}` : 'Antrean Puskesmas'}
        </div>
      </div>

      {/* Status indicator */}
      {!configured && (
        <div className="absolute top-10 right-10 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm">
          Mode Polling (Firestore belum dikonfigurasi)
        </div>
      )}

      {/* Main number */}
      {nomor ? (
        <CurrentNumberDisplay
          mode="board"
          nomor={nomor}
          patient_name={patient}
          poli_name={poli?.nama_poli ?? ''}
          pulse={isCalling}
        />
      ) : (
        <div className="text-center text-white">
          <div className="text-[clamp(72px,9vw,128px)] font-bold leading-none">
            Menunggu Pasien
          </div>
          <div className="mt-6 text-2xl text-white/80">
            Belum ada antrean yang dipanggil
          </div>
        </div>
      )}

      {/* Clock */}
      <div className="absolute bottom-10 right-12 text-white/85 text-[56px] font-bold tabular-nums">
        {clock.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>

      {/* Date */}
      <div className="absolute bottom-12 left-12 text-white/80 text-xl font-medium">
        {clock.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}
