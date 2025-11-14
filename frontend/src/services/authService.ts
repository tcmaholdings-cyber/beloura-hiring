import { api } from './api';
import type { LoginResponse, User } from '../types';

export const authService = {
  /**
   * Login with email/username and password
   */
  async login(emailOrUsername: string, password: string): Promise<LoginResponse> {
    // Determine if input is email or username (simple check: contains @)
    const isEmail = emailOrUsername.includes('@');

    const response = await api.post<LoginResponse>('/auth/login', {
      ...(isEmail ? { email: emailOrUsername } : { username: emailOrUsername }),
      password,
    });

    const { tokens, user } = response.data;

    // Store tokens and user in localStorage
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  /**
   * Logout - clear tokens and user data
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get current user from API
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>('/users/me');

    // Update localStorage with fresh user data
    localStorage.setItem('user', JSON.stringify(response.data));

    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    );

    const { tokens } = response.data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    return tokens;
  },
};
