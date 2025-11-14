# Candidate Management System - Implementation Guide

## Overview
Complete, production-ready Candidate Management system with real-time data fetching, filtering, pagination, and bulk operations.

## Files Created

### 1. Hooks - `/src/hooks/useCandidates.ts`
React Query hooks for data management with automatic caching and cache invalidation:

**Hooks:**
- `useCandidates(filters)` - Fetch paginated candidates with filters
- `useCandidate(id)` - Fetch single candidate
- `useCreateCandidate()` - Create mutation with cache invalidation
- `useUpdateCandidate()` - Update mutation with cache invalidation
- `useDeleteCandidate()` - Delete mutation with cache invalidation
- `useBulkUpdateCandidates()` - Bulk stage update
- `useSources()` - Fetch sources for dropdown
- `useReferrers()` - Fetch referrers for dropdown

**Features:**
- Automatic cache invalidation on mutations
- Optimistic updates support
- 5-minute cache for list data
- 10-minute cache for dropdown data
- Error handling with proper error messages

### 2. Form Component - `/src/pages/Candidates/CandidateForm.tsx`
Full-featured form with validation and error handling:

**Features:**
- Create and Edit modes
- Real-time validation
- Required fields: name, stage, owner
- Optional fields: telegram, country, timezone, source, referrer
- Telegram format validation
- Success/error message display
- Loading states during submission
- Auto-populated dropdowns from API

**Fields:**
- Name (required, min 2 characters)
- Telegram (optional, format: @username)
- Country (optional)
- Timezone (optional)
- Source (dropdown from API)
- Referrer (dropdown from API)
- Stage (dropdown, 12 stages)
- Owner (dropdown, 3 roles)

### 3. List Component - `/src/pages/Candidates/CandidateList.tsx`
Complete candidate management interface:

**Features:**
- Data table with sorting
- Pagination (20 per page)
- Search by name
- Filter by stage, owner, source
- Bulk select (select all/individual)
- Bulk stage update
- Edit and delete actions per row
- Success/error notifications
- Responsive design

**Columns:**
- Select checkbox
- Name (sortable)
- Telegram
- Country
- Stage (with badge)
- Owner
- Source
- Created date (sortable)
- Actions (Edit/Delete)

## API Integration

### Base URL
```typescript
const API_URL = 'http://localhost:3001/api/v1';
```

### Endpoints Used
```
GET    /candidates?search=&currentStage=&currentOwner=&sourceId=&limit=20&offset=0
GET    /candidates/:id
POST   /candidates
PATCH  /candidates/:id
DELETE /candidates/:id
PATCH  /candidates/bulk/stages
GET    /sources
GET    /referrers
```

### Authentication
Automatically includes Bearer token from localStorage:
```typescript
Authorization: Bearer {accessToken}
```

## Usage Examples

### 1. Basic Integration in App Router
```typescript
import { CandidateList } from './pages/Candidates';

function App() {
  return (
    <Routes>
      <Route path="/candidates" element={<CandidateList />} />
    </Routes>
  );
}
```

### 2. With Layout Wrapper
```typescript
import { CandidateList } from './pages/Candidates';
import { Layout } from './components/Layout';

function CandidatesPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CandidateList />
      </div>
    </Layout>
  );
}
```

### 3. Direct Hook Usage (Custom Implementation)
```typescript
import { useCandidates, useCreateCandidate } from './hooks/useCandidates';

function MyComponent() {
  const { data, isLoading } = useCandidates({
    search: 'John',
    currentStage: 'qualifying',
    limit: 10
  });

  const createMutation = useCreateCandidate();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name: 'Jane Doe',
      telegram: '@janedoe',
      currentStage: 'new',
      currentOwner: 'sourcer'
    });
  };
}
```

## Features Breakdown

### Search & Filters
- **Search**: Real-time search by candidate name
- **Stage Filter**: Filter by any of 12 pipeline stages
- **Owner Filter**: Filter by sourcer, interviewer, or chatting managers
- **Source Filter**: Filter by recruitment source
- All filters work together and reset pagination

### Bulk Operations
1. Select individual candidates using checkboxes
2. Use "Select All" to select all on current page
3. Click "Update Stage" to bulk update selected candidates
4. Choose new stage from modal
5. Confirm to apply changes to all selected

### Form Validation
- **Name**: Required, minimum 2 characters
- **Telegram**: Optional, validates format (@username or username)
- **Other fields**: Optional text inputs
- **Dropdowns**: Populated from API, pre-selected defaults

### Error Handling
- Network errors display at page level
- Validation errors display below each field
- Mutation errors show in forms
- Automatic retry for failed requests
- Token refresh on 401 errors

### Success Feedback
- Green notification on successful create/update/delete
- Auto-dismiss after 3 seconds
- Shows count for bulk updates

## Customization

### Change Page Size
```typescript
// In CandidateList.tsx
const PAGE_SIZE = 20; // Change to desired size
```

### Add New Filters
```typescript
// Add to filter state
const [customFilter, setCustomFilter] = useState('');

// Pass to useCandidates
const { data } = useCandidates({
  ...existingFilters,
  customFilter: customFilter || undefined
});
```

### Customize Table Columns
```typescript
// In CandidateList.tsx columns array
const columns: Column<Candidate>[] = [
  // Add new column
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    render: (value) => <a href={`mailto:${value}`}>{value}</a>
  },
  ...existingColumns
];
```

### Add Custom Validation
```typescript
// In CandidateForm.tsx validate function
if (formData.email && !isValidEmail(formData.email)) {
  newErrors.email = 'Invalid email format';
}
```

## Performance Optimizations

### React Query Caching
- List queries cached for 5 minutes
- Detail queries cached indefinitely (until mutation)
- Dropdown data cached for 10 minutes
- Automatic background refetch

### Optimistic Updates (Optional)
```typescript
const updateMutation = useUpdateCandidate({
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: candidateKeys.lists() });

    // Snapshot previous value
    const previous = queryClient.getQueryData(candidateKeys.list(filters));

    // Optimistically update
    queryClient.setQueryData(candidateKeys.list(filters), (old) => {
      // Update logic
    });

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(candidateKeys.list(filters), context.previous);
  }
});
```

### Pagination Best Practices
- Uses offset-based pagination
- Fetches only 20 records at a time
- Page state resets on filter changes
- Total count tracked for pagination UI

## Testing

### Manual Testing Checklist
- [ ] Create new candidate with all fields
- [ ] Create candidate with only required fields
- [ ] Edit existing candidate
- [ ] Delete candidate (with confirmation)
- [ ] Search by name (partial match)
- [ ] Filter by stage
- [ ] Filter by owner
- [ ] Filter by source
- [ ] Combine multiple filters
- [ ] Select individual candidates
- [ ] Select all candidates on page
- [ ] Bulk update stages
- [ ] Navigate pagination
- [ ] Sort by name, stage, created date
- [ ] Verify validation errors
- [ ] Test with network errors
- [ ] Test with empty results

### Integration Test Example
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CandidateList } from './CandidateList';

test('displays candidates and allows filtering', async () => {
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <CandidateList />
    </QueryClientProvider>
  );

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  // Test filtering
  const stageFilter = screen.getByLabelText('Stage');
  fireEvent.change(stageFilter, { target: { value: 'qualifying' } });

  await waitFor(() => {
    // Assert filtered results
  });
});
```

## Troubleshooting

### Common Issues

**1. No data loading**
- Check API is running on http://localhost:3001
- Verify network requests in DevTools
- Check authentication token in localStorage
- Review console for error messages

**2. Filters not working**
- Ensure backend API supports query parameters
- Check filter values are passed correctly
- Verify pagination resets on filter change

**3. Create/Edit not saving**
- Check validation errors
- Review network request payload
- Verify API endpoint and method
- Check authentication token

**4. Bulk update not working**
- Ensure candidates are selected
- Check bulk update endpoint format
- Verify candidateIds array structure

**5. TypeScript errors**
- Run `npm run type-check`
- Verify types match API response
- Check import paths

## Environment Variables

Required in `.env`:
```bash
VITE_API_URL=http://localhost:3001/api/v1
```

## Dependencies Used
- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client
- `react-router-dom` - Routing (if needed)
- `react` & `react-dom` - Core React

## File Structure
```
src/
├── hooks/
│   └── useCandidates.ts          # React Query hooks
├── pages/
│   └── Candidates/
│       ├── CandidateList.tsx     # Main list component
│       ├── CandidateForm.tsx     # Form component
│       └── index.tsx             # Exports
├── components/
│   ├── Modal.tsx                 # Modal wrapper
│   ├── DataTable.tsx             # Table component
│   ├── Button.tsx                # Button component
│   ├── FormField.tsx             # Input component
│   └── Select.tsx                # Dropdown component
├── services/
│   └── api.ts                    # Axios instance
└── types/
    └── index.ts                  # TypeScript types
```

## Next Steps

### Recommended Enhancements
1. **Export to CSV**: Add export functionality for filtered results
2. **Advanced Filters**: Date range filters, multiple stage selection
3. **Candidate Details Page**: Full view with history and notes
4. **Activity Timeline**: Track stage changes and updates
5. **File Uploads**: Resume/CV attachment support
6. **Email Integration**: Send emails to candidates
7. **Notes System**: Add comments and notes to candidates
8. **Duplicate Detection**: Check for existing candidates
9. **Import from CSV**: Bulk candidate import
10. **Dashboard Stats**: Visual metrics and charts

### Security Considerations
- All API calls include authentication
- Token refresh handled automatically
- CSRF protection (if needed)
- Input sanitization on backend
- Rate limiting on bulk operations

## Support
For issues or questions:
1. Check browser console for errors
2. Review network tab in DevTools
3. Verify API responses match expected format
4. Check React Query DevTools for cache state
5. Review this documentation

## License
Part of BELOURA HIRING system - Internal use only
