import type { Request, Response, NextFunction } from 'express';
import type { OwnerRole } from '@prisma/client';

/**
 * Role-based access control middleware
 * Checks if authenticated user has required role(s)
 */
export const requireRole = (...allowedRoles: OwnerRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
      return;
    }

    const userRole = req.user.role as OwnerRole;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        yourRole: userRole,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is a sourcer
 */
export const requireSourcer = requireRole('sourcer');

/**
 * Check if user is an interviewer
 */
export const requireInterviewer = requireRole('interviewer');

/**
 * Check if user is a chatting manager
 */
export const requireChattingManager = requireRole('chatting_managers');

/**
 * Check if user is sourcer or interviewer
 */
export const requireSourcerOrInterviewer = requireRole('sourcer', 'interviewer');

/**
 * Check if user owns the resource
 * Compares req.user.userId with a user ID from params or body
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
      });
      return;
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];

    if (!resourceUserId) {
      res.status(400).json({
        error: 'Invalid request',
        message: `Missing ${userIdParam} parameter`,
      });
      return;
    }

    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You can only access your own resources',
      });
      return;
    }

    next();
  };
};
