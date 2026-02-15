import apiClient from '@/api/client';
import { authApi } from '@/api/endpoints/auth';
import { User } from '@/types/auth';

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: async (
    params: LoginParams
  ): Promise<{ user: User; token: string; refreshToken: string }> => {
    // The actual API call to the backend
    const response = await apiClient.post<LoginResponse>(authApi.login, params);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    const { accessToken, refreshToken } = response.data.data;

    // Fetch the user profile using the new token
    // The apiClient withCredentials: true will automatically handle cookies
    const userResponse = await apiClient.get<{
      data: User;
      success: boolean;
      message: string;
    }>(authApi.me);

    return {
      user: userResponse.data.data,
      token: accessToken,
      refreshToken: refreshToken,
    };
  },

  logout: async (): Promise<void> => {
    // Optional: Call backend logout if needed
    // await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(authApi.me);
    return response.data;
  },
};
