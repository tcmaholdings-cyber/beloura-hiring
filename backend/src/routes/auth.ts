import { Router } from 'express';
import { registerUser, loginUser, refreshToken, logoutUser } from '../controllers/authController';
import { validateBody } from '../middleware/validation';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateBody([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, minLength: 6, maxLength: 128 },
    { field: 'name', required: true, minLength: 2, maxLength: 100 },
    { field: 'role', required: true, enum: ['sourcer', 'interviewer', 'chatting_manager'] },
  ]),
  registerUser
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  validateBody([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true },
  ]),
  loginUser
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validateBody([{ field: 'refreshToken', required: true, type: 'string' }]),
  refreshToken
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', logoutUser);

export default router;
