import { useMutation } from '@tanstack/react-query';
import { instanceApiToken } from '../../../shared/utils/Axios';

interface MicrosoftAuthURLResponse {
  status: string;
  message: string;
  data: {
    auth_url: string;
  };
}

const getMicrosoftAuthURL = async (): Promise<MicrosoftAuthURLResponse> => {
  const response = await instanceApiToken.get('/api/authazure/login');
  return response.data;
};

export const useMicrosoftSSO = () => {
  return useMutation({
    mutationFn: getMicrosoftAuthURL,
    onSuccess: (data) => {
      window.location.href = data.data.auth_url;
    },
    onError: (error: any) => {
      console.error('Failed to get Microsoft auth URL:', error);
    },
  });
};