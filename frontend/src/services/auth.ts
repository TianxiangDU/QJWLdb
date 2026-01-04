import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api/v1' 
  : `http://${window.location.hostname}:3000/api/v1`;

// Token 管理
const TOKEN_KEY = 'qjwl_token';
const USER_KEY = 'qjwl_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

// 认证 API
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    nickname: string;
    role: string;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: string;
  createdAt: string;
}

const authApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.post<LoginResponse>('/auth/login', data);
    const { accessToken, user } = res.data;
    authStorage.setToken(accessToken);
    authStorage.setUser(user);
    return res.data;
  },
  
  register: async (data: { username: string; password: string; nickname?: string; email?: string }) => {
    const res = await authApi.post('/auth/register', data);
    return res.data;
  },
  
  logout: () => {
    authStorage.clear();
    window.location.href = '/login';
  },
  
  getProfile: async (): Promise<UserProfile> => {
    const token = authStorage.getToken();
    const res = await authApi.get<UserProfile>('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  
  changePassword: async (oldPassword: string, newPassword: string) => {
    const token = authStorage.getToken();
    const res = await authApi.post('/auth/change-password', 
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  },
};


