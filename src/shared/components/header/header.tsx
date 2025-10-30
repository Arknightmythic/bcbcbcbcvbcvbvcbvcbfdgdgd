import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router";
import UserProfile from "./UserProfile";

const menuConfig = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/upload-document", title: "Knowledge base" },
  { path: "/document-management", title: "Document Management" },
  { path: "/public-service", title: "Public Service" },
  { path: "/validation-history", title: "Validation History" },
  { path: "/guide", title: "Guide", },
  { path: "/user-management", title: "User Management" },
  { path: "/team-management", title: "Team Management" },
  { path: "/role-management", title: "Role Management" },
];

const Notifications = () => (
  <button className="relative text-gray-600 hover:text-gray-800">
    {/* <Bell className="h-6 w-6" />
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span> */}
  </button>
);

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();
  const [title, setTitle] = useState("Dashboard");

  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenuItem = menuConfig.find((item) =>
      currentPath.startsWith(item.path)
    );

    setTitle(currentMenuItem ? currentMenuItem.title : "Dashboard");
  }, [location.pathname]);

  return (
    <header className="flex h-22 w-full items-center justify-between bg-white px-6 border-b border-gray-200 pt-5">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <Notifications />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;