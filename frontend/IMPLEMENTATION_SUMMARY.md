# User Management and Dashboard Implementation

Complete implementation of user management and dashboard features for BELOURA HIRING system.

## Features Implemented

### 1. User Management (Admin Only)

**Location**: `/src/pages/Users/`

#### Components Created:
- **UserList (index.tsx)**: Main user management page with full CRUD functionality
- **UserForm.tsx**: Reusable form component for creating and editing users

#### Features:
- Data table displaying all users with:
  - Name (with optional username)
  - Email address
  - Role (Sourcer, Interviewer, Chatting Managers)
  - Status (Active/Inactive)
  - Created date
  - Action buttons (Edit/Delete)

- Role-based access control (admin only)
- Filter by role and active status
- Sortable columns
- Refresh button to reload data
- Working "New User" button with modal
- Edit user functionality
- Delete user with confirmation modal
- Real-time data updates after mutations
- Form validation with error messages

#### Form Validations:
- Required fields: name, email, role, password (create only)
- Email format validation
- Password minimum length (6 characters)
- Optional username field
- Status toggle (Active/Inactive)
- Password update optional on edit

### 2. Dashboard with Visualizations

**Location**: `/src/pages/Dashboard/`

#### Features:
- Real-time statistics from API
- Three stat cards:
  - Total Candidates (with icon and "View All" link)
  - Active Stages count
  - Recent Candidates count

- Two visual charts (using Tailwind CSS):
  - **Candidates by Stage**: Horizontal bar chart showing top 5 stages
  - **Candidates by Owner**: Distribution chart with totals

- Recent candidates list:
  - Last 5 candidates added
  - Name, telegram, country, created date
  - Stage and owner badges with color coding
  - Links to full candidates list
  - Empty state with call-to-action

- Refresh button to reload stats
- Error handling and loading states
- Responsive design (mobile-friendly)

### 3. React Query Hooks

**Location**: `/src/hooks/`

#### useUsers.ts:
- `useUsers(filters)`: Fetch users list with caching (30s stale time)
- `useUser(id)`: Fetch single user by ID
- `useCreateUser()`: Create new user mutation
- `useUpdateUser()`: Update user mutation
- `useDeleteUser()`: Delete user mutation
- Automatic cache invalidation after mutations
- Error handling with proper messages

#### useDashboard.ts:
- `useCandidateStats()`: Fetch dashboard statistics
- 1-minute cache time
- Auto-refresh on window focus
- Loading and error states

### 4. Type Definitions

**Location**: `/src/types/index.ts`

Added types:
- `CreateUserInput`: User creation payload
- `UpdateUserInput`: User update payload
- `UserFilters`: User list filtering options
- `DashboardStats`: Dashboard statistics response

## API Integration

All components use real API endpoints:

### User Endpoints:
- `GET /api/v1/users`: List users with filters
- `GET /api/v1/users/:id`: Get single user
- `POST /api/v1/users`: Create user
- `PATCH /api/v1/users/:id`: Update user
- `DELETE /api/v1/users/:id`: Delete user

### Dashboard Endpoints:
- `GET /api/v1/candidates/stats`: Get candidate statistics

## Components Used

Reused existing components:
- `Modal`: For create/edit forms
- `ConfirmModal`: For delete confirmation
- `DataTable`: For user list display
- `Select`: For role and status filters
- `Button`: For all actions
- `FormField`: For form inputs
- `LoadingSpinner`: For loading states

## Styling

- Tailwind CSS for all styling
- Color-coded badges for roles and statuses
- Responsive grid layouts
- Hover effects and transitions
- Professional color scheme:
  - Blue for sourcer
  - Green for interviewer/active
  - Purple for chatting_managers
  - Various colors for candidate stages

## Security Features

- Admin-only access for user management
- Prevent users from editing/deleting themselves
- Email cannot be changed after creation
- Password validation on create
- Optional password update on edit
- Role-based UI rendering

## User Experience

- Real-time updates after mutations
- Optimistic UI updates
- Clear error messages
- Loading indicators
- Empty states with helpful messages
- Confirmation dialogs for destructive actions
- Quick filters and search
- Sortable columns
- Refresh buttons for manual updates

## Files Created/Modified

### Created:
1. `/src/hooks/useUsers.ts` - User management hooks
2. `/src/hooks/useDashboard.ts` - Dashboard statistics hooks
3. `/src/hooks/index.ts` - Hooks barrel export
4. `/src/pages/Users/UserForm.tsx` - User form component

### Modified:
1. `/src/pages/Users/index.tsx` - Complete user management page
2. `/src/pages/Dashboard/index.tsx` - Complete dashboard with charts
3. `/src/types/index.ts` - Added user management types

## Testing Checklist

- [ ] Admin can access user management page
- [ ] Non-admin users see permission denied
- [ ] Create new user with all fields
- [ ] Create user with validation errors
- [ ] Edit existing user
- [ ] Update user password
- [ ] Delete user with confirmation
- [ ] Filter users by role
- [ ] Filter users by status
- [ ] Sort users by columns
- [ ] Dashboard loads statistics
- [ ] Charts display correctly
- [ ] Recent candidates list works
- [ ] Refresh buttons update data
- [ ] Links to candidates page work
- [ ] Mobile responsive design

## Next Steps

Backend requirements:
1. Ensure `/api/v1/users` endpoints exist and work
2. Ensure `/api/v1/candidates/stats` endpoint returns:
   ```typescript
   {
     totalCandidates: number;
     byStage: Record<CandidateStage, number>;
     byOwner: Record<CandidateOwner, number>;
     recentCandidates: Candidate[] // last 5
   }
   ```
3. Implement proper user permissions on backend
4. Add password hashing and validation

## Notes

- All components are fully typed with TypeScript
- React Query handles caching and background updates
- Forms have comprehensive validation
- UI is accessible with proper ARIA labels
- Components are reusable and maintainable
- Code follows project conventions and patterns
