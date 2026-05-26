import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePolisQuery } from '@/hooks/useReferenceData';
import { useAppStore } from '@/stores/useAppStore';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import type { Poli } from '@/types';

// Map kode poli ke material symbol icon (sesuai referensi Stitch).
const POLI_ICON: Record<string, string> = {
  U: 'stethoscope',
  G: 'dentistry',
  K: 'child_care',
  A: 'pediatrics',
  L: 'elderly',
  B: 'science',
};

const POLI_DESC: Record<string, string> = {
  U: 'Pemeriksaan kesehatan umum dan konsultasi dasar.',
  G: 'Pemeriksaan, perawatan, dan tindakan kesehatan gigi.',
  K: 'Kesehatan Ibu & Anak serta layanan Keluarga Berencana.',
  A: 'Layanan spesifik untuk pemeriksaan balita dan anak.',
  L: 'Pelayanan kesehatan terpadu khusus lanjut usia.',
  B: 'Uji lab darah, urine, dan pemeriksaan sampel.',
};

const ACCENT_PALETTE: { from: string; to: string; ring: string }[] = [
  { from: '#0E7C7B', to: '#3DA5D9', ring: 'rgba(14,124,123,0.25)' },
  { from: '#3DA5D9', to: '#73BFB8', ring: 'rgba(61,165,217,0.25)' },
  { from: '#0EA5A4', to: '#22D3EE', ring: 'rgba(14,165,164,0.22)' },
  { from: '#0F766E', to: '#3DA5D9', ring: 'rgba(15,118,110,0.22)' },
  { from: '#0891B2', to: '#5EEAD4', ring: 'rgba(8,145,178,0.22)' },
  { from: '#0E7C7B', to: '#5EEAD4', ring: 'rgba(94,234,212,0.25)' },
];

export default function PilihPoli() {
  const navigate = useNavigate();
  const { selectedPoliId, setSelectedPoli } = useAppStore();
  const { data: polis, isLoading, isError, refetch } = usePolisQuery();

  useEffect(() => {
    if (selectedPoliId != null) navigate('/', { replace: true });
  }, [selectedPoliId, navigate]);

  const handlePick = (id: number) => {
    setSelectedPoli(id);
    navigate('/', { replace: true });
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#F4F8FB] flex flex-col"
      style={{
        backgroundImage:
          'radial-gradient(circle at 12% 8%, rgba(61,165,217,0.16) 0, transparent 42%), radial-gradient(circle at 92% 84%, rgba(14,124,123,0.18) 0, transparent 45%), radial-gradient(circle at 50% 110%, rgba(115,191,184,0.18) 0, transparent 55%)',
      }}
    >
      {/* Floating decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-secondary/25 to-primary-light/30 blur-3xl opacity-60"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-card">
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              local_hospital
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-ink">
              Puskesmas Hub
            </div>
            <div className="text-xs text-muted">Web Admin Antrean</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-line/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-done animate-pulse" />
          Sistem aktif
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[1080px]">
          {/* Hero */}
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Selamat datang
            </span>
            <h1 className="bg-gradient-to-br from-ink via-primary to-secondary bg-clip-text text-[clamp(36px,5.2vw,56px)] font-extrabold leading-[1.05] tracking-tight text-transparent">
              Pilih poli kamu
              <br />
              hari ini.
            </h1>
            <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-muted">
              Atur antrean dengan tenang. Pilih poli tempat kamu bertugas, dan
              biar kami bantu sisanya.
            </p>
          </div>

          {/* Card grid */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[220px] rounded-[24px]" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-[24px] border border-line bg-white/70 backdrop-blur p-2">
              <ErrorState
                title="Gagal memuat daftar poli"
                description="Pastikan backend Laravel berjalan di alamat yang dikonfigurasi pada VITE_API_BASE_URL."
                onRetry={() => refetch()}
              />
            </div>
          )}

          {!isLoading && !isError && polis && polis.length === 0 && (
            <div className="rounded-[24px] border border-line bg-white/70 backdrop-blur p-2">
              <EmptyState
                title="Belum ada poli"
                description="Backend belum mengembalikan data poli. Hubungi administrator."
              />
            </div>
          )}

          {!isLoading && polis && polis.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {polis.map((p, idx) => (
                <PoliCard
                  key={p.id}
                  poli={p}
                  accent={ACCENT_PALETTE[idx % ACCENT_PALETTE.length]}
                  onPick={() => handlePick(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between gap-2 px-8 py-5 text-xs text-subtle">
        <div>v0.1 — Antrean Puskesmas Cerdas</div>
        <div className="hidden sm:block">
          Dibuat dengan <span className="text-primary">♥</span> untuk pelayanan
          kesehatan yang lebih baik
        </div>
      </footer>
    </div>
  );
}

function PoliCard({
  poli,
  accent,
  onPick,
}: {
  poli: Poli;
  accent: { from: string; to: string; ring: string };
  onPick: () => void;
}) {
  const icon = POLI_ICON[poli.kode_poli.charAt(0).toUpperCase()] ?? 'medical_services';
  const desc =
    POLI_DESC[poli.kode_poli.charAt(0).toUpperCase()] ??
    `Layanan ${poli.nama_poli.toLowerCase()} di puskesmas ini.`;

  return (
    <button
      onClick={onPick}
      className="group relative isolate overflow-hidden rounded-[24px] border border-white/60 bg-white/80 p-6 text-left backdrop-blur-xl shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated focus-visible:-translate-y-1 focus-visible:shadow-elevated"
      style={{ ['--ring-color' as string]: accent.ring }}
    >
      {/* Animated gradient ring on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, ${accent.from}26, transparent 55%), radial-gradient(120% 80% at 100% 100%, ${accent.to}22, transparent 55%)`,
        }}
      />

      {/* Decorative icon */}
      <span
        aria-hidden
        className="material-symbols-outlined absolute right-2 top-2 text-[120px] leading-none text-ink/[0.04] transition-all duration-500 group-hover:rotate-[6deg] group-hover:scale-110 group-hover:text-ink/[0.08]"
      >
        {icon}
      </span>

      {/* Content */}
      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-center justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              backgroundImage: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            }}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              aria-hidden
            >
              {icon}
            </span>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
            style={{ background: `${accent.from}14` }}
          >
            {poli.kode_poli}
          </span>
        </div>

        <h2 className="text-[20px] font-bold leading-tight tracking-tight text-ink">
          {poli.nama_poli}
        </h2>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted">
          {desc}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            Mulai bertugas
          </span>
          <span
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.04] text-ink/60 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-focus-visible:bg-primary group-focus-visible:text-white"
            aria-hidden
          >
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}
