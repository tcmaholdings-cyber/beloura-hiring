import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * PATCH /api/v1/users/me
 * Update current user profile
 */
router.patch(
  '/me',
  authenticate,
  validateBody([{ field: 'name', required: false, minLength: 2, maxLength: 100 }]),
  updateCurrentUser
);

/**
 * GET /api/v1/users
 * List all users (optionally filtered by role)
 * RESTRICTED: chatting_managers only
 */
router.get(
  '/',
  authenticate,
  requireRole('chatting_managers'),
  validateQuery([
    {
      field: 'role',
      required: false,
      enum: ['sourcer', 'interviewer', 'chatting_managers'],
    },
  ]),
  listUsers
);

/**
 * POST /api/v1/users
 * Create new user
 * RESTRICTED: chatting_managers only
 */
router.post(
  '/',
  authenticate,
  requireRole('chatting_managers'),
  validateBody([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, type: 'string', minLength: 8 },
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'username', required: false, type: 'string', minLength: 3, maxLength: 50 },
    { field: 'role', required: true, enum: ['sourcer', 'interviewer', 'chatting_managers'] },
    { field: 'isActive', required: false, type: 'boolean' },
  ]),
  createUser
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 * RESTRICTED: chatting_managers only
 */
router.get('/:id', authenticate, requireRole('chatting_managers'), getUserById);

/**
 * PATCH /api/v1/users/:id
 * Update user by ID
 * RESTRICTED: chatting_managers only
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('chatting_managers'),
  validateBody([
    { field: 'email', required: false, type: 'email' },
    { field: 'password', required: false, type: 'string', minLength: 8 },
    { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'username', required: false, type: 'string', minLength: 3, maxLength: 50 },
    { field: 'role', required: false, enum: ['sourcer', 'interviewer', 'chatting_managers'] },
    { field: 'isActive', required: false, type: 'boolean' },
  ]),
  updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Delete user by ID
 * RESTRICTED: chatting_managers only
 */
router.delete('/:id', authenticate, requireRole('chatting_managers'), deleteUser);

export default router;
