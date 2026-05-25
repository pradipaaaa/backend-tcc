import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, FlaskConical, Stethoscope } from 'lucide-react';
import { usePolisQuery } from '@/hooks/useReferenceData';
import { useAppStore } from '@/stores/useAppStore';
import { useDemoStore } from '@/stores/useDemoStore';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

export default function PilihPoli() {
  const navigate = useNavigate();
  const { selectedPoliId, setSelectedPoli } = useAppStore();
  const demoEnabled = useDemoStore((s) => s.enabled);
  const toggleDemo = useDemoStore((s) => s.toggle);
  const { data: polis, isLoading, isError, refetch } = usePolisQuery();

  useEffect(() => {
    if (selectedPoliId != null) navigate('/', { replace: true });
  }, [selectedPoliId, navigate]);

  const handlePick = (id: number) => {
    setSelectedPoli(id);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-16">
      <main className="w-full max-w-[960px]">
        <header className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-ink leading-tight">
            Pilih Poli Anda
          </h1>
          <p className="mt-2 text-base text-muted">
            Pilih poli tempat Anda bertugas hari ini.
          </p>
        </header>

        {/* Demo mode toggle */}
        <div className="mb-8 flex items-center justify-center">
          <button
            type="button"
            onClick={toggleDemo}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors',
              demoEnabled
                ? 'bg-primary text-white border-primary shadow-card'
                : 'bg-white text-muted border-line hover:border-primary hover:text-primary',
            )}
          >
            <FlaskConical size={16} aria-hidden />
            {demoEnabled
              ? 'Demo Mode AKTIF — pakai data dummy'
              : 'Aktifkan Demo Mode'}
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full max-w-[280px] h-[200px] rounded-lg"
              />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            title="Gagal memuat daftar poli"
            description="Pastikan backend Laravel berjalan di alamat yang dikonfigurasi pada VITE_API_BASE_URL."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && polis && polis.length === 0 && (
          <EmptyState
            title="Belum ada poli"
            description="Backend belum mengembalikan data poli. Hubungi administrator."
          />
        )}

        {!isLoading && polis && polis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {polis.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePick(p.id)}
                className={cn(
                  'group relative w-full max-w-[280px] h-[200px] bg-white rounded-lg shadow-card hover:shadow-elevated hover:-translate-y-0.5 border border-line/60 p-6 text-left transition-all flex flex-col items-start',
                )}
              >
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
                  <Stethoscope size={80} />
                </div>
                <div className="bg-primary text-white rounded-full px-3 py-1 mb-4 z-10">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {p.kode_poli}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-ink z-10">
                  {p.nama_poli}
                </h2>
                <p className="mt-1 text-sm text-subtle line-clamp-2 z-10">
                  Layanan {p.nama_poli.toLowerCase()} di puskesmas ini.
                </p>
                <div className="mt-auto z-10 inline-flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                  Pilih Poli <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <footer className="mt-16 text-xs text-subtle">
        v0.1 — Antrean Puskesmas Cerdas
      </footer>
    </div>
  );
}
