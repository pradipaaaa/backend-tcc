import { cn } from '@/lib/utils';

interface Props {
  nomor: string | null;
  patient_name: string | null;
  poli_name: string;
  mode: 'compact' | 'panel' | 'board';
  pulse?: boolean;
  className?: string;
}

export function CurrentNumberDisplay({
  nomor,
  patient_name,
  poli_name,
  mode,
  pulse,
  className,
}: Props) {
  const display = nomor ?? '---';
  const name = patient_name ?? 'Belum ada panggilan';

  if (mode === 'board') {
    return (
      <div
        className={cn('flex flex-col items-center text-center', className)}
        aria-live="polite"
      >
        <div
          className={cn(
            'leading-none font-extrabold tracking-tight text-white drop-shadow-[0_12px_48px_rgba(14,124,123,0.45)]',
            'text-[clamp(140px,18vw,240px)]',
            pulse && 'animate-pulseSoft',
          )}
        >
          {display}
        </div>
        <div className="mt-6 text-[clamp(36px,5vw,64px)] font-semibold text-white/90">
          {name}
        </div>
        <div className="mt-3 text-[clamp(18px,2vw,28px)] font-medium text-white/75">
          {poli_name}
        </div>
      </div>
    );
  }

  if (mode === 'panel') {
    return (
      <div className={cn('text-center', className)} aria-live="polite">
        <div className="text-sm font-semibold text-muted uppercase tracking-wider">
          Antrean Saat Ini
        </div>
        <div className="mt-2 text-[180px] leading-none font-extrabold text-primary tracking-tight">
          {display}
        </div>
        <div className="mt-3 text-2xl font-semibold text-ink">{name}</div>
        <div className="mt-1 text-base text-muted">{poli_name}</div>
      </div>
    );
  }

  // compact
  return (
    <div className={cn('text-center', className)} aria-live="polite">
      <div className="text-xs font-semibold text-muted uppercase tracking-wider">
        Antrean Sedang Dipanggil
      </div>
      <div className="mt-1 text-[96px] leading-none font-extrabold text-primary tracking-tight">
        {display}
      </div>
      <div className="mt-2 text-xl font-semibold text-ink">{name}</div>
    </div>
  );
}
