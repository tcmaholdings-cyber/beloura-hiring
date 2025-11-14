import { api } from './api';
import type {
  Referrer,
  ReferrerWithStats,
  CreateReferrerInput,
  UpdateReferrerInput,
  PaginatedResponse,
  ReferrerFilters,
} from '../types';
import { AxiosResponse } from 'axios';

export const referrerService = {
  /**
   * Get paginated list of referrers with filters
   */
  async list(filters?: ReferrerFilters): Promise<AxiosResponse<PaginatedResponse<ReferrerWithStats>>> {
    return api.get<PaginatedResponse<ReferrerWithStats>>('/referrers', {
      params: filters,
    });
  },

  /**
   * Get all referrers (no pagination, for dropdowns/selects)
   */
  async listAll(): Promise<AxiosResponse<Referrer[]>> {
    return api.get<Referrer[]>('/referrers/all');
  },

  /**
   * Get single referrer by ID
   */
  async get(id: string): Promise<AxiosResponse<ReferrerWithStats>> {
    return api.get<ReferrerWithStats>(`/referrers/${id}`);
  },

  /**
   * Create new referrer
   */
  async create(data: CreateReferrerInput): Promise<AxiosResponse<Referrer>> {
    return api.post<Referrer>('/referrers', data);
  },

  /**
   * Update existing referrer
   */
  async update(id: string, data: UpdateReferrerInput): Promise<AxiosResponse<Referrer>> {
    return api.put<Referrer>(`/referrers/${id}`, data);
  },

  /**
   * Delete referrer
   */
  async delete(id: string): Promise<AxiosResponse<void>> {
    return api.delete<void>(`/referrers/${id}`);
  },

  /**
   * Get referrer by external ID
   */
  async getByExternalId(externalId: string): Promise<AxiosResponse<Referrer>> {
    return api.get<Referrer>(`/referrers/external/${externalId}`);
  },
};
