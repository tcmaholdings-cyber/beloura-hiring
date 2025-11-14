import { useState, useEffect } from 'react';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';
import type { CreateReferrerInput, ReferrerWithStats } from '../../types';

interface ReferrerFormProps {
  initialData?: ReferrerWithStats;
  onSubmit: (data: CreateReferrerInput) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ReferrerForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReferrerFormProps) {
  const [formData, setFormData] = useState<CreateReferrerInput>({
    name: initialData?.name || '',
    externalId: initialData?.externalId || '',
    telegram: initialData?.telegram || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        externalId: initialData.externalId || '',
        telegram: initialData.telegram || '',
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

  const handleChange = (field: keyof CreateReferrerInput, value: string) => {
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
        placeholder="e.g., John Doe"
      />

      <FormField
        label="External ID"
        value={formData.externalId}
        onChange={(e) => handleChange('externalId', e.target.value)}
        error={errors.externalId}
        disabled={isSubmitting}
        placeholder="e.g., EXT-12345"
        helperText="Optional: External system identifier for integration"
      />

      <FormField
        label="Telegram"
        value={formData.telegram}
        onChange={(e) => handleChange('telegram', e.target.value)}
        error={errors.telegram}
        disabled={isSubmitting}
        placeholder="e.g., @username or +1234567890"
        helperText="Optional: Telegram username or phone number"
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
          {initialData ? 'Update Referrer' : 'Create Referrer'}
        </Button>
      </div>
    </form>
  );
}
