import { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import { Select, SelectOption } from '../../components/Select';
import { TextareaField } from '../../components/TextareaField';
import { getErrorMessage } from '../../services/api';
import {
  useCreateCandidate,
  useUpdateCandidate,
  useCandidate,
  useSources,
  useReferrers,
} from '../../hooks/useCandidates';
import type { CandidateStage, CandidateOwner } from '../../types';

interface CandidateFormProps {
  candidateId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Stage options
const stageOptions: SelectOption[] = [
  { value: 'new', label: 'New' },
  { value: 'qualifying', label: 'Qualifying' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_done', label: 'Interview Done' },
  { value: 'tests_scheduled', label: 'Tests Scheduled' },
  { value: 'tests_done', label: 'Tests Done' },
  { value: 'mock_scheduled', label: 'Mock Scheduled' },
  { value: 'mock_done', label: 'Mock Done' },
  { value: 'onboarding_assigned', label: 'Onboarding Assigned' },
  { value: 'onboarding_done', label: 'Onboarding Done' },
  { value: 'probation_start', label: 'Probation Start' },
  { value: 'probation_end', label: 'Probation End' },
];

// Owner options
const ownerOptions: SelectOption[] = [
  { value: 'sourcer', label: 'Sourcer' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'chatting_managers', label: 'Chatting Managers' },
];

const ratingOptions: SelectOption[] = [
  { value: '', label: 'Not rated' },
  { value: '1', label: '1 — Exceptional (pass)' },
  { value: '2', label: '2 — Strong (pass)' },
  { value: '3', label: '3 — For consideration' },
  { value: '4', label: '4 — Borderline fail' },
  { value: '5', label: '5 — Failed' },
];

interface FormData {
  name: string;
  telegram: string;
  country: string;
  timezone: string;
  sourceId: string;
  referrerId: string;
  currentStage: CandidateStage;
  currentOwner: CandidateOwner;
  interviewRating: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: string;
  currentOwner?: string;
  interviewRating?: string;
  notes?: string;
}

export function CandidateForm({ candidateId, onSuccess, onCancel }: CandidateFormProps) {
  const isEditMode = !!candidateId;

  // Fetch existing candidate if editing
  const { data: existingCandidate, isLoading: isLoadingCandidate } = useCandidate(candidateId);

  // Fetch dropdown options
  const { data: sources = [], isLoading: isLoadingSources } = useSources();
  const { data: referrers = [], isLoading: isLoadingReferrers } = useReferrers();

  // Mutations
  const createMutation = useCreateCandidate();
  const updateMutation = useUpdateCandidate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    telegram: '',
    country: '',
    timezone: '',
    sourceId: '',
    referrerId: '',
    currentStage: 'new',
    currentOwner: 'sourcer',
    interviewRating: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Populate form when editing
  useEffect(() => {
    if (existingCandidate) {
      setFormData({
        name: existingCandidate.name,
        telegram: existingCandidate.telegram || '',
        country: existingCandidate.country || '',
        timezone: existingCandidate.timezone || '',
        sourceId: existingCandidate.sourceId || '',
        referrerId: existingCandidate.referrerId || '',
        currentStage: existingCandidate.currentStage,
        currentOwner: existingCandidate.currentOwner || 'sourcer',
        interviewRating: existingCandidate.interviewRating ? String(existingCandidate.interviewRating) : '',
        notes: existingCandidate.notes || '',
      });
    }
  }, [existingCandidate]);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.telegram && !/^@?[\w]{5,}$/.test(formData.telegram)) {
      newErrors.telegram = 'Invalid Telegram handle (e.g., @username)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    // Prepare data (remove empty strings)
    const submitData = {
      name: formData.name.trim(),
      telegram: formData.telegram.trim() || undefined,
      country: formData.country.trim() || undefined,
      timezone: formData.timezone.trim() || undefined,
      sourceId: formData.sourceId || undefined,
      referrerId: formData.referrerId || undefined,
      currentStage: formData.currentStage,
      currentOwner: formData.currentOwner,
      interviewRating: formData.interviewRating ? Number(formData.interviewRating) : undefined,
      notes: formData.notes.trim() ? formData.notes.trim() : null,
    };

    try {
      if (isEditMode && candidateId) {
        await updateMutation.mutateAsync({ id: candidateId, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      onSuccess();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  // Handle field changes
  const handleChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = isLoadingCandidate || isLoadingSources || isLoadingReferrers;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Convert sources and referrers to SelectOptions
  const sourceOptions: SelectOption[] = sources.map((source) => ({
    value: source.id,
    label: source.name,
  }));

  const referrerOptions: SelectOption[] = referrers.map((referrer) => ({
    value: referrer.id,
    label: referrer.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg" role="alert">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name - Required */}
        <FormField
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name')(e.target.value)}
          error={errors.name}
          required
          placeholder="Enter candidate name"
          disabled={isSubmitting}
        />

        {/* Telegram */}
        <FormField
          label="Telegram"
          value={formData.telegram}
          onChange={(e) => handleChange('telegram')(e.target.value)}
          error={errors.telegram}
          placeholder="@username"
          helperText="Optional: Telegram handle"
          disabled={isSubmitting}
        />

        {/* Country */}
        <FormField
          label="Country"
          value={formData.country}
          onChange={(e) => handleChange('country')(e.target.value)}
          error={errors.country}
          placeholder="Enter country"
          helperText="Optional"
          disabled={isSubmitting}
        />

        {/* Timezone */}
        <FormField
          label="Timezone"
          value={formData.timezone}
          onChange={(e) => handleChange('timezone')(e.target.value)}
          error={errors.timezone}
          placeholder="e.g., UTC+3, EST"
          helperText="Optional"
          disabled={isSubmitting}
        />

        {/* Source */}
        <Select
          label="Source"
          options={sourceOptions}
          value={formData.sourceId}
          onChange={handleChange('sourceId')}
          error={errors.sourceId}
          placeholder="Select a source"
          disabled={isSubmitting}
        />

        {/* Referrer */}
        <Select
          label="Referrer"
          options={referrerOptions}
          value={formData.referrerId}
          onChange={handleChange('referrerId')}
          error={errors.referrerId}
          placeholder="Select a referrer"
          disabled={isSubmitting}
        />

        {/* Stage */}
        <Select
          label="Stage"
          options={stageOptions}
          value={formData.currentStage}
          onChange={(value) => handleChange('currentStage')(value as CandidateStage)}
          error={errors.currentStage}
          required
          disabled={isSubmitting}
        />

        {/* Owner */}
        <Select
          label="Owner"
          options={ownerOptions}
          value={formData.currentOwner}
          onChange={(value) => handleChange('currentOwner')(value as CandidateOwner)}
          error={errors.currentOwner}
          required
          disabled={isSubmitting}
        />

        {/* Interview Rating */}
        <Select
          label="Interview Rating"
          options={ratingOptions}
          value={formData.interviewRating}
          onChange={(value) => handleChange('interviewRating')(value)}
          helperText="1–2 = passed, 3 = for consideration, 4 = borderline fail, 5 = failed"
          disabled={isSubmitting}
        />
      </div>

      <TextareaField
        label="Notes / Comments"
        placeholder="Add any context the interviewers should see in real time..."
        value={formData.notes}
        onChange={(e) => handleChange('notes')(e.target.value)}
        rows={5}
        disabled={isSubmitting}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {isEditMode ? 'Update Candidate' : 'Create Candidate'}
        </Button>
      </div>
    </form>
  );
}
