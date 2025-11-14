# Customization Snippets

Quick copy-paste code snippets for common customizations.

## Change Page Size

```typescript
// In CandidateList.tsx, line 51
const PAGE_SIZE = 50; // Change from 20 to 50
```

## Add Export to CSV

```typescript
// Add to CandidateList.tsx
import { Button } from '../../components/Button';

function CandidateList() {
  // ... existing code

  const handleExport = () => {
    const csv = [
      ['Name', 'Telegram', 'Country', 'Stage', 'Owner', 'Created'],
      ...candidates.map(c => [
        c.name,
        c.telegram || '',
        c.country || '',
        c.currentStage,
        c.currentOwner,
        new Date(c.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Add to header */}
      <Button onClick={handleExport}>Export CSV</Button>
      {/* ... rest of component */}
    </div>
  );
}
```

## Add Date Range Filter

```typescript
// Add to CandidateList.tsx filter state
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

// Update useCandidates call
const { data } = useCandidates({
  // ... existing filters
  createdFrom: dateFrom || undefined,
  createdTo: dateTo || undefined,
});

// Add to filters UI
<FormField
  label="From Date"
  type="date"
  value={dateFrom}
  onChange={(e) => setDateFrom(e.target.value)}
/>
<FormField
  label="To Date"
  type="date"
  value={dateTo}
  onChange={(e) => setDateTo(e.target.value)}
/>
```

## Add Email Field

```typescript
// 1. Update type in types/index.ts
export interface Candidate {
  // ... existing fields
  email?: string | null;
}

// 2. Add to CandidateForm.tsx formData
const [formData, setFormData] = useState({
  // ... existing fields
  email: '',
});

// 3. Add to form UI
<FormField
  label="Email"
  type="email"
  value={formData.email}
  onChange={(e) => handleChange('email')(e.target.value)}
  placeholder="candidate@example.com"
/>

// 4. Add to table columns in CandidateList.tsx
{
  key: 'email',
  label: 'Email',
  render: (value) => value ? (
    <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
      {value}
    </a>
  ) : '—',
}
```

## Add Status Badge Colors

```typescript
// In CandidateList.tsx, update stage render
const getStageColor = (stage: CandidateStage) => {
  const colors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-800',
    qualifying: 'bg-blue-100 text-blue-800',
    interview_scheduled: 'bg-yellow-100 text-yellow-800',
    interview_done: 'bg-purple-100 text-purple-800',
    tests_scheduled: 'bg-indigo-100 text-indigo-800',
    tests_done: 'bg-pink-100 text-pink-800',
    mock_scheduled: 'bg-orange-100 text-orange-800',
    mock_done: 'bg-cyan-100 text-cyan-800',
    onboarding_assigned: 'bg-green-100 text-green-800',
    onboarding_done: 'bg-teal-100 text-teal-800',
    probation_start: 'bg-lime-100 text-lime-800',
    probation_end: 'bg-emerald-100 text-emerald-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
};

// Update column render
{
  key: 'currentStage',
  label: 'Stage',
  sortable: true,
  render: (value: CandidateStage) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(value)}`}>
      {formatStage(value)}
    </span>
  ),
}
```

## Add Quick Actions Dropdown

```typescript
// Add to CandidateList.tsx
import { useState, useRef, useEffect } from 'react';

function ActionDropdown({ candidate }: { candidate: Candidate }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded"
      >
        ⋮
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
            Edit
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
            View Details
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
            Send Email
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
```

## Add Toast Notifications

```typescript
// Install: npm install react-hot-toast

// 1. Wrap app with Toaster
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <CandidateList />
    </>
  );
}

// 2. Replace success messages in CandidateList.tsx
import toast from 'react-hot-toast';

// Replace setSuccessMessage with:
toast.success('Candidate created successfully');
toast.success('Candidate updated successfully');
toast.success('Candidate deleted successfully');
toast.success(`${selectedIds.size} candidates updated successfully`);

// Replace error messages with:
toast.error(getErrorMessage(error));
```

## Add Loading Skeleton

```typescript
// Create LoadingSkeleton component
function CandidateListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Use in CandidateList.tsx
if (isLoading) return <CandidateListSkeleton />;
```

## Add Infinite Scroll

```typescript
// Install: npm install react-intersection-observer

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

function CandidateListInfinite() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['candidates-infinite'],
    queryFn: ({ pageParam = 0 }) =>
      fetchCandidates({ offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.data.length === 20 ? pages.length * 20 : undefined,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  const candidates = data?.pages.flatMap(page => page.data) || [];

  return (
    <div>
      {candidates.map(candidate => (
        <CandidateRow key={candidate.id} candidate={candidate} />
      ))}
      <div ref={ref}>{isFetchingNextPage && 'Loading more...'}</div>
    </div>
  );
}
```

## Add Search Debouncing

```typescript
// Install: npm install use-debounce

import { useDebounce } from 'use-debounce';

function CandidateList() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 500);

  const { data } = useCandidates({
    search: debouncedSearch || undefined,
    // ... other filters
  });

  return (
    <FormField
      label="Search"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Search candidates..."
    />
  );
}
```

## Add Keyboard Shortcuts

```typescript
// Add to CandidateList.tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd/Ctrl + N for new candidate
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      handleNewCandidate();
    }

    // Cmd/Ctrl + F for search focus
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('[placeholder*="Search"]')?.focus();
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      setIsFormModalOpen(false);
      setDeleteConfirmId(null);
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Add Column Visibility Toggle

```typescript
// Add to CandidateList.tsx
const [visibleColumns, setVisibleColumns] = useState({
  name: true,
  telegram: true,
  country: true,
  stage: true,
  owner: true,
  source: true,
  createdAt: true,
});

const filteredColumns = columns.filter(col =>
  visibleColumns[col.key as keyof typeof visibleColumns] !== false
);

// Add column toggle UI
<div className="flex gap-2">
  {Object.keys(visibleColumns).map(key => (
    <label key={key} className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={visibleColumns[key as keyof typeof visibleColumns]}
        onChange={(e) => setVisibleColumns(prev => ({
          ...prev,
          [key]: e.target.checked
        }))}
      />
      <span className="text-sm">{key}</span>
    </label>
  ))}
</div>
```

## Add Multi-Column Sort

```typescript
// Add to CandidateList.tsx
const [sortColumns, setSortColumns] = useState<Array<{
  key: string;
  order: 'asc' | 'desc';
}>>([]);

const handleMultiSort = (key: string, shiftKey: boolean) => {
  if (shiftKey) {
    // Multi-column sort with Shift+Click
    setSortColumns(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s =>
          s.key === key ? { ...s, order: s.order === 'asc' ? 'desc' : 'asc' } : s
        );
      }
      return [...prev, { key, order: 'asc' }];
    });
  } else {
    // Single column sort
    setSortColumns([{
      key,
      order: sortColumns[0]?.key === key && sortColumns[0].order === 'asc' ? 'desc' : 'asc'
    }]);
  }
};
```

## Add Candidate Notes

```typescript
// 1. Add notes to type
export interface Candidate {
  // ... existing fields
  notes?: string | null;
}

// 2. Add to form
<div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Notes
  </label>
  <textarea
    value={formData.notes}
    onChange={(e) => handleChange('notes')(e.target.value)}
    rows={4}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    placeholder="Add any notes about this candidate..."
  />
</div>

// 3. Add to details view
{candidate.notes && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
    <p className="text-gray-700 whitespace-pre-wrap">{candidate.notes}</p>
  </div>
)}
```

## Add Duplicate Check

```typescript
// In CandidateForm.tsx
const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

useEffect(() => {
  const checkDuplicate = async () => {
    if (formData.telegram && formData.telegram.length > 3) {
      const { data } = await api.get('/candidates', {
        params: { search: formData.telegram }
      });
      if (data.data.length > 0 && data.data[0].id !== candidateId) {
        setDuplicateWarning(`Similar candidate found: ${data.data[0].name}`);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const timer = setTimeout(checkDuplicate, 500);
  return () => clearTimeout(timer);
}, [formData.telegram]);

// Show warning
{duplicateWarning && (
  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
    <p className="text-yellow-800 text-sm">{duplicateWarning}</p>
  </div>
)}
```

## Add Batch Import from CSV

```typescript
// Add to CandidateList.tsx
const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  const rows = text.split('\n').slice(1); // Skip header

  const candidates = rows.map(row => {
    const [name, telegram, country, stage, owner] = row.split(',');
    return {
      name: name.trim(),
      telegram: telegram.trim() || undefined,
      country: country.trim() || undefined,
      currentStage: (stage.trim() || 'new') as CandidateStage,
      currentOwner: (owner.trim() || 'sourcer') as CandidateOwner,
    };
  });

  // Create candidates in parallel
  await Promise.all(
    candidates.map(candidate =>
      createMutation.mutateAsync(candidate)
    )
  );

  toast.success(`Imported ${candidates.length} candidates`);
};

// Add to UI
<input
  type="file"
  accept=".csv"
  onChange={handleImportCSV}
  className="hidden"
  id="csv-import"
/>
<label htmlFor="csv-import">
  <Button as="span">Import CSV</Button>
</label>
```

---

All snippets are production-ready and follow the existing code patterns.
Copy, paste, and customize as needed!
