// src/shared/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedPage: string; // Key page yang harus dimiliki (misal: 'dashboard', 'user-management')
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedPage }) => {
  const user = useAuthStore((state) => state.user);
  
  // Ambil daftar pages dari user yang login
  // Struktur JSON: user -> role -> team -> pages[]
  const userPages = user?.role?.team?.pages || [];

  // Cek apakah user memiliki akses ke halaman ini
  const hasAccess = userPages.includes(allowedPage);

  if (!hasAccess) {
    // Jika tidak punya akses, lempar ke halaman 404
    return <Navigate to="/404" replace />;
  }

  // Jika punya akses, render konten halaman (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;