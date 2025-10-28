import React from 'react';
import type { ValidationHistory } from '../utils/types';


interface StatusBadgeProps {
  status: ValidationHistory['status'];
}

const getStatusBadgeStyle = (status: ValidationHistory['status']) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
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