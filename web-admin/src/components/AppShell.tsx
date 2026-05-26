import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  HelpCircle,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Megaphone,
  Database,
  History,
  Tv2,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { usePolisQuery } from '@/hooks/useReferenceData';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/antrean', label: 'Antrean', icon: ListOrdered },
  { to: '/pemanggilan', label: 'Pemanggilan', icon: Megaphone },
  { to: '/master', label: 'Master Data', icon: Database },
  { to: '/riwayat', label: 'Riwayat', icon: History },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { selectedPoliId, clearSelectedPoli } = useAppStore();
  const { data: polis } = usePolisQuery();
  const currentPoli = polis?.find((p) => p.id === selectedPoliId);

  const handleLogout = () => {
    clearSelectedPoli();
    navigate('/pilih-poli');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] bg-primary text-white py-6 z-40 shadow-elevated"
        aria-label="Navigasi utama"
      >
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white font-bold">
              <span className="material-symbols-outlined" aria-hidden>
                medical_services
              </span>
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">
                Puskesmas Hub
              </div>
              <div className="text-xs text-white/70">Admin Panel</div>
            </div>
          </div>
        </div>

        <ul className="flex-1 space-y-1 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-white/15 text-white border-l-4 border-white -ml-1 pl-3'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon size={20} aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-4 mt-auto space-y-2">
          <button
            type="button"
            onClick={() => window.open('/board', '_blank')}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white text-primary font-semibold text-sm hover:bg-chip transition-colors"
          >
            <Tv2 size={16} aria-hidden />
            Buka Display TV
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-start gap-3 px-4 py-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white text-sm font-semibold transition-colors"
          >
            <LogOut size={18} aria-hidden />
            Ganti Poli
          </button>
        </div>
      </nav>

      {/* Top bar + main */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-line flex items-center justify-between px-6">
          <div className="text-primary font-bold">Puskesmas Hub</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-full text-muted hover:bg-chip transition-colors"
              aria-label="Notifikasi"
            >
              <Bell size={20} />
            </button>
            <button
              type="button"
              className="p-2 rounded-full text-muted hover:bg-chip transition-colors"
              aria-label="Bantuan"
            >
              <HelpCircle size={20} />
            </button>
            <div className="h-6 w-px bg-line mx-1" />
            {currentPoli && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-white text-sm font-semibold">
                <span className="text-xs uppercase tracking-wider opacity-90">
                  {currentPoli.kode_poli}
                </span>
                <span>{currentPoli.nama_poli}</span>
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
