/**
 * BELOURA HIRING - API Type Definitions
 *
 * Complete TypeScript types for frontend integration
 * Base URL: http://localhost:3001
 * API Base Path: /api/v1
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum PipelineStage {
  NEW = 'new',
  QUALIFYING = 'qualifying',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_DONE = 'interview_done',
  TESTS_SCHEDULED = 'tests_scheduled',
  TESTS_DONE = 'tests_done',
  MOCK_SCHEDULED = 'mock_scheduled',
  MOCK_DONE = 'mock_done',
  ONBOARDING_ASSIGNED = 'onboarding_assigned',
  ONBOARDING_DONE = 'onboarding_done',
  PROBATION_START = 'probation_start',
  PROBATION_END = 'probation_end',
}

export enum OwnerRole {
  SOURCER = 'sourcer',
  INTERVIEWER = 'interviewer',
  CHATTING_MANAGERS = 'chatting_managers',
}

export enum UserRole {
  SOURCER = 'sourcer',
  INTERVIEWER = 'interviewer',
  CHATTING_MANAGER = 'chatting_manager',
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  message: string;
  tokens: AuthTokens;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
}

export interface UserResponse {
  user: User;
}

export interface UserListResponse {
  users: User[];
  count: number;
}

export interface UserListParams {
  role?: UserRole;
}

// ============================================================================
// CANDIDATE TYPES
// ============================================================================

export interface Candidate {
  id: string;
  name: string;
  telegram: string | null;
  country: string | null;
  timezone: string | null;
  sourceId: string | null;
  referrerId: string | null;
  currentStage: PipelineStage;
  currentOwner: OwnerRole | null;
  interviewRating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateWithRelations extends Candidate {
  source?: Source | null;
  referrer?: Referrer | null;
}

export interface CreateCandidateRequest {
  name: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  interviewRating?: number;
  notes?: string;
}

export interface UpdateCandidateRequest {
  name?: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  interviewRating?: number | null;
  notes?: string | null;
}

export interface BulkUpdateStagesRequest {
  candidateIds: string[];
  currentStage: PipelineStage;
}

export interface CandidateListParams {
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  sourceId?: string;
  referrerId?: string;
  search?: string;
  interviewRating?: number;
  minInterviewRating?: number;
  maxInterviewRating?: number;
  hasInterviewRating?: boolean;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'currentStage' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateListResponse {
  candidates: CandidateWithRelations[];
  total: number;
  limit: number;
  offset: number;
}

export interface CandidateResponse {
  message?: string;
  candidate: CandidateWithRelations;
}

export interface CandidateStats {
  totalCandidates: number;
  byStage: Record<PipelineStage, number>;
  byOwner: Record<OwnerRole, number>;
  recentCandidates: CandidateWithRelations[];
  stageSummaries: Record<PipelineStage, CandidateStageSummary>;
}

export interface CandidateStageSummary {
  count: number;
  candidates: StageSummaryCandidate[];
}

export interface StageSummaryCandidate {
  id: string;
  name: string;
  telegram: string | null;
  currentOwner: OwnerRole | null;
  interviewRating: number | null;
  notes: string | null;
  updatedAt: string;
  source?: Pick<Source, 'id' | 'name'> | null;
}

export interface BulkUpdateResponse {
  message: string;
  count: number;
}

export interface UpdateCandidateFeedbackRequest {
  interviewRating?: number;
  notes?: string;
}

// ============================================================================
// SOURCE TYPES
// ============================================================================

export interface Source {
  id: string;
  name: string;
  type: string | null;
  createdAt: string;
}

export interface SourceInterviewInsights {
  interviewed: number;
  passed: number;
  failed: number;
}

export interface SourceWithStats extends Source {
  _count?: {
    candidates: number;
  };
  interviewInsights?: SourceInterviewInsights;
}

export interface CreateSourceRequest {
  name: string;
  type?: string;
}

export interface UpdateSourceRequest {
  name?: string;
  type?: string;
}

export interface SourceListParams {
  type?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'type' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SourceListResponse {
  sources: SourceWithStats[];
  total: number;
  limit: number;
  offset: number;
}

export interface SourceResponse {
  message?: string;
  source: SourceWithStats;
}

export interface SourceStats {
  total: number;
  byType: Record<string, number>;
  topSources: Array<{
    id: string;
    name: string;
    candidateCount: number;
  }>;
}

// ============================================================================
// REFERRER TYPES
// ============================================================================

export interface Referrer {
  id: string;
  name: string;
  externalId: string | null;
  telegram: string | null;
  createdAt: string;
}

export interface ReferrerWithStats extends Referrer {
  _count?: {
    candidates: number;
    bonuses: number;
  };
}

export interface CreateReferrerRequest {
  name: string;
  externalId?: string;
  telegram?: string;
}

export interface UpdateReferrerRequest {
  name?: string;
  externalId?: string;
  telegram?: string;
}

export interface ReferrerListParams {
  externalId?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'externalId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ReferrerListResponse {
  referrers: ReferrerWithStats[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReferrerResponse {
  message?: string;
  referrer: ReferrerWithStats;
}

export interface ReferrerStats {
  total: number;
  withExternalId: number;
  withTelegram: number;
  topReferrers: Array<{
    id: string;
    name: string;
    candidateCount: number;
    bonusCount: number;
  }>;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface SuccessMessage {
  message: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  version: string;
}

export interface DatabaseTestResponse {
  status: 'connected' | 'error';
  database: string;
  stats: {
    candidates: number;
    users: number;
    sources: number;
  };
  timestamp: string;
}

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  apiVersion: string;
  timeout?: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3001',
  apiVersion: 'v1',
  timeout: 30000,
};

// ============================================================================
// ENDPOINT PATHS
// ============================================================================

export const API_ENDPOINTS = {
  // Health & Info
  HEALTH: '/health',
  API_INFO: '/api/v1',
  TEST_DB: '/api/v1/test-db',

  // Authentication
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
  },

  // Users
  USERS: {
    ME: '/api/v1/users/me',
    LIST: '/api/v1/users',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
  },

  // Candidates
  CANDIDATES: {
    LIST: '/api/v1/candidates',
    CREATE: '/api/v1/candidates',
    BY_ID: (id: string) => `/api/v1/candidates/${id}`,
    STATS: '/api/v1/candidates/stats',
    BULK_UPDATE_STAGES: '/api/v1/candidates/bulk/update-stages',
  },

  // Sources
  SOURCES: {
    LIST: '/api/v1/sources',
    CREATE: '/api/v1/sources',
    BY_ID: (id: string) => `/api/v1/sources/${id}`,
    STATS: '/api/v1/sources/stats',
  },

  // Referrers
  REFERRERS: {
    LIST: '/api/v1/referrers',
    CREATE: '/api/v1/referrers',
    BY_ID: (id: string) => `/api/v1/referrers/${id}`,
    BY_EXTERNAL_ID: (externalId: string) => `/api/v1/referrers/external/${externalId}`,
    STATS: '/api/v1/referrers/stats',
  },
} as const;

// ============================================================================
// HTTP METHODS
// ============================================================================

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT',
}

// ============================================================================
// REQUEST HEADERS
// ============================================================================

export interface AuthHeaders {
  Authorization: string;
}

export const createAuthHeaders = (token: string): AuthHeaders => ({
  Authorization: `Bearer ${token}`,
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PaginationParams = {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type DateRangeParams = {
  createdFrom?: string;
  createdTo?: string;
};

export type SearchParams = {
  search?: string;
};

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

export type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export type ApiErrorResponse = {
  error: ApiError;
  status: number;
};
