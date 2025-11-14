import { api } from './api';
import type {
  Source,
  SourceWithStats,
  CreateSourceInput,
  UpdateSourceInput,
  PaginatedResponse,
  SourceFilters,
} from '../types';
import { AxiosResponse } from 'axios';

export const sourceService = {
  /**
   * Get paginated list of sources with filters
   */
  async list(filters?: SourceFilters): Promise<AxiosResponse<PaginatedResponse<SourceWithStats>>> {
    return api.get<PaginatedResponse<SourceWithStats>>('/sources', {
      params: filters,
    });
  },

  /**
   * Get all sources (no pagination, for dropdowns/selects)
   */
  async listAll(): Promise<AxiosResponse<Source[]>> {
    return api.get<Source[]>('/sources/all');
  },

  /**
   * Get single source by ID
   */
  async get(id: string): Promise<AxiosResponse<SourceWithStats>> {
    return api.get<SourceWithStats>(`/sources/${id}`);
  },

  /**
   * Create new source
   */
  async create(data: CreateSourceInput): Promise<AxiosResponse<Source>> {
    return api.post<Source>('/sources', data);
  },

  /**
   * Update existing source
   */
  async update(id: string, data: UpdateSourceInput): Promise<AxiosResponse<Source>> {
    return api.put<Source>(`/sources/${id}`, data);
  },

  /**
   * Delete source
   */
  async delete(id: string): Promise<AxiosResponse<void>> {
    return api.delete<void>(`/sources/${id}`);
  },

  /**
   * Get source types (for filtering/grouping)
   */
  async getTypes(): Promise<AxiosResponse<string[]>> {
    return api.get<string[]>('/sources/types');
  },

  /**
   * Get source analytics
   */
  async getAnalytics(): Promise<AxiosResponse<import('../types').SourceAnalytics[]>> {
    return api.get('/sources/analytics');
  },
};
