import {  useLocation } from "react-router";
import { useRef } from "react";
import { AgentPanel } from "./AgentPanel";
import { useAuthStore } from "../../store/authStore";
import { SidebarMenu } from "../../utils/title_content";
import { DummyChats } from "../../utils/dummy";
import { NavigationMenu } from "./NavigationMenu";


const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  isDesktop,
  setOutletBlurred,
}: {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isDesktop: boolean;
  setOutletBlurred: (isBlurred: boolean) => void;
}) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const userPages = user?.role?.team?.pages || [];
  const userPermissions = user?.role?.permissions || [];
  const accessibleMenu = SidebarMenu.filter((item) => {
    const isPageInTeam = userPages.includes(item.identifier);

    const hasReadPermission = userPermissions.some(
      (p: any) => p.name === `${item.identifier}:read`
    );

    return isPageInTeam && hasReadPermission;
  });

  const showAgentSection = userPermissions.some(
    (p: any) => p.name === "helpdesk:read"
  );
  const agentStatus = "online";

  return (
    <nav
      ref={sidebarRef}
      className={`fixed top-0 left-0 flex h-screen flex-col bg-white text-gray-700 shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-25" : "w-50"
      } 
      ${isDesktop ? "z-50" : isMobileOpen ? "z-[60]" : "z-50 -translate-x-full"}
      `}
    >
      <div
        className={`flex h-20 items-center px-4 mt-4 mb-4 transition-all duration-300 ${
          isCollapsed ? "justify-center" : "justify-start"
        }`}
      >
        <div className="relative flex items-center justify-center h-12 w-full">
          <img
            src="/LOGO KEMENTERIAN INVESTASI DAN HILIRISASI BKPM-Horizontal.png"
            alt="Logo"
            className={`absolute h-10 transition-all duration-300 ease-in-out ${
              isCollapsed ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
          />
          <img
            src="/bkpmlogo.png"
            alt="Collapsed Logo"
            className={`absolute h-7 transition-all duration-300 ease-in-out ${
              isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          />
        </div>
      </div>

      <div className={`flex flex-1 flex-col overflow-hidden`}>
        <div className={`flex-1 overflow-y-auto custom-scrollbar-overlay`}>
          <NavigationMenu
            menuItems={accessibleMenu}
            currentPath={location.pathname}
            isCollapsed={isCollapsed}
          />
        </div>

        {showAgentSection && (
          <div style={{ height: "auto" }} className="mt-auto">
            <AgentPanel
              panelRef={agentPanelRef}
              agentName={user?.name || "Guest"}
              chats={DummyChats}
              agentStatus={agentStatus}
              isCollapsed={isCollapsed}
              setOutletBlurred={setOutletBlurred}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
