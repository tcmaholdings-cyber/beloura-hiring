/**
 * Shared TypeScript types and interfaces for BELOURA HIRING components
 */

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

// Button Types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Form Field Types
export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

// Select Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

// Loading Spinner Types
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'white';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

// Empty State Types
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export interface NoResultsProps {
  searchTerm?: string;
  onClear?: () => void;
}

export interface EmptyListProps {
  entityName: string;
  onAdd?: () => void;
}

// Modal Types
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
}

// DataTable Types
export type ColumnAlignment = 'left' | 'center' | 'right';
export type SortOrder = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
  align?: ColumnAlignment;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  defaultSortKey?: string;
  defaultSortOrder?: SortOrder;
  pagination?: PaginationProps;
  className?: string;
}

// Common Utility Types
export type ValidationError = Record<string, string>;

export interface FormState<T> {
  values: T;
  errors: ValidationError;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

// API Response Types (for reference)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

// Component State Types
export interface ModalState {
  isOpen: boolean;
  mode: 'view' | 'add' | 'edit' | 'delete';
  selectedId: number | null;
}

export interface TableState<T> {
  data: T[];
  sortKey: string | null;
  sortOrder: SortOrder;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  filters: Record<string, any>;
}

// Event Handler Types
export type ChangeHandler<T = string> = (value: T) => void;
export type ClickHandler = () => void;
export type SubmitHandler = (e?: React.FormEvent) => void | Promise<void>;
export type AsyncHandler = () => Promise<void>;

// Filter and Sort Types
export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith';
  value: any;
}

export interface SortOption {
  field: string;
  order: SortOrder;
}

export interface TableFilters {
  search?: string;
  filters?: FilterOption[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

// Form Validation Types
export type Validator<T> = (value: T) => string | null;

export interface ValidationRule<T> {
  validator: Validator<T>;
  message: string;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// Component Composition Types
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: ReactNode;
}

export interface WithTestId {
  testId?: string;
}

export type ComponentProps<T = {}> = T & WithClassName & WithTestId;
