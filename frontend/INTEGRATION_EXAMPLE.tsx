/**
 * INTEGRATION EXAMPLE - How to use the Candidate Management System
 *
 * This file shows different ways to integrate the candidate management
 * system into your application.
 */

// ============================================================================
// EXAMPLE 1: Basic Integration with React Router
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CandidateList } from './pages/Candidates';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/candidates" element={<CandidateList />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// ============================================================================
// EXAMPLE 2: With Layout Wrapper
// ============================================================================

import { CandidateList } from './pages/Candidates';

function CandidatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation/Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">BELOURA HIRING</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CandidateList />
      </main>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Custom Hook Usage for Custom UI
// ============================================================================

import { useState } from 'react';
import { useCandidates, useCreateCandidate } from './hooks/useCandidates';

function CustomCandidateComponent() {
  const [search, setSearch] = useState('');

  // Fetch candidates with filters
  const { data, isLoading, error } = useCandidates({
    search: search || undefined,
    currentStage: 'qualifying',
    limit: 10,
  });

  // Create mutation
  const createMutation = useCreateCandidate();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: 'John Doe',
        telegram: '@johndoe',
        currentStage: 'new',
        currentOwner: 'sourcer',
      });
      alert('Candidate created!');
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search candidates..."
      />

      <button onClick={handleCreate}>Create New Candidate</button>

      <ul>
        {data?.data.map((candidate) => (
          <li key={candidate.id}>
            {candidate.name} - {candidate.currentStage}
          </li>
        ))}
      </ul>

      <div>Total: {data?.total}</div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Form Only Usage (for Modal or Separate Page)
// ============================================================================

import { useState } from 'react';
import { Modal } from './components/Modal';
import { CandidateForm } from './pages/Candidates';

function MyCustomPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditId(null);
    alert('Candidate saved!');
  };

  return (
    <div>
      <button onClick={() => {
        setEditId(null);
        setIsModalOpen(true);
      }}>
        Create New Candidate
      </button>

      <button onClick={() => {
        setEditId('some-candidate-id');
        setIsModalOpen(true);
      }}>
        Edit Existing Candidate
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'Edit Candidate' : 'New Candidate'}
        size="xl"
      >
        <CandidateForm
          candidateId={editId}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Direct API Usage (without React Query)
// ============================================================================

import { api, getErrorMessage } from './services/api';
import type { Candidate, CreateCandidateInput } from './types';

async function fetchCandidatesDirectly() {
  try {
    const response = await api.get<{ data: Candidate[]; total: number }>(
      '/candidates?limit=20&offset=0'
    );
    console.log('Candidates:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', getErrorMessage(error));
  }
}

async function createCandidateDirectly(input: CreateCandidateInput) {
  try {
    const response = await api.post<Candidate>('/candidates', input);
    console.log('Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', getErrorMessage(error));
  }
}

async function updateCandidateDirectly(id: string, updates: Partial<CreateCandidateInput>) {
  try {
    const response = await api.patch<Candidate>(`/candidates/${id}`, updates);
    console.log('Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', getErrorMessage(error));
  }
}

async function deleteCandidateDirectly(id: string) {
  try {
    await api.delete(`/candidates/${id}`);
    console.log('Deleted successfully');
  } catch (error) {
    console.error('Error:', getErrorMessage(error));
  }
}

// Usage
fetchCandidatesDirectly();
createCandidateDirectly({
  name: 'Jane Smith',
  telegram: '@janesmith',
  currentStage: 'new',
  currentOwner: 'sourcer',
});

// ============================================================================
// EXAMPLE 6: With React Query DevTools (for debugging)
// ============================================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CandidateList } from './pages/Candidates';

const queryClient = new QueryClient();

function AppWithDevTools() {
  return (
    <QueryClientProvider client={queryClient}>
      <CandidateList />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// ============================================================================
// EXAMPLE 7: Authentication Setup
// ============================================================================

// Before using any candidate features, ensure user is authenticated:

function LoginPage() {
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Store tokens
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Navigate to candidates page
      window.location.href = '/candidates';
    } catch (error) {
      console.error('Login failed:', getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}

// ============================================================================
// EXAMPLE 8: Environment Configuration
// ============================================================================

// Create .env file in your project root:
/*
VITE_API_URL=http://localhost:3001/api/v1

# For production:
# VITE_API_URL=https://api.beloura.com/api/v1
*/

// Access in code:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// ============================================================================
// EXAMPLE 9: Protected Route Pattern
// ============================================================================

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppWithProtectedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <CandidateList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// ============================================================================
// EXAMPLE 10: Custom Filter Presets
// ============================================================================

function CandidatesWithPresets() {
  const [activePreset, setActivePreset] = useState<'all' | 'new' | 'active'>('all');

  const presets = {
    all: {},
    new: { currentStage: 'new' as const },
    active: {
      currentStage: 'qualifying' as const,
      currentOwner: 'interviewer' as const,
    },
  };

  const { data } = useCandidates(presets[activePreset]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActivePreset('all')}>All</button>
        <button onClick={() => setActivePreset('new')}>New Only</button>
        <button onClick={() => setActivePreset('active')}>Active</button>
      </div>

      {/* Render candidate list */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// ============================================================================
// QUICK START CHECKLIST
// ============================================================================

/*
1. ✓ Backend API running on http://localhost:3001
2. ✓ React Query installed: npm install @tanstack/react-query
3. ✓ Axios installed: npm install axios
4. ✓ Environment variables configured (.env file)
5. ✓ User authenticated (tokens in localStorage)
6. ✓ QueryClientProvider wrapping your app
7. ✓ Import and use <CandidateList /> component

That's it! The system is ready to use.

For issues or customization, refer to CANDIDATE_MANAGEMENT.md
*/
