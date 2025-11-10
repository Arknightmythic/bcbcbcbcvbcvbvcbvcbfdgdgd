// src/shared/components/Layout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/header";

// --- 1. Tentukan Kunci LocalStorage ---
const SIDEBAR_STATE_KEY = "sidebar_is_collapsed";

function Layout() {
  
  // --- 2. Baca state dari LocalStorage saat inisialisasi ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    // Jika ada state tersimpan, gunakan itu. Jika tidak, default ke false (expanded).
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAgentPanelPopupOpen, setIsAgentPanelPopupOpen] = useState(false);
  
  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    
    if (!mediaQuery.matches) {
      setIsMobileSidebarOpen(false);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  // --- 3. Tulis state ke LocalStorage saat di-toggle ---
  const toggleSidebar = () => {
    if (isDesktop) {
      // Hitung state baru
      const newCollapsedState = !isSidebarCollapsed;
      
      // Simpan state baru ke LocalStorage
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newCollapsedState));
      
      // Terapkan state baru ke React
      setIsSidebarCollapsed(newCollapsedState);
    } else {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const isContentBlurred = isMobileSidebarOpen && !isDesktop;

  return (
    <div className="flex min-h-screen relative">
      
      {isContentBlurred && (
        <div
          className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar 
        isCollapsed={isDesktop ? isSidebarCollapsed : false} 
        isMobileOpen={isMobileSidebarOpen} 
        isDesktop={isDesktop} 
        setOutletBlurred={setIsAgentPanelPopupOpen} 
      />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isDesktop ? (isSidebarCollapsed ? "lg:ml-25" : "lg:ml-50") : "ml-0"
        } w-0`}
      >
        <Header toggleSidebar={toggleSidebar} />

        <main className={`flex flex-col flex-1 p-5 bg-[#F9FAFB] overflow-y-auto relative ${
          isAgentPanelPopupOpen ? 'blur-sm pointer-events-none' : '' 
        } transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;