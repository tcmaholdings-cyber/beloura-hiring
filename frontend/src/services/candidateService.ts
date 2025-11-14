import { api } from './api';
import type {
  Candidate,
  CandidateStats,
  CreateCandidateInput,
  UpdateCandidateInput,
  BulkUpdateStagesInput,
  PaginatedResponse,
  CandidateFilters,
} from '../types';
import { AxiosResponse } from 'axios';

export const candidateService = {
  /**
   * Get paginated list of candidates with filters
   */
  async list(filters?: CandidateFilters): Promise<AxiosResponse<PaginatedResponse<Candidate>>> {
    return api.get<PaginatedResponse<Candidate>>('/candidates', {
      params: filters,
    });
  },

  /**
   * Get single candidate by ID
   */
  async get(id: string): Promise<AxiosResponse<Candidate>> {
    return api.get<Candidate>(`/candidates/${id}`);
  },

  /**
   * Create new candidate
   */
  async create(data: CreateCandidateInput): Promise<AxiosResponse<Candidate>> {
    return api.post<Candidate>('/candidates', data);
  },

  /**
   * Update existing candidate
   */
  async update(id: string, data: UpdateCandidateInput): Promise<AxiosResponse<Candidate>> {
    return api.put<Candidate>(`/candidates/${id}`, data);
  },

  /**
   * Delete candidate
   */
  async delete(id: string): Promise<AxiosResponse<void>> {
    return api.delete<void>(`/candidates/${id}`);
  },

  /**
   * Bulk update candidate stages
   */
  async bulkUpdateStages(data: BulkUpdateStagesInput): Promise<AxiosResponse<{ count: number }>> {
    return api.patch<{ count: number }>('/candidates/bulk/stages', data);
  },

  /**
   * Get candidate statistics
   */
  async stats(filters?: {
    createdFrom?: string;
    createdTo?: string;
  }): Promise<AxiosResponse<CandidateStats>> {
    return api.get<CandidateStats>('/candidates/stats', {
      params: filters,
    });
  },

  /**
   * Export candidates to CSV
   */
  async export(filters?: CandidateFilters): Promise<AxiosResponse<Blob>> {
    return api.get<Blob>('/candidates/export', {
      params: filters,
      responseType: 'blob',
    });
  },
};
