import { useState, useEffect } from 'react';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';
import type { CreateSourceInput, SourceWithStats } from '../../types';

interface SourceFormProps {
  initialData?: SourceWithStats;
  onSubmit: (data: CreateSourceInput) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SourceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SourceFormProps) {
  const [formData, setFormData] = useState<CreateSourceInput>({
    name: initialData?.name || '',
    type: initialData?.type || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type || '',
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateSourceInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        disabled={isSubmitting}
        placeholder="e.g., LinkedIn, Indeed, Referral"
      />

      <FormField
        label="Type"
        value={formData.type}
        onChange={(e) => handleChange('type', e.target.value)}
        error={errors.type}
        disabled={isSubmitting}
        placeholder="e.g., Job Board, Social Media, Recruitment Agency"
        helperText="Optional: Categorize your sources for better organization"
      />

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update Source' : 'Create Source'}
        </Button>
      </div>
    </form>
  );
}
