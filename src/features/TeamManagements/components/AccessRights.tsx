import React from 'react';

interface AccessRightsProps {
  rights: string[];
}

const AccessRights: React.FC<AccessRightsProps> = ({ rights }) => {
  if (!rights || rights.length === 0) {
    return <span className="text-gray-400">Tidak memiliki Hak Akses</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-xl">
      {rights.map(right => (
        <span key={right} className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-800 rounded-full">
          {right.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
};

export default AccessRights;