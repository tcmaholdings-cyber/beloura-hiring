import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { referrerService } from '../services/referrerService';
import type {
  CreateReferrerInput,
  UpdateReferrerInput,
  ReferrerFilters,
} from '../types';

const REFERRERS_QUERY_KEY = 'referrers';

/**
 * Hook to fetch paginated referrers list
 */
export function useReferrers(filters?: ReferrerFilters) {
  return useQuery({
    queryKey: [REFERRERS_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await referrerService.list(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all referrers (for dropdowns)
 */
export function useAllReferrers() {
  return useQuery({
    queryKey: [REFERRERS_QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await referrerService.listAll();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch single referrer
 */
export function useReferrer(id: string) {
  return useQuery({
    queryKey: [REFERRERS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await referrerService.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new referrer
 */
export function useCreateReferrer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReferrerInput) => {
      const response = await referrerService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRERS_QUERY_KEY] });
      toast.success('Referrer created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create referrer';
      toast.error(message);
    },
  });
}

/**
 * Hook to update an existing referrer
 */
export function useUpdateReferrer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReferrerInput }) => {
      const response = await referrerService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [REFERRERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRERS_QUERY_KEY, variables.id] });
      toast.success('Referrer updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update referrer';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a referrer
 */
export function useDeleteReferrer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await referrerService.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRERS_QUERY_KEY] });
      toast.success('Referrer deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete referrer';
      toast.error(message);
    },
  });
}
