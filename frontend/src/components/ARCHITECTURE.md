# Component Architecture

## Component Hierarchy

```
Application
├── Layout (navigation + content wrapper)
│   ├── Navigation
│   └── Outlet (page content)
│       ├── Dashboard
│       ├── Candidates
│       │   ├── DataTable
│       │   │   ├── LoadingSpinner (if loading)
│       │   │   ├── EmptyList (if empty)
│       │   │   └── Table rows
│       │   ├── Button (Add Candidate)
│       │   └── Modal (Add/Edit)
│       │       ├── FormField
│       │       ├── Select
│       │       └── Button (Save/Cancel)
│       ├── Sources
│       ├── Referrers
│       └── Users
└── Modal System (overlays)
    ├── Modal (generic forms)
    ├── ConfirmModal (deletions)
    └── LoadingOverlay (async operations)
```

## Component Dependencies

### Independent Components (no dependencies)
- `Button` - Can be used standalone
- `LoadingSpinner` - Self-contained
- `EmptyState` - Self-contained

### Composed Components (use other components)
- `FormField` - Standalone, but often used with Button
- `Select` - Standalone, but often used with Button
- `Modal` - Uses Button in footer
- `ConfirmModal` - Uses Modal + Button
- `DataTable` - Uses LoadingSpinner + EmptyState
- `EmptyList` - Uses Button for action
- `LoadingOverlay` - Uses LoadingSpinner

### Dependency Graph

```
Button (0 dependencies)
  ↑
  ├─ Modal
  ├─ ConfirmModal
  └─ EmptyList

LoadingSpinner (0 dependencies)
  ↑
  ├─ DataTable
  └─ LoadingOverlay

EmptyState (0 dependencies)
  ↑
  └─ DataTable

FormField (0 dependencies)

Select (0 dependencies)

Modal (depends on Button)
  ↑
  └─ ConfirmModal

DataTable (depends on LoadingSpinner, EmptyState)
```

## Component Composition Patterns

### Form Pattern
```tsx
<Modal>
  <form>
    <FormField />
    <FormField />
    <Select />
    <Button type="submit" />
  </form>
</Modal>
```

### List Pattern
```tsx
<div>
  <Button onClick={openAdd} />
  {isLoading ? (
    <LoadingSpinner />
  ) : data.length ? (
    <DataTable data={data} />
  ) : (
    <EmptyList onAdd={openAdd} />
  )}
</div>
```

### CRUD Pattern
```tsx
function EntityManager() {
  return (
    <>
      {/* List View */}
      <DataTable
        data={entities}
        onRowClick={handleEdit}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormOpen}>
        <FormField label="Name" />
        <Select label="Type" />
        <Button>Save</Button>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onConfirm={handleDelete}
      />
    </>
  );
}
```

## Data Flow Patterns

### Controlled Components
```tsx
function Form() {
  const [name, setName] = useState('');

  return (
    <FormField
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

### Uncontrolled with Ref
```tsx
function Form() {
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const value = nameRef.current?.value;
  };

  return <FormField ref={nameRef} />;
}
```

### Callback Pattern
```tsx
function List() {
  const handleRowClick = (row: Candidate) => {
    navigate(`/candidates/${row.id}`);
  };

  return (
    <DataTable
      data={candidates}
      onRowClick={handleRowClick}
    />
  );
}
```

## State Management Integration

### Component-Level State
```tsx
function AddCandidateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {/* Form fields */}
    </Modal>
  );
}
```

### Global State (Zustand)
```tsx
function CandidateList() {
  const { candidates, isLoading } = useCandidateStore();

  if (isLoading) return <LoadingPage />;

  return <DataTable data={candidates} />;
}
```

### API Integration
```tsx
function EntityManager() {
  const { data, isLoading, error } = useQuery('entities', fetchEntities);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState />;

  return <DataTable data={data} />;
}
```

## Styling Architecture

### Tailwind CSS Classes
All components use Tailwind utility classes:

```tsx
// Consistent spacing
className="px-4 py-2"  // Medium
className="px-3 py-1.5" // Small
className="px-6 py-3"  // Large

// Consistent colors
className="bg-blue-600 hover:bg-blue-700" // Primary
className="bg-red-600 hover:bg-red-700"   // Danger
className="text-gray-700"                 // Text

// Consistent borders
className="border border-gray-300 rounded-lg"
className="focus:ring-2 focus:ring-blue-500"
```

### Component Style Composition
```tsx
// Base styles (always applied)
const baseStyles = "font-semibold rounded-lg transition";

// Variant styles (conditionally applied)
const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700",
  danger: "bg-red-600 hover:bg-red-700",
};

// Final className
const className = `${baseStyles} ${variantStyles[variant]} ${customClass}`;
```

## Accessibility Architecture

### Focus Management
```
1. Modal Opens
   ↓
2. Focus trapped in modal
   ↓
3. Tab cycles through modal elements
   ↓
4. Escape closes modal
   ↓
5. Focus returns to trigger element
```

### ARIA Structure
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Title</h2>
  <div aria-describedby="modal-description">
    <p id="modal-description">Description</p>
  </div>
</div>
```

### Keyboard Navigation Flow
```
Tab → Button
  ↓
Enter → Opens Modal
  ↓
Tab → FormField 1
  ↓
Tab → FormField 2
  ↓
Tab → Button (Save)
  ↓
Escape → Closes Modal
  ↓
Focus → Original Button
```

## Performance Optimization

### Component Memoization
```tsx
// Expensive computation
const columns = useMemo(() => [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
], []);

// Callback memoization
const handleClick = useCallback((id: number) => {
  navigate(`/candidates/${id}`);
}, [navigate]);

// Component memoization
const MemoizedRow = memo(TableRow);
```

### Lazy Loading
```tsx
// Lazy load heavy components
const DataTable = lazy(() => import('./DataTable'));
const Modal = lazy(() => import('./Modal'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <DataTable data={data} />
</Suspense>
```

### Virtual Scrolling (future)
```tsx
// For large datasets
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTable({ data }) {
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  // Render only visible rows
}
```

## Testing Architecture

### Component Testing
```tsx
// Button.test.tsx
describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

### Integration Testing
```tsx
// CandidateList.test.tsx
describe('CandidateList', () => {
  it('displays candidates in table', async () => {
    render(<CandidateList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('opens modal on add button click', () => {
    render(<CandidateList />);
    fireEvent.click(screen.getByText('Add Candidate'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

## Error Handling Architecture

### Component Error Boundaries
```tsx
function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorState />}
      onError={(error) => logError(error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

### Form Validation Pattern
```tsx
function ValidatedForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField error={errors.name} />
      <FormField error={errors.email} />
    </form>
  );
}
```

## Component Lifecycle

### Mounting
```
1. Component rendered
   ↓
2. Props validated
   ↓
3. Event listeners attached
   ↓
4. Focus management initialized (Modal)
   ↓
5. Component visible to user
```

### Updating
```
1. Props change
   ↓
2. Re-render scheduled
   ↓
3. Memoization checks
   ↓
4. DOM updated
   ↓
5. Effects run (if dependencies changed)
```

### Unmounting
```
1. Component unmount initiated
   ↓
2. Cleanup functions run
   ↓
3. Event listeners removed
   ↓
4. Focus restored (Modal)
   ↓
5. Component removed from DOM
```

## Build & Bundle Architecture

### Component Tree Shaking
```tsx
// Efficient imports (tree-shakeable)
import { Button, FormField } from '@/components';

// Avoid (imports everything)
import * as Components from '@/components';
```

### Code Splitting
```tsx
// Route-based splitting
const CandidatesPage = lazy(() => import('./pages/Candidates'));
const SourcesPage = lazy(() => import('./pages/Sources'));

// Component-based splitting
const DataTable = lazy(() => import('@/components/DataTable'));
```

### Bundle Optimization
```
Component Bundle Sizes (gzipped):
- Button: ~1KB
- FormField: ~1.5KB
- Select: ~2KB
- LoadingSpinner: ~0.5KB
- EmptyState: ~1KB
- Modal: ~3KB
- DataTable: ~5KB

Total Component Library: ~15KB gzipped
```

## Deployment Checklist

✅ All components TypeScript strict mode compliant
✅ No console warnings or errors
✅ Accessibility audit passed
✅ Responsive design verified
✅ Cross-browser testing completed
✅ Documentation complete
✅ Examples working
✅ Performance benchmarks met
✅ Error boundaries in place
✅ Loading states handled

---

**Component Library Version**: 1.0.0
**Architecture Document Version**: 1.0.0
**Last Updated**: 2025-01-13
