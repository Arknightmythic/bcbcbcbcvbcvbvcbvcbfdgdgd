import { useState } from "react";
import { LogOut } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";

// Dummy user data to replace the useAuth hook
const dummyUser = {
  name: "John Doe",
  avatarUrl: "/avatar.svg", // A default avatar
};

const UserProfile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use the custom hook to close the menu when clicking outside
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setIsMenuOpen(false);
  });

  const handleLogout = () => {
    // In a real app, you would call your logout logic here
    console.log("Logging out...");
    setIsMenuOpen(false);
    // navigate('/login');
  };

  return (
    <div ref={menuRef} className="relative">
      <img
        src={dummyUser.avatarUrl}
        alt="User Avatar"
        className="w-10 h-10 cursor-pointer rounded-full"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      />

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">
              {dummyUser.name}
            </p>
          </div>
          <div className="border-t border-gray-200"></div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
