# BELOURA HIRING API Documentation

Complete API documentation for the BELOURA HIRING backend system.

## Documentation Files

### 📖 For All Developers

**[API_SUMMARY.md](./API_SUMMARY.md)** - Start here!
- Quick reference guide
- Endpoint overview (28 total endpoints)
- Role-based access control matrix
- Common patterns and conventions
- ~8KB, quick read (~5 minutes)

### 📋 For Detailed API Reference

**[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Complete endpoint documentation
- Full request/response specifications
- All query parameters and filters
- Complete error response documentation
- Validation rules and constraints
- ~20KB, comprehensive reference

### 💻 For Frontend Developers

**[API_TYPES.ts](./API_TYPES.ts)** - TypeScript type definitions
- Complete TypeScript types for all entities
- Enum definitions
- Request/response types
- API endpoint path constants
- Ready to copy into your frontend project
- ~10KB

**[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Integration examples
- Authentication flow implementation
- React Query setup and hooks
- Common operations with code examples
- Error handling patterns
- Pagination components
- Role-based access control
- ~15KB with practical examples

## Quick Start

### Backend Developer
1. Read `API_SUMMARY.md` for overview
2. Reference `API_ENDPOINTS.md` for implementation details
3. Check `schema.prisma` for data model

### Frontend Developer
1. Read `API_SUMMARY.md` for overview
2. Copy `API_TYPES.ts` to your project
3. Follow `FRONTEND_INTEGRATION_GUIDE.md` for implementation
4. Reference `API_ENDPOINTS.md` as needed

## API Overview

- **Base URL**: `http://localhost:3001`
- **API Version**: `v1`
- **Total Endpoints**: 28
- **Authentication**: JWT Bearer tokens

### Endpoint Categories
- Authentication: 4 endpoints
- Users: 4 endpoints
- Candidates: 7 endpoints (CRUD + bulk operations + statistics)
- Sources: 6 endpoints (CRUD + statistics)
- Referrers: 7 endpoints (CRUD + statistics + external ID lookup)

## Key Features

### ✅ Complete CRUD Operations
Full create, read, update, delete for:
- Candidates
- Sources
- Referrers
- Users

### 📊 Statistics Endpoints
Aggregate data available for:
- Candidate counts by pipeline stage
- Source counts by type with top sources
- Referrer counts with performance metrics

### 🔍 Advanced Filtering
- Search across multiple fields
- Date range filtering
- Enum-based filtering (stages, roles)
- Relationship filtering (sourceId, referrerId)

### 📄 Pagination & Sorting
- Configurable page size (1-100)
- Offset-based pagination
- Multi-field sorting
- Sort direction control

### 🚀 Bulk Operations
- Bulk candidate stage updates
- Efficient multi-record operations

### 🔐 Role-Based Access Control
Three user roles:
- **Sourcer**: Full access (create, update, delete)
- **Interviewer**: Read-only access
- **Chatting Manager**: Read-only access

## Technology Stack

- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Validation**: Custom middleware with type checking
- **CORS**: Enabled for frontend integration

## Data Model Summary

### Core Entities
```
User ─────────────┐
                  │
Candidate ────────┼─── Source
    │             │
    ├─────────────┼─── Referrer
    │             │
    └─── Pipeline Stage Entries
             │
             ├─── Test
             ├─── Mock
             └─── ...
```

### Pipeline Stages (12 total)
```
new → qualifying → interview_scheduled → interview_done →
tests_scheduled → tests_done → mock_scheduled → mock_done →
onboarding_assigned → onboarding_done → probation_start → probation_end
```

## Common Use Cases

### 1. List Candidates with Filters
```http
GET /api/v1/candidates?currentStage=qualifying&limit=20&offset=0
```

### 2. Create New Candidate
```http
POST /api/v1/candidates
Body: { name, telegram, sourceId, referrerId, currentStage }
```

### 3. Bulk Update Stages
```http
POST /api/v1/candidates/bulk/update-stages
Body: { candidateIds: [...], currentStage: "interview_scheduled" }
```

### 4. Get Statistics
```http
GET /api/v1/candidates/stats
GET /api/v1/sources/stats
GET /api/v1/referrers/stats
```

### 5. Search Across Fields
```http
GET /api/v1/candidates?search=john
GET /api/v1/sources?search=linkedin
GET /api/v1/referrers?search=telegram
```

## Authentication Flow

```
1. Register/Login
   POST /api/v1/auth/register or /api/v1/auth/login
   → Receive: { accessToken, refreshToken }

2. Store tokens
   localStorage.setItem('accessToken', ...)

3. Make authenticated requests
   Authorization: Bearer <accessToken>

4. Token expires?
   POST /api/v1/auth/refresh
   Body: { refreshToken }
   → Receive new tokens

5. Logout
   POST /api/v1/auth/logout
   Clear tokens from storage
```

## Error Handling

All errors follow consistent format:
```json
{
  "error": "Error category",
  "message": "Detailed description"
}
```

HTTP status codes:
- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad request / validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

## Development Workflow

### Testing the API

1. **Health Check**
```bash
curl http://localhost:3001/health
```

2. **Database Test**
```bash
curl http://localhost:3001/api/v1/test-db
```

3. **Register User**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"sourcer"}'
```

4. **Login**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

5. **List Candidates (with auth)**
```bash
curl http://localhost:3001/api/v1/candidates \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

## Frontend Integration Checklist

- [ ] Copy `API_TYPES.ts` to frontend project
- [ ] Set up environment variables (`VITE_API_BASE_URL`)
- [ ] Implement authentication flow
- [ ] Create `authenticatedFetch` helper
- [ ] Set up React Query provider
- [ ] Create query hooks for data fetching
- [ ] Create mutation hooks for CRUD operations
- [ ] Implement role-based UI rendering
- [ ] Add error handling and boundaries
- [ ] Create reusable pagination component
- [ ] Add form validation matching backend rules

## Best Practices

### Security
- Store tokens securely (httpOnly cookies recommended for production)
- Implement automatic token refresh
- Clear tokens on logout
- Handle 401 errors by redirecting to login

### Performance
- Use pagination for large lists (default limit: 20)
- Implement search debouncing (300-500ms)
- Cache statistics with longer stale time
- Invalidate queries on mutations

### User Experience
- Show loading states during API calls
- Display error messages clearly
- Implement optimistic updates for mutations
- Add confirmation dialogs for destructive actions

## Production Considerations

### Required Changes
1. **Rate Limiting**: Add rate limiting middleware
2. **HTTPS**: Enforce HTTPS in production
3. **Token Storage**: Use httpOnly cookies
4. **CORS**: Restrict to production domain
5. **Logging**: Add comprehensive logging
6. **Monitoring**: Set up error tracking
7. **Database**: Enable connection pooling
8. **Validation**: Add request size limits

### Environment Variables
```env
# Production
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
CORS_ORIGIN=https://your-frontend.com
```

## Support & Maintenance

### Adding New Endpoints
1. Create service function in `src/services/`
2. Create controller handler in `src/controllers/`
3. Add route in `src/routes/`
4. Update `API_ENDPOINTS.md`
5. Update `API_TYPES.ts`
6. Add tests

### Modifying Existing Endpoints
1. Update service/controller as needed
2. Update validation rules if needed
3. Update documentation
4. Update TypeScript types
5. Notify frontend team of breaking changes

## Version History

**v1.0.0** (Current)
- Complete CRUD for candidates, sources, referrers
- JWT authentication with refresh tokens
- Role-based access control
- Statistics endpoints
- Bulk operations
- Advanced filtering and pagination

## Contributing

When contributing to the API:
1. Follow existing patterns and conventions
2. Update all documentation files
3. Add TypeScript types for new entities
4. Include validation rules
5. Add error handling
6. Test all endpoints
7. Update this README if needed

## Questions?

Refer to the appropriate documentation:
- Quick overview → `API_SUMMARY.md`
- Endpoint details → `API_ENDPOINTS.md`
- Types and interfaces → `API_TYPES.ts`
- Integration examples → `FRONTEND_INTEGRATION_GUIDE.md`
