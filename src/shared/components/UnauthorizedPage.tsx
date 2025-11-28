import React, { useEffect, useState } from "react";
import { LogOut, ShieldAlert } from "lucide-react";
import { useLogout } from "../../features/Auth/hooks/useLogout";

const UnauthorizedPage: React.FC = () => {
  const [countdown, setCountdown] = useState(5);
  const { mutate: logout } = useLogout();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      logout(); 
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [logout]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
        <p className="text-gray-600 mb-6">
          Akun Anda belum memiliki <strong> Akses Peran</strong> atau{" "}
          <strong>Tim</strong> yang didaftarkan.
        </p>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <p className="text-sm text-gray-500">
            Anda akan logout dalam{" "}
            <span className="font-bold text-red-600 text-lg">{countdown}</span>{" "}
            detik...
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sekarang
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
