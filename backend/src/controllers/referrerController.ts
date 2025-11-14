import type { Request, Response } from 'express';
import {
  createReferrer,
  getReferrerById,
  getReferrerByExternalId,
  listReferrers,
  updateReferrer,
  deleteReferrer,
  getReferrerStats,
  type CreateReferrerInput,
  type UpdateReferrerInput,
  type ReferrerFilters,
  type PaginationOptions,
} from '../services/referrerService';

/**
 * POST /api/v1/referrers
 * Create a new referrer
 */
export const createReferrerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const input: CreateReferrerInput = {
      name: req.body.name,
      externalId: req.body.externalId,
      telegram: req.body.telegram,
    };

    const referrer = await createReferrer(input);

    res.status(201).json({
      message: 'Referrer created successfully',
      referrer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to create referrer' });
  }
};

/**
 * GET /api/v1/referrers/:id
 * Get referrer by ID
 */
export const getReferrerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const referrer = await getReferrerById(id);

    if (!referrer) {
      res.status(404).json({ error: 'Referrer not found' });
      return;
    }

    res.json(referrer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrer' });
  }
};

/**
 * GET /api/v1/referrers/external/:externalId
 * Get referrer by external ID
 */
export const getReferrerByExternalIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { externalId } = req.params;
    const referrer = await getReferrerByExternalId(externalId);

    if (!referrer) {
      res.status(404).json({ error: 'Referrer not found' });
      return;
    }

    res.json(referrer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrer' });
  }
};

/**
 * GET /api/v1/referrers
 * List referrers with optional filtering, pagination, and search
 */
export const listReferrersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters: ReferrerFilters = {};

    if (req.query.externalId) {
      filters.externalId = req.query.externalId as string;
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    if (req.query.createdFrom || req.query.createdTo) {
      filters.createdAt = {};
      if (req.query.createdFrom) {
        filters.createdAt.from = new Date(req.query.createdFrom as string);
      }
      if (req.query.createdTo) {
        filters.createdAt.to = new Date(req.query.createdTo as string);
      }
    }

    const pagination: PaginationOptions = {};
    if (req.query.limit) {
      pagination.limit = parseInt(req.query.limit as string, 10);
    }
    if (req.query.offset) {
      pagination.offset = parseInt(req.query.offset as string, 10);
    }
    if (req.query.sortBy) {
      pagination.sortBy = req.query.sortBy as any;
    }
    if (req.query.sortOrder) {
      pagination.sortOrder = req.query.sortOrder as 'asc' | 'desc';
    }

    const result = await listReferrers(filters, pagination);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrers' });
  }
};

/**
 * PATCH /api/v1/referrers/:id
 * Update referrer
 */
export const updateReferrerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const input: UpdateReferrerInput = {};

    if (req.body.name !== undefined) input.name = req.body.name;
    if (req.body.externalId !== undefined) input.externalId = req.body.externalId;
    if (req.body.telegram !== undefined) input.telegram = req.body.telegram;

    const referrer = await updateReferrer(id, input);

    res.json({
      message: 'Referrer updated successfully',
      referrer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Referrer not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to update referrer' });
  }
};

/**
 * DELETE /api/v1/referrers/:id
 * Delete referrer
 */
export const deleteReferrerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteReferrer(id);

    res.json({ message: 'Referrer deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Referrer not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('Cannot delete')) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to delete referrer' });
  }
};

/**
 * GET /api/v1/referrers/stats
 * Get referrer statistics
 */
export const getReferrerStatsHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await getReferrerStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrer statistics' });
  }
};
