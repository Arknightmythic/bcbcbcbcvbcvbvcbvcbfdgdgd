import { Link } from "react-router";
import type { MenuItem } from "../../types/types";
import Tooltip from "../Tooltip";

export const NavigationMenu = ({
  menuItems,
  currentPath,
  isCollapsed,
}: {
  menuItems: MenuItem[];
  currentPath: string;
  isCollapsed: boolean;
}) => (
  <div className="space-y-1 px-2 pb-4 md:px-4">
    {menuItems.map((item) => {
      const isActive =
        currentPath === item.path || currentPath.startsWith(`${item.path}/`);
      const linkContent = (
        <Link
          key={item.path}
          to={item.path}
          className={`group flex items-center rounded-lg px-3 h-12 mx-2 transition-colors duration-200 ${
            isCollapsed ? "justify-center" : "justify-start"
          } ${
            isActive
              ? "bg-bOss-red text-white"
              : "hover:bg-bOss-red-50 text-gray-600"
          }`}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span
            className={`
                font-medium overflow-hidden transition-all duration-300 ease-in-out leading-snug text-xs
                ${
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                }
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
