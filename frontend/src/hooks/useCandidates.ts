import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../services/api';
import type {
  Candidate,
  PaginatedResponse,
  CreateCandidateInput,
  UpdateCandidateInput,
  BulkUpdateStagesInput,
  CandidateFilters,
  Source,
  Referrer,
} from '../types';

// Query keys
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters: CandidateFilters) => [...candidateKeys.lists(), filters] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
};

// Helper to build query string
function buildQueryString(filters: CandidateFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

// Fetch candidates list
async function fetchCandidates(filters: CandidateFilters = {}): Promise<PaginatedResponse<Candidate>> {
  const queryString = buildQueryString(filters);
  const { data } = await api.get<PaginatedResponse<Candidate>>(
    `/candidates${queryString ? `?${queryString}` : ''}`
  );
  return data;
}

// Fetch single candidate
async function fetchCandidate(id: string): Promise<Candidate> {
  const { data } = await api.get<{ candidate: Candidate }>(`/candidates/${id}`);
  return data.candidate;
}

// Create candidate
async function createCandidate(input: CreateCandidateInput): Promise<Candidate> {
  const { data } = await api.post<{ candidate: Candidate }>('/candidates', input);
  return data.candidate;
}

// Update candidate
async function updateCandidate({ id, data: input }: { id: string; data: UpdateCandidateInput }): Promise<Candidate> {
  const { data } = await api.patch<{ candidate: Candidate }>(`/candidates/${id}`, input);
  return data.candidate;
}

// Delete candidate
async function deleteCandidate(id: string): Promise<void> {
  await api.delete(`/candidates/${id}`);
}

// Bulk update candidates
async function bulkUpdateCandidates(input: BulkUpdateStagesInput): Promise<{ message: string; count: number }> {
  const { data } = await api.patch<{ message: string; count: number }>('/candidates/bulk/stages', input);
  return data;
}

// Update candidate feedback (notes + rating)
async function updateCandidateFeedback({
  id,
  data: input,
}: {
  id: string;
  data: { interviewRating?: number | null; notes?: string | null };
}): Promise<Candidate> {
  const { data } = await api.patch<{ candidate: Candidate }>(`/candidates/${id}/feedback`, input);
  return data.candidate;
}

// Fetch sources for dropdown
async function fetchSources(): Promise<Source[]> {
  const { data } = await api.get<PaginatedResponse<Source>>('/sources');
  return data?.data || [];
}

// Fetch referrers for dropdown
async function fetchReferrers(): Promise<Referrer[]> {
  const { data } = await api.get<PaginatedResponse<Referrer>>('/referrers');
  return data?.data || [];
}

// Hook: List candidates with filters
export function useCandidates(filters: CandidateFilters = {}) {
  return useQuery({
    queryKey: candidateKeys.list(filters),
    queryFn: () => fetchCandidates(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook: Single candidate
export function useCandidate(id: string | null) {
  return useQuery({
    queryKey: candidateKeys.detail(id!),
    queryFn: () => fetchCandidate(id!),
    enabled: !!id,
  });
}

// Hook: Create candidate mutation
export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      // Invalidate all candidate lists
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Create candidate error:', getErrorMessage(error));
    },
  });
}

// Hook: Update candidate mutation
export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCandidate,
    onSuccess: (_data, variables) => {
      // Invalidate lists and specific candidate
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Update candidate error:', getErrorMessage(error));
    },
  });
}

// Hook: Delete candidate mutation
export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      // Invalidate all candidate lists
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Delete candidate error:', getErrorMessage(error));
    },
  });
}

// Hook: Bulk update candidates mutation
export function useBulkUpdateCandidates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateCandidates,
    onSuccess: () => {
      // Invalidate all candidate lists
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk update error:', getErrorMessage(error));
    },
  });
}

// Hook: Update candidate feedback (notes + rating)
export function useUpdateCandidateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCandidateFeedback,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Feedback update error:', getErrorMessage(error));
    },
  });
}

// Hook: Fetch sources
export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook: Fetch referrers
export function useReferrers() {
  return useQuery({
    queryKey: ['referrers'],
    queryFn: fetchReferrers,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
