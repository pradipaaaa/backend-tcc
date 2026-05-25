import { Check, Clock, Megaphone, SkipForward } from 'lucide-react';
import type { BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<BookingStatus, string> = {
  waiting: 'Menunggu',
  calling: 'Dipanggil',
  done: 'Selesai',
  skipped: 'Dilewati',
};

const STATUS_ICON: Record<BookingStatus, typeof Clock> = {
  waiting: Clock,
  calling: Megaphone,
  done: Check,
  skipped: SkipForward,
};

const STATUS_CLASS: Record<BookingStatus, string> = {
  waiting: 'bg-warningTint text-warningInk',
  calling: 'bg-primary text-white animate-pulseSoft',
  done: 'bg-successTint text-successInk',
  skipped: 'bg-line text-muted',
};

interface Props {
  status: BookingStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: Props) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-label font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        STATUS_CLASS[status],
        className,
      )}
    >
      <Icon size={size === 'sm' ? 12 : 14} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
