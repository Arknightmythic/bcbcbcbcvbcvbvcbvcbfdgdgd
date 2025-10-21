import { Link, useLocation } from "react-router";
import { Users, Shield, Briefcase, LayoutDashboard } from "lucide-react";

import { AgentPanel } from "./AgentPanel";
import type { MenuItem } from "../../types/types";

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
  <div className="flex-1 px-2 md:px-4 py-6 space-y-2 overflow-y-auto">
    {menuItems.map((item) => {
      const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`group flex items-center px-3 py-2.5 rounded-lg mx-2 transition-colors ${isCollapsed?'justify-center':' justify-center md:justify-start'} ${
            isActive ? "bg-bOss-red text-white" : "hover:bg-bOss-red-50"
          }`}
        >
          <item.icon className={`w-5 h-5 ${!isCollapsed ? "md:mr-3" : ""}`} />
          <span className={`hidden ${!isCollapsed ? "md:inline" : ""} font-medium`}>{item.title}</span>
        </Link>
      );
    })}
  </div>
);

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();

  const accessibleMenu = dummyMenu.filter(item =>
    dummyUser.isSuperAdmin || dummyUser.permissions.some(p => p.startsWith(item.identifier))
  );

  const showAgentSection = dummyUser.permissions.includes("agent-dashboard:access");

  return (
    <nav
      className={`fixed top-0 left-0 h-screen bg-white text-gray-700 flex flex-col shadow-lg z-50 transition-all duration-300 ${
        isCollapsed ? "w-25" : "w-72"
      }`}
    >
      <div className={`${isCollapsed?"justify-center ml-0":"md:justify-start justify-center md:ml-2"} flex items-center h-20 px-4 mt-4 mb-4 `}>
        <img src={isCollapsed ? "/dokuprime-d.png" : "/Dokuprime.svg"} alt="Logo" className="h-10 md:h-12" />
      </div>

      <NavigationMenu menuItems={accessibleMenu} currentPath={location.pathname} isCollapsed={isCollapsed} />

      {showAgentSection && !isCollapsed && (
        <AgentPanel agentName={dummyUser.name} chats={dummyChats} agentStatus={dummyUser.status} />
      )}
    </nav>
  );
};

export default Sidebar;