import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { FarmsList } from './pages/FarmsList';
import { FarmNew } from './pages/FarmNew';
import { FarmDetail } from './pages/FarmDetail';
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="farms"
                element={
                  <ProtectedRoute>
                    <FarmsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="farms/new"
                element={
                  <ProtectedRoute>
                    <FarmNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="farms/:id"
                element={
                  <ProtectedRoute>
                    <FarmDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="weather"
                element={
                  <ProtectedRoute>
                    <Weather />
                  </ProtectedRoute>
                }
              />
              <Route
                path="rain-impact"
                element={
                  <ProtectedRoute>
                    <RainImpact />
                  </ProtectedRoute>
                }
              />
              <Route
                path="recovery"
                element={
                  <ProtectedRoute>
                    <Recovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="climate-analysis"
                element={
                  <ProtectedRoute>
                    <ClimateAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
