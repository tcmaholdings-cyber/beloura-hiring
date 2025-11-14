import { Router } from 'express';
import {
  createSourceHandler,
  getSourceHandler,
  listSourcesHandler,
  updateSourceHandler,
  deleteSourceHandler,
  getSourceStatsHandler,
  getSourceAnalyticsHandler,
} from '../controllers/sourceController';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/sources/analytics
 * Get comprehensive source analytics
 */
router.get('/analytics', getSourceAnalyticsHandler);

/**
 * GET /api/v1/sources/stats
 * Get source statistics
 */
router.get('/stats', getSourceStatsHandler);

/**
 * GET /api/v1/sources
 * List sources with optional filtering, pagination, and search
 */
router.get(
  '/',
  validateQuery([
    { field: 'type', required: false, type: 'string', minLength: 1 },
    { field: 'search', required: false, type: 'string', minLength: 1 },
    { field: 'createdFrom', required: false, type: 'string' },
    { field: 'createdTo', required: false, type: 'string' },
    { field: 'limit', required: false, type: 'number', min: 1, max: 100 },
    { field: 'offset', required: false, type: 'number', min: 0 },
    { field: 'sortBy', required: false, enum: ['name', 'type', 'createdAt'] },
    { field: 'sortOrder', required: false, enum: ['asc', 'desc'] },
  ]),
  listSourcesHandler
);

/**
 * POST /api/v1/sources
 * Create a new source
 */
router.post(
  '/',
  validateBody([
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'type', required: false, type: 'string', minLength: 1, maxLength: 50 },
  ]),
  createSourceHandler
);

/**
 * GET /api/v1/sources/:id
 * Get source by ID
 */
router.get('/:id', getSourceHandler);

/**
 * PATCH /api/v1/sources/:id
 * Update source
 */
router.patch(
  '/:id',
  validateBody([
    { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'type', required: false, type: 'string', minLength: 1, maxLength: 50 },
  ]),
  updateSourceHandler
);

/**
 * DELETE /api/v1/sources/:id
 * Delete source
 */
router.delete('/:id', deleteSourceHandler);

export default router;
