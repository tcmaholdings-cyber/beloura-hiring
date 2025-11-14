import type { Request, Response } from 'express';
import { register, login } from '../services/authService';
import { refreshAccessToken } from '../services/tokenService';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'name', 'role'],
      });
      return;
    }

    // Validate role
    const validRoles = ['sourcer', 'interviewer', 'chatting_manager'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        error: 'Invalid role',
        validRoles,
      });
      return;
    }

    const result = await register({ email, password, name, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Registration failed',
        message: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    // Validate required fields - need either email or username
    if ((!email && !username) || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['password', 'email OR username'],
      });
      return;
    }

    const result = await login({ email, username, password });

    res.json({
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        error: 'Login failed',
        message: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Missing refresh token',
      });
      return;
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      tokens,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        error: 'Token refresh failed',
        message: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logoutUser = async (_req: Request, res: Response): Promise<void> => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the tokens. The server can optionally maintain a blacklist
  // of revoked tokens, but for now, we'll keep it simple.
  res.json({
    message: 'Logout successful',
  });
};
