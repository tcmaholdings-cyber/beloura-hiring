import { useState } from 'react';
import { DataTable, Column } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Modal, ConfirmModal } from '../../components/Modal';
import { ReferrerForm } from './ReferrerForm';
import { useReferrers, useCreateReferrer, useUpdateReferrer, useDeleteReferrer } from '../../hooks/useReferrers';
import type { ReferrerWithStats, CreateReferrerInput, UpdateReferrerInput } from '../../types';

export function ReferrerList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState<ReferrerWithStats | null>(null);
  const [deletingReferrerId, setDeletingReferrerId] = useState<string | null>(null);

  // Queries and mutations
  const { data, isLoading } = useReferrers();
  const createReferrer = useCreateReferrer();
  const updateReferrer = useUpdateReferrer();
  const deleteReferrer = useDeleteReferrer();

  // Handlers
  const handleCreate = async (data: CreateReferrerInput) => {
    await createReferrer.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: UpdateReferrerInput) => {
    if (!editingReferrer) return;
    await updateReferrer.mutateAsync({ id: editingReferrer.id, data });
    setEditingReferrer(null);
  };

  const handleDelete = async () => {
    if (!deletingReferrerId) return;
    await deleteReferrer.mutateAsync(deletingReferrerId);
    setDeletingReferrerId(null);
  };

  // Table columns
  const columns: Column<ReferrerWithStats>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'externalId',
      label: 'External ID',
      sortable: false,
      render: (value) => value || <span className="text-gray-400">-</span>,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      sortable: false,
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
              setEditingReferrer(row);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingReferrerId(row.id);
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
        <h1 className="text-3xl font-bold text-gray-900">Referrers</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Referrer
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No referrers found. Create your first referrer to get started."
          defaultSortKey="name"
          defaultSortOrder="asc"
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Referrer"
      >
        <ReferrerForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={createReferrer.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingReferrer}
        onClose={() => setEditingReferrer(null)}
        title="Edit Referrer"
      >
        {editingReferrer && (
          <ReferrerForm
            initialData={editingReferrer}
            onSubmit={handleUpdate}
            onCancel={() => setEditingReferrer(null)}
            isSubmitting={updateReferrer.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingReferrerId}
        onClose={() => setDeletingReferrerId(null)}
        onConfirm={handleDelete}
        title="Delete Referrer"
        message="Are you sure you want to delete this referrer? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteReferrer.isPending}
      />
    </div>
  );
}
