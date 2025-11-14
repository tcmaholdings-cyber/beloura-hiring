import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, Column } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Modal, ConfirmModal } from '../../components/Modal';
import { SourceForm } from './SourceForm';
import { useSources, useCreateSource, useUpdateSource, useDeleteSource } from '../../hooks/useSources';
import type { SourceWithStats, CreateSourceInput, UpdateSourceInput } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function SourceList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceWithStats | null>(null);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);

  // Queries and mutations
  const { data, isLoading } = useSources();
  const createSource = useCreateSource();
  const updateSource = useUpdateSource();
  const deleteSource = useDeleteSource();

  const sources = data?.data || [];

  // Handlers
  const handleCreate = async (data: CreateSourceInput) => {
    await createSource.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: UpdateSourceInput) => {
    if (!editingSource) return;
    await updateSource.mutateAsync({ id: editingSource.id, data });
    setEditingSource(null);
  };

  const handleDelete = async () => {
    if (!deletingSourceId) return;
    await deleteSource.mutateAsync(deletingSourceId);
    setDeletingSourceId(null);
  };

  // Table columns
  const columns: Column<SourceWithStats>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => value || <span className="text-gray-400">-</span>,
    },
    {
      key: '_count',
      label: 'Candidates',
      sortable: false,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
          {value?.candidates || 0}
        </span>
      ),
    },
    {
      key: 'interviewed',
      label: 'Interviewed',
      sortable: false,
      align: 'center',
      render: (_, row) => row.interviewInsights?.interviewed || 0,
    },
    {
      key: 'passed',
      label: 'Passed (1–2)',
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <span className="text-green-700 font-semibold">
          {row.interviewInsights?.passed || 0}
        </span>
      ),
    },
    {
      key: 'failed',
      label: 'Failed (4–5)',
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <span className="text-red-600 font-semibold">
          {row.interviewInsights?.failed || 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingSource(row);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingSourceId(row.id);
            }}
            className="text-red-600 hover:text-red-800 font-medium text-sm transition"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sources</h1>
        <div className="flex gap-3">
          <Link to="/sources/analytics">
            <Button variant="ghost">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics
            </Button>
          </Link>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Source
          </Button>
        </div>
      </div>

      <SourceInsights sources={sources} isLoading={isLoading} />

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={sources}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No sources found. Create your first source to get started."
          defaultSortKey="name"
          defaultSortOrder="asc"
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Source"
      >
        <SourceForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={createSource.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        title="Edit Source"
      >
        {editingSource && (
          <SourceForm
            initialData={editingSource}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSource(null)}
            isSubmitting={updateSource.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingSourceId}
        onClose={() => setDeletingSourceId(null)}
        onConfirm={handleDelete}
        title="Delete Source"
        message="Are you sure you want to delete this source? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteSource.isPending}
      />
    </div>
  );
}

function SourceInsights({ sources, isLoading }: { sources: SourceWithStats[]; isLoading: boolean }) {
  const totals = sources.reduce(
    (acc, source) => {
      const insights = source.interviewInsights;
      if (insights) {
        acc.interviewed += insights.interviewed || 0;
        acc.passed += insights.passed || 0;
        acc.failed += insights.failed || 0;
      }
      return acc;
    },
    { interviewed: 0, passed: 0, failed: 0 }
  );

  const topSources = [...sources]
    .filter((source) => (source.interviewInsights?.interviewed || 0) > 0)
    .sort(
      (a, b) =>
        (b.interviewInsights?.interviewed || 0) - (a.interviewInsights?.interviewed || 0)
    )
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Source performance insights</h2>
          <p className="text-sm text-gray-500">
            Track how many interviewed candidates each sourcing channel delivers and how they perform.
          </p>
        </div>
      </div>

      {isLoading && sources.length === 0 ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="md" />
        </div>
      ) : totals.interviewed === 0 ? (
        <p className="text-gray-500 text-sm">No interviewed candidates yet. Insights will appear once interviews are logged.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InsightCard label="Total interviewed" value={totals.interviewed} description="All channels" />
            <InsightCard label="Passed (1–2)" value={totals.passed} description="Ready to advance" accent="text-green-600" />
            <InsightCard label="Failed (4–5)" value={totals.failed} description="Did not pass" accent="text-red-600" />
          </div>

          {topSources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top sourcing channels</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Source</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">Interviewed</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">Passed</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">Failed</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">Pass rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topSources.map((source) => {
                      const insights = source.interviewInsights!;
                      const passRate =
                        insights.interviewed > 0
                          ? Math.round((insights.passed / insights.interviewed) * 100)
                          : 0;
                      return (
                        <tr key={source.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{source.name}</td>
                          <td className="px-4 py-2 text-center">{insights.interviewed}</td>
                          <td className="px-4 py-2 text-center text-green-600 font-semibold">
                            {insights.passed}
                          </td>
                          <td className="px-4 py-2 text-center text-red-600 font-semibold">
                            {insights.failed}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-700">{passRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InsightCard({
  label,
  value,
  description,
  accent = 'text-blue-600',
}: {
  label: string;
  value: number;
  description: string;
  accent?: string;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}
