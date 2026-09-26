import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './pages/LandingPage';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { FarmsList } from './pages/FarmsList';
import { FarmNew } from './pages/FarmNew';
import { FarmDetail } from './pages/FarmDetail';
import { Weather } from './pages/Weather';
import { FarmCropImpact } from './pages/FarmCropImpact';
import { AlertsCenter } from './pages/AlertsCenter';
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
        <ToastProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Entry Landing Page */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Welcome Onboarding Route */}
                <Route
                  path="/welcome"
                  element={
                    <ProtectedRoute>
                      <Welcome />
                    </ProtectedRoute>
                  }
                />

              {/* Protected Application Routes inside Dashboard Layout */}
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/crop-impact"
                  element={
                    <ProtectedRoute>
                      <FarmCropImpact />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute>
                      <AlertsCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms"
                  element={
                    <ProtectedRoute>
                      <FarmsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/new"
                  element={
                    <ProtectedRoute>
                      <FarmNew />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:id"
                  element={
                    <ProtectedRoute>
                      <FarmDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/weather"
                  element={
                    <ProtectedRoute>
                      <Weather />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rain-impact"
                  element={
                    <ProtectedRoute>
                      <FarmCropImpact />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recovery"
                  element={
                    <ProtectedRoute>
                      <Recovery />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/climate-analysis"
                  element={
                    <ProtectedRoute>
                      <ClimateAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
