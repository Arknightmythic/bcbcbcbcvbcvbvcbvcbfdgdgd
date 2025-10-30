import type { AuthData } from '../../../shared/store/authStore';
import instanceApi from '../../../shared/utils/Axios';
import type { SignInValues } from '../utils/schema'; // Akan kita buat

// Tipe untuk response dari backend Go
interface ApiResponse {
  status: string;
  message: string;
  data: AuthData;
}

export const signIn = async (data: SignInValues): Promise<ApiResponse> => {
  const response = await instanceApi.post('/auth/login', data);
  return response.data;
};