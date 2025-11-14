# BELOURA HIRING - API Endpoint Reference

**Base URL**: `http://localhost:3001`
**API Version**: `v1`
**Base Path**: `/api/v1`

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Candidates](#candidates)
- [Sources](#sources)
- [Referrers](#referrers)
- [Enums & Types](#enums--types)

---

## Authentication

All endpoints except `/auth/register`, `/auth/login`, `/auth/refresh`, and `/auth/logout` require authentication via JWT Bearer token.

**Authorization Header**: `Authorization: Bearer <access_token>`

### Register User
```http
POST /api/v1/auth/register
```

**Request Body**:
```json
{
  "email": "string (email format, required)",
  "password": "string (6-128 chars, required)",
  "name": "string (2-100 chars, required)",
  "role": "sourcer | interviewer | chatting_manager (required)"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "sourcer | interviewer | chatting_manager",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Login
```http
POST /api/v1/auth/login
```

**Request Body**:
```json
{
  "email": "string (email format, required)",
  "password": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "sourcer | interviewer | chatting_manager"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body**:
```json
{
  "refreshToken": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Logout
```http
POST /api/v1/auth/logout
```

**Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

---

## Users

### Get Current User Profile
```http
GET /api/v1/users/me
```

**Auth Required**: Yes
**Roles**: All authenticated users

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "sourcer | interviewer | chatting_manager",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Update Current User Profile
```http
PATCH /api/v1/users/me
```

**Auth Required**: Yes
**Roles**: All authenticated users

**Request Body**:
```json
{
  "name": "string (2-100 chars, optional)"
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "sourcer | interviewer | chatting_manager",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### List Users
```http
GET /api/v1/users
```

**Auth Required**: Yes
**Roles**: All authenticated users

**Query Parameters**:
- `role` (optional): Filter by role (`sourcer`, `interviewer`, `chatting_manager`)

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "sourcer | interviewer | chatting_manager",
      "createdAt": "timestamp"
    }
  ],
  "count": "number"
}
```

### Get User by ID
```http
GET /api/v1/users/:id
```

**Auth Required**: Yes
**Roles**: All authenticated users

**URL Parameters**:
- `id` (required): User UUID

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "sourcer | interviewer | chatting_manager",
    "createdAt": "timestamp"
  }
}
```

---

## Candidates

### Get Candidate Statistics
```http
GET /api/v1/candidates/stats
```

**Auth Required**: Yes
**Roles**: All authenticated users

**Response** (200 OK):
```json
{
  "stats": {
    "total": "number",
    "byStage": {
      "new": "number",
      "qualifying": "number",
      "interview_scheduled": "number",
      "interview_done": "number",
      "tests_scheduled": "number",
      "tests_done": "number",
      "mock_scheduled": "number",
      "mock_done": "number",
      "onboarding_assigned": "number",
      "onboarding_done": "number",
      "probation_start": "number",
      "probation_end": "number"
    }
  }
}
```

### Bulk Update Candidate Stages
```http
POST /api/v1/candidates/bulk/update-stages
```

**Auth Required**: Yes
**Roles**: Sourcer only

**Request Body**:
```json
{
  "candidateIds": ["uuid", "uuid", ...] (min 1 item, required),
  "currentStage": "new | qualifying | interview_scheduled | interview_done | tests_scheduled | tests_done | mock_scheduled | mock_done | onboarding_assigned | onboarding_done | probation_start | probation_end (required)"
}
```

**Response** (200 OK):
```json
{
  "message": "Updated N candidates successfully",
  "count": "number"
}
```

### List Candidates
```http
GET /api/v1/candidates
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**Query Parameters**:
- `currentStage` (optional): Filter by pipeline stage
- `currentOwner` (optional): Filter by owner role (`sourcer`, `interviewer`, `chatting_managers`)
- `sourceId` (optional): Filter by source UUID
- `referrerId` (optional): Filter by referrer UUID
- `search` (optional): Search in name, telegram, country (min 1 char)
- `createdFrom` (optional): Filter by creation date from (ISO 8601 date string)
- `createdTo` (optional): Filter by creation date to (ISO 8601 date string)
- `limit` (optional): Number of results per page (1-100, default: 20)
- `offset` (optional): Number of results to skip (min 0, default: 0)
- `sortBy` (optional): Sort field (`name`, `currentStage`, `createdAt`, `updatedAt`, default: `createdAt`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`, default: `desc`)

**Response** (200 OK):
```json
{
  "candidates": [
    {
      "id": "uuid",
      "name": "string",
      "telegram": "string | null",
      "country": "string | null",
      "timezone": "string | null",
      "sourceId": "uuid | null",
      "referrerId": "uuid | null",
      "currentStage": "pipeline_stage",
      "currentOwner": "owner_role | null",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "source": {
        "id": "uuid",
        "name": "string",
        "type": "string | null",
        "createdAt": "timestamp"
      } | null,
      "referrer": {
        "id": "uuid",
        "name": "string",
        "externalId": "string | null",
        "telegram": "string | null",
        "createdAt": "timestamp"
      } | null
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

### Create Candidate
```http
POST /api/v1/candidates
```

**Auth Required**: Yes
**Roles**: Sourcer only

**Request Body**:
```json
{
  "name": "string (2-100 chars, required)",
  "telegram": "string (1-50 chars, optional)",
  "country": "string (1-100 chars, optional)",
  "timezone": "string (1-50 chars, optional)",
  "sourceId": "uuid (optional)",
  "referrerId": "uuid (optional)",
  "currentStage": "pipeline_stage (optional, default: new)",
  "currentOwner": "sourcer | interviewer | chatting_managers (optional)"
}
```

**Response** (201 Created):
```json
{
  "message": "Candidate created successfully",
  "candidate": {
    "id": "uuid",
    "name": "string",
    "telegram": "string | null",
    "country": "string | null",
    "timezone": "string | null",
    "sourceId": "uuid | null",
    "referrerId": "uuid | null",
    "currentStage": "pipeline_stage",
    "currentOwner": "owner_role | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "source": { ... } | null,
    "referrer": { ... } | null
  }
}
```

### Get Candidate by ID
```http
GET /api/v1/candidates/:id
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**URL Parameters**:
- `id` (required): Candidate UUID

**Response** (200 OK):
```json
{
  "candidate": {
    "id": "uuid",
    "name": "string",
    "telegram": "string | null",
    "country": "string | null",
    "timezone": "string | null",
    "sourceId": "uuid | null",
    "referrerId": "uuid | null",
    "currentStage": "pipeline_stage",
    "currentOwner": "owner_role | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "source": { ... } | null,
    "referrer": { ... } | null
  }
}
```

### Update Candidate
```http
PATCH /api/v1/candidates/:id
```

**Auth Required**: Yes
**Roles**: Sourcer only

**URL Parameters**:
- `id` (required): Candidate UUID

**Request Body** (all fields optional):
```json
{
  "name": "string (2-100 chars)",
  "telegram": "string (1-50 chars)",
  "country": "string (1-100 chars)",
  "timezone": "string (1-50 chars)",
  "sourceId": "uuid",
  "referrerId": "uuid",
  "currentStage": "pipeline_stage",
  "currentOwner": "sourcer | interviewer | chatting_managers"
}
```

**Response** (200 OK):
```json
{
  "message": "Candidate updated successfully",
  "candidate": { ... }
}
```

### Delete Candidate
```http
DELETE /api/v1/candidates/:id
```

**Auth Required**: Yes
**Roles**: Sourcer only

**URL Parameters**:
- `id` (required): Candidate UUID

**Response** (200 OK):
```json
{
  "message": "Candidate deleted successfully"
}
```

---

## Sources

### Get Source Statistics
```http
GET /api/v1/sources/stats
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**Response** (200 OK):
```json
{
  "total": "number",
  "byType": {
    "type_name": "number",
    ...
  },
  "topSources": [
    {
      "id": "uuid",
      "name": "string",
      "candidateCount": "number"
    }
  ]
}
```

### List Sources
```http
GET /api/v1/sources
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**Query Parameters**:
- `type` (optional): Filter by source type (min 1 char)
- `search` (optional): Search in name and type (min 1 char)
- `createdFrom` (optional): Filter by creation date from (ISO 8601 date string)
- `createdTo` (optional): Filter by creation date to (ISO 8601 date string)
- `limit` (optional): Number of results per page (1-100, default: 20)
- `offset` (optional): Number of results to skip (min 0, default: 0)
- `sortBy` (optional): Sort field (`name`, `type`, `createdAt`, default: `createdAt`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`, default: `desc`)

**Response** (200 OK):
```json
{
  "sources": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string | null",
      "createdAt": "timestamp",
      "_count": {
        "candidates": "number"
      }
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

### Create Source
```http
POST /api/v1/sources
```

**Auth Required**: Yes
**Roles**: Sourcer only

**Request Body**:
```json
{
  "name": "string (2-100 chars, required, unique)",
  "type": "string (1-50 chars, optional)"
}
```

**Response** (201 Created):
```json
{
  "message": "Source created successfully",
  "source": {
    "id": "uuid",
    "name": "string",
    "type": "string | null",
    "createdAt": "timestamp",
    "_count": {
      "candidates": "number"
    }
  }
}
```

### Get Source by ID
```http
GET /api/v1/sources/:id
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**URL Parameters**:
- `id` (required): Source UUID

**Response** (200 OK):
```json
{
  "source": {
    "id": "uuid",
    "name": "string",
    "type": "string | null",
    "createdAt": "timestamp",
    "_count": {
      "candidates": "number"
    }
  }
}
```

### Update Source
```http
PATCH /api/v1/sources/:id
```

**Auth Required**: Yes
**Roles**: Sourcer only

**URL Parameters**:
- `id` (required): Source UUID

**Request Body** (all fields optional):
```json
{
  "name": "string (2-100 chars, unique)",
  "type": "string (1-50 chars)"
}
```

**Response** (200 OK):
```json
{
  "message": "Source updated successfully",
  "source": { ... }
}
```

### Delete Source
```http
DELETE /api/v1/sources/:id
```

**Auth Required**: Yes
**Roles**: Sourcer only

**URL Parameters**:
- `id` (required): Source UUID

**Constraints**: Cannot delete source with associated candidates

**Response** (200 OK):
```json
{
  "message": "Source deleted successfully"
}
```

---

## Referrers

### Get Referrer Statistics
```http
GET /api/v1/referrers/stats
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**Response** (200 OK):
```json
{
  "total": "number",
  "withExternalId": "number",
  "withTelegram": "number",
  "topReferrers": [
    {
      "id": "uuid",
      "name": "string",
      "candidateCount": "number",
      "bonusCount": "number"
    }
  ]
}
```

### Get Referrer by External ID
```http
GET /api/v1/referrers/external/:externalId
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**URL Parameters**:
- `externalId` (required): External identifier string

**Response** (200 OK):
```json
{
  "referrer": {
    "id": "uuid",
    "name": "string",
    "externalId": "string | null",
    "telegram": "string | null",
    "createdAt": "timestamp",
    "_count": {
      "candidates": "number",
      "bonuses": "number"
    }
  }
}
```

### List Referrers
```http
GET /api/v1/referrers
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**Query Parameters**:
- `externalId` (optional): Filter by external ID (min 1 char)
- `search` (optional): Search in name, externalId, telegram (min 1 char)
- `createdFrom` (optional): Filter by creation date from (ISO 8601 date string)
- `createdTo` (optional): Filter by creation date to (ISO 8601 date string)
- `limit` (optional): Number of results per page (1-100, default: 20)
- `offset` (optional): Number of results to skip (min 0, default: 0)
- `sortBy` (optional): Sort field (`name`, `externalId`, `createdAt`, default: `createdAt`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`, default: `desc`)

**Response** (200 OK):
```json
{
  "referrers": [
    {
      "id": "uuid",
      "name": "string",
      "externalId": "string | null",
      "telegram": "string | null",
      "createdAt": "timestamp",
      "_count": {
        "candidates": "number",
        "bonuses": "number"
      }
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

### Create Referrer
```http
POST /api/v1/referrers
```

**Auth Required**: Yes
**Roles**: Sourcer only

**Request Body**:
```json
{
  "name": "string (2-100 chars, required)",
  "externalId": "string (1-50 chars, optional)",
  "telegram": "string (1-50 chars, optional)"
}
```

**Constraints**: Unique combination of `name` and `externalId`

**Response** (201 Created):
```json
{
  "message": "Referrer created successfully",
  "referrer": {
    "id": "uuid",
    "name": "string",
    "externalId": "string | null",
    "telegram": "string | null",
    "createdAt": "timestamp",
    "_count": {
      "candidates": "number",
      "bonuses": "number"
    }
  }
}
```

### Get Referrer by ID
```http
GET /api/v1/referrers/:id
```

**Auth Required**: Yes
**Roles**: Sourcer or Interviewer

**URL Parameters**:
- `id` (required): Referrer UUID

**Response** (200 OK):
```json
{
  "referrer": {
    "id": "uuid",
    "name": "string",
    "externalId": "string | null",
    "telegram": "string | null",
    "createdAt": "timestamp",
    "_count": {
      "candidates": "number",
      "bonuses": "number"
    }
  }
}
```

### Update Referrer
```http
PATCH /api/v1/referrers/:id
```

**Auth Required**: Yes
**Roles**: Sourcer only

**URL Parameters**:
- `id` (required): Referrer UUID

**Request Body** (all fields optional):
```json
{
  "name": "string (2-100 chars)",
  "externalId": "string (1-50 chars)",
  "telegram": "string (1-50 chars)"
}
```

**Constraints**: Unique combination of `name` and `externalId`

**Response** (200 OK):
```json
{
  "message": "Referrer updated successfully",
  "referrer": { ... }
}
```

### Delete Referrer
```http
DELETE /api/v1/referrers/:id
```

**Auth Required**: Yes
**Roles**: Sourcer only

**URL Parameters**:
- `id` (required): Referrer UUID

**Constraints**: Cannot delete referrer with associated candidates or bonuses

**Response** (200 OK):
```json
{
  "message": "Referrer deleted successfully"
}
```

---

## Enums & Types

### Pipeline Stages
```typescript
enum PipelineStage {
  new                    // New candidate
  qualifying             // In qualification
  interview_scheduled    // Interview scheduled
  interview_done         // Interview completed
  tests_scheduled        // Tests scheduled
  tests_done             // Tests completed
  mock_scheduled         // Mock scheduled
  mock_done              // Mock completed
  onboarding_assigned    // Onboarding assigned
  onboarding_done        // Onboarding completed
  probation_start        // Probation started
  probation_end          // Probation ended
}
```

### Owner Roles
```typescript
enum OwnerRole {
  sourcer              // Sourcer role
  interviewer          // Interviewer role
  chatting_managers    // Chatting managers role
}
```

### User Roles
```typescript
enum UserRole {
  sourcer              // Can create, update, delete candidates/sources/referrers
  interviewer          // Can view candidates and related data
  chatting_manager     // Can view candidates and related data
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error type or category",
  "message": "Detailed error message (optional)"
}
```

### HTTP Status Codes
- `200 OK`: Successful GET, PATCH, DELETE
- `201 Created`: Successful POST (resource created)
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks required permissions for action
- `404 Not Found`: Resource does not exist
- `500 Internal Server Error`: Unexpected server error

### Common Error Examples

**Validation Error (400)**:
```json
{
  "error": "Validation failed",
  "message": "name must be at least 2 characters long"
}
```

**Authentication Error (401)**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Permission Error (403)**:
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions for this action"
}
```

**Not Found (404)**:
```json
{
  "error": "Not found",
  "message": "Candidate not found"
}
```

**Constraint Violation (400)**:
```json
{
  "error": "Constraint violation",
  "message": "Cannot delete source with 5 associated candidates"
}
```

---

## Additional Endpoints

### Health Check
```http
GET /health
```

**Auth Required**: No

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "ISO 8601 timestamp",
  "environment": "development | production",
  "version": "v1"
}
```

### API Info
```http
GET /api/v1
```

**Auth Required**: No

**Response** (200 OK):
```json
{
  "name": "BELOURA HIRING API",
  "version": "1.0.0",
  "environment": "development | production",
  "documentation": "/api/v1/docs"
}
```

### Database Test
```http
GET /api/v1/test-db
```

**Auth Required**: No

**Response** (200 OK):
```json
{
  "status": "connected",
  "database": "beloura_hiring_dev",
  "stats": {
    "candidates": "number",
    "users": "number",
    "sources": "number"
  },
  "timestamp": "ISO 8601 timestamp"
}
```

---

## Notes

### Authentication Flow
1. Register or login to receive `accessToken` and `refreshToken`
2. Include `accessToken` in `Authorization: Bearer <token>` header for protected routes
3. When `accessToken` expires, use `/auth/refresh` with `refreshToken` to get new tokens
4. Logout by removing tokens client-side (optionally call `/auth/logout`)

### Role-Based Access Control (RBAC)
- **Sourcer**: Full CRUD access to candidates, sources, and referrers
- **Interviewer**: Read-only access to candidates, sources, and referrers
- **Chatting Manager**: Read-only access to candidates, sources, and referrers

### Pagination Best Practices
- Default `limit`: 20, maximum: 100
- Use `offset` for simple pagination
- Include `total` count in responses for UI pagination controls
- Default sort: `createdAt desc` (newest first)

### Search Functionality
- Case-insensitive search across multiple fields
- Partial match support (contains)
- Combines with other filters (AND operation)

### Date Filtering
- ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- `createdFrom`: Inclusive start date (>=)
- `createdTo`: Inclusive end date (<=)
- Both optional, can be used independently

### Validation Rules
- UUIDs validated for all ID fields
- Email format validation for user registration/login
- Enum validation for stages, roles, and owner types
- String length constraints enforced
- Referential integrity maintained (foreign key validation)
