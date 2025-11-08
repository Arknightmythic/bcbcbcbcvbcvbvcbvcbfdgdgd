import React from 'react';

interface TeamBadgeProps {
  teamName?: string; // Dibuat opsional
}

const getTeamBadgeStyle = (teamName: string = "No Team") => {
  switch (teamName.toLowerCase()) {
    case 'superadmin':
      return 'bg-red-100 text-red-800';
    case 'finance':
      return 'bg-green-100 text-green-800';
    case 'legal':
      return 'bg-yellow-100 text-yellow-800';
    case 'it':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TeamBadge: React.FC<TeamBadgeProps> = ({ teamName }) => {
  const badgeStyle = getTeamBadgeStyle(teamName);

  return (
    <span className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${badgeStyle}`}>
      {teamName || 'No Team'}
    </span>
  );
};

export default TeamBadge;