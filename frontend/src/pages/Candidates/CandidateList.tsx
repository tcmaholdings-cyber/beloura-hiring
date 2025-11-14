import { useState } from 'react';
import { Button } from '../../components/Button';
import { Modal, ConfirmModal } from '../../components/Modal';
import { DataTable, Column } from '../../components/DataTable';
import { FormField } from '../../components/FormField';
import { Select, SelectOption } from '../../components/Select';
import { CandidateForm } from './CandidateForm';
import {
  useCandidates,
  useDeleteCandidate,
  useBulkUpdateCandidates,
  useSources,
  useUpdateCandidateFeedback,
} from '../../hooks/useCandidates';
import { useCandidateStats } from '../../hooks/useDashboard';
import { getErrorMessage } from '../../services/api';
import type { Candidate, CandidateStage, CandidateOwner } from '../../types';
import { STAGE_LABELS, STAGE_ORDER } from '../../constants/stages';
import { getRatingBadgeClasses, getRatingLabel } from '../../utils/ratings';
import { StageSummary } from './StageSummary';
import { CandidateFeedbackModal, type CandidateFeedbackTarget } from './CandidateFeedbackModal';
import { FilterPresets } from './FilterPresets';

// Stage options for filtering
const stageOptions: SelectOption[] = [
  { value: '', label: 'All Stages' },
  ...STAGE_ORDER.map((stage) => ({
    value: stage,
    label: STAGE_LABELS[stage],
  })),
];

// Owner options for filtering
const ownerOptions: SelectOption[] = [
  { value: '', label: 'All Owners' },
  { value: 'sourcer', label: 'Sourcer' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'chatting_managers', label: 'Chatting Managers' },
];

// Bulk update stage options (no "All Stages" option)
const bulkStageOptions: SelectOption[] = stageOptions.slice(1);

const PAGE_SIZE = 20;

export function CandidateList() {
  // Filters state
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<CandidateStage | ''>('');
  const [ownerFilter, setOwnerFilter] = useState<CandidateOwner | ''>('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [passedOnly, setPassedOnly] = useState(false);
  const [noRatingOnly, setNoRatingOnly] = useState(false);
  const [topPerformersOnly, setTopPerformersOnly] = useState(false);

  // UI state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStage, setBulkStage] = useState<CandidateStage>('qualifying');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<CandidateFeedbackTarget | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Fetch data
  const { data: sourcesData } = useSources();
  const sources = sourcesData || [];
  const {
    data: statsData,
    isLoading: isStatsLoading,
  } = useCandidateStats();
  const {
    data: candidatesData,
    isLoading,
    error,
  } = useCandidates({
    search: search || undefined,
    currentStage: stageFilter || undefined,
    currentOwner: ownerFilter || undefined,
    sourceId: sourceFilter || undefined,
    minInterviewRating: passedOnly ? 1 : undefined,
    maxInterviewRating: passedOnly ? 2 : undefined,
    interviewRating: topPerformersOnly ? 1 : undefined,
    hasInterviewRating: noRatingOnly ? false : undefined,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Mutations
  const deleteMutation = useDeleteCandidate();
  const bulkUpdateMutation = useBulkUpdateCandidates();
  const feedbackMutation = useUpdateCandidateFeedback();

  // Derived data
  const candidates = candidatesData?.data || [];
  const total = candidatesData?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Source options for filtering
  const sourceFilterOptions: SelectOption[] = [
    { value: '', label: 'All Sources' },
    ...sources.map((source) => ({
      value: source.id,
      label: source.name,
    })),
  ];

  const stats = statsData;

  // Handle new candidate
  const handleNewCandidate = () => {
    setEditingCandidateId(null);
    setIsFormModalOpen(true);
  };

  const handleTogglePassedFilter = () => {
    setPassedOnly((prev) => !prev);
    setCurrentPage(1);
  };

  // Handle preset filter application
  const handleApplyPreset = (presetFilters: Record<string, any>) => {
    // Clear all filters first
    setSearch('');
    setStageFilter('');
    setOwnerFilter('');
    setSourceFilter('');
    setPassedOnly(false);
    setNoRatingOnly(false);
    setTopPerformersOnly(false);

    // Apply preset filters based on type
    if (presetFilters.currentStage) {
      setStageFilter(presetFilters.currentStage as CandidateStage);
    }

    // Ready for Next Stage: ratings 1-2, interview_done stage
    if (presetFilters.minInterviewRating !== undefined &&
        presetFilters.maxInterviewRating !== undefined &&
        presetFilters.currentStage === 'interview_done') {
      setPassedOnly(true);
      setStageFilter('interview_done');
    }
    // Needs Rating: no interview rating
    else if (presetFilters.hasInterviewRating === false) {
      setNoRatingOnly(true);
    }
    // Top Performers: rating = 1
    else if (presetFilters.interviewRating === 1) {
      setTopPerformersOnly(true);
    }

    setCurrentPage(1);
  };

  // Handle edit candidate
  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidateId(candidate.id);
    setIsFormModalOpen(true);
  };

  const openFeedbackModal = (target: CandidateFeedbackTarget) => {
    setFeedbackTarget(target);
    setFeedbackError(null);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackTarget(null);
    setFeedbackError(null);
  };

  const handleFeedbackSubmit = async (data: { interviewRating: number | null; notes: string | null }) => {
    if (!feedbackTarget) return;
    try {
      await feedbackMutation.mutateAsync({
        id: feedbackTarget.id,
        data,
      });
      setSuccessMessage('Interview feedback saved');
      setTimeout(() => setSuccessMessage(''), 3000);
      closeFeedbackModal();
    } catch (err) {
      setFeedbackError(getErrorMessage(err));
    }
  };

  // Handle delete candidate
  const handleDeleteCandidate = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setSuccessMessage('Candidate deleted successfully');
      setDeleteConfirmId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Delete error:', getErrorMessage(error));
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingCandidateId(null);
    setSuccessMessage(
      editingCandidateId ? 'Candidate updated successfully' : 'Candidate created successfully'
    );
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        candidateIds: Array.from(selectedIds),
        currentStage: bulkStage,
      });
      setSuccessMessage(`${selectedIds.size} candidates updated successfully`);
      setSelectedIds(new Set());
      setIsBulkModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Bulk update error:', getErrorMessage(error));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderNotesPreview = (notes: string | null) => {
    if (!notes || !notes.trim()) {
      return <span className="text-gray-400 italic">No notes yet</span>;
    }
    const trimmed = notes.trim();
    const snippet = trimmed.length > 120 ? `${trimmed.slice(0, 120)}…` : trimmed;
    return <span className="text-gray-700 text-sm">{snippet}</span>;
  };

  // Table columns
  const columns: Column<Candidate>[] = [
    {
      key: 'select',
      label: '',
      width: '50px',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => handleSelectOne(row.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      render: (value) => (
        <span className="text-gray-600">{value || '—'}</span>
      ),
    },
    {
      key: 'country',
      label: 'Country',
      render: (value) => (
        <span className="text-gray-600">{value || '—'}</span>
      ),
    },
    {
      key: 'currentStage',
      label: 'Stage',
      sortable: true,
      render: (value: CandidateStage) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {STAGE_LABELS[value]}
        </span>
      ),
    },
    {
      key: 'interviewRating',
      label: 'Rating',
      render: (value: Candidate['interviewRating']) => (
        <span className={getRatingBadgeClasses(value)}>{getRatingLabel(value)}</span>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      width: '25%',
      render: (_, row) => (
        <div className="max-w-xs">{renderNotesPreview(row.notes)}</div>
      ),
    },
    {
      key: 'currentOwner',
      label: 'Owner',
      render: (value: CandidateOwner | null) => (
        <span className="text-gray-700 capitalize">
          {value ? value.replace('_', ' ') : 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (_, row) => (
        <span className="text-gray-600">{row.source?.name || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 text-sm">{formatDate(value)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={(e) => {
              e.stopPropagation();
              openFeedbackModal({
                id: row.id,
                name: row.name,
                interviewRating: row.interviewRating,
                notes: row.notes,
              });
            }}
          >
            Feedback
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEditCandidate(row);
            }}
            aria-label={`Edit ${row.name}`}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmId(row.id);
            }}
            aria-label={`Delete ${row.name}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track candidate applications
          </p>
        </div>
        <Button variant="primary" onClick={handleNewCandidate}>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Candidate
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg" role="alert">
          {successMessage}
        </div>
      )}

      {/* Stage Summary */}
      <StageSummary
        stats={stats}
        isLoading={isStatsLoading}
        onOpenFeedback={(candidate) =>
          openFeedbackModal({
            id: candidate.id,
            name: candidate.name,
            interviewRating: candidate.interviewRating,
            notes: candidate.notes,
          })
        }
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg" role="alert">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Filter Presets */}
      <FilterPresets
        currentFilters={{
          search,
          currentStage: stageFilter || undefined,
          currentOwner: ownerFilter || undefined,
          sourceId: sourceFilter || undefined,
          minInterviewRating: passedOnly ? 1 : undefined,
          maxInterviewRating: passedOnly ? 2 : undefined,
          interviewRating: topPerformersOnly ? 1 : undefined,
          hasInterviewRating: noRatingOnly ? false : undefined,
        }}
        onApplyPreset={handleApplyPreset}
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <FormField
            label="Search"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* Stage Filter */}
          <Select
            label="Stage"
            options={stageOptions}
            value={stageFilter}
            onChange={(value) => {
              setStageFilter(value as CandidateStage | '');
              setCurrentPage(1);
            }}
          />

          {/* Owner Filter */}
          <Select
            label="Owner"
            options={ownerOptions}
            value={ownerFilter}
            onChange={(value) => {
              setOwnerFilter(value as CandidateOwner | '');
              setCurrentPage(1);
            }}
          />

          {/* Source Filter */}
          <Select
            label="Source"
            options={sourceFilterOptions}
            value={sourceFilter}
            onChange={(value) => {
              setSourceFilter(value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant={passedOnly ? 'success' : 'ghost'}
            size="sm"
            onClick={handleTogglePassedFilter}
          >
            {passedOnly ? 'Showing ratings 1–2' : 'Show ratings 1–2'}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedIds.size} candidate{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear Selection
            </Button>
            <Button variant="primary" onClick={() => setIsBulkModalOpen(true)}>
              Update Stage
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Select All Header */}
        {candidates.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === candidates.length && candidates.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
          </div>
        )}

        <DataTable
          columns={columns}
          data={candidates}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No candidates found"
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems: total,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCandidateId(null);
        }}
        title={editingCandidateId ? 'Edit Candidate' : 'New Candidate'}
        size="xl"
      >
        <CandidateForm
          candidateId={editingCandidateId}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingCandidateId(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteCandidate}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Update Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Update Stage"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsBulkModalOpen(false)}
              disabled={bulkUpdateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkUpdate}
              isLoading={bulkUpdateMutation.isPending}
            >
              Update {selectedIds.size} Candidate{selectedIds.size !== 1 ? 's' : ''}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Update the stage for {selectedIds.size} selected candidate{selectedIds.size !== 1 ? 's' : ''}:
          </p>
          <Select
            label="New Stage"
            options={bulkStageOptions}
            value={bulkStage}
            onChange={(value) => setBulkStage(value as CandidateStage)}
            required
          />
        </div>
      </Modal>

      <CandidateFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
        candidate={feedbackTarget}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={feedbackMutation.isPending}
        error={feedbackError || undefined}
      />
    </div>
  );
}
