import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const DocumentGeneratorPage = React.lazy(() => import('./pages/DocumentGeneratorPage').then(module => ({ default: module.DocumentGeneratorPage })));
const DocumentDetailPage = React.lazy(() => import('./pages/DocumentDetailPage').then(module => ({ default: module.DocumentDetailPage })));
const LegalVaultPage = React.lazy(() => import('./pages/LegalVaultPage').then(module => ({ default: module.LegalVaultPage })));
const AIAssistantPage = React.lazy(() => import('./pages/AIAssistantPage').then(module => ({ default: module.AIAssistantPage })));
const LawyerDirectoryPage = React.lazy(() => import('./pages/LawyerDirectoryPage').then(module => ({ default: module.LawyerDirectoryPage })));
const LawyerProfilePage = React.lazy(() => import('./pages/LawyerProfilePage').then(module => ({ default: module.LawyerProfilePage })));
const ConsultationsPage = React.lazy(() => import('./pages/ConsultationsPage').then(module => ({ default: module.ConsultationsPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F]"></div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<LandingPage />} />
            <Route path="/how-it-works" element={<LandingPage />} />
            <Route path="/security" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/documents/new" element={<ProtectedRoute><DocumentGeneratorPage /></ProtectedRoute>} />
            <Route path="/documents/generate" element={<ProtectedRoute><DocumentGeneratorPage /></ProtectedRoute>} />
            <Route path="/documents/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><LegalVaultPage /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
            <Route path="/lawyers" element={<ProtectedRoute><LawyerDirectoryPage /></ProtectedRoute>} />
            <Route path="/lawyers/:id" element={<ProtectedRoute><LawyerProfilePage /></ProtectedRoute>} />
            <Route path="/consultations" element={<ProtectedRoute><ConsultationsPage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
