import { Router } from 'express';
import {
  createReferrerHandler,
  getReferrerHandler,
  getReferrerByExternalIdHandler,
  listReferrersHandler,
  updateReferrerHandler,
  deleteReferrerHandler,
  getReferrerStatsHandler,
} from '../controllers/referrerController';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/referrers/stats
 * Get referrer statistics
 */
router.get('/stats', getReferrerStatsHandler);

/**
 * GET /api/v1/referrers/external/:externalId
 * Get referrer by external ID
 */
router.get('/external/:externalId', getReferrerByExternalIdHandler);

/**
 * GET /api/v1/referrers
 * List referrers with optional filtering, pagination, and search
 */
router.get(
  '/',
  validateQuery([
    { field: 'externalId', required: false, type: 'string', minLength: 1 },
    { field: 'search', required: false, type: 'string', minLength: 1 },
    { field: 'createdFrom', required: false, type: 'string' },
    { field: 'createdTo', required: false, type: 'string' },
    { field: 'limit', required: false, type: 'number', min: 1, max: 100 },
    { field: 'offset', required: false, type: 'number', min: 0 },
    {
      field: 'sortBy',
      required: false,
      enum: ['name', 'externalId', 'createdAt'],
    },
    { field: 'sortOrder', required: false, enum: ['asc', 'desc'] },
  ]),
  listReferrersHandler
);

/**
 * POST /api/v1/referrers
 * Create a new referrer
 */
router.post(
  '/',
  validateBody([
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'externalId', required: false, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'telegram', required: false, type: 'string', minLength: 1, maxLength: 50 },
  ]),
  createReferrerHandler
);

/**
 * GET /api/v1/referrers/:id
 * Get referrer by ID
 */
router.get('/:id', getReferrerHandler);

/**
 * PATCH /api/v1/referrers/:id
 * Update referrer
 */
router.patch(
  '/:id',
  validateBody([
    { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'externalId', required: false, type: 'string', minLength: 1, maxLength: 50 },
    { field: 'telegram', required: false, type: 'string', minLength: 1, maxLength: 50 },
  ]),
  updateReferrerHandler
);

/**
 * DELETE /api/v1/referrers/:id
 * Delete referrer
 */
router.delete('/:id', deleteReferrerHandler);

export default router;
