// [File: src/features/HelpDesk/pages/HelpDeskPage.tsx]

import React from 'react';
import { Outlet } from 'react-router';
import HelpDeskListPanel from '../components/HelpDeskListPanel';


const HelpDeskPage: React.FC = () => {
  return (
    <div className="flex flex-1 h-full min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Kolom Kiri: Daftar Chat */}
      <div className="w-full max-w-xs md:max-w-sm border-r border-gray-200 flex flex-col">
        <HelpDeskListPanel />
      </div>

      {/* Kolom Kanan: Panel Chat (Intro atau Chat Aktif) */}
      <div className="flex-1 flex flex-col min-h-0 ">
        <Outlet />
      </div>
    </div>
  );
};

export default HelpDeskPage;