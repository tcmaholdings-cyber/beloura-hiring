import { Router } from 'express';
import {
  createCandidateHandler,
  getCandidateHandler,
  listCandidatesHandler,
  updateCandidateHandler,
  deleteCandidateHandler,
  bulkUpdateStagesHandler,
  getCandidateStatsHandler,
  updateCandidateFeedbackHandler,
} from '../controllers/candidateController';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/candidates/stats
 * Get candidate statistics
 */
router.get('/stats', getCandidateStatsHandler);

/**
 * POST /api/v1/candidates/bulk/update-stages
 * Bulk update candidate stages
 */
router.post(
  '/bulk/update-stages',
  validateBody([
    { field: 'candidateIds', required: true, type: 'array', arrayItemType: 'uuid', minItems: 1 },
    {
      field: 'currentStage',
      required: true,
      enum: [
        'new',
        'qualifying',
        'interview_scheduled',
        'interview_done',
        'tests_scheduled',
        'tests_done',
        'mock_scheduled',
        'mock_done',
        'onboarding_assigned',
        'onboarding_done',
        'probation_start',
        'probation_end',
      ],
    },
  ]),
  bulkUpdateStagesHandler
);

/**
 * GET /api/v1/candidates
 * List candidates with optional filtering, pagination, and search
 */
router.get(
  '/',
  validateQuery([
    {
      field: 'currentStage',
      required: false,
      enum: [
        'new',
        'qualifying',
        'interview_scheduled',
        'interview_done',
        'tests_scheduled',
        'tests_done',
        'mock_scheduled',
        'mock_done',
        'onboarding_assigned',
        'onboarding_done',
        'probation_start',
        'probation_end',
      ],
    },
    {
      field: 'currentOwner',
      required: false,
      enum: ['sourcer', 'interviewer', 'chatting_managers'],
    },
    { field: 'sourceId', required: false, type: 'uuid' },
    { field: 'referrerId', required: false, type: 'uuid' },
    { field: 'search', required: false, type: 'string', minLength: 1 },
    { field: 'createdFrom', required: false, type: 'string' },
    { field: 'createdTo', required: false, type: 'string' },
    { field: 'limit', required: false, type: 'number', min: 1, max: 100 },
    { field: 'offset', required: false, type: 'number', min: 0 },
    {
      field: 'sortBy',
      required: false,
      enum: ['name', 'currentStage', 'createdAt', 'updatedAt'],
    },
    { field: 'sortOrder', required: false, enum: ['asc', 'desc'] },
    { field: 'interviewRating', required: false, type: 'number', min: 1, max: 5 },
    { field: 'minInterviewRating', required: false, type: 'number', min: 1, max: 5 },
    { field: 'maxInterviewRating', required: false, type: 'number', min: 1, max: 5 },
    { field: 'hasInterviewRating', required: false, type: 'boolean' },
  ]),
  listCandidatesHandler
);

/**
 * POST /api/v1/candidates
 * Create a new candidate
 */
router.post(
  '/',
  validateBody([
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'telegram', required: false, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'country', required: false, type: 'string', minLength: 1, maxLength: 100 },
    { field: 'timezone', required: false, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'sourceId', required: false, type: 'uuid' },
    { field: 'referrerId', required: false, type: 'uuid' },
    {
      field: 'currentStage',
      required: false,
      enum: [
        'new',
        'qualifying',
        'interview_scheduled',
        'interview_done',
        'tests_scheduled',
        'tests_done',
        'mock_scheduled',
        'mock_done',
        'onboarding_assigned',
        'onboarding_done',
        'probation_start',
        'probation_end',
      ],
    },
    {
      field: 'currentOwner',
      required: false,
      enum: ['sourcer', 'interviewer', 'chatting_managers'],
    },
    { field: 'interviewRating', required: false, type: 'number', min: 1, max: 5 },
    { field: 'notes', required: false, type: 'string', maxLength: 5000 },
  ]),
  createCandidateHandler
);

/**
 * GET /api/v1/candidates/:id
 * Get candidate by ID
 */
router.get('/:id', getCandidateHandler);

/**
 * PATCH /api/v1/candidates/:id
 * Update candidate
 */
router.patch(
  '/:id',
  validateBody([
    { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'telegram', required: false, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'country', required: false, type: 'string', minLength: 1, maxLength: 100 },
    { field: 'timezone', required: false, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'sourceId', required: false, type: 'uuid' },
    { field: 'referrerId', required: false, type: 'uuid' },
    {
      field: 'currentStage',
      required: false,
      enum: [
        'new',
        'qualifying',
        'interview_scheduled',
        'interview_done',
        'tests_scheduled',
        'tests_done',
        'mock_scheduled',
        'mock_done',
        'onboarding_assigned',
        'onboarding_done',
        'probation_start',
        'probation_end',
      ],
    },
    {
      field: 'currentOwner',
      required: false,
      enum: ['sourcer', 'interviewer', 'chatting_managers'],
    },
    { field: 'interviewRating', required: false, type: 'number', min: 1, max: 5 },
    { field: 'notes', required: false, type: 'string', maxLength: 5000 },
  ]),
  updateCandidateHandler
);

/**
 * PATCH /api/v1/candidates/:id/feedback
 * Update candidate interview rating/notes
 */
router.patch(
  '/:id/feedback',
  validateBody([
    { field: 'interviewRating', required: false, type: 'number', min: 1, max: 5 },
    { field: 'notes', required: false, type: 'string', maxLength: 5000 },
  ]),
  updateCandidateFeedbackHandler
);

/**
 * DELETE /api/v1/candidates/:id
 * Delete candidate
 */
router.delete('/:id', deleteCandidateHandler);

export default router;
