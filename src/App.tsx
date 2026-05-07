/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar, { Footer } from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrandingProvider } from "./context/BrandingContext";
import HomeGuard from "./components/HomeGuard";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <Router>
          <div className="min-h-screen bg-white text-slate-900 transition-colors duration-500">
            <Routes>
              <Route path="/" element={<HomeGuard><MainLayout><Home /></MainLayout></HomeGuard>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </BrandingProvider>
    </AuthProvider>
  );
}
