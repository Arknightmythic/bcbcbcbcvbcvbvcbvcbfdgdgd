import { useEffect } from 'react';
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

  useEffect(() => {
    const handleCallback = async () => {
      console.log('MicrosoftCallback mounted');
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      const status = searchParams.get('status');
      const error = searchParams.get('error');
      const logout = searchParams.get('logout');

      
      if (logout === 'logout') {
        console.log('Logout callback detected');
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
        return;
      }

      
      if (status === 'login-failed' || error) {
        console.log('Login failed:', error);
        toast.error(error || 'Microsoft login failed. Please try again.');
        navigate('/login', { replace: true });
        return;
      }

      
      if (status === 'login-success') {
        console.log('Login success detected, fetching user data...');
        
        
        const result = await refetch();
        
        if (result.isError || !result.data) {
          console.error('Failed to fetch user data');
          toast.error('Failed to fetch user data. Please try again.');
          navigate('/login', { replace: true });
          return;
        }

        console.log('User data fetched:', result.data);
        
        
        loginAction({
          user: {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role,
          },
          access_token: 'token_from_cookie',
          refresh_token: 'refresh_from_cookie',
        });

        toast.success('Login successful!');
        
        
        const userPages = result.data.role?.team?.pages || [];
        const firstAllowedKey = Object.keys(PAGE_PATHS).find(key => userPages.includes(key));
        const defaultPath = firstAllowedKey ? PAGE_PATHS[firstAllowedKey] : "/404";
        
        console.log('Navigating to:', defaultPath);
        navigate(defaultPath, { replace: true });
        return;
      }

      
      if (isAuthenticated && !status && !error && !logout) {
        console.log('Already authenticated, redirecting home');
        navigate('/', { replace: true });
        return;
      }

      
      console.log('No valid status, redirecting to login');
      navigate('/login', { replace: true });
    };

    handleCallback();
  }, [searchParams, navigate, loginAction, isAuthenticated, refetch]);

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