import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import {
  useDoctorsQuery,
  usePolisQuery,
  useSchedulesQuery,
} from '@/hooks/useReferenceData';
import { cn } from '@/lib/utils';

type Tab = 'polis' | 'doctors' | 'schedules';

export default function MasterData() {
  const [tab, setTab] = useState<Tab>('polis');

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink">Master Data</h1>
            <p className="text-sm text-muted">
              Referensi data poli, dokter, dan jadwal praktik (read-only).
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Endpoint backend belum tersedia"
            className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-line text-subtle font-semibold cursor-not-allowed"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-line">
          <nav className="flex gap-6" aria-label="Tabs">
            <TabButton tab="polis" active={tab} onClick={setTab}>
              Polis
            </TabButton>
            <TabButton tab="doctors" active={tab} onClick={setTab}>
              Dokter
            </TabButton>
            <TabButton tab="schedules" active={tab} onClick={setTab}>
              Jadwal
            </TabButton>
          </nav>
        </div>

        <div className="bg-white rounded-lg border border-line shadow-card overflow-hidden">
          {tab === 'polis' && <PolisTable />}
          {tab === 'doctors' && <DoctorsTable />}
          {tab === 'schedules' && <SchedulesTable />}
        </div>
      </div>
    </AppShell>
  );
}

function TabButton({
  tab,
  active,
  onClick,
  children,
}: {
  tab: Tab;
  active: Tab;
  onClick: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const isActive = tab === active;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={cn(
        'pb-3 px-1 text-base font-semibold transition-colors',
        isActive
          ? 'text-ink border-b-[3px] border-primary'
          : 'text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <thead className="bg-chip">
      <tr className="border-b border-line">
        {cols.map((c) => (
          <th
            key={c}
            className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider"
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function PolisTable() {
  const { data, isLoading, isError, refetch } = usePolisQuery();
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading)
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  if (!data || data.length === 0)
    return <EmptyState title="Belum ada data poli" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <TableHeader cols={['Kode', 'Nama Poli', 'Dibuat']} />
        <tbody className="divide-y divide-line/60">
          {data.map((p) => (
            <tr key={p.id} className="hover:bg-callingTint/30">
              <td className="py-3 px-4 font-bold text-ink">{p.kode_poli}</td>
              <td className="py-3 px-4 text-ink">{p.nama_poli}</td>
              <td className="py-3 px-4 text-sm text-muted">
                {p.created_at?.slice(0, 10) ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DoctorsTable() {
  const { data, isLoading, isError, refetch } = useDoctorsQuery();
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading)
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  if (!data || data.length === 0)
    return <EmptyState title="Belum ada data dokter" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <TableHeader cols={['Nama', 'Spesialis', 'No. HP']} />
        <tbody className="divide-y divide-line/60">
          {data.map((d) => (
            <tr key={d.id} className="hover:bg-callingTint/30">
              <td className="py-3 px-4 font-semibold text-ink">{d.nama}</td>
              <td className="py-3 px-4 text-ink">{d.spesialis}</td>
              <td className="py-3 px-4 text-sm text-muted">
                {d.no_hp ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchedulesTable() {
  const { data, isLoading, isError, refetch } = useSchedulesQuery();
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading)
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  if (!data || data.length === 0)
    return <EmptyState title="Belum ada jadwal" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <TableHeader cols={['Dokter', 'Poli', 'Hari', 'Jam']} />
        <tbody className="divide-y divide-line/60">
          {data.map((s) => (
            <tr key={s.id} className="hover:bg-callingTint/30">
              <td className="py-3 px-4 font-semibold text-ink">
                {s.doctor?.nama ?? '—'}
              </td>
              <td className="py-3 px-4 text-ink">{s.poli?.nama_poli ?? '—'}</td>
              <td className="py-3 px-4 text-sm text-muted capitalize">
                {s.hari}
              </td>
              <td className="py-3 px-4 text-sm text-muted tabular-nums">
                {s.jam_mulai?.slice(0, 5)} – {s.jam_selesai?.slice(0, 5)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
