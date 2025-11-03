import { Link, useLocation } from "react-router";
import { Users, Shield, LayoutDashboard, Dock, Database, BotIcon, History, SearchSlash, User2, Headset } from "lucide-react";
import {  useRef } from 'react';

import { AgentPanel } from "./AgentPanel";
import type { MenuItem } from "../../types/types";
import Tooltip from "../Tooltip";


const dummyMenu: MenuItem[] = [
  { path: "/dashboard", title: "Dashboard", icon: LayoutDashboard, identifier: "dashboard" },
  { path: "/upload-document", title: "Knowledge base", icon: Database, identifier: "upload-document"},
  { path: "/document-management", title: "Document Management", icon: Dock, identifier: "document-management" },
  { path: "/public-service", title: "Public service", icon: BotIcon, identifier: "public-service" },
  { path: "/validation-history", title: "Validation History", icon: History, identifier: "validation-history" },
  { path: "/guide", title: "Guide", icon: SearchSlash, identifier: "guide" },
  { path: "/user-management", title: "User Management", icon: User2, identifier: "user-management" },
  { path: "/team-management", title: "Team Management ", icon: Users, identifier: "team-management" },
  { path: "/role-management", title: "Role Management", icon: Shield, identifier: "role-management" },
  // { path: "/helpdesk", title: "Help Desk", icon: Headset, identifier: "helpdesk" },
];

const dummyUser = {
  name: "Budi Santoso",
  isSuperAdmin: false,
  permissions: ["dashboard:access", "document-management:access", "agent-dashboard:access", "user-management:master", "upload-document:access", "public-service:access", "validation-history:access","guide:access", "team-management", "role-management", "helpdesk:access"],
  status: 'online' as const,
};

const dummyChats = {
  queue: [
    { id: 'q1', user_name: 'Antrian User 1', last_message: '', timestamp: new Date().toISOString() },
    { id: 'q2', user_name: 'Antrian User 2', last_message: '', timestamp: new Date().toISOString() },
  ],
  active: [
    { id: 'a1', user_name: 'User Aktif', last_message: '', timestamp: new Date().toISOString() },
  ],
  history: [
    { id: 'h1', user_name: 'User Riwayat', last_message: '', timestamp: new Date().toISOString() },
  ],
  pending: [],
};

// --- START: MODIFIED COMPONENT ---
const NavigationMenu = ({ menuItems, currentPath, isCollapsed }: { menuItems: MenuItem[], currentPath: string, isCollapsed: boolean }) => (
    <div className="space-y-2 px-2 py-6 md:px-4">
      {menuItems.map((item) => {
        const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
        const linkContent = (
          <Link
            key={item.path}
            to={item.path}
            // MODIFICATION: Removed py-2.5, added fixed height h-14
            className={`group flex items-center rounded-lg px-3 h-12 mx-2 transition-colors duration-200 ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } ${
              isActive ? "bg-bOss-red text-white" : "hover:bg-bOss-red-50 text-gray-600"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span
              className={`
                font-medium overflow-hidden transition-all duration-300 ease-in-out leading-snug
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
// --- END: MODIFIED COMPONENT ---

const Sidebar = ({ isCollapsed, setOutletBlurred }: { isCollapsed: boolean, setOutletBlurred: (isBlurred: boolean) => void }) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const logoSectionRef = useRef<HTMLDivElement>(null);

  const accessibleMenu = dummyMenu.filter(item =>
    dummyUser.isSuperAdmin || dummyUser.permissions.some(p => p.startsWith(item.identifier))
  );

  const showAgentSection = dummyUser.permissions.includes("agent-dashboard:access");

  return (
    <nav
      ref={sidebarRef}
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col bg-white text-gray-700 shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-25" : "w-72"
      }`}
    >
      <div className={`flex h-20 items-center px-4 mt-4 mb-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="relative flex items-center justify-center h-12 w-full">
              <img 
                  src="/dokulogo.png" 
                  alt="Logo" 
                  className={`absolute h-30 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
              />
              <img 
                  src="/dokulogo-d.png" 
                  alt="Collapsed Logo" 
                  className={`absolute h-10 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              />
          </div>
      </div>

      <div className={`flex flex-1 flex-col ${isCollapsed ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className={`flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <NavigationMenu menuItems={accessibleMenu} currentPath={location.pathname} isCollapsed={isCollapsed} />
        </div>

        {showAgentSection && (
          <div style={{ height: 'auto' }} className="mt-auto">
            <AgentPanel
              panelRef={agentPanelRef}
              agentName={dummyUser.name}
              chats={dummyChats}
              agentStatus={dummyUser.status}
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