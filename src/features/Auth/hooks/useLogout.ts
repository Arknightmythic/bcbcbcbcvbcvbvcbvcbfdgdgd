import { useMutation } from '@tanstack/react-query';
import { instanceApiToken } from '../../../shared/utils/Axios';
import { useAuthActions, useAuthStore } from '../../../shared/store/authStore';

const logoutApi = async () => {
  const sessionId = useAuthStore.getState().sessionId;
  return instanceApiToken.post('/auth/logout', {
      session_id: sessionId
  });
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