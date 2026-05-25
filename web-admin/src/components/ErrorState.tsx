import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Terjadi kesalahan',
  description = 'Tidak dapat memuat data. Periksa koneksi atau coba lagi.',
  onRetry,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className,
      )}
    >
      <div className="w-20 h-20 rounded-full bg-warningTint flex items-center justify-center text-warningInk mb-4">
        <AlertTriangle size={40} aria-hidden />
      </div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-muted leading-relaxed">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          <RefreshCw size={16} aria-hidden />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
