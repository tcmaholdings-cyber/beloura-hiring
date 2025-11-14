# Quick Component Reference

## Component Decision Tree

```
Need UI element?
├─ Interactive action → Button
├─ Text input → FormField
├─ Dropdown selection → Select
├─ Show loading → LoadingSpinner/LoadingOverlay/LoadingPage
├─ No data to show → EmptyState/NoResults/EmptyList
├─ Show dialog/form → Modal/ConfirmModal
└─ Display data → DataTable
```

## Quick Import Guide

```tsx
// Single import for all components
import {
  Button,
  FormField,
  Select,
  SelectOption,
  LoadingSpinner,
  LoadingOverlay,
  LoadingPage,
  EmptyState,
  NoResults,
  EmptyList,
  Modal,
  ConfirmModal,
  DataTable,
  Column,
} from '@/components';
```

## Component Cheat Sheet

### Button
```tsx
<Button variant="primary|secondary|danger|success|ghost"
        size="sm|md|lg"
        isLoading={boolean}
        fullWidth={boolean}
        leftIcon={ReactNode}
        rightIcon={ReactNode}>
  Text
</Button>
```

### FormField
```tsx
<FormField label="Field Name"
           error="Error message"
           helperText="Helper text"
           required={boolean}
           type="text|email|password|etc"
           value={value}
           onChange={handler} />
```

### Select
```tsx
<Select label="Field Name"
        options={[{value: '', label: ''}]}
        value={value}
        onChange={handler}
        error="Error message"
        required={boolean} />
```

### LoadingSpinner
```tsx
<LoadingSpinner size="sm|md|lg|xl"
                color="primary|secondary|white"
                label="Loading text" />

<LoadingOverlay label="Processing" />

<LoadingPage label="Loading application" />
```

### EmptyState
```tsx
<EmptyState title="Title"
            description="Description"
            icon={<Icon />}
            actionLabel="Button text"
            onAction={handler} />

<NoResults searchTerm={query} onClear={handler} />

<EmptyList entityName="Candidate" onAdd={handler} />
```

### Modal
```tsx
<Modal isOpen={boolean}
       onClose={handler}
       title="Modal Title"
       size="sm|md|lg|xl"
       footer={<Buttons />}>
  Content
</Modal>

<ConfirmModal isOpen={boolean}
              onClose={handler}
              onConfirm={handler}
              title="Confirm Title"
              message="Confirm message"
              confirmLabel="Yes"
              cancelLabel="No"
              variant="primary|danger"
              isLoading={boolean} />
```

### DataTable
```tsx
const columns: Column<T>[] = [
  { key: 'field', label: 'Label', sortable: true },
  { key: 'field2', label: 'Label 2', render: (val, row) => <Custom /> }
];

<DataTable columns={columns}
           data={data}
           keyExtractor={(row) => row.id}
           isLoading={boolean}
           onRowClick={(row) => handler(row)}
           defaultSortKey="field"
           pagination={{
             currentPage,
             totalPages,
             pageSize,
             totalItems,
             onPageChange
           }} />
```

## Common Use Cases

### Add/Edit Form
```tsx
function AddForm() {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Item">
      <form className="space-y-4">
        <FormField label="Name" required />
        <Select label="Type" options={options} required />
        <Button type="submit" fullWidth>Save</Button>
      </form>
    </Modal>
  );
}
```

### Delete Confirmation
```tsx
<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure? This cannot be undone."
  variant="danger"
/>
```

### List with Add
```tsx
function List() {
  if (isLoading) return <LoadingPage />;
  if (!data.length) return <EmptyList entityName="Item" onAdd={handleAdd} />;

  return (
    <div>
      <Button onClick={handleAdd}>Add Item</Button>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
```

### Search Results
```tsx
function SearchResults() {
  if (isLoading) return <LoadingSpinner />;
  if (!results.length && query) return <NoResults searchTerm={query} onClear={clearSearch} />;

  return <DataTable data={results} columns={columns} />;
}
```

## Keyboard Navigation

All components support keyboard interaction:

- **Button**: Space/Enter to activate
- **FormField**: Standard input navigation
- **Select**: Arrow keys, Enter to select
- **Modal**: Escape to close, Tab to cycle focus
- **DataTable**: Tab through controls, Enter on sort buttons

## Accessibility Features

- Proper ARIA labels and roles
- Screen reader announcements
- Focus management
- Keyboard navigation
- Error state announcements
- Loading state communication
- Semantic HTML structure

## Performance Tips

1. **Memoize table columns**: Define columns outside component or use useMemo
2. **Debounce searches**: Delay API calls for search inputs
3. **Lazy load modals**: Only render modal content when open
4. **Virtual scrolling**: For tables with 100+ rows, implement virtualization
5. **Optimize renders**: Use React.memo for list items

## Common Gotchas

1. **FormField value**: Must be controlled (provide value and onChange)
2. **Select onChange**: Receives value string, not event
3. **Modal focus**: Automatically manages focus, don't manually focus
4. **DataTable keyExtractor**: Must return unique string/number per row
5. **Button type**: Defaults to "button", use type="submit" in forms

## Browser DevTools Testing

### Check Accessibility
```javascript
// Chrome DevTools Console
// Lighthouse audit for accessibility
// Elements tab → Accessibility tree view
```

### Test Keyboard Navigation
1. Tab through all interactive elements
2. Test modal with Tab and Escape
3. Sort table columns with keyboard
4. Submit forms with Enter

### Screen Reader Testing
- VoiceOver (macOS): Cmd+F5
- NVDA (Windows): Free download
- Verify all labels are read
- Check error announcements
- Test loading states

## Design Tokens

```css
/* Colors */
--color-primary: #2563eb (blue-600)
--color-secondary: #4b5563 (gray-600)
--color-danger: #dc2626 (red-600)
--color-success: #059669 (green-600)

/* Spacing */
--spacing-sm: 0.375rem 0.75rem
--spacing-md: 0.5rem 1rem
--spacing-lg: 0.75rem 1.5rem

/* Borders */
--border-radius: 0.5rem (rounded-lg)
--focus-ring: 2px solid blue-500
```

## Component Status

| Component | Status | Tested | Documented |
|-----------|--------|--------|------------|
| Button | ✅ Complete | ✅ Yes | ✅ Yes |
| FormField | ✅ Complete | ✅ Yes | ✅ Yes |
| Select | ✅ Complete | ✅ Yes | ✅ Yes |
| LoadingSpinner | ✅ Complete | ✅ Yes | ✅ Yes |
| EmptyState | ✅ Complete | ✅ Yes | ✅ Yes |
| Modal | ✅ Complete | ✅ Yes | ✅ Yes |
| DataTable | ✅ Complete | ✅ Yes | ✅ Yes |

## Version

Component Library v1.0.0 - BELOURA HIRING
Last Updated: 2025-01-13
