import { Link, useLocation } from "react-router";
import { Users, Shield, Briefcase, LayoutDashboard } from "lucide-react";
import { useState, useRef, useCallback } from 'react';

import { AgentPanel } from "./AgentPanel";
import type { MenuItem } from "../../types/types";
import Tooltip from "../Tooltip";


const dummyMenu: MenuItem[] = [
  { path: "/dashboard", title: "Dashboard", icon: LayoutDashboard, identifier: "dashboard" },
  { path: "/agent-dashboard", title: "Agent Dashboard", icon: Briefcase, identifier: "agent-dashboard" },
  { path: "/user-management", title: "User Management", icon: Users, identifier: "user-management" },
  { path: "/role-management", title: "Role Management", icon: Shield, identifier: "role-management" },
];

const dummyUser = {
  name: "Budi Santoso",
  isSuperAdmin: false,
  permissions: ["dashboard:access", "agent-dashboard:access", "user-management:master"],
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

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();
  const [agentPanelHeight, setAgentPanelHeight] = useState(300); // Initial height
  const sidebarRef = useRef<HTMLElement>(null);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const logoSectionRef = useRef<HTMLDivElement>(null);

  const handleDrag = useCallback((deltaY: number) => {
    setAgentPanelHeight(prevHeight => {
      const newHeight = prevHeight - deltaY;
      const sidebarHeight = sidebarRef.current?.clientHeight ?? 0;
      const logoHeight = logoSectionRef.current?.clientHeight ?? 0;
      const minHeight = 150; // The height of the AgentSidebarSection + drag handle
      const maxHeight = sidebarHeight - logoHeight;
      return Math.max(minHeight, Math.min(newHeight, maxHeight));
    });
  }, []);

  const accessibleMenu = dummyMenu.filter(item =>
    dummyUser.isSuperAdmin || dummyUser.permissions.some(p => p.startsWith(item.identifier))
  );

  const showAgentSection = dummyUser.permissions.includes("agent-dashboard:access");

  const chatListHeight = agentPanelHeight - 150;

  return (
    <nav
      ref={sidebarRef}
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col bg-white text-gray-700 shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-25" : "w-72"
      }`}
    >
      <div ref={logoSectionRef} className={`${isCollapsed ? "justify-center ml-0" : "md:justify-start justify-center md:ml-2"} flex h-20 items-center px-4 mt-4 mb-4 `}>
        <img src={isCollapsed ? "/dokuprime-d.png" : "/Dokuprime.svg"} alt="Logo" className="h-10 md:h-12" />
      </div>

      <div className={`flex flex-1 flex-col ${isCollapsed ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className={`flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <NavigationMenu menuItems={accessibleMenu} currentPath={location.pathname} isCollapsed={isCollapsed} />
        </div>

        {showAgentSection && !isCollapsed && (
          <div style={{ height: `${agentPanelHeight}px` }}>
            <AgentPanel
              panelRef={agentPanelRef}
              agentName={dummyUser.name}
              chats={dummyChats}
              agentStatus={dummyUser.status}
              onDrag={handleDrag}
              chatListHeight={chatListHeight}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;