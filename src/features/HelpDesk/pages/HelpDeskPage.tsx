import React from 'react';
import { Outlet, useParams } from 'react-router'; 
import HelpDeskListPanel from '../components/HelpDeskListPanel';


const HelpDeskPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>(); 

  return (
    <div className="flex flex-1 h-full min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* --- PERUBAHAN DI SINI: ganti md: -> lg: --- */}
      <div className={`
        ${sessionId ? 'hidden' : 'flex'} 
        lg:flex lg:flex-col 
        w-full lg:max-w-xs lg:max-w-sm 
        border-r border-gray-200 
        flex-col
      `}>
        <HelpDeskListPanel />
      </div>

      {/* --- PERUBAHAN DI SINI: ganti md: -> lg: --- */}
      <div className={`
        ${sessionId ? 'flex' : 'hidden'} 
        lg:flex 
        flex-1 flex-col min-h-0
      `}>
        <Outlet />
      </div>
    </div>
  );
};

export default HelpDeskPage;