import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';

export function RequirePoli({ children }: { children: ReactNode }) {
  const selectedPoliId = useAppStore((s) => s.selectedPoliId);
  if (selectedPoliId == null) {
    return <Navigate to="/pilih-poli" replace />;
  }
  return <>{children}</>;
}
