
import { Link, useLocation } from "react-router";
import { Users, Shield, Briefcase, LayoutDashboard } from "lucide-react";
import type { MenuItem } from "../types/types";
import { AgentPanel } from "./AgentPanel";

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
// --- AKHIR DUMMY DATA ---

const NavigationMenu = ({ menuItems, currentPath }: { menuItems: MenuItem[], currentPath: string }) => (
  <div className="flex-1 px-2 md:px-4 py-6 space-y-2 overflow-y-auto">
    {menuItems.map((item) => {
      const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`group flex items-center justify-center md:justify-start px-3 py-2.5 rounded-lg mx-2 transition-colors ${
            isActive ? "bg-blue-100 text-blue-800" : "hover:bg-blue-50"
          }`}
        >
          <item.icon className="w-5 h-5 md:mr-3" />
          <span className="hidden md:inline font-medium">{item.title}</span>
        </Link>
      );
    })}
  </div>
);


const Sidebar = () => {
  const location = useLocation();

  // Logika untuk menentukan menu yang bisa diakses (disimulasikan dengan dummy data)
  const accessibleMenu = dummyMenu.filter(item => 
    dummyUser.isSuperAdmin || dummyUser.permissions.some(p => p.startsWith(item.identifier))
  );

  // Logika untuk menampilkan bagian agen
  const showAgentSection = dummyUser.permissions.includes("agent-dashboard:access");

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 md:w-72 bg-white text-gray-700 flex flex-col shadow-lg z-50">
      <div className="flex items-center justify-center md:justify-start h-20 px-4 mt-2 mb-4 ml-2">
        <img src="/Dokuprime.svg" alt="Logo" className="h-10 md:h-12" />
      </div>

      <NavigationMenu menuItems={accessibleMenu} currentPath={location.pathname} />

      {showAgentSection && (
        <AgentPanel agentName={dummyUser.name} chats={dummyChats} agentStatus={dummyUser.status}/>
      )}
    </nav>
  );
};

export default Sidebar;