import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { RequirePoli } from '@/app/RequirePoli';
import PilihPoli from '@/pages/PilihPoli';
import Dashboard from '@/pages/Dashboard';
import AntreanHariIni from '@/pages/AntreanHariIni';
import Pemanggilan from '@/pages/Pemanggilan';
import DisplayBoard from '@/pages/DisplayBoard';
import MasterData from '@/pages/MasterData';
import Riwayat from '@/pages/Riwayat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/pilih-poli" element={<PilihPoli />} />
          <Route
            path="/"
            element={
              <RequirePoli>
                <Dashboard />
              </RequirePoli>
            }
          />
          <Route
            path="/antrean"
            element={
              <RequirePoli>
                <AntreanHariIni />
              </RequirePoli>
            }
          />
          <Route
            path="/pemanggilan"
            element={
              <RequirePoli>
                <Pemanggilan />
              </RequirePoli>
            }
          />
          <Route
            path="/board"
            element={
              <RequirePoli>
                <DisplayBoard />
              </RequirePoli>
            }
          />
          <Route
            path="/master"
            element={
              <RequirePoli>
                <MasterData />
              </RequirePoli>
            }
          />
          <Route
            path="/riwayat"
            element={
              <RequirePoli>
                <Riwayat />
              </RequirePoli>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
