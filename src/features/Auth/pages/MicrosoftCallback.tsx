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
  const { refetch } = useGetMe();
  

  const isProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessed.current) return;
      const status = searchParams.get('status');
      const error = searchParams.get('error');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const sessionId = searchParams.get('session_id');
      const logout = searchParams.get('logout');

      if (logout === 'logout') {
        isProcessed.current = true; 
        toast.success('Berhasil keluar');
        navigate('/login', { replace: true });
        return;
      }

      if (status === 'login-failed' || error) {
        isProcessed.current = true; 
        toast.error(error || 'SSO Microsot Gagal. silahkan coba lagi.');
        navigate('/login', { replace: true });
        return;
      }

     if (status === 'login-success' && accessToken && refreshToken) {
        isProcessed.current = true; 
        
        // 1. SIMPAN Token ke Store DULUAN
        // Kita butuh simpan user dummy dulu agar interceptor axios bisa pakai tokennya untuk request /me
        loginAction({
          user: { id: 0, name: '', email: '' }, // Dummy user, akan diupdate via refetch
          access_token: accessToken,
          refresh_token: refreshToken,
          session_id: sessionId || undefined
        });

        // 2. FETCH User Profile
        // Sekarang instanceApiToken sudah punya token di header karena kita sudah set di step 1
        const result = await refetch();
        
        if (result.isError || !result.data) {
          console.error('Failed to fetch user data');
          toast.error('Gagal mengambil data pengguna.');
          navigate('/login', { replace: true });
          return;
        }

        // 3. UPDATE User data yang asli ke store
        loginAction({
          user: {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role, 
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          session_id: sessionId || undefined
        });

        toast.success('Berhasil Masuk!');

        if (!result.data.role?.team) {
            navigate("/unauthorized", { replace: true });
            return;
        }

        const userPages = result.data.role.team.pages || [];
        const firstAllowedKey = Object.keys(PAGE_PATHS).find(key => userPages.includes(key));
        const defaultPath = firstAllowedKey ? PAGE_PATHS[firstAllowedKey] : "/unauthorized";
        
        navigate(defaultPath, { replace: true });
        return;
      }

      if (isAuthenticated && !status && !error && !logout) {
        navigate('/', { replace: true });
        return;
      }

     
      if (!status && !error && !logout) {
         navigate('/login', { replace: true });
      }
    };

    handleCallback();

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Memproses Autentikasi dengan akun Microsoft</p>
        <p className="mt-2 text-sm text-gray-500">mohon tunggu...</p>
      </div>
    </div>
  );
}

export default MicrosoftCallback;