import { useState } from "react";
import { LogOut } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useLogout } from "../../../features/Auth/hooks/useLogout";
import { useAuthStore } from "../../store/authStore";

const UserProfile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setIsMenuOpen(false);
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 focus:ring-2 focus:ring-blue-500"
      >
        {user ? (
          <span className="font-bold text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <img src="/avatar.svg" alt="User Avatar" />
        )}
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ""}
            </p>
          </div>
          <div className="border-t border-gray-200"></div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            <span>{isPending ? "Keluar sekarang..." : "Keluar"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
