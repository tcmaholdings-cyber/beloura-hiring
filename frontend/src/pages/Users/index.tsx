import { useState } from 'react';
import { Modal, ConfirmModal } from '../../components/Modal';
import { DataTable, Column } from '../../components/DataTable';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { UserForm } from './UserForm';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
} from '../../hooks/useUsers';
import type { User, UserRole } from '../../types';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'sourcer', label: 'Sourcer' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'chatting_managers', label: 'Chatting Managers' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const roleLabels: Record<UserRole, string> = {
  sourcer: 'Sourcer',
  interviewer: 'Interviewer',
  chatting_managers: 'Chatting Managers',
};

export function UserList() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'chatting_managers';

  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Data fetching
  const { data, isLoading, error, refetch } = useUsers(filters);

  // Mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // Filter handlers
  const handleRoleFilter = (role: string) => {
    setFilters((prev) => ({
      ...prev,
      role: role ? (role as UserRole) : undefined,
      offset: 0,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      isActive: status ? status === 'true' : undefined,
      offset: 0,
    }));
  };

  // Create user handler
  const handleCreate = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      await createMutation.mutateAsync(data as CreateUserInput);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Create user error:', error);
    }
  };

  // Update user handler
  const handleUpdate = async (data: UpdateUserInput) => {
    if (!editingUser) return;

    try {
      await updateMutation.mutateAsync({ id: editingUser.id, input: data });
      setEditingUser(null);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  // Delete user handler
  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      setDeletingUser(null);
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  // Table columns
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, user) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          {user.username && (
            <div className="text-xs text-gray-500">@{user.username}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role: UserRole) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {roleLabels[role]}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, user) =>
        isAdmin && user.id !== currentUser?.id ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingUser(user)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => setDeletingUser(user)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        ) : null,
    },
  ];

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
          <p className="text-yellow-700">
            You do not have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Filter by Role"
            options={roleOptions}
            value={filters.role || ''}
            onChange={handleRoleFilter}
          />

          <Select
            label="Filter by Status"
            options={statusOptions}
            value={
              filters.isActive === undefined
                ? ''
                : filters.isActive
                ? 'true'
                : 'false'
            }
            onChange={handleStatusFilter}
          />

          <div className="flex items-end">
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
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r mb-6">
          <p className="text-red-700">
            {error instanceof Error ? error.message : 'Failed to load users'}
          </p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="lg"
      >
        <UserForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        size="lg"
      >
        {editingUser && (
          <UserForm
            mode="edit"
            initialData={editingUser}
            onSubmit={handleUpdate}
            onCancel={() => setEditingUser(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deletingUser?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
