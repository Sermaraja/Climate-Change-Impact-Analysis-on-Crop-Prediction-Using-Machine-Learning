import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { FarmsList } from './pages/FarmsList';
import { FarmNew } from './pages/FarmNew';
import { Weather } from './pages/Weather';
import { RainImpact } from './pages/RainImpact';
import { Recovery } from './pages/Recovery';
import { ClimateAnalysis } from './pages/ClimateAnalysis';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="farms" element={<FarmsList />} />
            <Route path="farms/new" element={<FarmNew />} />
            <Route path="weather" element={<Weather />} />
            <Route path="rain-impact" element={<RainImpact />} />
            <Route path="recovery" element={<Recovery />} />
            <Route path="climate-analysis" element={<ClimateAnalysis />} />
            <Route path="history" element={<History />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
