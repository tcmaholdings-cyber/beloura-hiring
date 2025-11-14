# BELOURA HIRING UI Components

Comprehensive, accessible, and reusable React component library built with TypeScript and Tailwind CSS.

## Design Principles

- **Accessibility First**: WCAG 2.1 AA compliant with ARIA labels and keyboard navigation
- **TypeScript**: Fully typed with proper prop interfaces
- **Responsive**: Mobile-first design patterns
- **Consistent**: Follows established design patterns from Login.tsx and Layout.tsx
- **Composable**: Components work together seamlessly

## Component Overview

### Button (`Button.tsx`)

Versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean - Shows loading spinner
- `fullWidth`: boolean - Takes full container width
- `leftIcon`: ReactNode - Icon before text
- `rightIcon`: ReactNode - Icon after text
- All standard button HTML attributes

**Usage:**
```tsx
import { Button } from '@/components';

<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

<Button variant="danger" isLoading>
  Deleting...
</Button>

<Button leftIcon={<AddIcon />} size="lg">
  Add Candidate
</Button>
```

**Variants:**
- `primary`: Blue background (main actions)
- `secondary`: Gray background (secondary actions)
- `danger`: Red background (destructive actions)
- `success`: Green background (confirmation actions)
- `ghost`: Transparent background (subtle actions)

---

### FormField (`FormField.tsx`)

Text input field with label, error, and helper text support.

**Props:**
- `label`: string (required) - Field label
- `error`: string - Error message (shows red state)
- `helperText`: string - Helper text below input
- `required`: boolean - Shows required indicator
- `fullWidth`: boolean (default: true)
- All standard input HTML attributes

**Usage:**
```tsx
import { FormField } from '@/components';

<FormField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  helperText="Enter your work email"
  required
/>
```

**Accessibility:**
- Automatic ID generation
- Proper label association
- Error announcement via aria-invalid
- Helper text linked with aria-describedby
- Required indicator with aria-label

---

### Select (`Select.tsx`)

Dropdown select component with label, error, and helper text.

**Props:**
- `label`: string (required) - Field label
- `options`: SelectOption[] (required) - Dropdown options
- `error`: string - Error message
- `helperText`: string - Helper text
- `placeholder`: string (default: 'Select an option')
- `required`: boolean
- `fullWidth`: boolean (default: true)
- `onChange`: (value: string) => void - Value change handler

**SelectOption Interface:**
```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { Select, SelectOption } from '@/components';

const stageOptions: SelectOption[] = [
  { value: 'new', label: 'New' },
  { value: 'qualifying', label: 'Qualifying' },
  { value: 'interview', label: 'Interview', disabled: true },
];

<Select
  label="Candidate Stage"
  options={stageOptions}
  value={stage}
  onChange={setStage}
  required
/>
```

---

### LoadingSpinner (`LoadingSpinner.tsx`)

Loading indicators with multiple sizes and variants.

**Components:**
1. `LoadingSpinner` - Inline spinner
2. `LoadingOverlay` - Full-screen overlay with spinner
3. `LoadingPage` - Full-page loading state

**LoadingSpinner Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'primary' | 'secondary' | 'white' (default: 'primary')
- `label`: string (default: 'Loading') - Screen reader text

**Usage:**
```tsx
import { LoadingSpinner, LoadingOverlay, LoadingPage } from '@/components';

// Inline spinner
<LoadingSpinner size="md" />

// Full-screen overlay
{isProcessing && <LoadingOverlay label="Saving changes" />}

// Full-page loading
if (isInitialLoad) return <LoadingPage label="Loading application" />;
```

**Accessibility:**
- role="status" with aria-live="polite"
- Screen reader text via sr-only
- Proper loading announcements

---

### EmptyState (`EmptyState.tsx`)

Placeholder components for empty data states.

**Components:**
1. `EmptyState` - Generic empty state with customization
2. `NoResults` - No search results variant
3. `EmptyList` - Empty list variant with add action

**EmptyState Props:**
- `title`: string (required) - Main heading
- `description`: string - Descriptive text
- `icon`: ReactNode - Custom icon
- `actionLabel`: string - Button text
- `onAction`: () => void - Button click handler

**Usage:**
```tsx
import { EmptyState, NoResults, EmptyList } from '@/components';

// Generic empty state
<EmptyState
  title="No notifications"
  description="You're all caught up!"
  icon={<BellIcon />}
/>

// No search results
<NoResults
  searchTerm={searchQuery}
  onClear={() => setSearchQuery('')}
/>

// Empty list with add action
<EmptyList
  entityName="Candidate"
  onAdd={() => setShowAddModal(true)}
/>
```

---

### Modal (`Modal.tsx`)

Accessible modal dialogs with focus management.

**Components:**
1. `Modal` - Generic modal with custom content
2. `ConfirmModal` - Confirmation dialog variant

**Modal Props:**
- `isOpen`: boolean (required) - Modal visibility
- `onClose`: () => void (required) - Close handler
- `title`: string (required) - Modal title
- `children`: ReactNode (required) - Modal content
- `footer`: ReactNode - Custom footer (buttons)
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)

**ConfirmModal Props:**
- `isOpen`, `onClose`, `title`: Same as Modal
- `message`: string (required) - Confirmation message
- `onConfirm`: () => void (required) - Confirm handler
- `confirmLabel`: string (default: 'Confirm')
- `cancelLabel`: string (default: 'Cancel')
- `variant`: 'primary' | 'danger' (default: 'danger')
- `isLoading`: boolean - Shows loading state

**Usage:**
```tsx
import { Modal, ConfirmModal, Button } from '@/components';

// Generic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Candidate"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>Save</Button>
    </>
  }
>
  <form>{/* Form fields */}</form>
</Modal>

// Confirmation modal
<ConfirmModal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDelete}
  title="Delete Candidate"
  message="Are you sure you want to delete this candidate? This action cannot be undone."
  confirmLabel="Yes, delete"
  variant="danger"
  isLoading={isDeleting}
/>
```

**Accessibility:**
- Focus trap within modal
- Focus restoration on close
- Escape key to close
- role="dialog" with aria-modal
- Body scroll lock when open
- aria-labelledby for title

---

### DataTable (`DataTable.tsx`)

Feature-rich data table with sorting, pagination, and custom rendering.

**Props:**
- `columns`: Column<T>[] (required) - Column definitions
- `data`: T[] (required) - Table data
- `keyExtractor`: (row: T) => string | number (required)
- `isLoading`: boolean - Shows loading state
- `emptyMessage`: string - Empty state message
- `onRowClick`: (row: T) => void - Row click handler
- `defaultSortKey`: string - Initial sort column
- `defaultSortOrder`: 'asc' | 'desc' (default: 'asc')
- `pagination`: PaginationProps - Pagination config

**Column Interface:**
```typescript
interface Column<T> {
  key: string;              // Data key
  label: string;            // Column header
  sortable?: boolean;       // Enable sorting
  render?: (value: any, row: T) => ReactNode; // Custom cell render
  width?: string;           // Column width
  align?: 'left' | 'center' | 'right'; // Text alignment
}
```

**Pagination Interface:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
```

**Usage:**
```tsx
import { DataTable, Column } from '@/components';

interface Candidate {
  id: number;
  name: string;
  email: string;
  stage: string;
  created_at: string;
}

const columns: Column<Candidate>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'stage',
    label: 'Stage',
    sortable: true,
    render: (value) => (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {value}
      </span>
    ),
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

<DataTable
  columns={columns}
  data={candidates}
  keyExtractor={(row) => row.id.toString()}
  isLoading={isLoading}
  onRowClick={(row) => navigate(`/candidates/${row.id}`)}
  defaultSortKey="name"
  pagination={{
    currentPage: page,
    totalPages: Math.ceil(totalItems / pageSize),
    pageSize,
    totalItems,
    onPageChange: setPage,
  }}
/>
```

**Features:**
- Client-side sorting with visual indicators
- Custom cell rendering with full TypeScript support
- Pagination with page controls
- Row click handlers for navigation
- Loading and empty states
- Responsive design with horizontal scroll
- Keyboard accessible sorting

**Accessibility:**
- Sortable columns have button role
- Sort state announced via aria-label
- Pagination with proper aria-labels
- Current page marked with aria-current
- Table semantics with proper scope

---

## Common Patterns

### Form with Validation

```tsx
import { FormField, Select, Button } from '@/components';

function CandidateForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Validation logic
    if (!name) setErrors(prev => ({ ...prev, name: 'Name is required' }));
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <Select
        label="Stage"
        options={stageOptions}
        value={stage}
        onChange={setStage}
        error={errors.stage}
        required
      />

      <Button type="submit" fullWidth>
        Add Candidate
      </Button>
    </form>
  );
}
```

### Modal Form Pattern

```tsx
import { Modal, Button, FormField } from '@/components';

function AddCandidateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitCandidate();
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Candidate</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Candidate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Save
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <FormField label="Name" required />
          <FormField label="Email" type="email" required />
        </form>
      </Modal>
    </>
  );
}
```

### Table with Actions

```tsx
import { DataTable, Column, Button } from '@/components';

const columns: Column<Candidate>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'id',
    label: 'Actions',
    align: 'right',
    render: (id, row) => (
      <div className="flex gap-2 justify-end">
        <Button size="sm" onClick={() => handleEdit(row)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(id)}>
          Delete
        </Button>
      </div>
    ),
  },
];
```

### Loading States

```tsx
import { LoadingSpinner, LoadingPage } from '@/components';

function DataView() {
  const { data, isLoading, error } = useQuery();

  // Initial page load
  if (isLoading && !data) {
    return <LoadingPage label="Loading candidates" />;
  }

  // Error state
  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <div>
      <h1>Candidates</h1>

      {/* Inline loading for updates */}
      {isLoading && <LoadingSpinner />}

      <DataTable data={data} columns={columns} />
    </div>
  );
}
```

## Styling Guidelines

All components use Tailwind CSS with consistent design tokens:

**Colors:**
- Primary: Blue (blue-600, blue-700)
- Secondary: Gray (gray-600, gray-700)
- Danger: Red (red-600, red-700)
- Success: Green (green-600, green-700)

**Spacing:**
- Small: px-3 py-1.5
- Medium: px-4 py-2
- Large: px-6 py-3

**Shadows:**
- Card: shadow-xl
- Modal: shadow-xl
- Table: shadow

**Borders:**
- Radius: rounded-lg
- Color: border-gray-300
- Focus ring: ring-2 ring-blue-500

## TypeScript Usage

All components are fully typed with proper prop interfaces:

```tsx
// Import with types
import { Button, FormField, Column } from '@/components';
import type { SelectOption } from '@/components';

// Define data types
interface Candidate {
  id: number;
  name: string;
  email: string;
}

// Use with TypeScript generics
const columns: Column<Candidate>[] = [
  { key: 'name', label: 'Name' }
];

<DataTable<Candidate>
  columns={columns}
  data={candidates}
  keyExtractor={(row) => row.id}
/>
```

## Testing Components

All components include proper ARIA attributes for testing:

```tsx
// Testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { Button } from '@/components';

test('button renders with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
});

test('loading state', () => {
  render(<Button isLoading>Submit</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
});
```

## Best Practices

1. **Always provide labels**: Use label props for form fields and selects
2. **Handle loading states**: Use isLoading props to prevent double submissions
3. **Validate inputs**: Show error messages using error props
4. **Use TypeScript**: Define proper interfaces for table columns and select options
5. **Keyboard navigation**: All components support keyboard interaction
6. **Focus management**: Modals handle focus properly
7. **Responsive design**: All components work on mobile and desktop

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All components are tested for accessibility with screen readers (NVDA, JAWS, VoiceOver).
