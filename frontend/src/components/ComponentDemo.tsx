/**
 * Component Demo and Usage Examples
 *
 * This file demonstrates all BELOURA HIRING UI components.
 * Use this as a reference for implementing features.
 */

import { useState } from 'react';
import {
  Button,
  FormField,
  Select,
  SelectOption,
  LoadingSpinner,
  LoadingOverlay,
  EmptyState,
  EmptyList,
  NoResults,
  Modal,
  ConfirmModal,
  DataTable,
  Column,
} from './index';

// Example data for DataTable
interface ExampleCandidate {
  id: number;
  name: string;
  email: string;
  stage: string;
  status: string;
}

const exampleData: ExampleCandidate[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', stage: 'Interview', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', stage: 'Qualifying', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', stage: 'Tests', status: 'Pending' },
];

export function ComponentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [formValue, setFormValue] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);

  const selectOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  const tableColumns: Column<ExampleCandidate>[] = [
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsConfirmOpen(false);
      alert('Action confirmed!');
    }, 2000);
  };

  const handleLoadingDemo = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Component Library</h1>
        <p className="text-gray-600">BELOURA HIRING UI Components Showcase</p>
      </header>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Buttons</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button isLoading>Loading Button</Button>
            <Button disabled>Disabled Button</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<span>🚀</span>}>With Left Icon</Button>
            <Button rightIcon={<span>→</span>}>With Right Icon</Button>
          </div>

          <Button fullWidth>Full Width Button</Button>
        </div>
      </section>

      {/* Form Fields */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Form Fields</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <FormField
            label="Name"
            placeholder="Enter your name"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            required
          />

          <FormField
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            helperText="We'll never share your email"
          />

          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            error="Password must be at least 8 characters"
          />

          <FormField
            label="Disabled Field"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </section>

      {/* Select Dropdowns */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Dropdowns</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <Select
            label="Choose an option"
            options={selectOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            required
          />

          <Select
            label="With helper text"
            options={selectOptions}
            helperText="Select the option that best fits"
          />

          <Select
            label="With error"
            options={selectOptions}
            error="This field is required"
          />

          <Select
            label="Disabled select"
            options={selectOptions}
            disabled
          />
        </div>
      </section>

      {/* Loading Spinners */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Loading Spinners</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sizes</h3>
            <div className="flex items-center gap-6">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Colors</h3>
            <div className="flex items-center gap-6">
              <LoadingSpinner color="primary" />
              <LoadingSpinner color="secondary" />
              <div className="bg-blue-600 p-4 rounded">
                <LoadingSpinner color="white" />
              </div>
            </div>
          </div>

          <Button onClick={handleLoadingDemo}>Show Loading Overlay</Button>
        </div>
      </section>

      {/* Empty States */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Empty States</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          <EmptyState
            title="No data available"
            description="There is currently no data to display. Try adjusting your filters."
            actionLabel="Reset Filters"
            onAction={() => alert('Filters reset')}
          />

          <NoResults searchTerm="example search" onClear={() => alert('Search cleared')} />

          <EmptyList entityName="Candidate" onAdd={() => alert('Add candidate')} />
        </div>
      </section>

      {/* Modals */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modals</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex gap-3">
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Open Confirm Modal
            </Button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Save Changes
                </Button>
              </>
            }
          >
            <p className="text-gray-700">
              This is an example modal with custom content. You can put any React
              components here including forms, tables, or other complex UI.
            </p>
            <div className="mt-4">
              <FormField
                label="Example Input"
                placeholder="Type something..."
              />
            </div>
          </Modal>

          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={handleConfirm}
            title="Confirm Action"
            message="Are you sure you want to perform this action? This cannot be undone."
            confirmLabel="Yes, proceed"
            cancelLabel="Cancel"
            variant="danger"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Data Table */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Table</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            columns={tableColumns}
            data={exampleData}
            keyExtractor={(row) => row.id.toString()}
            onRowClick={(row) => alert(`Clicked: ${row.name}`)}
            defaultSortKey="name"
            pagination={{
              currentPage: 1,
              totalPages: 3,
              pageSize: 10,
              totalItems: 23,
              onPageChange: (page) => console.log('Go to page', page),
            }}
          />
        </div>
      </section>

      {showOverlay && <LoadingOverlay label="Processing" />}
    </div>
  );
}
