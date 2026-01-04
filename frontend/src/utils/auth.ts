const TOKEN_KEY = 'qjwl_token';
const USER_KEY = 'qjwl_user';

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  role: string;
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = (): UserInfo | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setUser = (user: UserInfo): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};

