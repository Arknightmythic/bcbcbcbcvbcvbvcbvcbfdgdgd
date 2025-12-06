import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/header";
import { SIDEBAR_STATE_KEY } from "../utils/constant";
import { useSyncUser } from "../hooks/useSyncUser";



function Layout() {
  useSyncUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    globalThis.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    if (!mediaQuery.matches) {
      setIsMobileSidebarOpen(false);
    }
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  const toggleSidebar = () => {
    if (isDesktop) {
      const newCollapsedState = !isSidebarCollapsed;
      localStorage.setItem(
        SIDEBAR_STATE_KEY,
        JSON.stringify(newCollapsedState)
      );
      setIsSidebarCollapsed(newCollapsedState);
    } else {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const isContentBlurred = isMobileSidebarOpen && !isDesktop;

  let mainContentMargin = "ml-0";
  if (isDesktop) {
    mainContentMargin = isSidebarCollapsed ? "lg:ml-25" : "lg:ml-50";
  }
  
  return (
    <div className="flex h-screen relative overflow-hidden">
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
      />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${mainContentMargin} w-0`}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main
          className="flex flex-col flex-1 px-5 pt-5 bg-[#F9FAFB] overflow-y-auto custom-scrollbar relative transition-all duration-300"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
