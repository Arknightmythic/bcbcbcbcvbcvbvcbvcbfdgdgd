import { create } from 'zustand';
import secureLocalStorage from 'react-secure-storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_ID_KEY, USER_KEY } from '../utils/constant';

interface User {
  id: number;
  name: string;
  email: string;
  account_type?: string;
  role?: any;
  phone?: string;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  session_id?: string; 
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null; 
  sessionId: string | null;    
  actions: {
    login: (data: AuthData) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    refreshToken: (accessToken: string) => void;
  };
}

const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'Development';

const storage = {
  getAccessToken: () => isDevelopment ? localStorage.getItem(ACCESS_TOKEN_KEY) : secureLocalStorage.getItem(ACCESS_TOKEN_KEY) as string | null,
  
  getRefreshToken: () => isDevelopment ? localStorage.getItem(REFRESH_TOKEN_KEY) : secureLocalStorage.getItem(REFRESH_TOKEN_KEY) as string | null,
  getSessionId: () => isDevelopment ? localStorage.getItem(SESSION_ID_KEY) : secureLocalStorage.getItem(SESSION_ID_KEY) as string | null,
  
  getUser: (): User | null => {
    const userStr = isDevelopment ? localStorage.getItem(USER_KEY) : secureLocalStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr as string) : null;
  },

  setItems: (data: AuthData) => {
    const storageType = isDevelopment ? localStorage : secureLocalStorage;
    storageType.setItem(ACCESS_TOKEN_KEY, data.access_token);
    
    if(data.refresh_token) storageType.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    if(data.session_id) storageType.setItem(SESSION_ID_KEY, data.session_id);
    
    storageType.setItem(USER_KEY, JSON.stringify(data.user));
  },

  removeItems: () => {
    const keys = [ACCESS_TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY, SESSION_ID_KEY];
    const storageType = isDevelopment ? localStorage : secureLocalStorage;
    for (const key of keys) {
      storageType.removeItem(key);
    }
  },

  updateAccessToken: (token: string) => {
    const storageType = isDevelopment ? localStorage : secureLocalStorage;
    storageType.setItem(ACCESS_TOKEN_KEY, token);
  }
};

const initialAccessToken = storage.getAccessToken();
const initialRefreshToken = storage.getRefreshToken();
const initialSessionId = storage.getSessionId();
const initialUser = storage.getUser();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!initialAccessToken && !!initialUser,
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken, 
  sessionId: initialSessionId,       
  actions: {
    login: (data) => {
      storage.setItems(data); 
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token, 
        sessionId: data.session_id,       
      });
    },
    logout: () => {
      storage.removeItems();
      set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null, sessionId: null });
    },
    setUser: (user) => {
      const storageType = isDevelopment ? localStorage : secureLocalStorage;
      storageType.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    },
    refreshToken: (accessToken: string) => {
      storage.updateAccessToken(accessToken);
      set({ accessToken: accessToken });
    },
  },
}));

export const useAuthActions = () => useAuthStore((state) => state.actions);