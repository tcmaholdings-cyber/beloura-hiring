# Phase 1 Completion & Future Phases Design Plan

**Date**: November 12, 2025
**Current Status**: Phase 1 - 85% Complete
**Document Purpose**: Comprehensive design and implementation plan for remaining work

---

## Executive Summary

### Current Achievement
- ✅ **Week 1**: Authentication & User Management (100%)
- ✅ **Week 2**: Candidate Management (95%)
- ⏳ **Remaining**: Source/Referrer Management, Testing, Documentation

### Immediate Priorities
1. Complete remaining Phase 1 endpoints (5% remaining)
2. Fix validation bug in bulk update
3. Add comprehensive test coverage
4. Generate API documentation
5. Prepare for Phase 2 (Pipeline Stage Management)

---

## Part 1: Phase 1 Completion Plan

### A. Source & Referrer Management Endpoints

#### 1.1 Source Management API Design

**Database Schema (Already Exists)**:
```prisma
model Source {
  id         String      @id @default(uuid())
  name       String      @unique
  type       String?
  createdAt  DateTime    @default(now())
  candidates Candidate[]
}
```

**Endpoints to Implement**:

| Method | Endpoint | Description | Auth Required | RBAC |
|--------|----------|-------------|---------------|------|
| GET | `/api/v1/sources` | List all sources | ✅ | sourcer, interviewer |
| GET | `/api/v1/sources/:id` | Get source by ID | ✅ | sourcer, interviewer |
| POST | `/api/v1/sources` | Create new source | ✅ | sourcer |
| PATCH | `/api/v1/sources/:id` | Update source | ✅ | sourcer |
| DELETE | `/api/v1/sources/:id` | Delete source | ✅ | sourcer |
| GET | `/api/v1/sources/:id/candidates` | Get candidates by source | ✅ | sourcer, interviewer |

**Service Layer Functions**:
```typescript
// src/services/sourceService.ts
export interface CreateSourceInput {
  name: string;
  type?: string;
}

export interface UpdateSourceInput {
  name?: string;
  type?: string;
}

- createSource(input: CreateSourceInput): Promise<Source>
- getSourceById(id: string): Promise<Source | null>
- listSources(): Promise<Source[]>
- updateSource(id: string, input: UpdateSourceInput): Promise<Source>
- deleteSource(id: string): Promise<void>
- getSourceWithCandidates(id: string): Promise<SourceWithCandidates>
```

**Validation Rules**:
- `name`: required, string, 2-100 chars, unique
- `type`: optional, string, 1-50 chars

---

#### 1.2 Referrer Management API Design

**Database Schema (Already Exists)**:
```prisma
model Referrer {
  id            String          @id @default(uuid())
  name          String
  externalId    String?
  telegram      String?
  createdAt     DateTime        @default(now())
  candidates    Candidate[]
  bonuses       ReferralBonus[]

  @@unique([name, externalId])
}
```

**Endpoints to Implement**:

| Method | Endpoint | Description | Auth Required | RBAC |
|--------|----------|-------------|---------------|------|
| GET | `/api/v1/referrers` | List all referrers | ✅ | sourcer, interviewer |
| GET | `/api/v1/referrers/:id` | Get referrer by ID | ✅ | sourcer, interviewer |
| POST | `/api/v1/referrers` | Create new referrer | ✅ | sourcer |
| PATCH | `/api/v1/referrers/:id` | Update referrer | ✅ | sourcer |
| DELETE | `/api/v1/referrers/:id` | Delete referrer | ✅ | sourcer |
| GET | `/api/v1/referrers/:id/candidates` | Get candidates by referrer | ✅ | sourcer, interviewer |
| GET | `/api/v1/referrers/:id/bonuses` | Get referrer bonuses | ✅ | sourcer |

**Service Layer Functions**:
```typescript
// src/services/referrerService.ts
export interface CreateReferrerInput {
  name: string;
  externalId?: string;
  telegram?: string;
}

export interface UpdateReferrerInput {
  name?: string;
  externalId?: string;
  telegram?: string;
}

- createReferrer(input: CreateReferrerInput): Promise<Referrer>
- getReferrerById(id: string): Promise<Referrer | null>
- listReferrers(): Promise<Referrer[]>
- updateReferrer(id: string, input: UpdateReferrerInput): Promise<Referrer>
- deleteReferrer(id: string): Promise<void>
- getReferrerWithCandidates(id: string): Promise<ReferrerWithRelations>
- getReferrerBonuses(id: string): Promise<ReferralBonus[]>
```

**Validation Rules**:
- `name`: required, string, 2-100 chars
- `externalId`: optional, string, 1-50 chars
- `telegram`: optional, string, 1-50 chars
- Unique constraint: name + externalId combination

---

### B. Bug Fixes & Improvements

#### 2.1 Fix Bulk Update Validation

**Current Issue**:
```typescript
// routes/candidates.ts:34
{ field: 'candidateIds', required: true, type: 'string' }
// Should accept array, not string
```

**Solution**:
```typescript
// Add array type support to validation middleware
// middleware/validation.ts
if (rule.type === 'array') {
  if (!Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
  }
  if (rule.minItems && value.length < rule.minItems) {
    errors.push({ field, message: `${field} must have at least ${rule.minItems} items` });
  }
  if (rule.maxItems && value.length > rule.maxItems) {
    errors.push({ field, message: `${field} must have at most ${rule.maxItems} items` });
  }
  if (rule.itemType) {
    // Validate each array item matches itemType
  }
}

// Update routes/candidates.ts
{
  field: 'candidateIds',
  required: true,
  type: 'array',
  minItems: 1,
  maxItems: 100,
  itemType: 'uuid'
}
```

#### 2.2 Improve Error Handling

**Current State**: Basic error handling in controllers
**Enhancement Plan**:
```typescript
// Create centralized error handler
// middleware/errorHandler.ts

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle unique constraint violations, foreign key violations, etc.
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    // Format validation errors
  }

  // Default 500 error
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};
```

---

### C. Testing Strategy

#### 3.1 Test Structure

```
backend/
├── src/
│   └── __tests__/
│       ├── unit/
│       │   ├── services/
│       │   │   ├── authService.test.ts
│       │   │   ├── candidateService.test.ts
│       │   │   ├── sourceService.test.ts
│       │   │   └── referrerService.test.ts
│       │   ├── utils/
│       │   │   ├── jwt.test.ts
│       │   │   └── password.test.ts
│       │   └── middleware/
│       │       ├── auth.test.ts
│       │       ├── rbac.test.ts
│       │       └── validation.test.ts
│       └── integration/
│           ├── auth.integration.test.ts
│           ├── users.integration.test.ts
│           ├── candidates.integration.test.ts
│           ├── sources.integration.test.ts
│           └── referrers.integration.test.ts
└── jest.config.js
```

#### 3.2 Test Coverage Goals

| Category | Target Coverage | Priority |
|----------|----------------|----------|
| Services | 90%+ | High |
| Controllers | 85%+ | High |
| Middleware | 90%+ | High |
| Utils | 95%+ | High |
| Routes | 80%+ | Medium |
| Overall | 85%+ | High |

#### 3.3 Key Test Scenarios

**Authentication Tests**:
- ✅ User registration with valid data
- ✅ User registration with duplicate email
- ✅ Login with correct credentials
- ✅ Login with incorrect credentials
- ✅ Token refresh with valid token
- ✅ Token refresh with expired token
- ✅ Access protected route with valid token
- ✅ Access protected route without token

**Candidate Tests**:
- ✅ Create candidate with all fields
- ✅ Create candidate with required fields only
- ✅ List candidates with pagination
- ✅ Filter candidates by stage
- ✅ Search candidates by name
- ✅ Update candidate stage
- ✅ Delete candidate
- ✅ Bulk update candidate stages
- ✅ Get candidate statistics

**RBAC Tests**:
- ✅ Sourcer can create candidates
- ✅ Interviewer cannot create candidates
- ✅ Both can view candidates
- ✅ Chatting manager permissions

---

### D. API Documentation

#### 4.1 OpenAPI/Swagger Implementation

**Installation**:
```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express @types/swagger-jsdoc
```

**Configuration**:
```typescript
// src/config/swagger.ts
export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BELOURA HIRING API',
      version: '1.0.0',
      description: 'Recruitment pipeline management system API',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
```

**Route Documentation Example**:
```typescript
/**
 * @swagger
 * /api/v1/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               telegram:
 *                 type: string
 *               country:
 *                 type: string
 *               timezone:
 *                 type: string
 *               currentStage:
 *                 type: string
 *                 enum: [new, qualifying, interview_scheduled, ...]
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
```

#### 4.2 Postman Collection

**Generate from Swagger**:
- Use Swagger UI's export feature
- Create Postman Collection v2.1 format
- Include environment variables for tokens
- Add example requests for all endpoints

---

### E. Performance & Security

#### 5.1 Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to routes
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', apiLimiter);
```

#### 5.2 Security Headers

```typescript
// Already using helmet middleware
// Additional security configurations
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## Part 2: Phase 2 - Pipeline Stage Management

### A. Pipeline Stage System Overview

**Purpose**: Track candidate progress through recruitment pipeline stages with detailed metadata, timings, and verdicts.

**Key Features**:
1. Stage entry/exit tracking
2. Turnaround time measurement
3. Verdict recording (pass/fail/no_show)
4. Owner assignment per stage
5. Scheduled vs actual completion dates
6. Stage-specific data (tests, mocks)

### B. Database Schema Analysis

```prisma
model PipelineStageEntry {
  id                  String          @id @default(uuid())
  candidateId         String
  stage               PipelineStage   // Which stage
  status              String          // pending/in_progress/completed
  ownerRole           OwnerRole?      // Who owns this stage
  scheduledDate       DateTime?       // When it should happen
  completedDate       DateTime?       // When it actually happened
  verdict             Verdict?        // pass/fail/no_show/regular/not_regular
  remarks             String?         // Notes about this stage
  turnaroundTimeHours Int?            // How long it took
  createdAt           DateTime
  updatedAt           DateTime

  candidate           Candidate
  tests               Test?           // If stage is tests_scheduled/done
  mock                Mock?           // If stage is mock_scheduled/done
}

model Test {
  id           String
  stageId      String @unique
  wpmScore     Int?
  englishScore Decimal?
  pass         Boolean?

  stage        PipelineStageEntry
}

model Mock {
  id          String
  stageId     String @unique
  verdict     Verdict?
  scheduledAt DateTime?
  completedAt DateTime?

  stage       PipelineStageEntry
}
```

### C. Pipeline Stage API Design

#### Endpoints to Implement:

| Method | Endpoint | Description | Auth | RBAC |
|--------|----------|-------------|------|------|
| POST | `/api/v1/candidates/:id/stages` | Add stage entry | ✅ | sourcer |
| GET | `/api/v1/candidates/:id/stages` | Get candidate's stage history | ✅ | sourcer, interviewer |
| GET | `/api/v1/stages/:id` | Get stage entry details | ✅ | sourcer, interviewer |
| PATCH | `/api/v1/stages/:id` | Update stage entry | ✅ | sourcer |
| POST | `/api/v1/stages/:id/complete` | Mark stage as completed | ✅ | sourcer |
| POST | `/api/v1/stages/:id/tests` | Record test results | ✅ | sourcer |
| POST | `/api/v1/stages/:id/mock` | Record mock results | ✅ | sourcer |
| GET | `/api/v1/stages/analytics` | Stage analytics & metrics | ✅ | sourcer, interviewer |

#### Service Layer Design:

```typescript
// src/services/stageService.ts

export interface CreateStageEntryInput {
  candidateId: string;
  stage: PipelineStage;
  ownerRole?: OwnerRole;
  scheduledDate?: Date;
  remarks?: string;
}

export interface UpdateStageEntryInput {
  status?: string;
  ownerRole?: OwnerRole;
  scheduledDate?: Date;
  completedDate?: Date;
  verdict?: Verdict;
  remarks?: string;
  turnaroundTimeHours?: number;
}

export interface CompleteStageInput {
  verdict: Verdict;
  remarks?: string;
}

export interface RecordTestInput {
  wpmScore?: number;
  englishScore?: number;
  pass: boolean;
}

export interface RecordMockInput {
  verdict: Verdict;
  scheduledAt?: Date;
  completedAt?: Date;
}

// Core functions
- createStageEntry(input: CreateStageEntryInput): Promise<PipelineStageEntry>
- getStageById(id: string): Promise<PipelineStageEntryWithRelations | null>
- getCandidateStages(candidateId: string): Promise<PipelineStageEntry[]>
- updateStageEntry(id: string, input: UpdateStageEntryInput): Promise<PipelineStageEntry>
- completeStage(id: string, input: CompleteStageInput): Promise<PipelineStageEntry>
- recordTestResults(stageId: string, input: RecordTestInput): Promise<Test>
- recordMockResults(stageId: string, input: RecordMockInput): Promise<Mock>
- getStageAnalytics(): Promise<StageAnalytics>
```

#### Stage Analytics Design:

```typescript
export interface StageAnalytics {
  averageTurnaroundByStage: Record<PipelineStage, number>;
  passRateByStage: Record<PipelineStage, number>;
  currentStageDistribution: Record<PipelineStage, number>;
  bottlenecks: Array<{
    stage: PipelineStage;
    averageWaitTime: number;
    candidatesStuck: number;
  }>;
  completionRates: {
    last7Days: number;
    last30Days: number;
    allTime: number;
  };
}
```

---

## Part 3: Phase 3 - Probation & Bonus Management

### A. Probation Tracking System

**Database Schema**:
```prisma
model Probation {
  id          String    @id @default(uuid())
  candidateId String    @unique
  startDate   DateTime  @db.Date
  endDate     DateTime  @db.Date
  verdict     Verdict?  // pass/fail
  createdAt   DateTime

  candidate   Candidate
}
```

**API Endpoints**:

| Method | Endpoint | Description | Auth | RBAC |
|--------|----------|-------------|------|------|
| POST | `/api/v1/candidates/:id/probation` | Start probation period | ✅ | sourcer |
| GET | `/api/v1/candidates/:id/probation` | Get probation details | ✅ | sourcer, interviewer |
| PATCH | `/api/v1/probation/:id` | Update probation | ✅ | sourcer |
| POST | `/api/v1/probation/:id/complete` | Complete probation with verdict | ✅ | sourcer |
| GET | `/api/v1/probation/expiring` | Get probations expiring soon | ✅ | sourcer |
| GET | `/api/v1/probation/stats` | Probation statistics | ✅ | sourcer |

### B. Referral Bonus System

**Database Schema**:
```prisma
model ReferralBonus {
  id          String       @id @default(uuid())
  candidateId String       @unique
  referrerId  String
  amount      Decimal      @default(20.00)
  status      BonusStatus  // pending/approved/paid
  approvedAt  DateTime?
  paidAt      DateTime?
  createdAt   DateTime

  candidate   Candidate
  referrer    Referrer
}
```

**API Endpoints**:

| Method | Endpoint | Description | Auth | RBAC |
|--------|----------|-------------|------|------|
| POST | `/api/v1/bonuses` | Create bonus record | ✅ | sourcer |
| GET | `/api/v1/bonuses` | List all bonuses | ✅ | sourcer |
| GET | `/api/v1/bonuses/:id` | Get bonus details | ✅ | sourcer |
| PATCH | `/api/v1/bonuses/:id/approve` | Approve bonus | ✅ | sourcer |
| PATCH | `/api/v1/bonuses/:id/pay` | Mark bonus as paid | ✅ | sourcer |
| GET | `/api/v1/bonuses/pending` | Get pending bonuses | ✅ | sourcer |
| GET | `/api/v1/bonuses/stats` | Bonus statistics | ✅ | sourcer |
| GET | `/api/v1/referrers/:id/bonuses` | Get referrer's bonuses | ✅ | sourcer |

**Bonus Workflow**:
1. Candidate reaches `probation_end` stage
2. System checks if candidate has referrer
3. Auto-create bonus record with `pending` status
4. Sourcer reviews and approves bonus
5. Finance marks bonus as `paid`

---

## Part 4: Phase 4 - Advanced Features

### A. Dashboard & Analytics

**Metrics to Track**:
- Active candidates by stage
- Conversion rates between stages
- Average time per stage
- Pass/fail rates
- Source effectiveness
- Referrer performance
- Monthly recruitment trends
- Bottleneck identification

**Endpoints**:
```
GET /api/v1/dashboard/overview
GET /api/v1/dashboard/pipeline
GET /api/v1/dashboard/sources
GET /api/v1/dashboard/referrers
GET /api/v1/dashboard/trends?period=30d
```

### B. Notifications & Reminders

**Notification Types**:
- Interview scheduled
- Test scheduled
- Mock scheduled
- Probation ending soon
- Stage overdue
- Bonus approved

**Implementation**:
- Email notifications (nodemailer + templates)
- In-app notifications (database table + real-time)
- Optional Telegram bot integration

### C. Bulk Operations

**Endpoints**:
```
POST /api/v1/candidates/bulk/import       # CSV import
POST /api/v1/candidates/bulk/export       # CSV export
POST /api/v1/candidates/bulk/assign       # Bulk assign owner
POST /api/v1/candidates/bulk/schedule     # Bulk schedule interviews
POST /api/v1/stages/bulk/update           # Bulk update stages
```

### D. Search & Filtering

**Advanced Search Features**:
- Full-text search across all fields
- Multi-field filtering
- Date range filters
- Saved searches
- Search history

---

## Implementation Timeline

### Week 3: Complete Phase 1 (3-5 days)
- **Day 1**: Source & Referrer Management (services + controllers + routes)
- **Day 2**: Bug fixes + Array validation + Error handling
- **Day 3**: Unit tests for all services
- **Day 4**: Integration tests for all endpoints
- **Day 5**: API documentation (Swagger) + Postman collection

### Week 4: Phase 2 - Pipeline Stages (5-7 days)
- **Day 1-2**: Stage entry CRUD operations
- **Day 3**: Test recording functionality
- **Day 4**: Mock recording functionality
- **Day 5**: Stage analytics & metrics
- **Day 6-7**: Testing & documentation

### Week 5-6: Phase 3 - Probation & Bonuses (5-7 days)
- **Day 1-2**: Probation tracking system
- **Day 3-4**: Bonus management system
- **Day 5**: Automated bonus triggers
- **Day 6-7**: Testing & documentation

### Week 7-8: Phase 4 - Advanced Features (7-10 days)
- **Day 1-3**: Dashboard & analytics
- **Day 4-5**: Notification system
- **Day 6-7**: Bulk operations
- **Day 8-10**: Testing & optimization

---

## Success Metrics

### Phase 1 Completion
- ✅ All CRUD endpoints implemented
- ✅ 85%+ test coverage
- ✅ API documentation complete
- ✅ No critical bugs
- ✅ Response times < 200ms (p95)

### Phase 2 Success
- ✅ Stage tracking working end-to-end
- ✅ Turnaround time calculation accurate
- ✅ Analytics dashboard functional
- ✅ Test coverage maintained

### Phase 3 Success
- ✅ Probation workflow automated
- ✅ Bonus triggers working correctly
- ✅ Payment tracking accurate

### Phase 4 Success
- ✅ Dashboard loads < 1s
- ✅ Bulk operations handle 1000+ records
- ✅ Notifications delivered reliably

---

## Risk Management

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance with complex queries | High | Medium | Add indexes, query optimization |
| TypeScript compilation issues | Medium | Low | Maintain strict types, regular cache clearing |
| Test data management | Medium | Medium | Use factories, seed scripts |
| API response time degradation | High | Medium | Implement caching, pagination |

### Implementation Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | High | Stick to defined requirements |
| Incomplete testing | High | Medium | Enforce coverage thresholds |
| Poor documentation | Medium | Medium | Document as you build |
| Technical debt accumulation | High | Medium | Regular refactoring sessions |

---

## Next Immediate Actions

### Priority 1: Complete Phase 1 (This Session)
1. ✅ Create `sourceService.ts` with CRUD operations
2. ✅ Create `sourceController.ts` with handlers
3. ✅ Create `routes/sources.ts` with endpoints
4. ✅ Create `referrerService.ts` with CRUD operations
5. ✅ Create `referrerController.ts` with handlers
6. ✅ Create `routes/referrers.ts` with endpoints
7. ✅ Test all new endpoints
8. ✅ Update documentation

### Priority 2: Bug Fix & Validation (This Session)
1. ✅ Add array type support to validation middleware
2. ✅ Update bulk update route validation
3. ✅ Test bulk update endpoint

### Priority 3: Testing (Next Session)
1. Set up Jest test infrastructure
2. Write unit tests for services
3. Write integration tests for endpoints
4. Achieve 85%+ coverage

### Priority 4: Documentation (Next Session)
1. Set up Swagger/OpenAPI
2. Document all endpoints
3. Generate Postman collection
4. Create API usage guide

---

## Appendix: File Structure

### Complete Backend Structure (After Phase 1)
```
backend/src/
├── index.ts
├── config/
│   ├── database.ts
│   └── swagger.ts
├── utils/
│   ├── jwt.ts
│   └── password.ts
├── services/
│   ├── authService.ts
│   ├── tokenService.ts
│   ├── candidateService.ts
│   ├── sourceService.ts          # NEW
│   └── referrerService.ts        # NEW
├── controllers/
│   ├── authController.ts
│   ├── userController.ts
│   ├── candidateController.ts
│   ├── sourceController.ts       # NEW
│   └── referrerController.ts     # NEW
├── middleware/
│   ├── auth.ts
│   ├── rbac.ts
│   ├── validation.ts
│   ├── errorHandler.ts           # NEW
│   └── rateLimiter.ts            # NEW
├── routes/
│   ├── auth.ts
│   ├── users.ts
│   ├── candidates.ts
│   ├── sources.ts                # NEW
│   └── referrers.ts              # NEW
└── __tests__/
    ├── unit/
    └── integration/
```

---

**Document Version**: 1.0
**Last Updated**: November 12, 2025, 5:30 PM
**Next Review**: After Phase 1 completion
