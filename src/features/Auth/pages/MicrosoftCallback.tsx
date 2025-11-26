import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { useAuthActions, useAuthStore } from '../../../shared/store/authStore';
import { useGetMe } from '../hooks/useGetMe';

const PAGE_PATHS: Record<string, string> = {
  "dashboard": "/dashboard",
  "knowledge-base": "/knowledge-base",
  "document-management": "/document-management",
  "public-service": "/public-service",
  "validation-history": "/validation-history",
  "guide": "/guide",
  "user-management": "/user-management",
  "team-management": "/team-management",
  "role-management": "/role-management",
  "helpdesk": "/helpdesk",
};

function MicrosoftCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: loginAction } = useAuthActions();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: userData, isLoading, isError, refetch } = useGetMe();
  
  // [2] Tambahkan Ref untuk menandai apakah proses sudah dijalankan
  const isProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // [3] Cek jika sudah diproses, langsung berhenti
      if (isProcessed.current) return;

      const status = searchParams.get('status');
      const error = searchParams.get('error');
      const logout = searchParams.get('logout');

      if (logout === 'logout') {
        isProcessed.current = true; // Tandai selesai
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
        return;
      }

      if (status === 'login-failed' || error) {
        isProcessed.current = true; // Tandai selesai
        toast.error(error || 'Microsoft login failed. Please try again.');
        navigate('/login', { replace: true });
        return;
      }

      if (status === 'login-success') {
        isProcessed.current = true; // [4] KUNCI DI SINI SEBELUM PROSES ASYNC

        console.log('Login success detected, fetching user data...');
        const result = await refetch();
        
        if (result.isError || !result.data) {
          console.error('Failed to fetch user data');
          toast.error('Failed to fetch user data. Please try again.');
          navigate('/login', { replace: true });
          return;
        }

        loginAction({
          user: {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role, // Ingat perbaikan role undefined sebelumnya
          },
          access_token: 'token_from_cookie',
          refresh_token: 'refresh_from_cookie',
        });

        toast.success('Login successful!');

        // --- Logika Redirect yang sudah diperbaiki ---
        if (!result.data.role || !result.data.role.team) {
            navigate("/unauthorized", { replace: true });
            return;
        }

        const userPages = result.data.role.team.pages || [];
        const firstAllowedKey = Object.keys(PAGE_PATHS).find(key => userPages.includes(key));
        const defaultPath = firstAllowedKey ? PAGE_PATHS[firstAllowedKey] : "/unauthorized";
        
        navigate(defaultPath, { replace: true });
        return;
      }

      // Block ini hanya jalan jika TIDAK ADA status di URL (misal user akses langsung URL callback)
      if (isAuthenticated && !status && !error && !logout) {
        navigate('/', { replace: true });
        return;
      }

      // Fallback
      if (!status && !error && !logout) {
         navigate('/login', { replace: true });
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Processing Microsoft login...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait...</p>
      </div>
    </div>
  );
}

export default MicrosoftCallback;