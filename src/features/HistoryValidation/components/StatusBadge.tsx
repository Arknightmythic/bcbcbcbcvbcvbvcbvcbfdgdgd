// [File: src/features/HistoryValidation/components/StatusBadge.tsx]

import React from 'react';
// import type { ValidationHistory } from '../utils/types'; // <-- Hapus
import type { ValidationStatus } from '../utils/types'; // <-- Ganti

interface StatusBadgeProps {
  // status: ValidationHistory['status']; // <-- Hapus
  status: ValidationStatus; // <-- Ganti
}

const getStatusBadgeStyle = (status: ValidationStatus) => {
  switch (status) {
    // Ganti case lama
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Validated':
      return 'bg-green-100 text-green-800';
    case 'Not Validated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;