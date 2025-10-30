import React from 'react';

interface AccessRightsProps {
  rights: string[];
}

const AccessRights: React.FC<AccessRightsProps> = ({ rights }) => {
  if (!rights || rights.length === 0) {
    return <span className="text-gray-400">No access rights</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-md">
      {rights.map(right => (
        <span key={right} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full">
          {right.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
};

export default AccessRights;