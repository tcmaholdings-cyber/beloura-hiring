# BELOURA HIRING API - Quick Reference Summary

## Overview

**Base URL**: `http://localhost:3001`
**API Version**: `v1`
**Base Path**: `/api/v1`

## Authentication

All endpoints require JWT Bearer token in `Authorization` header except:
- `/auth/register`
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`

## Endpoint Count by Category

| Category | Endpoints | Operations |
|----------|-----------|------------|
| Authentication | 4 | Register, Login, Refresh, Logout |
| Users | 4 | Get current, Update current, List all, Get by ID |
| Candidates | 7 | CRUD + Stats + Bulk update + List with filters |
| Sources | 6 | CRUD + Stats + List with filters |
| Referrers | 7 | CRUD + Stats + List with filters + Get by external ID |
| **Total** | **28** | |

## Quick Endpoint Reference

### Authentication (4 endpoints)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Users (4 endpoints)
```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users
GET    /api/v1/users/:id
```

### Candidates (7 endpoints)
```
GET    /api/v1/candidates/stats
POST   /api/v1/candidates/bulk/update-stages
GET    /api/v1/candidates
POST   /api/v1/candidates
GET    /api/v1/candidates/:id
PATCH  /api/v1/candidates/:id
DELETE /api/v1/candidates/:id
```

### Sources (6 endpoints)
```
GET    /api/v1/sources/stats
GET    /api/v1/sources
POST   /api/v1/sources
GET    /api/v1/sources/:id
PATCH  /api/v1/sources/:id
DELETE /api/v1/sources/:id
```

### Referrers (7 endpoints)
```
GET    /api/v1/referrers/stats
GET    /api/v1/referrers/external/:externalId
GET    /api/v1/referrers
POST   /api/v1/referrers
GET    /api/v1/referrers/:id
PATCH  /api/v1/referrers/:id
DELETE /api/v1/referrers/:id
```

## Role-Based Access Control

### Roles
1. **sourcer**: Full CRUD access to all resources
2. **interviewer**: Read-only access to candidates and related data
3. **chatting_manager**: Read-only access to candidates and related data

### Permission Matrix

| Operation | Sourcer | Interviewer | Chatting Manager |
|-----------|---------|-------------|------------------|
| View candidates | ✅ | ✅ | ✅ |
| Create candidates | ✅ | ❌ | ❌ |
| Update candidates | ✅ | ❌ | ❌ |
| Delete candidates | ✅ | ❌ | ❌ |
| Bulk operations | ✅ | ❌ | ❌ |
| View sources/referrers | ✅ | ✅ | ✅ |
| Manage sources/referrers | ✅ | ❌ | ❌ |
| View statistics | ✅ | ✅ | ✅ |

## Common Query Parameters

### Pagination
```
limit: 1-100 (default: 20)
offset: ≥0 (default: 0)
sortBy: field name
sortOrder: 'asc' | 'desc' (default: 'desc')
```

### Filtering
```
search: string (min 1 char)
createdFrom: ISO 8601 date string
createdTo: ISO 8601 date string
```

### Candidate-specific
```
currentStage: PipelineStage enum
currentOwner: OwnerRole enum
sourceId: UUID
referrerId: UUID
```

### Source-specific
```
type: string
```

### Referrer-specific
```
externalId: string
```

### User-specific
```
role: UserRole enum
```

## Pipeline Stages (12 stages)

```
new                    → New candidate
qualifying             → In qualification
interview_scheduled    → Interview scheduled
interview_done         → Interview completed
tests_scheduled        → Tests scheduled
tests_done             → Tests completed
mock_scheduled         → Mock scheduled
mock_done              → Mock completed
onboarding_assigned    → Onboarding assigned
onboarding_done        → Onboarding completed
probation_start        → Probation started
probation_end          → Probation ended
```

## Owner Roles (3 roles)

```
sourcer               → Sourcer team
interviewer           → Interview team
chatting_managers     → Chatting management team
```

## Statistics Endpoints

### Candidate Stats
```
GET /api/v1/candidates/stats

Response:
{
  total: number,
  byStage: {
    new: number,
    qualifying: number,
    ...
  }
}
```

### Source Stats
```
GET /api/v1/sources/stats

Response:
{
  total: number,
  byType: { type: count },
  topSources: [{ id, name, candidateCount }]
}
```

### Referrer Stats
```
GET /api/v1/referrers/stats

Response:
{
  total: number,
  withExternalId: number,
  withTelegram: number,
  topReferrers: [{ id, name, candidateCount, bonusCount }]
}
```

## Bulk Operations

### Bulk Update Candidate Stages
```
POST /api/v1/candidates/bulk/update-stages

Request:
{
  candidateIds: string[],
  currentStage: PipelineStage
}

Response:
{
  message: "Updated N candidates successfully",
  count: number
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request data, validation errors |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

## Error Response Format

```json
{
  "error": "Error type or category",
  "message": "Detailed error message (optional)"
}
```

## Common Validation Rules

### String Fields
```
name: 2-100 characters (candidates, sources, referrers, users)
email: valid email format
password: 6-128 characters
telegram: 1-50 characters
country: 1-100 characters
timezone: 1-50 characters
externalId: 1-50 characters
type: 1-50 characters
```

### UUID Fields
All ID fields validated for proper UUID format:
- candidateId
- sourceId
- referrerId
- userId

### Enum Fields
Strictly validated against allowed values:
- role (UserRole)
- currentStage (PipelineStage)
- currentOwner (OwnerRole)

## Unique Constraints

1. **Sources**: `name` must be unique
2. **Referrers**: `(name, externalId)` combination must be unique
3. **Users**: `email` must be unique

## Deletion Constraints

1. **Sources**: Cannot delete if associated candidates exist
2. **Referrers**: Cannot delete if associated candidates or bonuses exist
3. **Candidates**: Cascade deletes related records

## Search Capabilities

### Candidate Search
Searches across: `name`, `telegram`, `country` (case-insensitive, partial match)

### Source Search
Searches across: `name`, `type` (case-insensitive, partial match)

### Referrer Search
Searches across: `name`, `externalId`, `telegram` (case-insensitive, partial match)

## Response Includes

### Candidate Responses
Include related `source` and `referrer` objects when available

### Source Responses
Include `_count.candidates` for candidate count

### Referrer Responses
Include `_count.candidates` and `_count.bonuses` for counts

## Rate Limiting

Currently: No rate limiting implemented

Recommendation for production:
- 100 requests per minute per user for regular endpoints
- 10 requests per minute for bulk operations
- 5 requests per minute for authentication endpoints

## CORS Configuration

Allowed origins:
- `http://localhost:5173` (default frontend dev server)
- Configurable via `CORS_ORIGIN` environment variable

## Files for Frontend Team

1. **API_ENDPOINTS.md** - Complete endpoint documentation with request/response examples
2. **API_TYPES.ts** - TypeScript type definitions for all API entities
3. **FRONTEND_INTEGRATION_GUIDE.md** - Integration examples with React Query
4. **API_SUMMARY.md** - This quick reference document

## Next Steps for Frontend

1. Copy `API_TYPES.ts` to your frontend project
2. Set up authentication flow with token storage
3. Implement `authenticatedFetch` helper function
4. Set up React Query with provided hooks
5. Create reusable components for pagination, filters, and forms
6. Implement role-based UI rendering

## Testing Endpoints

Use the `/health` and `/api/v1/test-db` endpoints to verify backend connectivity:

```bash
# Health check
curl http://localhost:3001/health

# Database connectivity
curl http://localhost:3001/api/v1/test-db
```

## Environment Variables

Backend requires:
```env
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Frontend should use:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1
```

## Support

For questions or issues:
1. Check the detailed documentation in `API_ENDPOINTS.md`
2. Review integration examples in `FRONTEND_INTEGRATION_GUIDE.md`
3. Verify types in `API_TYPES.ts`
4. Test endpoints with the provided examples
