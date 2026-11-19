import { apiClient } from './apiClient';

interface LoginResponse {
  token: string;
}

export const login = async (username: string, password: string): Promise<string> => {
  const data: LoginResponse = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return data.token;
};