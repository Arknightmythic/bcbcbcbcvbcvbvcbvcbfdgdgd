import { useQuery } from '@tanstack/react-query';
import { instanceApiToken } from '../../../shared/utils/Axios';

interface Permission {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  pages: string[];
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  team: Team;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  account_type: string;
  role?: Role;
}

interface UserMeResponse {
  status: string;
  message: string;
  data: UserData;
}

const fetchUserMe = async (): Promise<UserData> => {
  const response = await instanceApiToken.get<UserMeResponse>('/api/users/me');
  return response.data.data;
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: fetchUserMe,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};