# Beloura Hiring System - Feature Enhancements Design Specification

**Version**: 1.0
**Date**: 2025-11-13
**Status**: Design Phase

## Executive Summary

This document outlines comprehensive design specifications for five key feature enhancements to the Beloura hiring system, requested to improve user experience, standardize evaluations, and provide better insights into the hiring pipeline.

### Features Overview

1. **Enhanced Pipeline Stage Summary with Drill-Down** ✅ (Partially Implemented)
2. **Real-Time Interview Notes/Comments System** ✅ (Implemented)
3. **Standardized Likert Scale Rating System** ✅ (Implemented)
4. **Source Analytics and Conversion Tracking** 🔄 (Needs Enhancement)
5. **High-Performer Filtering System** ✅ (Implemented)

---

## Current System Analysis

### Architecture
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend**: React + TypeScript + TanStack Query (React Query)
- **Database**: PostgreSQL with Prisma migrations
- **State Management**: React Query for server state, React hooks for UI state

### Existing Data Model
```prisma
model Candidate {
  id              String          @id @default(uuid())
  name            String
  telegram        String?
  country         String?
  timezone        String?
  sourceId        String?
  referrerId      String?
  currentStage    PipelineStage   @default(new)
  currentOwner    OwnerRole?
  interviewRating Int?            // 1-5 Likert scale
  notes           String?         @db.Text
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  source          Source?         @relation(fields: [sourceId], references: [id])
  referrer        Referrer?       @relation(fields: [referrerId], references: [id])
  stages          PipelineStageEntry[]
  probation       Probation?
  bonus           ReferralBonus?
}

model Source {
  id         String      @id @default(uuid())
  name       String      @unique
  type       String?
  createdAt  DateTime    @default(now())
  candidates Candidate[]
}
```

### Existing API Endpoints
- `GET /api/v1/candidates/stats` - Returns stage summaries with candidate details
- `PATCH /api/v1/candidates/:id/feedback` - Updates interview rating (1-5) and notes
- `GET /api/v1/candidates` - Supports filtering by `minInterviewRating` and `maxInterviewRating`
- `GET /api/v1/sources` - Lists sources with candidate counts

---

## Feature 1: Enhanced Pipeline Stage Summary with Drill-Down

### Current Implementation Status
✅ **IMPLEMENTED** - StageSummary component exists with expandable stages

### Current Features
- Stage summaries with candidate counts
- Click to expand/collapse individual stages
- Shows list of candidates in each stage with:
  - Name, source, telegram, updated date
  - Interview rating badge
  - Notes preview
  - "Add / edit notes" button

### Enhancement Recommendations

#### 1.1 Visual Improvements
**Priority**: Medium
**Complexity**: Low

**Changes**:
```typescript
// Add visual indicators for stage health
interface StageHealthIndicator {
  totalCount: number;
  withRating: number;
  withNotes: number;
  avgRating: number | null;
  stagnantCandidates: number; // Not updated in 7+ days
}

// Enhanced stage header
<StageHeader>
  <StageIcon color={STAGE_COLORS[stage]} />
  <StageName>{STAGE_LABELS[stage]}</StageName>
  <StageMetrics>
    <Badge>{count} candidates</Badge>
    <Badge variant="info">{withRating}/{count} rated</Badge>
    <Badge variant="warning" show={stagnantCandidates > 0}>
      {stagnantCandidates} stagnant
    </Badge>
  </StageMetrics>
  <ExpandIcon />
</StageHeader>
```

**Backend Changes**:
```typescript
// Enhance GET /api/v1/candidates/stats response
interface StageSummary {
  count: number;
  candidates: StageSummaryCandidate[];
  metrics: {
    withRating: number;
    withNotes: number;
    avgRating: number | null;
    stagnantCount: number; // updatedAt > 7 days ago
  };
}
```

#### 1.2 Sorting and Filtering Within Stages
**Priority**: Low
**Complexity**: Low

**Changes**:
- Add sort options when stage is expanded: "Recently updated", "Highest rated", "Needs attention"
- Quick filter buttons: "Rated", "No rating", "No notes"

---

## Feature 2: Real-Time Interview Notes/Comments System

### Current Implementation Status
✅ **FULLY IMPLEMENTED** - CandidateFeedbackModal component exists

### Current Features
- Modal-based feedback interface
- Fields for:
  - Interview rating (1-5 select dropdown)
  - Notes (textarea with multi-line support)
- Accessible from:
  - Main candidate table "Feedback" button
  - Stage summary "Add / edit notes" button
- Real-time updates via React Query mutation
- Proper error handling and success messaging

### Architecture
```typescript
// Frontend: CandidateFeedbackModal.tsx
interface CandidateFeedbackTarget {
  id: string;
  name: string;
  interviewRating: number | null;
  notes: string | null;
}

// Backend: PATCH /api/v1/candidates/:id/feedback
interface UpdateFeedbackInput {
  interviewRating?: number | null; // 1-5
  notes?: string | null;           // Trimmed, null if empty
}
```

### Enhancement Recommendations

#### 2.1 Rich Text Formatting
**Priority**: Low
**Complexity**: Medium

**Rationale**: Current plain text is sufficient for MVP. Rich text adds complexity without significant user benefit for interview notes.

**If Implemented Later**:
- Use lightweight Markdown editor (e.g., `react-markdown-editor-lite`)
- Support basic formatting: **bold**, *italic*, bullet lists
- Preserve plain text in database, render as formatted on display

#### 2.2 Timestamped Comment History
**Priority**: Medium
**Complexity**: High

**Current Limitation**: Overwriting notes loses historical context

**Design**:
```prisma
// New model for comment history
model CandidateComment {
  id          String    @id @default(uuid())
  candidateId String
  userId      String?   // Who added the comment
  userRole    OwnerRole?
  content     String    @db.Text
  rating      Int?      // Rating at time of comment
  createdAt   DateTime  @default(now())

  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@index([candidateId, createdAt])
  @@map("candidate_comments")
}

// Update Candidate model
model Candidate {
  // ... existing fields
  comments    CandidateComment[] // New relation
  notes       String?  @db.Text  // Keep for backward compatibility, shows latest
}
```

**API Changes**:
```typescript
// POST /api/v1/candidates/:id/comments
interface CreateCommentInput {
  content: string;
  rating?: number; // Optional, can update rating separately
}

// GET /api/v1/candidates/:id/comments
interface CommentResponse {
  id: string;
  content: string;
  rating: number | null;
  createdAt: string;
  author: {
    name: string;
    role: string;
  } | null;
}

// UI: Show comments timeline
<CommentTimeline>
  {comments.map(comment => (
    <Comment>
      <CommentHeader>
        <Author>{comment.author?.name || 'System'}</Author>
        <Timestamp>{formatRelative(comment.createdAt)}</Timestamp>
        {comment.rating && <Rating>{comment.rating}</Rating>}
      </CommentHeader>
      <CommentContent>{comment.content}</CommentContent>
    </Comment>
  ))}
</CommentTimeline>
```

**Migration Strategy**:
1. Add `CandidateComment` model to schema
2. Migrate existing `notes` to first comment (preserve data)
3. Update frontend to show comments timeline
4. Keep `notes` field synced with latest comment for backward compatibility

---

## Feature 3: Standardized Likert Scale Rating System

### Current Implementation Status
✅ **FULLY IMPLEMENTED** - 1-5 rating system with semantic labels

### Current Implementation
```typescript
// Rating scale: 1 (highest) to 5 (lowest)
// Database: candidate.interviewRating (Int, nullable)

// Utils: frontend/src/utils/ratings.ts
const RATING_LABELS = {
  1: 'Excellent (1)',
  2: 'Good (2)',
  3: 'Consider (3)',
  4: 'Borderline (4)',
  5: 'Fail (5)',
};

// Visual badges with color coding
function getRatingBadgeClasses(rating: number | null) {
  if (!rating) return 'bg-gray-100 text-gray-600'; // Not rated
  if (rating <= 2) return 'bg-green-100 text-green-800'; // Pass
  if (rating === 3) return 'bg-yellow-100 text-yellow-800'; // Consider
  return 'bg-red-100 text-red-800'; // Fail (4-5)
}
```

### Evaluation Criteria
- **1-2 (Passed)**: Strong candidates, move to next stage
- **3 (For Consideration)**: Requires discussion, may need additional evaluation
- **4 (Borderline Fail)**: Weak performance, unlikely to proceed
- **5 (Failed)**: Clear rejection

### Enhancement Recommendations

#### 3.1 Stage-Based Rating Requirements
**Priority**: Medium
**Complexity**: Medium

**Design**: Make rating mandatory for certain stage transitions

```typescript
// Define rating requirements per stage
const RATING_REQUIRED_STAGES = [
  'interview_done',
  'tests_done',
  'mock_done',
  'probation_end',
];

// Validation in backend
async function updateCandidateStage(
  candidateId: string,
  newStage: PipelineStage
) {
  const candidate = await getCandidateById(candidateId);

  // Enforce rating requirement
  if (RATING_REQUIRED_STAGES.includes(newStage)) {
    if (!candidate.interviewRating) {
      throw new Error(
        `Rating required before moving to ${STAGE_LABELS[newStage]}`
      );
    }
  }

  // Auto-progress logic based on rating
  if (newStage === 'interview_done' && candidate.interviewRating) {
    if (candidate.interviewRating <= 2) {
      // Auto-suggest next stage: tests_scheduled
      return {
        updated: candidate,
        suggestedNextStage: 'tests_scheduled',
        message: 'Candidate rated highly, ready for testing phase'
      };
    } else if (candidate.interviewRating >= 4) {
      // Suggest rejection workflow
      return {
        updated: candidate,
        suggestedAction: 'reject',
        message: 'Low rating, consider rejection'
      };
    }
  }

  return { updated: candidate };
}
```

**Frontend Changes**:
```typescript
// Show rating requirement indicator
<StageTransitionButton
  disabled={requiresRating && !candidate.interviewRating}
  tooltip={requiresRating ? 'Rating required for this stage' : undefined}
>
  Move to {nextStage}
</StageTransitionButton>

// Smart suggestions after rating
{ratingJustUpdated && rating <= 2 && (
  <Alert variant="success">
    High rating! Ready to move to {suggestedNextStage}?
    <Button onClick={handleAutoAdvance}>Move Forward</Button>
  </Alert>
)}
```

#### 3.2 Rating Analytics and Trends
**Priority**: Low
**Complexity**: Medium

**Metrics to Track**:
- Average rating by source
- Rating distribution across stages
- Interviewer rating patterns (if user tracking added)
- Time-to-rate after interview completion

---

## Feature 4: Source Analytics and Conversion Tracking

### Current Implementation Status
🔄 **PARTIALLY IMPLEMENTED** - Basic structure exists, needs enhancement

### Current Features
- `SourceWithStats` type includes `interviewInsights`
- Backend service calculates:
  - `interviewed`: Candidates with any rating
  - `passed`: Candidates with rating ≤ 2
  - `failed`: Candidates with rating ≥ 4
- Data available at `GET /api/v1/sources` endpoint

### Current Implementation
```typescript
// backend/src/services/sourceService.ts
interface SourceInterviewInsights {
  interviewed: number;
  passed: number;
  failed: number;
}

const PASSING_RATING_MAX = 2;
const FAILING_RATING_MIN = 4;

async function buildInterviewInsights(
  sourceIds: string[]
): Promise<Record<string, SourceInterviewInsights>> {
  // Aggregates candidate counts per source
  // Groups by sourceId with filters on interviewRating
}
```

### Enhancement Requirements

#### 4.1 Enhanced Source Analytics Dashboard
**Priority**: HIGH
**Complexity**: Medium

**Design**: Create dedicated Sources page with analytics table

```typescript
// Frontend: pages/Sources/SourceAnalytics.tsx
interface SourceAnalyticsRow {
  id: string;
  name: string;
  type: string | null;

  // Candidate metrics
  totalCandidates: number;

  // Interview metrics
  interviewed: number;
  interviewedPercent: number; // interviewed / totalCandidates

  // Outcome metrics
  passed: number;
  failed: number;
  pending: number; // interviewed - passed - failed (ratings 3 only)

  // Conversion metrics
  passRate: number;         // passed / interviewed
  failRate: number;         // failed / interviewed
  pendingRate: number;      // pending / interviewed

  // Quality score (weighted)
  qualityScore: number;     // (passed * 2) - failed / interviewed
}

// UI Layout
<SourceAnalyticsTable>
  <TableHeader>
    <Column>Source Name</Column>
    <Column>Total</Column>
    <Column>Interviewed</Column>
    <Column>Passed (1-2)</Column>
    <Column>Consider (3)</Column>
    <Column>Failed (4-5)</Column>
    <Column>Pass Rate</Column>
    <Column>Quality Score</Column>
  </TableHeader>
  <TableBody>
    {sources.map(source => (
      <TableRow key={source.id}>
        <Cell>{source.name}</Cell>
        <Cell>{source.totalCandidates}</Cell>
        <Cell>
          {source.interviewed}
          <Badge>{source.interviewedPercent}%</Badge>
        </Cell>
        <Cell>
          <Badge variant="success">{source.passed}</Badge>
        </Cell>
        <Cell>
          <Badge variant="warning">{source.pending}</Badge>
        </Cell>
        <Cell>
          <Badge variant="danger">{source.failed}</Badge>
        </Cell>
        <Cell>
          <ProgressBar
            value={source.passRate}
            color="green"
          />
          {source.passRate}%
        </Cell>
        <Cell>
          <QualityBadge score={source.qualityScore}>
            {source.qualityScore.toFixed(2)}
          </QualityBadge>
        </Cell>
      </TableRow>
    ))}
  </TableBody>
</SourceAnalyticsTable>
```

**Backend API Enhancement**:
```typescript
// GET /api/v1/sources/analytics
export interface SourceAnalytics {
  id: string;
  name: string;
  type: string | null;
  totalCandidates: number;
  interviewMetrics: {
    interviewed: number;
    passed: number;        // rating 1-2
    consideration: number; // rating 3
    failed: number;        // rating 4-5
    notRated: number;      // interviewed but no rating yet
  };
  conversionRates: {
    interviewRate: number;  // interviewed / total
    passRate: number;       // passed / interviewed
    failRate: number;       // failed / interviewed
    qualityScore: number;   // (passed * 2 - failed) / interviewed
  };
  pipeline: {
    active: number;         // Current candidates in pipeline
    completed: number;      // Reached probation_end
    dropped: number;        // High rating but not progressed in 30 days
  };
}

// Service implementation
export async function getSourceAnalytics(): Promise<SourceAnalytics[]> {
  const sources = await prisma.source.findMany({
    include: {
      _count: {
        select: { candidates: true }
      },
      candidates: {
        select: {
          id: true,
          interviewRating: true,
          currentStage: true,
          updatedAt: true,
        }
      }
    }
  });

  return sources.map(source => {
    const candidates = source.candidates;
    const total = candidates.length;
    const interviewed = candidates.filter(c => c.interviewRating !== null);
    const passed = interviewed.filter(c => c.interviewRating <= 2);
    const consideration = interviewed.filter(c => c.interviewRating === 3);
    const failed = interviewed.filter(c => c.interviewRating >= 4);
    const notRated = candidates.filter(c =>
      ['interview_done', 'tests_done', 'mock_done'].includes(c.currentStage) &&
      c.interviewRating === null
    );

    const interviewRate = total > 0 ? (interviewed.length / total) * 100 : 0;
    const passRate = interviewed.length > 0 ? (passed.length / interviewed.length) * 100 : 0;
    const failRate = interviewed.length > 0 ? (failed.length / interviewed.length) * 100 : 0;
    const qualityScore = interviewed.length > 0
      ? (passed.length * 2 - failed.length) / interviewed.length
      : 0;

    return {
      id: source.id,
      name: source.name,
      type: source.type,
      totalCandidates: total,
      interviewMetrics: {
        interviewed: interviewed.length,
        passed: passed.length,
        consideration: consideration.length,
        failed: failed.length,
        notRated: notRated.length,
      },
      conversionRates: {
        interviewRate,
        passRate,
        failRate,
        qualityScore,
      },
      pipeline: {
        active: candidates.filter(c =>
          !['probation_end'].includes(c.currentStage)
        ).length,
        completed: candidates.filter(c =>
          c.currentStage === 'probation_end'
        ).length,
        dropped: 0, // TODO: Implement drop detection
      }
    };
  });
}
```

#### 4.2 Visual Analytics Components
**Priority**: Medium
**Complexity**: Medium

**Components to Build**:

1. **Source Performance Chart**
```typescript
// Bar chart: Sources vs Pass Rate
<BarChart
  data={sources}
  x="name"
  y="passRate"
  color={(d) => d.passRate > 50 ? 'green' : 'red'}
  title="Source Performance by Pass Rate"
/>
```

2. **Source Quality Matrix**
```typescript
// Scatter plot: Volume vs Quality
<ScatterPlot
  data={sources}
  x="totalCandidates"      // Volume
  y="qualityScore"         // Quality
  size="interviewed"       // Bubble size
  color="passRate"         // Color gradient
  quadrants={{
    topRight: "High Volume + High Quality",
    topLeft: "Low Volume + High Quality",
    bottomRight: "High Volume + Low Quality",
    bottomLeft: "Low Volume + Low Quality",
  }}
/>
```

3. **Funnel Visualization**
```typescript
// Pipeline funnel per source
<FunnelChart
  stages={[
    { name: 'Total Candidates', count: total },
    { name: 'Interviewed', count: interviewed },
    { name: 'Passed', count: passed },
    { name: 'In Pipeline', count: active },
    { name: 'Completed', count: completed },
  ]}
  dropOffColor="red"
/>
```

#### 4.3 Source Comparison Tool
**Priority**: Low
**Complexity**: Low

```typescript
// Select 2-3 sources for side-by-side comparison
<SourceComparison selectedIds={[source1, source2, source3]}>
  <ComparisonTable>
    <Metric label="Total Candidates" values={[45, 32, 78]} />
    <Metric label="Pass Rate" values={[65%, 48%, 72%]} highlight="max" />
    <Metric label="Quality Score" values={[1.2, 0.8, 1.5]} highlight="max" />
    <Metric label="Avg Time to Interview" values={[5d, 8d, 3d]} highlight="min" />
  </ComparisonTable>
</SourceComparison>
```

---

## Feature 5: High-Performer Filtering System

### Current Implementation Status
✅ **FULLY IMPLEMENTED** - Filter for ratings 1-2 exists

### Current Features
```typescript
// Frontend: CandidateList.tsx
const [passedOnly, setPassedOnly] = useState(false);

// Query parameters
const { data } = useCandidates({
  minInterviewRating: passedOnly ? 1 : undefined,
  maxInterviewRating: passedOnly ? 2 : undefined,
  // ... other filters
});

// UI Toggle
<Button
  variant={passedOnly ? 'success' : 'ghost'}
  onClick={handleTogglePassedFilter}
>
  {passedOnly ? 'Showing ratings 1–2' : 'Show ratings 1–2'}
</Button>
```

### Enhancement Recommendations

#### 5.1 Advanced Rating Filters
**Priority**: Low
**Complexity**: Low

**Design**: Add more granular rating filter options

```typescript
// Rating filter options
const ratingFilterOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: 'excellent', label: 'Excellent (1)', filter: { exact: 1 } },
  { value: 'good', label: 'Good (2)', filter: { exact: 2 } },
  { value: 'passed', label: 'Passed (1-2)', filter: { min: 1, max: 2 } },
  { value: 'consider', label: 'Consider (3)', filter: { exact: 3 } },
  { value: 'failed', label: 'Failed (4-5)', filter: { min: 4, max: 5 } },
  { value: 'not_rated', label: 'Not Rated', filter: { isNull: true } },
];

// UI: Dropdown instead of toggle
<Select
  label="Rating Filter"
  options={ratingFilterOptions}
  value={ratingFilter}
  onChange={setRatingFilter}
/>
```

#### 5.2 Quick Action Buttons
**Priority**: Medium
**Complexity**: Low

**Design**: Add preset filter combinations

```typescript
<FilterPresets>
  <PresetButton
    label="Ready for Next Stage"
    onClick={() => setFilters({
      minInterviewRating: 1,
      maxInterviewRating: 2,
      currentStage: 'interview_done',
    })}
    icon={<CheckCircle />}
    count={readyCount}
  />

  <PresetButton
    label="Needs Rating"
    onClick={() => setFilters({
      hasInterviewRating: false,
      currentStage: ['interview_done', 'tests_done', 'mock_done'],
    })}
    icon={<AlertCircle />}
    count={needsRatingCount}
    variant="warning"
  />

  <PresetButton
    label="Top Performers"
    onClick={() => setFilters({
      interviewRating: 1,
    })}
    icon={<Star />}
    count={topPerformersCount}
    variant="success"
  />

  <PresetButton
    label="Stagnant Candidates"
    onClick={() => setFilters({
      updatedBefore: sevenDaysAgo,
      currentStage: ['qualifying', 'interview_scheduled'],
    })}
    icon={<Clock />}
    count={stagnantCount}
    variant="warning"
  />
</FilterPresets>
```

#### 5.3 Saved Filter Views
**Priority**: Low
**Complexity**: Medium

**Design**: Allow users to save and name filter combinations

```typescript
// Store in localStorage or backend user preferences
interface SavedFilterView {
  id: string;
  name: string;
  filters: CandidateFilters;
  createdAt: string;
}

// UI
<FilterViewSelector>
  <Select
    label="Saved Views"
    options={savedViews}
    value={currentView}
    onChange={loadView}
  />
  <Button onClick={openSaveViewModal}>Save Current View</Button>
</FilterViewSelector>

// Modal to save
<Modal title="Save Filter View">
  <Input
    label="View Name"
    placeholder="e.g., High Priority Interviews"
    value={viewName}
  />
  <Button onClick={saveCurrentFilters}>Save</Button>
</Modal>
```

---

## Implementation Priority Matrix

### Phase 1: Quick Wins (1-2 days)
**Priority**: HIGH | **Complexity**: LOW

1. ✅ Verify all current features working correctly
2. 🔄 **Source Analytics Dashboard** - Create `/sources/analytics` page
3. 🔄 **Enhanced Source Data API** - Implement `GET /api/v1/sources/analytics`
4. Add quick filter preset buttons for candidates
5. Improve stage summary visual indicators

### Phase 2: Core Enhancements (3-5 days)
**Priority**: MEDIUM | **Complexity**: MEDIUM

1. **Comment History System**:
   - Add `CandidateComment` model
   - Migrate existing notes to comments
   - Create comment timeline UI
   - Implement `POST /api/v1/candidates/:id/comments`

2. **Stage-Based Rating Requirements**:
   - Add validation for rating-required stages
   - Implement auto-progression suggestions
   - Add rating requirement indicators in UI

3. **Source Analytics Visualizations**:
   - Bar chart for source performance
   - Quality score indicators
   - Source comparison tool

### Phase 3: Advanced Features (5-7 days)
**Priority**: LOW | **Complexity**: MEDIUM-HIGH

1. Saved filter views with user preferences
2. Rich text editor for notes (Markdown support)
3. Advanced analytics dashboards with charts
4. Email notifications for stagnant candidates
5. Export analytics to CSV/PDF

---

## Database Migration Plan

### Migration 1: Add Comment History
```prisma
model CandidateComment {
  id          String    @id @default(uuid())
  candidateId String    @map("candidate_id")
  userId      String?   @map("user_id")
  userRole    OwnerRole?
  content     String    @db.Text
  rating      Int?
  createdAt   DateTime  @default(now()) @map("created_at")

  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@index([candidateId, createdAt])
  @@map("candidate_comments")
}

// Update Candidate model
model Candidate {
  // ... existing fields
  comments    CandidateComment[]
}
```

**Migration SQL**:
```sql
-- Create candidate_comments table
CREATE TABLE candidate_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID,
  user_role TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_candidate FOREIGN KEY (candidate_id)
    REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE INDEX idx_candidate_comments_candidate_created
  ON candidate_comments(candidate_id, created_at DESC);

-- Migrate existing notes to comments
INSERT INTO candidate_comments (candidate_id, content, rating, created_at)
SELECT id, notes, interview_rating, updated_at
FROM candidates
WHERE notes IS NOT NULL AND TRIM(notes) != '';

-- Keep notes field for backward compatibility
-- It will be synced with latest comment
```

### Migration 2: Add Source Analytics Indexes
```sql
-- Optimize source analytics queries
CREATE INDEX idx_candidates_source_rating
  ON candidates(source_id, interview_rating)
  WHERE interview_rating IS NOT NULL;

CREATE INDEX idx_candidates_source_stage
  ON candidates(source_id, current_stage);

CREATE INDEX idx_candidates_updated_at
  ON candidates(updated_at DESC);
```

---

## API Specification Updates

### New Endpoints

#### 1. Source Analytics
```typescript
GET /api/v1/sources/analytics

Response: SourceAnalytics[]
{
  "id": "uuid",
  "name": "LinkedIn",
  "type": "professional_network",
  "totalCandidates": 45,
  "interviewMetrics": {
    "interviewed": 32,
    "passed": 21,
    "consideration": 5,
    "failed": 6,
    "notRated": 3
  },
  "conversionRates": {
    "interviewRate": 71.11,
    "passRate": 65.63,
    "failRate": 18.75,
    "qualityScore": 1.13
  },
  "pipeline": {
    "active": 28,
    "completed": 5,
    "dropped": 2
  }
}
```

#### 2. Candidate Comments
```typescript
POST /api/v1/candidates/:id/comments

Request Body:
{
  "content": "Great technical knowledge, strong communication",
  "rating": 1  // Optional
}

Response:
{
  "message": "Comment added successfully",
  "comment": {
    "id": "uuid",
    "content": "...",
    "rating": 1,
    "createdAt": "2025-11-13T...",
    "author": {
      "name": "John Doe",
      "role": "interviewer"
    }
  }
}

---

GET /api/v1/candidates/:id/comments

Response:
{
  "comments": [
    {
      "id": "uuid",
      "content": "Initial screening call - promising candidate",
      "rating": null,
      "createdAt": "2025-11-10T...",
      "author": {
        "name": "Jane Smith",
        "role": "sourcer"
      }
    },
    {
      "id": "uuid",
      "content": "Technical interview - excellent problem solving",
      "rating": 1,
      "createdAt": "2025-11-12T...",
      "author": {
        "name": "John Doe",
        "role": "interviewer"
      }
    }
  ]
}
```

### Enhanced Endpoints

#### 1. Candidate List Filters
```typescript
GET /api/v1/candidates

New Query Parameters:
- updatedBefore: Date      // Find stagnant candidates
- updatedAfter: Date       // Recent activity
- hasNotes: boolean        // Has any notes
- stageIn: string[]        // Multiple stages filter
- ratingExact: number      // Exact rating match

Example:
GET /api/v1/candidates?minInterviewRating=1&maxInterviewRating=2&currentStage=interview_done
GET /api/v1/candidates?hasInterviewRating=false&stageIn=interview_done,tests_done
GET /api/v1/candidates?updatedBefore=2025-11-06&currentStage=qualifying
```

---

## UI/UX Design Guidelines

### Component Hierarchy

```
Pages/
├── Candidates/
│   ├── CandidateList.tsx          ✅ Exists
│   ├── StageSummary.tsx           ✅ Exists
│   ├── CandidateFeedbackModal.tsx ✅ Exists
│   ├── FilterPresets.tsx          🆕 To Build
│   └── CommentTimeline.tsx        🆕 To Build
│
├── Sources/
│   ├── SourceList.tsx             ✅ Exists (basic)
│   ├── SourceAnalytics.tsx        🆕 To Build
│   ├── SourceComparison.tsx       🆕 To Build
│   └── SourcePerformanceChart.tsx 🆕 To Build
│
└── Dashboard/
    └── Dashboard.tsx              ✅ Exists
```

### Design Tokens

```typescript
// Colors for rating badges
const RATING_COLORS = {
  1: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  2: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  3: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  4: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  5: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  null: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
};

// Stage colors (already defined)
const STAGE_COLORS = {
  new: 'bg-gray-500',
  qualifying: 'bg-blue-500',
  interview_scheduled: 'bg-indigo-500',
  interview_done: 'bg-purple-500',
  tests_scheduled: 'bg-pink-500',
  tests_done: 'bg-rose-500',
  mock_scheduled: 'bg-orange-500',
  mock_done: 'bg-amber-500',
  onboarding_assigned: 'bg-yellow-500',
  onboarding_done: 'bg-lime-500',
  probation_start: 'bg-green-500',
  probation_end: 'bg-emerald-500',
};
```

### Accessibility Requirements

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader Support**: Proper ARIA labels on all form fields and buttons
3. **Color Contrast**: All text meets WCAG AA standards (4.5:1 ratio)
4. **Focus Indicators**: Visible focus states on all interactive elements
5. **Error Messaging**: Clear, descriptive error messages for form validation

---

## Testing Strategy

### Unit Tests
```typescript
// Test rating validation
describe('Rating System', () => {
  it('should accept ratings 1-5', () => {
    expect(validateRating(1)).toBe(true);
    expect(validateRating(5)).toBe(true);
  });

  it('should reject invalid ratings', () => {
    expect(validateRating(0)).toBe(false);
    expect(validateRating(6)).toBe(false);
  });

  it('should classify ratings correctly', () => {
    expect(isPassingRating(1)).toBe(true);
    expect(isPassingRating(2)).toBe(true);
    expect(isPassingRating(3)).toBe(false);
    expect(isFailingRating(4)).toBe(true);
    expect(isFailingRating(5)).toBe(true);
  });
});

// Test source analytics calculations
describe('Source Analytics', () => {
  it('should calculate pass rate correctly', () => {
    const source = {
      interviewed: 10,
      passed: 7,
      failed: 3,
    };
    expect(calculatePassRate(source)).toBe(70);
  });

  it('should calculate quality score correctly', () => {
    const source = {
      interviewed: 10,
      passed: 7,
      failed: 2,
    };
    // (7 * 2 - 2) / 10 = 1.2
    expect(calculateQualityScore(source)).toBe(1.2);
  });
});
```

### Integration Tests
```typescript
describe('Candidate Feedback Flow', () => {
  it('should save feedback with rating and notes', async () => {
    const response = await api.patch('/candidates/123/feedback', {
      interviewRating: 1,
      notes: 'Excellent candidate'
    });

    expect(response.status).toBe(200);
    expect(response.data.candidate.interviewRating).toBe(1);
    expect(response.data.candidate.notes).toBe('Excellent candidate');
  });

  it('should filter candidates by rating range', async () => {
    const response = await api.get('/candidates', {
      params: {
        minInterviewRating: 1,
        maxInterviewRating: 2
      }
    });

    expect(response.status).toBe(200);
    response.data.data.forEach(candidate => {
      expect(candidate.interviewRating).toBeGreaterThanOrEqual(1);
      expect(candidate.interviewRating).toBeLessThanOrEqual(2);
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
test('Interviewer can add feedback and see updated rating', async ({ page }) => {
  // Navigate to candidates page
  await page.goto('/candidates');

  // Click feedback button for first candidate
  await page.click('[data-testid="candidate-row-1"] button:has-text("Feedback")');

  // Fill feedback form
  await page.selectOption('[data-testid="rating-select"]', '1');
  await page.fill('[data-testid="notes-textarea"]', 'Strong technical skills');
  await page.click('button:has-text("Save")');

  // Verify success message
  await expect(page.locator('.success-message')).toContainText('Interview feedback saved');

  // Verify rating badge updated
  await expect(page.locator('[data-testid="candidate-row-1"] .rating-badge'))
    .toContainText('Excellent (1)');
});

test('User can filter high performers and see correct results', async ({ page }) => {
  await page.goto('/candidates');

  // Click filter toggle
  await page.click('button:has-text("Show ratings 1–2")');

  // Verify filter applied
  await expect(page.locator('button:has-text("Showing ratings 1–2")')).toBeVisible();

  // Verify all candidates have ratings 1 or 2
  const ratingBadges = await page.locator('.rating-badge').allTextContents();
  ratingBadges.forEach(badge => {
    expect(badge).toMatch(/Excellent|Good/);
  });
});
```

---

## Performance Considerations

### Database Query Optimization

1. **Source Analytics Query**:
   - Use database aggregation instead of client-side filtering
   - Add indexes on `sourceId` and `interviewRating`
   - Cache results for 5-10 minutes using Redis

```typescript
// Optimized query with aggregation
const sourceStats = await prisma.$queryRaw`
  SELECT
    s.id,
    s.name,
    COUNT(c.id) as total_candidates,
    COUNT(CASE WHEN c.interview_rating IS NOT NULL THEN 1 END) as interviewed,
    COUNT(CASE WHEN c.interview_rating <= 2 THEN 1 END) as passed,
    COUNT(CASE WHEN c.interview_rating = 3 THEN 1 END) as consideration,
    COUNT(CASE WHEN c.interview_rating >= 4 THEN 1 END) as failed,
    ROUND(AVG(CASE WHEN c.interview_rating IS NOT NULL
      THEN c.interview_rating END), 2) as avg_rating
  FROM sources s
  LEFT JOIN candidates c ON c.source_id = s.id
  GROUP BY s.id, s.name
  ORDER BY total_candidates DESC
`;
```

2. **Pagination for Large Datasets**:
   - Always use limit/offset for candidate lists
   - Default page size: 20 items
   - Maximum page size: 100 items

3. **Debounce Search Inputs**:
   - 300ms delay for search term updates
   - Cancel in-flight requests on new search

### Frontend Optimization

1. **React Query Caching**:
   ```typescript
   // Cache candidate stats for 1 minute
   useQuery({
     queryKey: ['candidate-stats'],
     queryFn: fetchCandidateStats,
     staleTime: 60000,
     cacheTime: 300000,
   });

   // Cache source analytics for 5 minutes
   useQuery({
     queryKey: ['source-analytics'],
     queryFn: fetchSourceAnalytics,
     staleTime: 300000,
     cacheTime: 600000,
   });
   ```

2. **Virtual Scrolling for Long Lists**:
   - Use `react-virtual` for lists >100 items
   - Render only visible items + buffer

3. **Code Splitting**:
   ```typescript
   // Lazy load analytics pages
   const SourceAnalytics = lazy(() =>
     import('./pages/Sources/SourceAnalytics')
   );
   ```

---

## Security Considerations

### Authorization
- All candidate update operations require authentication
- Role-based access control for sensitive operations:
  - `sourcer`: Can create, view, update candidates (limited fields)
  - `interviewer`: Can add feedback, rating, notes
  - `chatting_managers`: Full access to all operations

### Data Validation
```typescript
// Backend validation for rating
function validateRating(rating: number | null): void {
  if (rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }
}

// Sanitize notes input
function sanitizeNotes(notes: string): string {
  return notes
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .substring(0, 10000); // Max 10k characters
}
```

### Audit Logging
```typescript
// Log all feedback updates to AuditLog table
await prisma.auditLog.create({
  data: {
    entityType: 'candidate',
    entityId: candidateId,
    userId: req.user?.id,
    userRole: req.user?.role,
    action: 'update_feedback',
    oldValue: { rating: oldRating, notes: oldNotes },
    newValue: { rating: newRating, notes: newNotes },
  }
});
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Run E2E tests on staging
- [ ] Database migrations tested on staging
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Code review approved

### Deployment Steps
1. Backup production database
2. Run database migrations
3. Deploy backend API changes
4. Deploy frontend build
5. Verify all endpoints responding
6. Smoke test critical flows
7. Monitor error logs for 1 hour

### Post-Deployment
- [ ] Verify source analytics loading correctly
- [ ] Test feedback submission
- [ ] Test rating filters
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Collect user feedback

---

## Documentation Requirements

### User Documentation
1. **Rating System Guide**:
   - Explanation of 1-5 scale
   - When to use each rating
   - How ratings affect pipeline progression

2. **Source Analytics Guide**:
   - How to read analytics dashboard
   - Understanding quality scores
   - Using comparison tools

3. **Feedback Best Practices**:
   - Writing effective notes
   - Using comment history
   - Rating consistently

### Developer Documentation
1. **API Documentation**:
   - OpenAPI spec for new endpoints
   - Example requests and responses
   - Error codes and handling

2. **Database Schema**:
   - Updated ERD with new tables
   - Index documentation
   - Migration guide

3. **Component Library**:
   - Storybook for new components
   - Props documentation
   - Usage examples

---

## Success Metrics

### Adoption Metrics
- % of candidates with ratings (target: >80%)
- % of candidates with notes (target: >60%)
- Average time to add feedback (target: <2 minutes)
- Daily active users on analytics page (target: >5)

### Quality Metrics
- Rating consistency across interviewers (std dev <1.0)
- Notes completeness (avg >50 characters)
- Source analytics data accuracy (100%)

### Performance Metrics
- Page load time <2s (p95)
- API response time <500ms (p95)
- Source analytics query time <1s

---

## Future Enhancements (Phase 4+)

### Advanced Features
1. **Predictive Analytics**:
   - ML model to predict candidate success based on source and early ratings
   - Risk scoring for drop-off probability

2. **Email Notifications**:
   - Alert interviewers when candidates need rating
   - Weekly digest of source performance

3. **Mobile App**:
   - iOS/Android app for quick feedback on the go
   - Push notifications for rating reminders

4. **Integration APIs**:
   - Webhook support for external ATS systems
   - Slack integration for candidate updates

5. **Advanced Reporting**:
   - Custom report builder
   - Export to Excel/PDF
   - Scheduled reports via email

---

## Conclusion

This design specification provides a comprehensive blueprint for enhancing the Beloura hiring system with five key features. The system already has strong foundations with the rating system, feedback modal, and stage summaries implemented. The primary focus for Phase 1 should be building out the **Source Analytics Dashboard** to provide valuable insights into recruiting channel performance.

### Immediate Next Steps

1. ✅ **Validate Current Implementation**: Ensure all existing features work correctly
2. 🔄 **Build Source Analytics API**: Implement `GET /api/v1/sources/analytics` endpoint
3. 🔄 **Create Analytics UI**: Design and build the source analytics dashboard
4. Plan Phase 2 features based on user feedback from Phase 1

### Key Principles
- **Incremental delivery**: Ship features in phases, gather feedback
- **Data-driven design**: Base all enhancements on actual user needs
- **Maintainability**: Write clean, tested, documented code
- **Performance**: Optimize queries and use caching appropriately
- **User experience**: Prioritize intuitive, accessible interfaces

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Next Review**: After Phase 1 completion
