import { useMutation } from '@tanstack/react-query';
import { instanceApiToken } from '../../../shared/utils/Axios';
import { useAuthActions } from '../../../shared/store/authStore';

const logoutApi = async () => {
  return instanceApiToken.post('/auth/logout');
};

export const useLogout = () => {
  const { logout: logoutFromStore } = useAuthActions();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logoutFromStore();
      globalThis.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout failed but forcing client logout:', error);
      logoutFromStore();
      globalThis.location.href = '/login';
    }
  });
};