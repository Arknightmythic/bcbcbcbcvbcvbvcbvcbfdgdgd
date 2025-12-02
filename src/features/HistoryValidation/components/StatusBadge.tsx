import React from 'react';
import type { ValidationStatus } from '../utils/types';

interface StatusBadgeProps {
  status: ValidationStatus;
}

// Fungsi untuk menentukan warna background dan text
const getStatusBadgeStyle = (status: ValidationStatus) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Validated': // Asumsi: 'Validated' di sini adalah status 'approved'
      return 'bg-green-100 text-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Fungsi baru untuk menerjemahkan label status
const getStatusLabel = (status: ValidationStatus) => {
  switch (status) {
    case 'Pending':
      return 'Ditinjau';
    case 'Validated':
      return 'Disetujui';
    case 'Rejected':
      return 'Ditolak';
    default:
      return status; // Jika ada status lain, tampilkan apa adanya
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeStyle = getStatusBadgeStyle(status);
  const label = getStatusLabel(status); // Mengambil teks bahasa Indonesia

  return (
    <span className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${badgeStyle}`}>
      {label}
    </span>
  );
};

export default StatusBadge;