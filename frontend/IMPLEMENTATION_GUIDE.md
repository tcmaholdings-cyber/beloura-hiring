# Frontend Implementation Guide

## Current Status

### ✅ Completed (Just Now)
1. **Type Definitions** (`src/types/index.ts`)
   - All API response types
   - User, Candidate, Source, Referrer types
   - Filter and pagination types

2. **API Client** (`src/services/api.ts`)
   - Axios instance with interceptors
   - Automatic token refresh on 401
   - Error handling utilities

3. **Authentication Service** (`src/services/authService.ts`)
   - Login/logout methods
   - Token management
   - User persistence

4. **Authentication Store** (`src/store/authStore.ts`)
   - Zustand state management
   - Login/logout actions
   - Auth state initialization

5. **Login Page** (`src/pages/Login.tsx`)
   - Beautiful login UI
   - Form validation
   - Error handling
   - Demo credentials displayed

## Next Steps to Complete GUI

### Step 1: Protected Routes & Navigation (1-2 hours)

**Files to Create:**
```
src/components/ProtectedRoute.tsx
src/components/Layout.tsx
src/components/Sidebar.tsx
src/components/Header.tsx
```

**ProtectedRoute.tsx** - Protects routes requiring authentication:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Layout.tsx** - Main app layout with sidebar and header:
- Sidebar with navigation links
- Header with user info and logout button
- Main content area
- Responsive design

**Sidebar.tsx** - Navigation sidebar:
```
- Dashboard
- Candidates
- Sources
- Referrers
- Users (admin only)
```

### Step 2: API Service Layer (1 hour)

**Files to Create:**
```
src/services/candidateService.ts
src/services/sourceService.ts
src/services/referrerService.ts
src/services/userService.ts
```

Example (`candidateService.ts`):
```typescript
import { api } from './api';
import type { Candidate, CandidateFilters, CreateCandidateInput } from '../types';

export const candidateService = {
  list: (filters?: CandidateFilters) =>
    api.get('/candidates', { params: filters }),

  get: (id: string) =>
    api.get(`/candidates/${id}`),

  create: (data: CreateCandidateInput) =>
    api.post('/candidates', data),

  update: (id: string, data: UpdateCandidateInput) =>
    api.patch(`/candidates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/candidates/${id}`),

  bulkUpdateStages: (data: BulkUpdateStagesInput) =>
    api.post('/candidates/bulk/update-stages', data),

  stats: () =>
    api.get('/candidates/stats'),
};
```

### Step 3: Dashboard Page (2-3 hours)

**File:** `src/pages/Dashboard.tsx`

**Features:**
- Statistics cards (total candidates, by stage, by owner)
- Charts showing recruitment pipeline
- Recent activity feed
- Quick actions

**React Query Integration:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../services/candidateService';

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['candidate-stats'],
    queryFn: () => candidateService.stats(),
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Candidates" value={stats?.total} />
        <StatCard title="New" value={stats?.byStage.new} />
        <StatCard title="Qualifying" value={stats?.byStage.qualifying} />
      </div>

      {/* Pipeline Chart */}
      <PipelineChart data={stats?.byStage} />
    </div>
  );
}
```

### Step 4: Candidate Management (3-4 hours)

**Files to Create:**
```
src/pages/Candidates/CandidateList.tsx
src/pages/Candidates/CandidateForm.tsx
src/pages/Candidates/CandidateDetail.tsx
src/components/CandidateTable.tsx
src/components/FilterPanel.tsx
```

**CandidateList.tsx** - Main candidate management page:
- Search and filter panel
- Data table with pagination
- Bulk actions (select multiple, update stage)
- Create new button
- Export functionality

**CandidateTable.tsx** - Reusable table component:
```typescript
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

function CandidateTable({ data, columns, onEdit, onDelete }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map(row => (
          <tr key={row.id} className="hover:bg-gray-50">
            {columns.map(col => (
              <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**CandidateForm.tsx** - Create/edit candidate form:
- React Hook Form for form state
- Zod for validation
- Source and Referrer dropdowns
- Stage and Owner dropdowns
- All candidate fields

Example with React Hook Form + Zod:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const candidateSchema = z.object({
  name: z.string().min(2).max(100),
  telegram: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  sourceId: z.string().uuid().optional(),
  referrerId: z.string().uuid().optional(),
  currentStage: z.enum(['new', 'qualifying', ...]),
  currentOwner: z.enum(['sourcer', 'interviewer', 'chatting_managers']),
});

function CandidateForm({ initialData, onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(candidateSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label>Name</label>
        <input {...register('name')} className="..." />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>
      {/* More fields... */}
    </form>
  );
}
```

### Step 5: Source Management (1-2 hours)

**Files:**
```
src/pages/Sources/SourceList.tsx
src/pages/Sources/SourceForm.tsx
```

Similar to candidates but simpler (only name and type fields).

### Step 6: Referrer Management (1-2 hours)

**Files:**
```
src/pages/Referrers/ReferrerList.tsx
src/pages/Referrers/ReferrerForm.tsx
```

Similar to sources with name, externalId, and telegram fields.

### Step 7: User Management (1-2 hours)

**Files:**
```
src/pages/Users/UserList.tsx
src/pages/Users/UserForm.tsx
```

Admin-only section for managing users.

### Step 8: Update App.tsx with Routing (30 minutes)

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CandidateList } from './pages/Candidates/CandidateList';
import { SourceList } from './pages/Sources/SourceList';
import { ReferrerList } from './pages/Referrers/ReferrerList';
import { UserList } from './pages/Users/UserList';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

const queryClient = new QueryClient();

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<CandidateList />} />
            <Route path="sources" element={<SourceList />} />
            <Route path="referrers" element={<ReferrerList />} />
            <Route path="users" element={<UserList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

## Reusable Components to Create

### Common UI Components
```
src/components/Button.tsx              - Reusable button with variants
src/components/Card.tsx                - Container card component
src/components/Badge.tsx               - Status badges (for stages)
src/components/Modal.tsx               - Modal dialog
src/components/Table.tsx               - Generic data table
src/components/Pagination.tsx          - Pagination controls
src/components/Select.tsx              - Dropdown select
src/components/SearchInput.tsx         - Search input with icon
src/components/LoadingSpinner.tsx      - Loading indicator
src/components/EmptyState.tsx          - Empty state placeholder
```

### Example Badge Component
```typescript
const stageColors: Record<CandidateStage, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualifying: 'bg-yellow-100 text-yellow-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  interview_done: 'bg-green-100 text-green-800',
  // ... more stages
};

export function StageBadge({ stage }: { stage: CandidateStage }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColors[stage]}`}>
      {stage.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
```

## Tailwind Utilities to Add

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition;
  }

  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition;
  }

  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }

  .card {
    @apply bg-white rounded-lg shadow p-6;
  }
}
```

## React Query Setup

Create query hooks for common operations:

```typescript
// src/hooks/useCandidates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../services/candidateService';

export function useCandidates(filters?: CandidateFilters) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => candidateService.list(filters),
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateInput }) =>
      candidateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}
```

## Environment Variables

Update `.env.local`:
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=BELOURA HIRING
VITE_ENVIRONMENT=development
```

## Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Protected Routes & Layout | 1-2 hours | High |
| API Service Layer | 1 hour | High |
| Dashboard | 2-3 hours | High |
| Candidate Management | 3-4 hours | High |
| Source Management | 1-2 hours | Medium |
| Referrer Management | 1-2 hours | Medium |
| User Management | 1-2 hours | Low |
| Common Components | 2-3 hours | High |
| Polish & UX Improvements | 2-3 hours | Medium |

**Total**: 16-24 hours for complete implementation

## Testing Recommendations

1. **Manual Testing**
   - Test all CRUD operations
   - Verify authentication flow
   - Check RBAC (different roles see different features)
   - Test pagination and filtering
   - Verify bulk operations

2. **Playwright E2E Tests** (Future)
   - Login flow
   - Create/edit/delete candidates
   - Bulk update workflow
   - Navigation and routing

## Production Checklist

- [ ] Error boundaries for crash recovery
- [ ] Loading states for all async operations
- [ ] Success/error toast notifications
- [ ] Confirmation dialogs for destructive actions
- [ ] Form validation with helpful error messages
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Performance optimization (React.memo, useMemo, useCallback)
- [ ] Build optimization (code splitting, lazy loading)
- [ ] SEO meta tags
- [ ] Analytics integration
- [ ] Error tracking (Sentry, etc.)

## Next Immediate Step

Run the following command to see the login page:

```bash
cd frontend
npm run dev
```

Then visit http://localhost:5173/login

You should see the beautiful login page with demo credentials!
