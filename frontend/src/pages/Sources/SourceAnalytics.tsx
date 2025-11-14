import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, Column } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Select, SelectOption } from '../../components/Select';
import { useSourceAnalytics } from '../../hooks/useSources';
import { getErrorMessage } from '../../services/api';
import type { SourceAnalytics as SourceAnalyticsType } from '../../types';

// Helper function to get quality score badge color
function getQualityScoreBadgeClasses(score: number): string {
  if (score > 1.0) {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800';
  } else if (score >= 0.5) {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800';
  } else {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800';
  }
}

// Helper function to get progress bar color
function getProgressBarColor(passRate: number): string {
  if (passRate >= 70) {
    return 'bg-green-500';
  } else if (passRate >= 50) {
    return 'bg-yellow-500';
  } else {
    return 'bg-red-500';
  }
}

export function SourceAnalytics() {
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: analyticsData, isLoading, error, refetch } = useSourceAnalytics();

  // Get unique source types for filtering
  const sourceTypes = analyticsData
    ? Array.from(new Set(analyticsData.map((s) => s.type).filter(Boolean)))
    : [];

  const typeFilterOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    ...sourceTypes.map((type) => ({
      value: type as string,
      label: type as string,
    })),
  ];

  // Filter data
  let filteredData = analyticsData || [];

  // Apply type filter
  if (typeFilter) {
    filteredData = filteredData.filter((source) => source.type === typeFilter);
  }

  // Table columns
  const columns: Column<SourceAnalyticsType>[] = [
    {
      key: 'name',
      label: 'Source Name',
      sortable: true,
      render: (value: string, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.type && (
            <div className="text-xs text-gray-500 mt-1">{row.type}</div>
          )}
        </div>
      ),
    },
    {
      key: 'totalCandidates',
      label: 'Total',
      sortable: true,
      align: 'center',
      render: (value: number) => (
        <span className="text-gray-900 font-semibold">{value}</span>
      ),
    },
    {
      key: 'interviewMetrics',
      label: 'Interviewed',
      sortable: true,
      align: 'center',
      render: (_, row: SourceAnalyticsType) => (
        <div className="space-y-1">
          <div className="text-gray-900 font-semibold">
            {row.interviewMetrics.interviewed}
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {row.conversionRates.interviewRate.toFixed(0)}%
          </div>
        </div>
      ),
    },
    {
      key: 'passed',
      label: 'Passed (1-2)',
      align: 'center',
      render: (_, row: SourceAnalyticsType) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          {row.interviewMetrics.passed}
        </span>
      ),
    },
    {
      key: 'consideration',
      label: 'Consider (3)',
      align: 'center',
      render: (_, row: SourceAnalyticsType) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          {row.interviewMetrics.consideration}
        </span>
      ),
    },
    {
      key: 'failed',
      label: 'Failed (4-5)',
      align: 'center',
      render: (_, row: SourceAnalyticsType) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          {row.interviewMetrics.failed}
        </span>
      ),
    },
    {
      key: 'passRate',
      label: 'Pass Rate',
      sortable: true,
      width: '15%',
      render: (_, row: SourceAnalyticsType) => {
        const passRate = row.conversionRates.passRate;
        return (
          <div className="space-y-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressBarColor(passRate)}`}
                style={{ width: `${Math.min(passRate, 100)}%` }}
              />
            </div>
            <div className="text-sm font-medium text-gray-700 text-center">
              {passRate.toFixed(1)}%
            </div>
          </div>
        );
      },
    },
    {
      key: 'qualityScore',
      label: 'Quality Score',
      sortable: true,
      align: 'center',
      render: (_, row: SourceAnalyticsType) => {
        const score = row.conversionRates.qualityScore;
        return (
          <span className={getQualityScoreBadgeClasses(score)}>
            {score.toFixed(2)}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Source Analytics</h1>
          <Link to="/sources">
            <Button variant="ghost">Back to Sources</Button>
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg" role="alert">
          {getErrorMessage(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Source Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track performance and conversion metrics for each candidate source
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => refetch()}>
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
          <Link to="/sources">
            <Button variant="primary">Back to Sources</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sources</h3>
              <p className="text-3xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Candidates</h3>
              <p className="text-3xl font-bold text-gray-900">
                {filteredData.reduce((sum, s) => sum + s.totalCandidates, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Pass Rate</h3>
              <p className="text-3xl font-bold text-gray-900">
                {filteredData.length > 0
                  ? (
                      filteredData.reduce((sum, s) => sum + s.conversionRates.passRate, 0) /
                      filteredData.length
                    ).toFixed(1)
                  : '0.0'}
                %
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Quality Score</h3>
              <p className="text-3xl font-bold text-gray-900">
                {filteredData.length > 0
                  ? (
                      filteredData.reduce((sum, s) => sum + s.conversionRates.qualityScore, 0) /
                      filteredData.length
                    ).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {sourceTypes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Source Type"
              options={typeFilterOptions}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Quality Score Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-green-100 border border-green-300" />
            <span className="text-gray-700">High Quality {'(>'} 1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
            <span className="text-gray-700">Moderate Quality (0.5 - 1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-red-100 border border-red-300" />
            <span className="text-gray-700">Low Quality {'(<'} 0.5)</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Quality Score = (Passed × 2 - Failed) / Interviewed
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No source analytics available"
        />
      </div>
    </div>
  );
}
