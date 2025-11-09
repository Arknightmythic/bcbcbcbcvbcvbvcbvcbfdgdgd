// src/shared/components/Layout.tsx
import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/header";


function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOutletBlurred, setIsOutletBlurred] = useState(false);


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen relative">
      <Sidebar isCollapsed={isSidebarCollapsed} setOutletBlurred={setIsOutletBlurred}/>
      <div
        /* --- PERUBAHAN DI SINI: Tambahkan 'w-0' --- */
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-25" : "ml-50"
        } w-0`} // w-0 akan memperbaiki bug flex-shrink
      >
        <Header toggleSidebar={toggleSidebar} />
        <main className={`flex flex-col flex-1 p-5 bg-[#F9FAFB] overflow-y-auto relative ${isOutletBlurred ? 'blur-sm' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;