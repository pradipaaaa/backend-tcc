import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className,
      )}
    >
      <div className="w-20 h-20 rounded-full bg-callingTint flex items-center justify-center text-primary mb-4">
        {icon ?? <Inbox size={40} aria-hidden />}
      </div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-muted leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
