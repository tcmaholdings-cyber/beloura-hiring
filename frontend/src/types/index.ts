// API Response Types
export interface ApiError {
  error: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// User Types
export type UserRole = 'sourcer' | 'interviewer' | 'chatting_managers';

export interface User {
  id: string;
  email: string;
  username?: string | null;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

// Candidate Types
export type CandidateStage =
  | 'new'
  | 'qualifying'
  | 'interview_scheduled'
  | 'interview_done'
  | 'tests_scheduled'
  | 'tests_done'
  | 'mock_scheduled'
  | 'mock_done'
  | 'onboarding_assigned'
  | 'onboarding_done'
  | 'probation_start'
  | 'probation_end';

export type CandidateOwner = 'sourcer' | 'interviewer' | 'chatting_managers';

export interface Source {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface Referrer {
  id: string;
  name: string;
  externalId: string | null;
  telegram: string | null;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  telegram: string | null;
  country: string | null;
  timezone: string | null;
  sourceId: string | null;
  referrerId: string | null;
  currentStage: CandidateStage;
  currentOwner: CandidateOwner | null;
  interviewRating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  source?: Source | null;
  referrer?: Referrer | null;
}

export interface StageSummaryCandidate {
  id: string;
  name: string;
  telegram: string | null;
  currentOwner: CandidateOwner | null;
  interviewRating: number | null;
  notes: string | null;
  updatedAt: string;
  source?: Pick<Source, 'id' | 'name'> | null;
}

export interface StageSummary {
  count: number;
  candidates: StageSummaryCandidate[];
}

export interface CandidateStats {
  totalCandidates: number;
  byStage: Record<CandidateStage, number>;
  byOwner: Record<CandidateOwner, number>;
  recentCandidates: Candidate[];
  stageSummaries: Record<CandidateStage, StageSummary>;
}

export interface CreateCandidateInput {
  name: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: CandidateStage;
  currentOwner?: CandidateOwner;
  interviewRating?: number;
  notes?: string | null;
}

export interface UpdateCandidateInput {
  name?: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: CandidateStage;
  currentOwner?: CandidateOwner;
  interviewRating?: number | null;
  notes?: string | null;
}

export interface BulkUpdateStagesInput {
  candidateIds: string[];
  currentStage: CandidateStage;
}

// Source Types
export interface SourceWithStats extends Source {
  _count: {
    candidates: number;
  };
  interviewInsights?: SourceInterviewInsights;
}

export interface SourceInterviewInsights {
  interviewed: number;
  passed: number;
  failed: number;
}

export interface CreateSourceInput {
  name: string;
  type?: string;
}

export interface UpdateSourceInput {
  name?: string;
  type?: string;
}

// Referrer Types
export interface ReferrerWithStats extends Referrer {
  _count: {
    candidates: number;
    bonuses: number;
  };
}

export interface CreateReferrerInput {
  name: string;
  externalId?: string;
  telegram?: string;
}

export interface UpdateReferrerInput {
  name?: string;
  externalId?: string;
  telegram?: string;
}

// Filter Types
export interface CandidateFilters {
  currentStage?: CandidateStage;
  currentOwner?: CandidateOwner;
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

export interface SourceFilters {
  type?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'type' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ReferrerFilters {
  externalId?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// User Management Types
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  username?: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Source Analytics Types
export interface SourceAnalyticsMetrics {
  interviewed: number;
  passed: number;
  consideration: number;
  failed: number;
  notRated: number;
}

export interface SourceAnalyticsConversionRates {
  interviewRate: number;
  passRate: number;
  failRate: number;
  qualityScore: number;
}

export interface SourceAnalytics {
  id: string;
  name: string;
  type: string | null;
  totalCandidates: number;
  interviewMetrics: SourceAnalyticsMetrics;
  conversionRates: SourceAnalyticsConversionRates;
}
