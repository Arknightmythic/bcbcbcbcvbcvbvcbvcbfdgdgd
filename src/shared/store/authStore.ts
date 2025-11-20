import { create } from 'zustand';
import secureLocalStorage from 'react-secure-storage';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../utils/constant';

interface Team {
  id: number;
  name: string;
  pages: string[]; 
}

interface Role {
  id: number;
  name: string;
  permissions: { id: number; name: string }[]; 
  team: Team;
}

interface User {
  id: number;
  name: string;
  email: string;
  account_type?: string;
  role?: Role; 
  phone?: string;
}


export interface AuthData {
  access_token: string;
  refresh_token: string; 
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
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
  getUser: (): User | null => {
    const userStr = isDevelopment ? localStorage.getItem(USER_KEY) : secureLocalStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr as string) : null;
  },

  setItems: (data: AuthData) => {
    
    if (isDevelopment) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } else {
      secureLocalStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      secureLocalStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
  },

  removeItems: () => {
    const keys = [ACCESS_TOKEN_KEY, USER_KEY];
    if (isDevelopment) {
      keys.forEach(key => localStorage.removeItem(key));
    } else {
      keys.forEach(key => secureLocalStorage.removeItem(key));
    }
  },

  updateAccessToken: (token: string) => {
    if (isDevelopment) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      secureLocalStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }
};

const initialAccessToken = storage.getAccessToken();
const initialUser = storage.getUser();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!initialAccessToken && !!initialUser,
  user: initialUser,
  accessToken: initialAccessToken,
  actions: {
    login: (data) => {
      storage.setItems(data); 
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.access_token,
      });
    },
    logout: () => {
      storage.removeItems();
      set({ isAuthenticated: false, user: null, accessToken: null });
    },
    setUser: (user) => {
      
      if (isDevelopment) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
          secureLocalStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      set({ user });
    },
    refreshToken: (accessToken: string) => {
      storage.updateAccessToken(accessToken);
      set({ accessToken: accessToken });
    },
  },
}));

export const useAuthActions = () => useAuthStore((state) => state.actions);