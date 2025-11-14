import { api } from './api';
import type { User, PaginatedResponse, UserRole } from '../types';
import { AxiosResponse } from 'axios';

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserInput {
  email: string;
  username?: string;
  name: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const userService = {
  /**
   * Get paginated list of users with filters
   */
  async list(filters?: UserFilters): Promise<AxiosResponse<PaginatedResponse<User>>> {
    return api.get<PaginatedResponse<User>>('/users', {
      params: filters,
    });
  },

  /**
   * Get all users (no pagination, for dropdowns/selects)
   */
  async listAll(): Promise<AxiosResponse<User[]>> {
    return api.get<User[]>('/users/all');
  },

  /**
   * Get single user by ID
   */
  async get(id: string): Promise<AxiosResponse<User>> {
    return api.get<User>(`/users/${id}`);
  },

  /**
   * Create new user
   */
  async create(data: CreateUserInput): Promise<AxiosResponse<User>> {
    return api.post<User>('/users', data);
  },

  /**
   * Update existing user
   */
  async update(id: string, data: UpdateUserInput): Promise<AxiosResponse<User>> {
    return api.put<User>(`/users/${id}`, data);
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<AxiosResponse<void>> {
    return api.delete<void>(`/users/${id}`);
  },

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<AxiosResponse<User>> {
    return api.get<User>('/users/me');
  },

  /**
   * Update current user profile
   */
  async updateMe(data: Omit<UpdateUserInput, 'role' | 'isActive'>): Promise<AxiosResponse<User>> {
    return api.put<User>('/users/me', data);
  },

  /**
   * Change current user password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AxiosResponse<{ message: string }>> {
    return api.post<{ message: string }>('/users/me/password', data);
  },

  /**
   * Get users by role
   */
  async getByRole(role: UserRole): Promise<AxiosResponse<User[]>> {
    return api.get<User[]>('/users/by-role', {
      params: { role },
    });
  },
};
