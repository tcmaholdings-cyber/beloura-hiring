import { useState, useEffect } from 'react';
import { FormField } from '../../components/FormField';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import type { User, UserRole } from '../../types';
import type { CreateUserInput, UpdateUserInput } from '../../hooks/useUsers';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: User;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const roleOptions = [
  { value: 'sourcer', label: 'Sourcer' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'chatting_managers', label: 'Chatting Managers' },
];

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export function UserForm({ mode, initialData, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: '' as UserRole | '',
    isActive: 'true',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        username: initialData.username || '',
        password: '',
        role: initialData.role,
        isActive: String(initialData.isActive),
      });
    }
  }, [mode, initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (mode === 'edit' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (mode === 'create') {
        const createData: CreateUserInput = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || undefined,
          password: formData.password,
          role: formData.role as UserRole,
          isActive: formData.isActive === 'true',
        };
        await onSubmit(createData);
      } else {
        const updateData: UpdateUserInput = {
          name: formData.name.trim(),
          username: formData.username.trim() || undefined,
          role: formData.role as UserRole,
          isActive: formData.isActive === 'true',
        };

        // Only include password if it was provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await onSubmit(updateData);
      }
    } catch (error) {
      // Error is handled by the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
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
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        disabled={isLoading}
        placeholder="John Doe"
      />

      <FormField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        required
        disabled={isLoading || mode === 'edit'}
        placeholder="john.doe@example.com"
        helperText={mode === 'edit' ? 'Email cannot be changed' : undefined}
      />

      <FormField
        label="Username"
        type="text"
        value={formData.username}
        onChange={(e) => handleChange('username', e.target.value)}
        error={errors.username}
        disabled={isLoading}
        placeholder="johndoe (optional)"
        helperText="Optional username for login"
      />

      <FormField
        label={mode === 'create' ? 'Password' : 'New Password'}
        type="password"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={errors.password}
        required={mode === 'create'}
        disabled={isLoading}
        placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current'}
        helperText={
          mode === 'edit'
            ? 'Leave blank to keep current password'
            : 'Must be at least 6 characters'
        }
      />

      <Select
        label="Role"
        options={roleOptions}
        value={formData.role}
        onChange={(value) => handleChange('role', value)}
        error={errors.role}
        required
        disabled={isLoading}
        placeholder="Select role"
      />

      <Select
        label="Status"
        options={statusOptions}
        value={formData.isActive}
        onChange={(value) => handleChange('isActive', value)}
        disabled={isLoading}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {mode === 'create' ? 'Create User' : 'Update User'}
        </Button>
      </div>
    </form>
  );
}
