import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { CandidateStats } from '../types';

// Fetch candidate statistics
async function fetchCandidateStats(): Promise<CandidateStats> {
  const { data } = await api.get<CandidateStats>('/candidates/stats');
  return data;
}

// Hook: Get dashboard statistics with caching
export function useCandidateStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchCandidateStats,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });
}
