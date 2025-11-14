# Frontend Integration Guide

Quick reference for integrating with the BELOURA HIRING backend API.

## Getting Started

### Base Configuration
```typescript
const API_BASE_URL = 'http://localhost:3001';
const API_VERSION = 'v1';
const API_PATH = `/api/${API_VERSION}`;
```

### Import Types
```typescript
import {
  User,
  Candidate,
  CandidateWithRelations,
  Source,
  Referrer,
  PipelineStage,
  OwnerRole,
  UserRole,
  API_ENDPOINTS,
} from './API_TYPES';
```

## Authentication Flow

### 1. Register New User
```typescript
const register = async (data: {
  email: string;
  password: string;
  name: string;
  role: 'sourcer' | 'interviewer' | 'chatting_manager';
}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  // Store tokens
  localStorage.setItem('accessToken', result.tokens.accessToken);
  localStorage.setItem('refreshToken', result.tokens.refreshToken);

  return result;
};
```

### 2. Login
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  localStorage.setItem('accessToken', result.tokens.accessToken);
  localStorage.setItem('refreshToken', result.tokens.refreshToken);

  return result;
};
```

### 3. Refresh Token
```typescript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const result = await response.json();
  localStorage.setItem('accessToken', result.tokens.accessToken);
  localStorage.setItem('refreshToken', result.tokens.refreshToken);

  return result;
};
```

### 4. Authenticated Request Helper
```typescript
const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    await refreshToken();
    // Retry request with new token
    const newToken = localStorage.getItem('accessToken');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return response;
};
```

## Common Operations

### Candidates

#### List Candidates with Filters
```typescript
const listCandidates = async (params: {
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  sourceId?: string;
  referrerId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'currentStage' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}) => {
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/candidates?${queryString}`
  );

  return response.json();
};

// Example usage
const candidates = await listCandidates({
  currentStage: PipelineStage.QUALIFYING,
  limit: 20,
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
```

#### Create Candidate
```typescript
const createCandidate = async (data: {
  name: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
}) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/candidates`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return response.json();
};
```

#### Update Candidate
```typescript
const updateCandidate = async (id: string, data: Partial<{
  name: string;
  telegram: string;
  country: string;
  timezone: string;
  sourceId: string;
  referrerId: string;
  currentStage: PipelineStage;
  currentOwner: OwnerRole;
}>) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/candidates/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );

  return response.json();
};
```

#### Bulk Update Candidate Stages
```typescript
const bulkUpdateStages = async (
  candidateIds: string[],
  currentStage: PipelineStage
) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/candidates/bulk/update-stages`,
    {
      method: 'POST',
      body: JSON.stringify({ candidateIds, currentStage }),
    }
  );

  return response.json();
};
```

#### Get Candidate Statistics
```typescript
const getCandidateStats = async () => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/candidates/stats`
  );

  return response.json();
};

// Example response structure
// {
//   stats: {
//     total: 150,
//     byStage: {
//       new: 20,
//       qualifying: 30,
//       interview_scheduled: 15,
//       ...
//     }
//   }
// }
```

### Sources

#### List Sources
```typescript
const listSources = async (params?: {
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryString = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/sources?${queryString}`
  );

  return response.json();
};
```

#### Create Source
```typescript
const createSource = async (data: {
  name: string;
  type?: string;
}) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/sources`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return response.json();
};
```

### Referrers

#### List Referrers
```typescript
const listReferrers = async (params?: {
  externalId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryString = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/referrers?${queryString}`
  );

  return response.json();
};
```

#### Get Referrer by External ID
```typescript
const getReferrerByExternalId = async (externalId: string) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/referrers/external/${externalId}`
  );

  return response.json();
};
```

## React Query Integration

### Setup Provider
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Query Hooks

#### Use Candidates
```typescript
import { useQuery } from '@tanstack/react-query';

const useCandidates = (params: CandidateListParams) => {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: () => listCandidates(params),
  });
};

// Usage in component
const { data, isLoading, error } = useCandidates({
  currentStage: PipelineStage.QUALIFYING,
  limit: 20,
  offset: 0,
});
```

#### Use Candidate Stats
```typescript
const useCandidateStats = () => {
  return useQuery({
    queryKey: ['candidates', 'stats'],
    queryFn: getCandidateStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### Mutation Hooks

#### Create Candidate
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      // Invalidate and refetch candidates
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'stats'] });
    },
  });
};

// Usage in component
const createMutation = useCreateCandidate();

const handleSubmit = (data) => {
  createMutation.mutate(data, {
    onSuccess: (result) => {
      console.log('Created:', result.candidate);
    },
    onError: (error) => {
      console.error('Failed:', error);
    },
  });
};
```

#### Update Candidate
```typescript
const useUpdateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateRequest }) =>
      updateCandidate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', id] });
    },
  });
};
```

#### Bulk Update Stages
```typescript
const useBulkUpdateStages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, stage }: { ids: string[]; stage: PipelineStage }) =>
      bulkUpdateStages(ids, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', 'stats'] });
    },
  });
};
```

## Error Handling

### Standard Error Structure
```typescript
interface ApiError {
  error: string;
  message?: string;
}

const handleApiError = (error: ApiError) => {
  switch (error.error) {
    case 'Unauthorized':
      // Redirect to login
      window.location.href = '/login';
      break;
    case 'Validation failed':
      // Show validation errors
      console.error('Validation:', error.message);
      break;
    case 'Not found':
      // Show 404 message
      console.error('Resource not found');
      break;
    default:
      console.error('Unknown error:', error);
  }
};
```

### Global Error Boundary
```typescript
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

function ErrorBoundary({ children }) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ReactErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <h2>Something went wrong</h2>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
}
```

## Pagination Component Example

```typescript
interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
}

const Pagination = ({ total, limit, offset, onPageChange }: PaginationProps) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange((currentPage - 2) * limit)}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages} ({total} total)
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage * limit)}
      >
        Next
      </button>
    </div>
  );
};
```

## Pipeline Stage Display Helper

```typescript
const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.NEW]: 'New',
  [PipelineStage.QUALIFYING]: 'Qualifying',
  [PipelineStage.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [PipelineStage.INTERVIEW_DONE]: 'Interview Done',
  [PipelineStage.TESTS_SCHEDULED]: 'Tests Scheduled',
  [PipelineStage.TESTS_DONE]: 'Tests Done',
  [PipelineStage.MOCK_SCHEDULED]: 'Mock Scheduled',
  [PipelineStage.MOCK_DONE]: 'Mock Done',
  [PipelineStage.ONBOARDING_ASSIGNED]: 'Onboarding Assigned',
  [PipelineStage.ONBOARDING_DONE]: 'Onboarding Done',
  [PipelineStage.PROBATION_START]: 'Probation Start',
  [PipelineStage.PROBATION_END]: 'Probation End',
};

const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  [PipelineStage.NEW]: '#3b82f6',
  [PipelineStage.QUALIFYING]: '#8b5cf6',
  [PipelineStage.INTERVIEW_SCHEDULED]: '#ec4899',
  [PipelineStage.INTERVIEW_DONE]: '#f59e0b',
  [PipelineStage.TESTS_SCHEDULED]: '#10b981',
  [PipelineStage.TESTS_DONE]: '#06b6d4',
  [PipelineStage.MOCK_SCHEDULED]: '#6366f1',
  [PipelineStage.MOCK_DONE]: '#84cc16',
  [PipelineStage.ONBOARDING_ASSIGNED]: '#f97316',
  [PipelineStage.ONBOARDING_DONE]: '#14b8a6',
  [PipelineStage.PROBATION_START]: '#a855f7',
  [PipelineStage.PROBATION_END]: '#22c55e',
};

const StageBadge = ({ stage }: { stage: PipelineStage }) => (
  <span
    className="stage-badge"
    style={{ backgroundColor: PIPELINE_STAGE_COLORS[stage] }}
  >
    {PIPELINE_STAGE_LABELS[stage]}
  </span>
);
```

## Role-Based Access Control

```typescript
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const checkPermission = (requiredRole: UserRole) => {
    if (!user) return false;

    // Sourcers have all permissions
    if (user.role === UserRole.SOURCER) return true;

    // Check specific role
    return user.role === requiredRole;
  };

  const canEdit = () => user?.role === UserRole.SOURCER;
  const canView = () => !!user;

  return { user, checkPermission, canEdit, canView };
};

// Usage in component
const { canEdit } = useAuth();

return (
  <div>
    {canEdit() && (
      <button onClick={handleEdit}>Edit Candidate</button>
    )}
  </div>
);
```

## WebSocket Support (Future Enhancement)

Currently, the API uses REST. For real-time updates, consider:

1. **Polling**: Use React Query's `refetchInterval`
```typescript
const useCandidates = () => {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: listCandidates,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};
```

2. **Manual Refetch**: Refetch on user action
```typescript
const { refetch } = useCandidates();

<button onClick={() => refetch()}>Refresh</button>
```

## Testing

### Mock API Responses
```typescript
// __mocks__/api.ts
export const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    currentStage: PipelineStage.QUALIFYING,
    currentOwner: OwnerRole.SOURCER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockListCandidates = jest.fn(() =>
  Promise.resolve({
    candidates: mockCandidates,
    total: mockCandidates.length,
    limit: 20,
    offset: 0,
  })
);
```

## Environment Variables

```env
# .env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1
```

```typescript
// config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  apiVersion: import.meta.env.VITE_API_VERSION || 'v1',
};
```
