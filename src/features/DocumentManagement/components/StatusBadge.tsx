import React from 'react';
import type { Document } from '../types/types';


interface StatusBadgeProps {
  status: Document['status'];
}

const getStatusBadgeStyle = (status: Document['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default: // pending
      return 'bg-yellow-100 text-yellow-800';
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