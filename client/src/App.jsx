import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentGeneratorPage } from './pages/DocumentGeneratorPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { LegalVaultPage } from './pages/LegalVaultPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { LawyerDirectoryPage } from './pages/LawyerDirectoryPage';
import { LawyerProfilePage } from './pages/LawyerProfilePage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { AdminPage } from './pages/AdminPage';

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
      </BrowserRouter>
    </AuthProvider>
  );
}
