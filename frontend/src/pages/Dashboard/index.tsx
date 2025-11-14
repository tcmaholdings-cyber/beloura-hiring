import { Link } from 'react-router-dom';
import { useCandidateStats } from '../../hooks/useDashboard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import type { CandidateStage, CandidateOwner } from '../../types';
import { STAGE_LABELS, STAGE_COLORS } from '../../constants/stages';

// Owner labels
const ownerLabels: Record<CandidateOwner, string> = {
  sourcer: 'Sourcer',
  interviewer: 'Interviewer',
  chatting_managers: 'Chatting Managers',
};

const ownerColors: Record<CandidateOwner, string> = {
  sourcer: 'bg-blue-500',
  interviewer: 'bg-green-500',
  chatting_managers: 'bg-purple-500',
};

export function Dashboard() {
  const { data, isLoading, error, refetch } = useCandidateStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
          <p className="text-red-700">
            {error instanceof Error ? error.message : 'Failed to load dashboard statistics'}
          </p>
        </div>
      </div>
    );
  }

  const stats = data;

  // Get top 5 stages by count
  const topStages = Object.entries(stats.byStage || {})
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate percentages for bar chart
  const maxStageCount = Math.max(...topStages.map(([_, count]) => count), 1);

  // Get owner counts
  const ownerData = Object.entries(stats.byOwner || {});

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button variant="ghost" onClick={() => refetch()} size="md">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Candidates */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Candidates</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/candidates"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            >
              View All
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Active Stages */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Stages</h3>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(stats.byStage || {}).filter((count) => count > 0).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Candidates</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.recentCandidates?.length || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Last 5 added</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Candidates by Stage Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidates by Stage</h3>
          {topStages.length > 0 ? (
            <div className="space-y-3">
              {topStages.map(([stage, count]) => {
                const percentage = (count / maxStageCount) * 100;
                return (
                  <div key={stage}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {STAGE_LABELS[stage as CandidateStage]}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                        STAGE_COLORS[stage as CandidateStage]
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No candidates yet</p>
          )}
        </div>

        {/* Candidates by Owner Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidates by Owner</h3>
          {ownerData.length > 0 ? (
            <div className="space-y-4">
              {ownerData.map(([owner, count]) => (
                <div key={owner} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${ownerColors[owner as CandidateOwner]}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {ownerLabels[owner as CandidateOwner]}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{stats.totalCandidates}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No candidates yet</p>
          )}
        </div>
      </div>

      {/* Recent Candidates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
            <Link
              to="/candidates"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            >
              View All
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {(stats.recentCandidates?.length || 0) > 0 ? (
          <div className="divide-y divide-gray-200">
            {stats.recentCandidates.map((candidate) => (
              <div key={candidate.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                      {candidate.telegram && (
                        <span className="inline-flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                          </svg>
                          {candidate.telegram}
                        </span>
                      )}
                      {candidate.country && <span>{candidate.country}</span>}
                      <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
                        STAGE_COLORS[candidate.currentStage]
                      }`}
                    >
                      {STAGE_LABELS[candidate.currentStage]}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
                        ownerColors[candidate.currentOwner || 'sourcer']
                      }`}
                    >
                      {ownerLabels[candidate.currentOwner || 'sourcer']}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="mt-4 text-gray-600">No candidates yet</p>
            <Link
              to="/candidates"
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Add your first candidate
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
