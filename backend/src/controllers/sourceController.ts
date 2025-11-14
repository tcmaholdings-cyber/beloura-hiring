import type { Request, Response } from 'express';
import {
  createSource,
  getSourceById,
  listSources,
  updateSource,
  deleteSource,
  getSourceStats,
  getSourceAnalytics,
  type CreateSourceInput,
  type UpdateSourceInput,
  type SourceFilters,
  type PaginationOptions,
} from '../services/sourceService';

/**
 * POST /api/v1/sources
 * Create a new source
 */
export const createSourceHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const input: CreateSourceInput = {
      name: req.body.name,
      type: req.body.type,
    };

    const source = await createSource(input);

    res.status(201).json({
      message: 'Source created successfully',
      source,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to create source' });
  }
};

/**
 * GET /api/v1/sources/:id
 * Get source by ID
 */
export const getSourceHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const source = await getSourceById(id);

    if (!source) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source' });
  }
};

/**
 * GET /api/v1/sources
 * List sources with optional filtering, pagination, and search
 */
export const listSourcesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters: SourceFilters = {};

    if (req.query.type) {
      filters.type = req.query.type as string;
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

    const result = await listSources(filters, pagination);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
};

/**
 * PATCH /api/v1/sources/:id
 * Update source
 */
export const updateSourceHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const input: UpdateSourceInput = {};

    if (req.body.name !== undefined) input.name = req.body.name;
    if (req.body.type !== undefined) input.type = req.body.type;

    const source = await updateSource(id, input);

    res.json({
      message: 'Source updated successfully',
      source,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Source not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to update source' });
  }
};

/**
 * DELETE /api/v1/sources/:id
 * Delete source
 */
export const deleteSourceHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteSource(id);

    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Source not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('Cannot delete')) {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to delete source' });
  }
};

/**
 * GET /api/v1/sources/stats
 * Get source statistics
 */
export const getSourceStatsHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await getSourceStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source statistics' });
  }
};

/**
 * GET /api/v1/sources/analytics
 * Get comprehensive source analytics with conversion metrics
 */
export const getSourceAnalyticsHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const analytics = await getSourceAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source analytics' });
  }
};
