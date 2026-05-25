import { Check, Megaphone, SkipForward } from 'lucide-react';
import type { BookingStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface Props {
  nomor_antrean: string;
  patient_name: string;
  status: BookingStatus;
  onCall?: () => void;
  onDone?: () => void;
  onSkip?: () => void;
  highlighted?: boolean;
  className?: string;
}

export function QueueCard({
  nomor_antrean,
  patient_name,
  status,
  onCall,
  onDone,
  onSkip,
  highlighted,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-md bg-white p-4 shadow-card border border-line transition-all',
        highlighted && 'ring-2 ring-primary border-primary',
        className,
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-2xl font-bold text-ink shrink-0 w-20">
          {nomor_antrean}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-ink truncate">{patient_name}</div>
          <div className="mt-1">
            <StatusBadge status={status} size="sm" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onCall && (
          <button
            type="button"
            onClick={onCall}
            title="Panggil"
            className="p-2 rounded-md text-primary hover:bg-callingTint transition-colors"
          >
            <Megaphone size={18} />
          </button>
        )}
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            title="Selesai"
            className="p-2 rounded-md text-done hover:bg-successTint transition-colors"
          >
            <Check size={18} />
          </button>
        )}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            title="Lewati"
            className="p-2 rounded-md text-muted hover:bg-line transition-colors"
          >
            <SkipForward size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
