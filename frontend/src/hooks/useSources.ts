import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { sourceService } from '../services/sourceService';
import type {
  CreateSourceInput,
  UpdateSourceInput,
  SourceFilters,
} from '../types';

const SOURCES_QUERY_KEY = 'sources';

/**
 * Hook to fetch paginated sources list
 */
export function useSources(filters?: SourceFilters) {
  return useQuery({
    queryKey: [SOURCES_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await sourceService.list(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all sources (for dropdowns)
 */
export function useAllSources() {
  return useQuery({
    queryKey: [SOURCES_QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await sourceService.listAll();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch single source
 */
export function useSource(id: string) {
  return useQuery({
    queryKey: [SOURCES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await sourceService.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new source
 */
export function useCreateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSourceInput) => {
      const response = await sourceService.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all sources queries
      queryClient.invalidateQueries({ queryKey: [SOURCES_QUERY_KEY], refetchType: 'all' });
      toast.success('Source created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create source';
      toast.error(message);
    },
  });
}

/**
 * Hook to update an existing source
 */
export function useUpdateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSourceInput }) => {
      const response = await sourceService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SOURCES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SOURCES_QUERY_KEY, variables.id] });
      toast.success('Source updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update source';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a source
 */
export function useDeleteSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await sourceService.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SOURCES_QUERY_KEY] });
      toast.success('Source deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete source';
      toast.error(message);
    },
  });
}

/**
 * Hook to fetch source analytics
 */
export function useSourceAnalytics() {
  return useQuery({
    queryKey: ['source-analytics'],
    queryFn: async () => {
      const response = await sourceService.getAnalytics();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
