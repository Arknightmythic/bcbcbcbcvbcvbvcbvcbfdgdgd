import React from 'react';

// Props diubah agar menerima isApprove
interface StatusBadgeProps {
  isApprove: string | null;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isApprove }) => {
  let badgeStyle: string;
  let statusText: string;

  if (isApprove === 'Approved') {
    badgeStyle = 'bg-green-100 text-green-800';
    statusText = 'Approved';
  } else if (isApprove === 'Rejected') {
    badgeStyle = 'bg-red-100 text-red-800';
    statusText = 'Rejected';
  } else {
    // isApprove === null
    badgeStyle = 'bg-yellow-100 text-yellow-800';
    statusText = 'Pending';
  }
  
  return (
    <span className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${badgeStyle}`}>
      {statusText}
    </span>
  );
};

export default StatusBadge;