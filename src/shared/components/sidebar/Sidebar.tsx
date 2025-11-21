import { Link, useLocation } from "react-router";
import { Users, Shield, LayoutDashboard, Dock, Database, BotIcon, History, SearchSlash, User2, Headset } from "lucide-react";
import { useRef } from 'react';

import { AgentPanel } from "./AgentPanel";
import type { Chat, MenuItem } from "../../types/types";
import Tooltip from "../Tooltip"; 
import { useAuthStore } from "../../store/authStore";

// ... (dummyMenu tetap sama) ...
const dummyMenu: MenuItem[] = [
  { path: "/dashboard", title: "Dashboard", icon: LayoutDashboard, identifier: "dashboard" },
  { path: "/knowledge-base", title: "Knowledge base", icon: Database, identifier: "knowledge-base"},
  { path: "/document-management", title: "Document Management", icon: Dock, identifier: "document-management" },
  { path: "/public-service", title: "Public service", icon: BotIcon, identifier: "public-service" },
  { path: "/validation-history", title: "Validation History", icon: History, identifier: "validation-history" },
  { path: "/guide", title: "Guide", icon: SearchSlash, identifier: "guide" },
  { path: "/user-management", title: "User Management", icon: User2, identifier: "user-management" },
  { path: "/team-management", title: "Team Management ", icon: Users, identifier: "team-management" },
  { path: "/role-management", title: "Role Management", icon: Shield, identifier: "role-management" },
  { path: "/helpdesk", title: "Help Desk", icon: Headset, identifier: "helpdesk" },
];


const dummyChats: {
  queue: Chat[];
  active: Chat[];
  history: Chat[];
  pending: Chat[];
} = {
  queue: [
    { id: 'q1', user_name: 'Antrian User 1', last_message: '', timestamp: new Date().toISOString(), channel: 'web' },
    { id: 'q2', user_name: 'Antrian User 2', last_message: '', timestamp: new Date().toISOString(), channel: 'whatsapp' },
  ],
  active: [
    { id: 'a1', user_name: 'User Aktif', last_message: '', timestamp: new Date().toISOString(), channel: 'web' },
  ],
  history: [
    { id: 'h1', user_name: 'User Riwayat', last_message: '', timestamp: new Date().toISOString(), channel: 'email' },
  ],
  pending: [],
};

const NavigationMenu = ({ menuItems, currentPath, isCollapsed }: { menuItems: MenuItem[], currentPath: string, isCollapsed: boolean }) => (
    <div className="space-y-1 px-2 pb-4 md:px-4">
      {menuItems.map((item) => {
        const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
        const linkContent = (
          <Link
            key={item.path}
            to={item.path}
            className={`group flex items-center rounded-lg px-3 h-12 mx-2 transition-colors duration-200 ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } ${
              isActive ? "bg-bOss-red text-white" : "hover:bg-bOss-red-50 text-gray-600"
            }`}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span
              className={`
                font-medium overflow-hidden transition-all duration-300 ease-in-out leading-snug text-xs
                ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
              `}
            >
              {item.title}
            </span>
          </Link>
        );
  
        return isCollapsed ? (
          <Tooltip key={item.path} text={item.title}>
            {linkContent}
          </Tooltip>
        ) : (
          linkContent
        );
      })}
    </div>
  );

const Sidebar = ({ isCollapsed, isMobileOpen, isDesktop, setOutletBlurred }: { 
  isCollapsed: boolean, 
  isMobileOpen: boolean,
  isDesktop: boolean,
  setOutletBlurred: (isBlurred: boolean) => void 
}) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore(); // AMBIL DATA USER DARI STORE
  
  // --- LOGIKA FILTER MENU (RBAC) ---
  // Ambil pages dari user.role.team.pages
  const userPages = user?.role?.team?.pages || [];
  
  const accessibleMenu = dummyMenu.filter(item =>
    // Tampilkan jika identifier menu ada di dalam userPages
    userPages.includes(item.identifier)
  );

  // --- LOGIKA AGENT PANEL ---
  // Cek permission user.role.permissions (array of object {id, name})
  const userPermissions = user?.role?.permissions || [];
  const showAgentSection = userPermissions.some((p: any) => p.name === "helpdesk:read");
  const agentStatus = 'online'; // Bisa dibuat dinamis nanti jika ada state status di user

  return (
    <nav
      ref={sidebarRef}
      className={`fixed top-0 left-0 flex h-screen flex-col bg-white text-gray-700 shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-25" : "w-50"
      } 
      ${
        isDesktop
          ? 'z-50' 
          : isMobileOpen
            ? 'z-[60]' 
            : 'z-50 -translate-x-full' 
      }
      `}
    >
      {/* 1. LOGO */}
      <div className={`flex h-20 items-center px-4 mt-4 mb-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="relative flex items-center justify-center h-12 w-full">
              <img 
                  src="/LOGO KEMENTERIAN INVESTASI DAN HILIRISASI BKPM-Horizontal.png" 
                  alt="Logo" 
                  className={`absolute h-10 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
              />
              <img 
                  src="/bkpmlogo.png" 
                  alt="Collapsed Logo" 
                  className={`absolute h-7 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              />
          </div>
      </div>

      {/* 2. Container untuk layout internal */}
      <div className={`flex flex-1 flex-col overflow-hidden`}>
        
        {/* 3. AREA MENU (Scrollable) */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar-overlay`}>
          <NavigationMenu menuItems={accessibleMenu} currentPath={location.pathname} isCollapsed={isCollapsed} />
        </div>

        {/* 4. AGENT PANEL (Didorong ke bawah) */}
        {showAgentSection && (
          <div style={{ height: 'auto' }} className="mt-auto">
            <AgentPanel
              panelRef={agentPanelRef}
              agentName={user?.name || 'Guest'}
              chats={dummyChats}
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