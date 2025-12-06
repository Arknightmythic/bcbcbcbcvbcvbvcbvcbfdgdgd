// src/features/RoleManagements/components/ViewPermissionModal.tsx

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import type { Role } from '../utils/types'; 

// --- HELPER CONFIG (Sama dengan RoleTableRow) ---
const shouldShowPermission = (name: string) => name.endsWith(':read');
const formatPermissionLabel = (name: string) => name.replace(':read', ':access');
// ------------------------------------------------

interface ViewPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

const ViewPermissionsModal: React.FC<ViewPermissionsModalProps> = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  // 1. Ambil permission raw
  const allPermissions = role.permissions || [];
  // 2. Filter permission
  const visiblePermissions = allPermissions.filter(p => shouldShowPermission(p.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* PERBAIKAN 1: Gunakan <button> untuk backdrop (Native Interactive Element) */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-white/30 backdrop-blur-sm border-none cursor-default"
        onClick={onClose}
        aria-label="Tutup modal"
        tabIndex={-1} // Mencegah user melakukan tab focus ke background
      />

      {/* PERBAIKAN 2: 
          - Gunakan <dialog> untuk semantik yang benar.
          - Hapus onClick={stopPropagation} karena backdrop sekarang adalah sibling.
      */}
      <dialog
        open
        aria-modal="true"
        className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up m-0 border-none outline-none"
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Detail Peran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Nama Peran:</span>
            <p className="text-lg text-gray-900 capitalize">{role.name}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Tim:</span>
            <p className="text-lg text-gray-900 capitalize">{role.team.name || 'Tidak ada tim'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Izin Akses yang Didaftarkan</h3>
          <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {/* Render visiblePermissions yang sudah difilter */}
            {visiblePermissions.length > 0 ? (
              <ul className="space-y-2">
                {visiblePermissions.map(permission => (
                  <li key={permission.id} className="flex items-center bg-white p-2 border rounded-md">
                    <ShieldCheck className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{formatPermissionLabel(permission.name)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada hak akses yang didaftarkan</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Tutup
          </button>
        </div>
      </dialog>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default ViewPermissionsModal;