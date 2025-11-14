import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../services/api';
import type { User, PaginatedResponse, UserRole } from '../types';

// User filters
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Create user input
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  username?: string;
  role: UserRole;
  isActive?: boolean;
}

// Update user input
export interface UpdateUserInput {
  name?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

// Fetch users list
async function fetchUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams();

  if (filters?.role) params.append('role', filters.role);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data } = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
  return data;
}

// Fetch single user
async function fetchUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}

// Create user
async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await api.post<User>('/users', input);
  return data;
}

// Update user
async function updateUser({ id, input }: { id: string; input: UpdateUserInput }): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}`, input);
  return data;
}

// Delete user
async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

// Hook: List users with caching
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Hook: Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

// Hook: Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

// Hook: Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      // Invalidate users list and specific user
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', data.id] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

// Hook: Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}
