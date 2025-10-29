import { Link, useLocation } from "react-router";
import { Users, Shield,  LayoutDashboard, Dock, Database, BotIcon, History, SearchSlash } from "lucide-react";
import { useRef } from 'react';

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
  // { path: "/agent-dashboard", title: "Agent Dashboard", icon: Briefcase, identifier: "agent-dashboard" },
  { path: "/user-management", title: "User Management", icon: Users, identifier: "user-management" },
  { path: "/role-management", title: "Role Management", icon: Shield, identifier: "role-management" },
];

const dummyUser = {
  name: "Budi Santoso",
  isSuperAdmin: false,
  permissions: ["dashboard:access", "document-management:access", "agent-dashboard:access", "user-management:master", "upload-document:access", "public-service:access", "validation-history:access","guide:access"],
  status: 'online' as const,
};

const dummyChats = {
  queue: [
    { id: 'q1', user_name: 'Antrian User 1', last_message: '', timestamp: new Date().toISOString() },
    { id: 'q2', user_name: 'Antrian User 2', last_message: '', timestamp: new Date().toISOString() },
    { id: 'q3', user_name: 'Antrian User 3', last_message: '', timestamp: new Date().toISOString() },
    { id: 'q4', user_name: 'Antrian User 4', last_message: '', timestamp: new Date().toISOString() },
  ],
  active: [
    { id: 'a1', user_name: 'User Aktif', last_message: '', timestamp: new Date().toISOString() },
  ],
  history: [
    { id: 'h1', user_name: 'User Riwayat', last_message: '', timestamp: new Date().toISOString() },
  ],
  pending: [],
};

const NavigationMenu = ({ menuItems, currentPath, isCollapsed }: { menuItems: MenuItem[], currentPath: string, isCollapsed: boolean }) => (
  <div className="space-y-2 px-2 py-6 md:px-4">
    {menuItems.map((item) => {
      const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
      const linkContent = (
        <Link
          key={item.path}
          to={item.path}
          className={`group flex items-center rounded-lg px-3 py-2.5 mx-2 transition-colors ${isCollapsed ? 'justify-center' : ' justify-center md:justify-start'} ${
            isActive ? "bg-bOss-red text-white" : "hover:bg-bOss-red-50"
          }`}
        >
          <item.icon className={`h-5 w-5 ${!isCollapsed ? "md:mr-3" : ""}`} />
          <span className={`hidden ${!isCollapsed ? "md:inline" : ""} font-medium`}>{item.title}</span>
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
      <div ref={logoSectionRef} className={`${isCollapsed ? "justify-center ml-0" : "md:justify-start justify-center md:ml-2"} flex h-20 items-center px-4 mt-4 mb-4 `}>
        <img src={isCollapsed ? "/dokulogo-d.png" : "/dokulogo.png"} alt="Logo" className={`${isCollapsed ? "h-10" : "h-30"}`} />
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